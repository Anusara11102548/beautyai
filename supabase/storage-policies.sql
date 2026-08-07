-- ============================================================
-- AI Beauty Advisor - Supabase Storage Policies
-- ============================================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
  VALUES ('profile-images', 'profile-images', true)
  ON CONFLICT DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
  VALUES ('face-analysis-images', 'face-analysis-images', false)
  ON CONFLICT DO NOTHING;

-- ============================================================
-- PROFILE IMAGES POLICIES (public bucket)
-- ============================================================

-- Anyone can read profile images (public bucket)
CREATE POLICY "Public read profile images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profile-images');

-- Authenticated users can upload profile images
CREATE POLICY "Authenticated users upload profile images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'profile-images'
    AND auth.role() = 'authenticated'
  );

-- Users can update their own profile images
CREATE POLICY "Users update own profile images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'profile-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete their own profile images
CREATE POLICY "Users delete own profile images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'profile-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================
-- FACE ANALYSIS IMAGES POLICIES (private bucket)
-- ============================================================

-- Users can only read their own face analysis images
CREATE POLICY "Users read own face images"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'face-analysis-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Authenticated users can upload face analysis images (only to their own folder)
CREATE POLICY "Authenticated users upload face images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'face-analysis-images'
    AND auth.role() = 'authenticated'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can update their own face analysis images
CREATE POLICY "Users update own face images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'face-analysis-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete their own face analysis images
CREATE POLICY "Users delete own face images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'face-analysis-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
