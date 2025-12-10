-- ============================================
-- PAINEL KOKUHITO - SETUP COMPLETO
-- ============================================
-- Copie e cole este código inteiro no SQL Editor do Supabase
-- Isso vai criar todas as tabelas e configurações necessárias

-- Criar tabela de pessoas
CREATE TABLE IF NOT EXISTS public.people (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de casos
CREATE TABLE IF NOT EXISTS public.cases (
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

-- Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Criar trigger para atualizar updated_at nos casos
DROP TRIGGER IF EXISTS update_cases_updated_at ON public.cases;
CREATE TRIGGER update_cases_updated_at
BEFORE UPDATE ON public.cases
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_cases_requester ON public.cases(requester_id);
CREATE INDEX IF NOT EXISTS idx_cases_related_person ON public.cases(related_person);
CREATE INDEX IF NOT EXISTS idx_cases_is_resolved ON public.cases(is_resolved);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;

-- Criar policies para permitir todas as operações
-- (Como é um app single-user com senha no código, liberamos tudo)
DROP POLICY IF EXISTS "Allow all operations on people" ON public.people;
CREATE POLICY "Allow all operations on people"
ON public.people
FOR ALL
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations on cases" ON public.cases;
CREATE POLICY "Allow all operations on cases"
ON public.cases
FOR ALL
USING (true)
WITH CHECK (true);

-- ============================================
-- PRONTO! 🎉
-- ============================================
-- Agora seu Painel Kokuhito está configurado!
-- Volte para o app e comece a usar.
