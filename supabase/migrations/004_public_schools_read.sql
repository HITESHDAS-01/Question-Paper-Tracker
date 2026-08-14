-- Allow anyone (including anon) to read schools for the login selector
create policy "Public can read schools" on schools
  for select using (true);
