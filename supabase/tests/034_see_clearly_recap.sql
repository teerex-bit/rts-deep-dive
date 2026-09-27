begin;
select plan(13);
insert into auth.users (id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at) values
('00000000-0000-4000-8000-0000000000f1','00000000-0000-0000-0000-000000000000','authenticated','authenticated','recap-a@example.test','',now(),'{}','{}',now(),now()),
('00000000-0000-4000-8000-0000000000f2','00000000-0000-0000-0000-000000000000','authenticated','authenticated','recap-b@example.test','',now(),'{}','{}',now(),now());
insert into public.deep_dive_module_progress(id,user_id,curriculum_version_id,module_id,last_section_id,completed_at) values
('f1000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-0000000000f1','phase-1-v1','see-clearly.sg4','carry-forward',now()),
('f1000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-0000000000f2','phase-1-v1','see-clearly.sg4','carry-forward',now());
select is((select count(*)::integer from pg_class where oid='public.see_clearly_recaps'::regclass and relrowsecurity and relforcerowsecurity),1,'recap forces RLS');
select is((select count(*)::integer from pg_class where oid='public.see_clearly_recap_sources'::regclass and relrowsecurity and relforcerowsecurity),1,'dependencies force RLS');
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-0000000000f1',true);
select lives_ok($$insert into public.see_clearly_sg4_records(user_id,progress_id,situation,trust_meaning) values ('00000000-0000-4000-8000-0000000000f1','f1000000-0000-4000-8000-000000000001','An open decision','I can take a responsible step')$$,'owned source');
select lives_ok($$insert into public.see_clearly_recaps(user_id,narrative,clarification,carry_forward,confirmed_at) values ('00000000-0000-4000-8000-0000000000f1','Earlier I wrote about an open decision.','This feels different now.','I can ask for help.',now())$$,'participant confirmation');
select lives_ok($$insert into public.see_clearly_recap_sources(user_id,progress_id,module_id) values ('00000000-0000-4000-8000-0000000000f1','f1000000-0000-4000-8000-000000000001','see-clearly.sg4')$$,'owned dependency');
select throws_ok($$insert into public.see_clearly_recap_sources(user_id,progress_id,module_id) values ('00000000-0000-4000-8000-0000000000f1','f1000000-0000-4000-8000-000000000002','see-clearly.sg4')$$,'23503',null,'cross-owner dependency rejected');
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-0000000000f2',true);
select is((select count(*)::integer from public.see_clearly_recaps),0,'other owner cannot read recap');
select is((select count(*)::integer from public.see_clearly_recap_sources),0,'other owner cannot read dependencies');
select throws_ok($$insert into public.see_clearly_recaps(user_id,narrative,confirmed_at) values ('00000000-0000-4000-8000-0000000000f1','Borrowed',now())$$,'42501',null,'other owner cannot confirm');
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-0000000000f1',true);
update public.see_clearly_sg4_records set trust_meaning='I can wait and act' where user_id='00000000-0000-4000-8000-0000000000f1';
select is((select confirmed_at is null from public.see_clearly_recaps where user_id='00000000-0000-4000-8000-0000000000f1'),true,'source change removes confirmation');
select is((select narrative from public.see_clearly_recaps where user_id='00000000-0000-4000-8000-0000000000f1'),'','source change removes quoted narrative');
select is((select carry_forward from public.see_clearly_recaps where user_id='00000000-0000-4000-8000-0000000000f1'),'I can ask for help.','independent carry-forward remains');
update public.see_clearly_recaps set narrative='A new provisional story.',confirmed_at=now() where user_id='00000000-0000-4000-8000-0000000000f1';
delete from public.see_clearly_sg4_records where user_id='00000000-0000-4000-8000-0000000000f1';
select is((select narrative from public.see_clearly_recaps where user_id='00000000-0000-4000-8000-0000000000f1'),'','source deletion removes quoted narrative');
select * from finish();
rollback;
