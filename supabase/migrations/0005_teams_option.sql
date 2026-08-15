create type team_option as enum ('ete', 'automne', 'academie', 'voyage', 'pses', 'cla');

alter table teams add column if not exists option team_option;
