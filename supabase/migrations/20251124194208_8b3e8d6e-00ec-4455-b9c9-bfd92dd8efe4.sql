-- Create people table
CREATE TABLE public.people (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cases table
CREATE TABLE public.cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  related_person UUID NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  vision_1 TEXT,
  vision_2 TEXT,
  resolution_comment TEXT,
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create trigger function to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_cases_updated_at
BEFORE UPDATE ON public.cases
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_cases_requester ON public.cases(requester_id);
CREATE INDEX idx_cases_related_person ON public.cases(related_person_id);
CREATE INDEX idx_cases_is_resolved ON public.cases(is_resolved);

-- Since this is a single-user app with frontend password protection,
-- we'll make the tables publicly accessible
-- Note: In a production multi-user app, you would want to enable RLS
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (single-user app)
CREATE POLICY "Allow all operations on people"
ON public.people
FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow all operations on cases"
ON public.cases
FOR ALL
USING (true)
WITH CHECK (true);
