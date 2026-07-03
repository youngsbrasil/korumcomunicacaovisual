
-- Lock down SECURITY DEFINER event-trigger helper: not for API callers
REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;

-- Storage RLS: deny all access to portfolios bucket for anon/authenticated.
-- All legitimate access goes through server functions using the service role
-- (which bypasses RLS). Signed URLs remain valid without any policy.
CREATE POLICY "portfolios: deny select to clients"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id <> 'portfolios');

CREATE POLICY "portfolios: deny insert to clients"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id <> 'portfolios');

CREATE POLICY "portfolios: deny update to clients"
  ON storage.objects FOR UPDATE
  TO anon, authenticated
  USING (bucket_id <> 'portfolios')
  WITH CHECK (bucket_id <> 'portfolios');

CREATE POLICY "portfolios: deny delete to clients"
  ON storage.objects FOR DELETE
  TO anon, authenticated
  USING (bucket_id <> 'portfolios');
