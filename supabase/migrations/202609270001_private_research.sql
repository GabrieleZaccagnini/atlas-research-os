-- Private research documents. Run once in the Atlas Supabase project.
create table public.research_projects (
  owner_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  project_id text not null check (project_id ~ '^[a-z0-9_-]{1,100}$'),
  document jsonb not null check (
    jsonb_typeof(document) = 'object' and
    document ?& array['id', 'name', 'updatedAt'] and
    document->>'id' = project_id and
    length(document->>'name') between 1 and 100 and
    octet_length(document::text) <= 2000000
  ),
  revision uuid not null default gen_random_uuid(),
  primary key (owner_id, project_id)
);
alter table public.research_projects enable row level security;
create policy "Owners read research" on public.research_projects for select to authenticated using ((select auth.uid()) = owner_id);
create policy "Owners insert research" on public.research_projects for insert to authenticated with check ((select auth.uid()) = owner_id);
create policy "Owners update research" on public.research_projects for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
revoke all on public.research_projects from anon;
grant select, insert, update on public.research_projects to authenticated;

create function public.save_research(p_document jsonb, p_revision uuid default null)
returns setof public.research_projects language plpgsql security invoker set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'Sign in required'; end if;
  perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text, 0));
  if p_revision is null then
    if (select count(*) from public.research_projects where owner_id = auth.uid()) >= 2000 then raise exception 'Project limit reached'; end if;
    return query insert into public.research_projects (owner_id, project_id, document)
      values (auth.uid(), p_document->>'id', p_document) returning *;
  else
    return query update public.research_projects set document = p_document, revision = gen_random_uuid()
      where owner_id = auth.uid() and project_id = p_document->>'id' and revision = p_revision returning *;
    if not found then raise exception 'Research changed. Reload before saving.' using errcode = '40001'; end if;
  end if;
end;
$$;

-- One transaction, insert-only: repeat imports do not overwrite newer research.
create function public.import_research(p_documents jsonb)
returns integer language plpgsql security invoker set search_path = '' as $$
declare added integer;
begin
  if auth.uid() is null then raise exception 'Sign in required'; end if;
  if jsonb_typeof(p_documents) <> 'array' or jsonb_array_length(p_documents) > 2000 then raise exception 'Invalid import'; end if;
  perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text, 0));
  insert into public.research_projects (owner_id, project_id, document)
    select auth.uid(), value->>'id', value from jsonb_array_elements(p_documents)
    on conflict (owner_id, project_id) do nothing;
  get diagnostics added = row_count;
  if (select count(*) from public.research_projects where owner_id = auth.uid()) > 2000 then raise exception 'Project limit reached'; end if;
  return added;
end;
$$;
revoke all on function public.save_research(jsonb, uuid) from public, anon;
revoke all on function public.import_research(jsonb) from public, anon;
grant execute on function public.save_research(jsonb, uuid) to authenticated;
grant execute on function public.import_research(jsonb) to authenticated;
