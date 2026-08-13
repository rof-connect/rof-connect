-- Comme pour 0003 : les nouvelles tables n'héritent pas des privilèges
-- accordés en bloc avant leur création.
grant select, insert, update, delete on calendar_events to authenticated, service_role;
grant select on calendar_events to anon;
