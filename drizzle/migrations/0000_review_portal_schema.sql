create table public.outlets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.outlets to authenticated;
grant all on public.outlets to service_role;
alter table public.outlets enable row level security;
create policy "auth all outlets" on public.outlets for all to authenticated using (true) with check (true);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  outlet_id uuid not null references public.outlets(id) on delete cascade,
  author text not null,
  rating int not null,
  text text not null default '',
  reply text,
  replied_at timestamptz,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.reviews to authenticated;
grant all on public.reviews to service_role;
alter table public.reviews enable row level security;
create policy "auth all reviews" on public.reviews for all to authenticated using (true) with check (true);

create table public.reply_rules (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  stars int[] not null default '{}',
  template text not null default '',
  enabled boolean not null default false,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.reply_rules to authenticated;
grant all on public.reply_rules to service_role;
alter table public.reply_rules enable row level security;
create policy "auth all rules" on public.reply_rules for all to authenticated using (true) with check (true);

create table public.team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  role text not null default 'Responder',
  outlets text not null default '',
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.team_members to authenticated;
grant all on public.team_members to service_role;
alter table public.team_members enable row level security;
create policy "auth all team" on public.team_members for all to authenticated using (true) with check (true);

create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  review_id uuid references public.reviews(id) on delete set null,
  author text not null,
  outlet text not null,
  reply text not null,
  by_email text,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.audit_log to authenticated;
grant all on public.audit_log to service_role;
alter table public.audit_log enable row level security;
create policy "auth all audit" on public.audit_log for all to authenticated using (true) with check (true);

insert into public.outlets (name, city) values
 ('Roastery Coffee House','Hyderabad'),('Roastery Coffee House','Kolkata'),('Roastery Coffee House','Agra'),
 ('Roastery Coffee House','Jaipur'),('Roastery Coffee House','Bengaluru'),('Cafe Athyeka 2.0','Noida');

insert into public.reviews (outlet_id, author, rating, text, reply)
select o.id, v.author, v.rating, v.text, v.reply from public.outlets o join (values
 ('Hyderabad','Ananya S.',5,'Best cold brew in town, cozy vibe!',null),
 ('Hyderabad','Rohit K.',2,'Waited 30 minutes for a latte.',null),
 ('Hyderabad','Priya M.',4,'Great coffee, slightly slow service.','Thanks Priya! We are speeding things up.'),
 ('Kolkata','Arjun D.',1,'Very rude staff, will not return.',null),
 ('Kolkata','Sneha P.',5,'Loved the pour-over.',null),
 ('Agra','Karan V.',4,'Nice place, desserts could be better.',null),
 ('Jaipur','Meera J.',3,'Average experience, coffee was okay.',null),
 ('Bengaluru','Vikram R.',5,'Amazing ambience, perfect for working.',null)
) as v(city,author,rating,text,reply) on o.city = v.city;

insert into public.reply_rules (name, stars, template, enabled) values
 ('Delighted guests','{5}','Hi {name}, thank you so much for the 5-star love! See you again at Roastery.',true),
 ('Happy guests','{4}','Hi {name}, thanks for visiting! We''d love to make your next visit a perfect 5.',true),
 ('Mixed feedback','{3}','Hi {name}, thanks for the honest feedback. We''re working on improving.',false),
 ('Service recovery','{1,2}','Hi {name}, we''re truly sorry. Please write to care@roastery.in so we can make it right.',false);

insert into public.team_members (name, email, role, outlets) values
 ('Vivek Sir','vivek@roastery.in','Admin','All outlets'),
 ('Neha Gupta','neha@roastery.in','Manager','Hyderabad, Bengaluru'),
 ('Rahul Mehta','rahul@roastery.in','Responder','Kolkata');