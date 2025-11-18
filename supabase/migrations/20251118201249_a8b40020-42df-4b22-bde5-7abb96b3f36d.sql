-- Create pair_responses table for matched pairs to answer together
CREATE TABLE public.pair_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cycle_id UUID NOT NULL REFERENCES public.cycles(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  response_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  vote_count INTEGER NOT NULL DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.pair_responses ENABLE ROW LEVEL SECURITY;

-- Anyone can view pair responses
CREATE POLICY "Anyone can view pair responses"
ON public.pair_responses
FOR SELECT
USING (true);

-- Group members can create their pair response
CREATE POLICY "Group members can create pair responses"
ON public.pair_responses
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = pair_responses.group_id
    AND user_id = auth.uid()
  )
);

-- Group members can update their pair response
CREATE POLICY "Group members can update pair responses"
ON public.pair_responses
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = pair_responses.group_id
    AND user_id = auth.uid()
  )
);

-- Create response_votes table for voting on pair responses
CREATE TABLE public.response_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  response_id UUID NOT NULL REFERENCES public.pair_responses(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, response_id)
);

-- Enable RLS
ALTER TABLE public.response_votes ENABLE ROW LEVEL SECURITY;

-- Users can view all votes
CREATE POLICY "Anyone can view votes"
ON public.response_votes
FOR SELECT
USING (true);

-- Users can create their own votes
CREATE POLICY "Users can create their own votes"
ON public.response_votes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own votes
CREATE POLICY "Users can delete their own votes"
ON public.response_votes
FOR DELETE
USING (auth.uid() = user_id);

-- Create function to update vote count
CREATE OR REPLACE FUNCTION public.update_response_vote_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Create trigger for vote count
CREATE TRIGGER update_response_votes_count
AFTER INSERT OR DELETE ON public.response_votes
FOR EACH ROW
EXECUTE FUNCTION public.update_response_vote_count();