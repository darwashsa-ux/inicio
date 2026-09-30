-- ============================================================
--  Darwash · Inicio — calendario de remates
--  Correr UNA vez en Supabase → SQL Editor (proyecto de Anotaciones Feria)
--  Lectura: pública (la muestra el launcher).
--  Alta/baja: solo con PIN (se valida en el servidor, no en el navegador).
-- ============================================================

create table if not exists public.calendario_remates (
  id         bigint generated always as identity primary key,
  fecha      date not null,
  lugar      text not null check (length(trim(lugar)) between 1 and 60),
  created_at timestamptz not null default now()
);
create index if not exists calendario_remates_fecha_idx on public.calendario_remates (fecha);

alter table public.calendario_remates enable row level security;
drop policy if exists "calendario lectura publica" on public.calendario_remates;
create policy "calendario lectura publica" on public.calendario_remates
  for select to anon, authenticated using (true);
-- (sin policies de insert/update/delete: solo se escribe vía las funciones de abajo)

-- PIN guardado en una tabla sin acceso público
create table if not exists public.calendario_config (
  id  int primary key default 1 check (id = 1),
  pin text not null
);
alter table public.calendario_config enable row level security;
insert into public.calendario_config (id, pin) values (1, '1234')   -- <<< CAMBIÁ ESTE PIN
on conflict (id) do nothing;

create or replace function public.cal_agregar(p_fecha date, p_lugar text, p_pin text)
returns public.calendario_remates
language plpgsql security definer set search_path = public as $$
declare r public.calendario_remates;
begin
  if not exists (select 1 from calendario_config where id = 1 and pin = p_pin) then
    raise exception 'PIN incorrecto';
  end if;
  insert into calendario_remates (fecha, lugar) values (p_fecha, trim(p_lugar)) returning * into r;
  return r;
end $$;

create or replace function public.cal_borrar(p_id bigint, p_pin text)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from calendario_config where id = 1 and pin = p_pin) then
    raise exception 'PIN incorrecto';
  end if;
  delete from calendario_remates where id = p_id;
end $$;

revoke all on function public.cal_agregar(date, text, text) from public;
revoke all on function public.cal_borrar(bigint, text) from public;
grant execute on function public.cal_agregar(date, text, text) to anon, authenticated;
grant execute on function public.cal_borrar(bigint, text) to anon, authenticated;

-- Para cambiar el PIN más adelante:
-- update public.calendario_config set pin = 'NUEVO' where id = 1;
