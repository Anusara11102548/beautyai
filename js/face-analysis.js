// ============================================================
// Face Analysis Orchestrator
// Coordinates: upload → AI analysis → save → recommend → save
// ============================================================

import { supabaseClient } from './supabase.js';
import { uploadToStorage } from './upload.js';
import { analyzeImage, fileToBase64 } from './ai-service.js';
import { generateRecommendation } from './recommendation.js';
import { validateImageFile } from './validation.js';
import { toast } from './toast.js';

// Analysis step definitions
const ANALYSIS_STEPS = [
  { id: 1, label: 'Validating image',          icon: '🔍' },
  { id: 2, label: 'Uploading securely',         icon: '☁️' },
  { id: 3, label: 'Detecting face',             icon: '👤' },
  { id: 4, label: 'Analyzing skin tone',        icon: '🎨' },
  { id: 5, label: 'Identifying face shape',     icon: '💎' },
  { id: 6, label: 'Determining skin type',      icon: '✨' },
  { id: 7, label: 'Generating recommendations', icon: '💄' },
];

/**
 * Update progress step UI
 */
function updateStepUI(stepId, status = 'active') {
  const el = document.getElementById(`step-${stepId}`);
  if (!el) return;
  el.setAttribute('data-status', status);
  el.className = el.className.replace(/step-(active|done|pending|error)/g, '');
  el.classList.add(`step-${status}`);
}

/**
 * Main analysis pipeline
 * @param {File} imageFile
 * @param {string} userId
 * @param {function} [onStepChange] - callback(stepId, status)
 * @returns {Promise<{analysisId, recommendationId, analysisResult, recommendation}>}
 */
async function runFaceAnalysis(imageFile, userId, onStepChange) {
  const step = (id, status) => {
    updateStepUI(id, status);
    if (onStepChange) onStepChange(id, status);
  };

  // ── Step 1: Validate ──────────────────────────────────────
  step(1, 'active');
  const validation = validateImageFile(imageFile);
  if (!validation.valid) {
    step(1, 'error');
    throw new Error(validation.message);
  }
  step(1, 'done');

  // ── Step 2: Upload to storage ─────────────────────────────
  step(2, 'active');
  let uploadedPath, imageBase64;
  try {
    const result = await uploadToStorage(imageFile, 'face-analysis-images', userId);
    uploadedPath = result.path;
    imageBase64 = result.base64;
  } catch (err) {
    step(2, 'error');
    throw new Error(`Image upload failed: ${err.message}`);
  }
  step(2, 'done');

  // Create a pending analysis record
  const { data: analysisRecord, error: insertErr } = await supabaseClient
    .from('face_analysis')
    .insert({
      user_id: userId,
      uploaded_image: uploadedPath,
      analysis_status: 'processing',
    })
    .select()
    .single();

  if (insertErr) throw new Error(`Failed to create analysis record: ${insertErr.message}`);
  const analysisId = analysisRecord.id;

  // ── Steps 3-6: AI Analysis ────────────────────────────────
  step(3, 'active');
  let aiResult;
  try {
    // Simulate step transitions during local analysis
    const simulateSteps = async () => {
      await delay(400); step(3, 'done'); step(4, 'active');
      await delay(400); step(4, 'done'); step(5, 'active');
      await delay(400); step(5, 'done'); step(6, 'active');
    };

    // analyzeImage now works locally — no API key needed
    const [result] = await Promise.all([
      analyzeImage(imageFile),
      simulateSteps(),
    ]);
    aiResult = result;
  } catch (err) {
    step(6, 'error');
    // Update status to failed
    await supabaseClient
      .from('face_analysis')
      .update({ analysis_status: 'failed' })
      .eq('id', analysisId);
    throw new Error(`AI analysis failed: ${err.message}`);
  }
  step(6, 'done');

  if (!aiResult.faceDetected) {
    await supabaseClient
      .from('face_analysis')
      .update({ analysis_status: 'failed' })
      .eq('id', analysisId);
    throw new Error('No face detected in the image. Please use a clear, well-lit frontal photo.');
  }

  // ── Step 7: Generate recommendations ─────────────────────
  step(7, 'active');
  const recommendation = generateRecommendation({
    skinTone:  aiResult.skinTone,
    undertone: aiResult.undertone,
    faceShape: aiResult.faceShape,
    skinType:  aiResult.skinType,
  });

  const beautyStyle = recommendation.beautyStyles[0] || 'Natural';

  // Save updated analysis result
  const { error: updateErr } = await supabaseClient
    .from('face_analysis')
    .update({
      skin_tone:             aiResult.skinTone,
      undertone:             aiResult.undertone,
      face_shape:            aiResult.faceShape,
      skin_type:             aiResult.skinType,
      beauty_style:          beautyStyle,
      recommendation_result: aiResult,
      analysis_status:       'completed',
    })
    .eq('id', analysisId);

  if (updateErr) throw new Error(`Failed to save analysis: ${updateErr.message}`);

  // Save recommendations
  const { data: recRecord, error: recErr } = await supabaseClient
    .from('cosmetic_recommendations')
    .insert({
      analysis_id: analysisId,
      foundation:  recommendation.foundation,
      cushion:     recommendation.cushion,
      lipstick:    recommendation.lipstick,
      blush:       recommendation.blush,
      eyeshadow:   recommendation.eyeshadow,
      eyebrow:     recommendation.eyebrow,
      sunscreen:   recommendation.sunscreen,
      skincare:    recommendation.skincare,
      description: recommendation.description,
    })
    .select()
    .single();

  if (recErr) throw new Error(`Failed to save recommendations: ${recErr.message}`);

  step(7, 'done');

  return {
    analysisId,
    recommendationId: recRecord.id,
    analysisResult: { ...aiResult, beautyStyle },
    recommendation,
  };
}

/**
 * Load analysis with its recommendation by analysis ID
 */
async function loadAnalysisWithRecommendation(analysisId) {
  const { data, error } = await supabaseClient
    .from('face_analysis')
    .select(`
      *,
      cosmetic_recommendations (*)
    `)
    .eq('id', analysisId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Load user's analysis history
 */
async function loadAnalysisHistory(userId, { page = 1, pageSize = 10 } = {}) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabaseClient
    .from('face_analysis')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .eq('analysis_status', 'completed')
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;
  return { data, count, totalPages: Math.ceil(count / pageSize) };
}

/**
 * Delete an analysis (cascades to recommendations + deletes storage file)
 */
async function deleteAnalysis(analysisId, storagePath) {
  // Delete from DB (cascades to cosmetic_recommendations)
  const { error } = await supabaseClient
    .from('face_analysis')
    .delete()
    .eq('id', analysisId);

  if (error) throw error;

  // Delete from storage
  if (storagePath) {
    await supabaseClient.storage
      .from('face-analysis-images')
      .remove([storagePath]);
  }
}

function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

export {
  runFaceAnalysis,
  loadAnalysisWithRecommendation,
  loadAnalysisHistory,
  deleteAnalysis,
  ANALYSIS_STEPS,
};
