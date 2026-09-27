begin;

-- The recap is a stage handoff, not a ninth lesson or a progress row.
create table public.see_clearly_recaps (
  user_id uuid primary key references auth.users(id) on delete cascade,
  narrative text not null default '',
  clarification text not null default '',
  carry_forward text not null default '',
  confirmed_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint recap_confirmation_has_narrative check (confirmed_at is null or length(btrim(narrative)) > 0)
);
alter table public.see_clearly_recaps enable row level security;
alter table public.see_clearly_recaps force row level security;
create trigger see_clearly_recaps_immutable_owner before update of user_id on public.see_clearly_recaps
  for each row execute function public.reject_user_id_change();
create policy recap_owner_select on public.see_clearly_recaps for select to authenticated using ((select auth.uid()) = user_id);
create policy recap_owner_insert on public.see_clearly_recaps for insert to authenticated with check ((select auth.uid()) = user_id);
create policy recap_owner_update on public.see_clearly_recaps for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy recap_owner_delete on public.see_clearly_recaps for delete to authenticated using ((select auth.uid()) = user_id);
revoke all on public.see_clearly_recaps from public, anon, authenticated;
grant select, insert, update, delete on public.see_clearly_recaps to authenticated;
grant select, insert, update, delete on public.see_clearly_recaps to rts_privileged_owner;

-- A dependency is tied to an owned progress row and its exact module, never a caller-supplied loose ID.
create table public.see_clearly_recap_sources (
  user_id uuid not null references public.see_clearly_recaps(user_id) on delete cascade,
  progress_id uuid not null,
  module_id text not null check (module_id in ('see-clearly.sc1','see-clearly.sy2','see-clearly.sy3','see-clearly.sy4','see-clearly.sg1','see-clearly.sg2','see-clearly.sg3','see-clearly.sg4')),
  primary key (user_id, progress_id),
  foreign key (progress_id,user_id,module_id) references public.deep_dive_module_progress(id,user_id,module_id) on delete cascade
);
create index see_clearly_recap_sources_progress_idx on public.see_clearly_recap_sources(progress_id,user_id,module_id);
alter table public.see_clearly_recap_sources enable row level security;
alter table public.see_clearly_recap_sources force row level security;
create trigger see_clearly_recap_sources_immutable_owner before update of user_id on public.see_clearly_recap_sources
  for each row execute function public.reject_user_id_change();
create policy recap_source_owner_select on public.see_clearly_recap_sources for select to authenticated using ((select auth.uid()) = user_id);
create policy recap_source_owner_insert on public.see_clearly_recap_sources for insert to authenticated with check ((select auth.uid()) = user_id);
create policy recap_source_owner_update on public.see_clearly_recap_sources for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy recap_source_owner_delete on public.see_clearly_recap_sources for delete to authenticated using ((select auth.uid()) = user_id);
revoke all on public.see_clearly_recap_sources from public, anon, authenticated;
grant select, insert, update, delete on public.see_clearly_recap_sources to authenticated;
grant select, insert, update, delete on public.see_clearly_recap_sources to rts_privileged_owner;

-- Revisions and deletion invalidate quotations; independently written clarification and carry-forward remain.
create function public.invalidate_see_clearly_recap_source() returns trigger language plpgsql as $$
begin
  update public.see_clearly_recaps r set narrative='', confirmed_at=null, updated_at=now()
    where r.user_id=old.user_id and exists (
      select 1 from public.see_clearly_recap_sources s
      where s.user_id=old.user_id and s.progress_id=old.progress_id
    );
  return old;
end;
$$;
revoke all on function public.invalidate_see_clearly_recap_source() from public;
-- The trigger only acts on the row's owner; RLS remains enforced for authenticated writes.
do $$
declare lesson text;
begin
  foreach lesson in array array['sc1','sy2','sy3','sy4','sg1','sg2','sg3','sg4'] loop
    execute format('create trigger recap_source_changed after update or delete on public.see_clearly_%I_records for each row execute function public.invalidate_see_clearly_recap_source()', lesson);
  end loop;
end $$;

commit;
