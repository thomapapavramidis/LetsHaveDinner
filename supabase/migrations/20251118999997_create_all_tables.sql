-- Comprehensive database schema for LetsHaveDinner
-- Run this in your Supabase SQL Editor for project: nohxsojfnyxrisceamar

-- ============================================
-- 1. PROFILES TABLE (if not exists)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  major TEXT,
  year TEXT,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================
-- 2. CYCLES TABLE (already exists, just ensure it has right structure)
-- ============================================
-- This table should already exist with: id, title, prompt, event_date, is_active, created_at

-- ============================================
-- 3. OPT_INS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.opt_ins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cycle_id UUID NOT NULL REFERENCES public.cycles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, cycle_id)
);

-- ============================================
-- 4. GROUPS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cycle_id UUID NOT NULL REFERENCES public.cycles(id) ON DELETE CASCADE,
  dining_hall TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================
-- 5. GROUP_MEMBERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- ============================================
-- 6. PAIR_RESPONSES TABLE (for group answers to prompts)
-- ============================================
CREATE TABLE IF NOT EXISTS public.pair_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cycle_id UUID NOT NULL REFERENCES public.cycles(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  response_text TEXT NOT NULL,
  vote_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================
-- 7. RESPONSE_VOTES TABLE (for voting on pair responses)
-- ============================================
CREATE TABLE IF NOT EXISTS public.response_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  response_id UUID NOT NULL REFERENCES public.pair_responses(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, response_id)
);

-- ============================================
-- 8. POSTS TABLE (for Feed/Fizz-like feature)
-- ============================================
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================
-- 9. POST_LIKES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.post_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, post_id)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_opt_ins_user_id ON public.opt_ins(user_id);
CREATE INDEX IF NOT EXISTS idx_opt_ins_cycle_id ON public.opt_ins(cycle_id);
CREATE INDEX IF NOT EXISTS idx_groups_cycle_id ON public.groups(cycle_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON public.group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON public.group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_pair_responses_cycle_id ON public.pair_responses(cycle_id);
CREATE INDEX IF NOT EXISTS idx_pair_responses_group_id ON public.pair_responses(group_id);
CREATE INDEX IF NOT EXISTS idx_response_votes_response_id ON public.response_votes(response_id);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Cycles
ALTER TABLE public.cycles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view cycles" ON public.cycles FOR SELECT USING (true);

-- Opt-ins
ALTER TABLE public.opt_ins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all opt-ins" ON public.opt_ins FOR SELECT USING (true);
CREATE POLICY "Users can create own opt-ins" ON public.opt_ins FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own opt-ins" ON public.opt_ins FOR DELETE USING (auth.uid() = user_id);

-- Groups
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all groups" ON public.groups FOR SELECT USING (true);

-- Group Members
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all group members" ON public.group_members FOR SELECT USING (true);

-- Pair Responses
ALTER TABLE public.pair_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all pair responses" ON public.pair_responses FOR SELECT USING (true);

-- Response Votes
ALTER TABLE public.response_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all votes" ON public.response_votes FOR SELECT USING (true);
CREATE POLICY "Users can create own votes" ON public.response_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own votes" ON public.response_votes FOR DELETE USING (auth.uid() = user_id);

-- Posts
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all posts" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Users can create own posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON public.posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON public.posts FOR DELETE USING (auth.uid() = user_id);

-- Post Likes
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all likes" ON public.post_likes FOR SELECT USING (true);
CREATE POLICY "Users can create own likes" ON public.post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own likes" ON public.post_likes FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update vote count when votes are added/removed
CREATE OR REPLACE FUNCTION public.update_response_vote_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.pair_responses
    SET vote_count = vote_count + 1
    WHERE id = NEW.response_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.pair_responses
    SET vote_count = vote_count - 1
    WHERE id = OLD.response_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS update_response_votes_count ON public.response_votes;
CREATE TRIGGER update_response_votes_count
AFTER INSERT OR DELETE ON public.response_votes
FOR EACH ROW
EXECUTE FUNCTION public.update_response_vote_count();

-- Auto-update updated_at on posts
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_posts_updated_at ON public.posts;
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
