CREATE TABLE public.portfolio_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL,
  section_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  kind TEXT NOT NULL,
  url TEXT NOT NULL,
  caption TEXT DEFAULT '',
  alt TEXT DEFAULT '',
  ordem INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_portfolio_media_lookup ON public.portfolio_media (slug, status, section_id, ordem);

GRANT SELECT ON public.portfolio_media TO anon;
GRANT SELECT ON public.portfolio_media TO authenticated;
GRANT ALL ON public.portfolio_media TO service_role;

ALTER TABLE public.portfolio_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published media"
  ON public.portfolio_media
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');
