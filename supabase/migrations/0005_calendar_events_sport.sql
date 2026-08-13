-- Permet un événement général ciblé sur tout un sport (softball ou baseball)
-- en plus de "toute l'organisation" ou "une équipe précise".
alter table calendar_events add column sport sport_type;
