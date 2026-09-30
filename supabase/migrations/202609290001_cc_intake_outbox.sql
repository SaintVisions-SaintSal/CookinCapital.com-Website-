-- Preview repair only. Apply to a verified database after explicit approval.
begin;

create table public.cc_intake_outbox (
  id uuid primary key default gen_random_uuid(),
  event_key text not null unique,
  event_type text not null check (event_type in ('signup','inquiry','activity')),
  user_id uuid references auth.users(id) on delete set null,
  payload jsonb not null,
  payload_hash text not null,
  state text not null default 'pending' check (state in ('pending','processing','accepted','confirmed','failed')),
  attempts integer not null default 0,
  lease_id uuid,
  lease_until timestamptz,
  last_error text,
  ghl_contact_id text,
  ghl_opportunity_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index cc_intake_pending on public.cc_intake_outbox(state, created_at);
alter table public.cc_intake_outbox enable row level security;
revoke all on public.cc_intake_outbox from public, anon, authenticated;
grant select, insert, update on public.cc_intake_outbox to service_role;

create table public.cc_intake_rate_limits (
  rate_key text not null,
  bucket bigint not null,
  requests integer not null default 1,
  primary key (rate_key, bucket)
);
alter table public.cc_intake_rate_limits enable row level security;
revoke all on public.cc_intake_rate_limits from public, anon, authenticated;
grant select, insert, update, delete on public.cc_intake_rate_limits to service_role;

create function public.cc_enqueue_intake(
  p_event_key text, p_event_type text, p_payload jsonb, p_user_id uuid,
  p_payload_hash text, p_rate_key text
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  existing public.cc_intake_outbox;
  received public.cc_intake_outbox;
  request_count integer;
  current_bucket bigint := floor(extract(epoch from now()) / 600);
begin
  if length(p_event_key) > 150 or length(p_payload::text) > 12000 then
    raise exception 'INVALID_PAYLOAD';
  end if;
  -- Serialize concurrent retries of the same request before deciding whether to insert.
  perform pg_advisory_xact_lock(hashtextextended(p_event_key, 0));
  select * into existing from public.cc_intake_outbox where event_key = p_event_key;
  if found then
    if p_event_type <> existing.event_type or (p_event_type <> 'signup' and existing.payload_hash <> p_payload_hash) then
      raise exception 'IDEMPOTENCY_CONFLICT';
    end if;
    return jsonb_build_object('id', existing.id, 'state', existing.state);
  end if;
  insert into public.cc_intake_rate_limits(rate_key, bucket) values (p_rate_key, current_bucket)
  on conflict (rate_key,bucket) do update set requests = public.cc_intake_rate_limits.requests + 1
  returning requests into request_count;
  if request_count > 5 then raise exception 'RATE_LIMIT'; end if;
  insert into public.cc_intake_outbox(event_key,event_type,user_id,payload,payload_hash)
  values(p_event_key,p_event_type,p_user_id,p_payload,p_payload_hash)
  returning * into received;
  return jsonb_build_object('id',received.id,'state',received.state);
end;
$$;

create function public.cc_claim_intake()
returns setof public.cc_intake_outbox language plpgsql security definer set search_path = '' as $$
begin
  -- A crashed worker may have delivered the request. Do not automatically resend it.
  update public.cc_intake_outbox set state='failed',last_error='LEASE_EXPIRED_REVIEW',
    lease_id=null,lease_until=null,updated_at=now()
    where state='processing' and lease_until < now();
  delete from public.cc_intake_rate_limits where bucket < floor(extract(epoch from now()) / 600) - 144;
  return query
  with selected as (
    select id from public.cc_intake_outbox where state='pending'
    order by created_at for update skip locked limit 5
  )
  update public.cc_intake_outbox o set state='processing',attempts=attempts+1,
    lease_id=gen_random_uuid(),lease_until=now()+interval '2 minutes',updated_at=now()
  from selected where o.id=selected.id returning o.*;
end;
$$;

revoke execute on function public.cc_enqueue_intake(text,text,jsonb,uuid,text,text) from public,anon,authenticated;
revoke execute on function public.cc_claim_intake() from public,anon,authenticated;
grant execute on function public.cc_enqueue_intake(text,text,jsonb,uuid,text,text) to service_role;
grant execute on function public.cc_claim_intake() to service_role;
commit;
