-- ============================================================
-- AI Beauty Advisor - Supabase Database Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

-- Users profile table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  profile_image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Face analysis table
CREATE TABLE IF NOT EXISTS public.face_analysis (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  uploaded_image TEXT NOT NULL,
  skin_tone TEXT CHECK (skin_tone IN ('fair','light','medium','tan','deep')),
  undertone TEXT CHECK (undertone IN ('warm','cool','neutral')),
  face_shape TEXT CHECK (face_shape IN ('oval','round','square','heart','diamond','rectangle','oblong')),
  skin_type TEXT CHECK (skin_type IN ('dry','oily','combination','sensitive','normal')),
  beauty_style TEXT,
  recommendation_result JSONB,
  analysis_status TEXT DEFAULT 'pending' CHECK (analysis_status IN ('pending','processing','completed','failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cosmetic recommendations table
CREATE TABLE IF NOT EXISTS public.cosmetic_recommendations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  analysis_id UUID REFERENCES public.face_analysis(id) ON DELETE CASCADE NOT NULL,
  foundation JSONB,
  cushion JSONB,
  lipstick JSONB,
  blush JSONB,
  eyeshadow JSONB,
  eyebrow JSONB,
  sunscreen JSONB,
  skincare JSONB,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.face_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cosmetic_recommendations ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Face analysis policies
CREATE POLICY "Users can view own analysis"
  ON public.face_analysis FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analysis"
  ON public.face_analysis FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analysis"
  ON public.face_analysis FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own analysis"
  ON public.face_analysis FOR DELETE
  USING (auth.uid() = user_id);

-- Cosmetic recommendations policies
CREATE POLICY "Users can view own recommendations"
  ON public.cosmetic_recommendations FOR SELECT
  USING (auth.uid() = (SELECT user_id FROM public.face_analysis WHERE id = analysis_id));

CREATE POLICY "Users can insert own recommendations"
  ON public.cosmetic_recommendations FOR INSERT
  WITH CHECK (auth.uid() = (SELECT user_id FROM public.face_analysis WHERE id = analysis_id));

CREATE POLICY "Users can delete own recommendations"
  ON public.cosmetic_recommendations FOR DELETE
  USING (auth.uid() = (SELECT user_id FROM public.face_analysis WHERE id = analysis_id));

-- ============================================================
-- TRIGGERS & FUNCTIONS
-- ============================================================

-- Trigger to auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at auto-update trigger
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- INDEXES (for performance)
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_face_analysis_user_id ON public.face_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_face_analysis_created_at ON public.face_analysis(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cosmetic_recommendations_analysis_id ON public.cosmetic_recommendations(analysis_id);
