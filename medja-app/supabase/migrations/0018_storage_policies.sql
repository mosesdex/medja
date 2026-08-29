-- Storage RLS for the private buckets. Files are stored under a company-id
-- folder prefix: `<company_id>/<...>`. A member may only access objects whose
-- first path segment equals their own company_id, enforced via auth_company_id().
--
-- storage.foldername(name) returns the folder segments of the object path;
-- element [1] is the top-level folder (the company_id).

-- job-photos ---------------------------------------------------------------
create policy "job_photos_company_read" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'job-photos'
    and (storage.foldername(name))[1] = public.auth_company_id()::text
  );

create policy "job_photos_company_write" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'job-photos'
    and (storage.foldername(name))[1] = public.auth_company_id()::text
  );

create policy "job_photos_company_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'job-photos'
    and (storage.foldername(name))[1] = public.auth_company_id()::text
  );

-- staff-docs ---------------------------------------------------------------
create policy "staff_docs_company_read" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'staff-docs'
    and (storage.foldername(name))[1] = public.auth_company_id()::text
  );

create policy "staff_docs_company_write" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'staff-docs'
    and (storage.foldername(name))[1] = public.auth_company_id()::text
  );

create policy "staff_docs_company_update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'staff-docs'
    and (storage.foldername(name))[1] = public.auth_company_id()::text
  );

create policy "staff_docs_company_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'staff-docs'
    and (storage.foldername(name))[1] = public.auth_company_id()::text
  );
