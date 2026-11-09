-- Site public : la Direction choisit quelles équipes sont visibles, leur ordre et leur texte.
-- (La colonne « sport » existe déjà depuis 0001.)
alter table teams
  add column if not exists visible_public boolean not null default false,
  add column if not exists ordre_affichage int,
  add column if not exists description_publique text,
  add column if not exists nom_public text,
  add column if not exists roster_public boolean not null default true,
  add column if not exists gamechanger_widget_id text,
  add column if not exists gamechanger_url text,
  add column if not exists categorie text,
  add column if not exists niveau_public text;

comment on column teams.visible_public is 'Affichée sur le site public (royalonfield.ca). Faux par défaut.';
comment on column teams.ordre_affichage is 'Ordre sur le site public (petit = en premier). Vide = tri par défaut.';
comment on column teams.description_publique is 'Courte description affichée sur le site public (facultatif).';
comment on column teams.nom_public is 'Nom affiché sur le site public (ex. « 14U »). Vide = déduit du nom interne.';
comment on column teams.roster_public is 'La Direction autorise l''affichage du roster (liste des joueuses) sur le site public. Vrai par défaut.';
comment on column teams.gamechanger_widget_id is 'Identifiant du widget calendrier GameChanger (affiché sur la page de l''équipe).';

-- Calendrier GameChanger de 18U - Di Peco.
update teams set gamechanger_widget_id = '7995b8d4-b175-40db-9190-7719a306837c'
where archived = false and name = 'Softball 18U - Di Peco';

comment on column teams.gamechanger_url is 'Lien de la page de l''équipe sur GameChanger (bouton sur la page de l''équipe).';
update teams set gamechanger_url = 'https://web.gc.com/teams/8MQao52hpmge'
where archived = false and name = 'Softball 16U - Dostaler';

-- Calendrier GameChanger de 16U - Dostaler.
update teams set gamechanger_widget_id = '1f3faad8-a77c-44a3-986c-848b65a6ac07'
where archived = false and name = 'Softball 16U - Dostaler';

-- Roster affiché seulement pour 18U - Di Peco (softball) ; les autres équipes de softball : roster masqué.
update teams set roster_public = false
where sport = 'softball' and archived = false and name <> 'Softball 18U - Di Peco';

comment on column teams.categorie is 'Étiquette de catégorie affichée sur le site public (ex. NATIONAL).';
update teams set categorie = 'NATIONAL'
where archived = false and name = 'Softball 18U - Di Peco';
update teams set categorie = 'RÉGIONAL' where archived = false and name = 'Softball 16U - Bertrand';
update teams set categorie = 'ÉLITE' where archived = false and name = 'Softball 16U - Dostaler';

-- Au départ, toutes les équipes actives sont visibles sur le site (la Direction décoche celles à masquer).
update teams set visible_public = true where archived = false and sport in ('softball', 'baseball');

comment on column teams.niveau_public is 'Niveau affiché à côté de la catégorie sur le site public (ex. VARSITY, JV).';
update teams set niveau_public = 'VARSITY' where archived = false and name = 'Softball 18U - Di Peco';
update teams set niveau_public = 'JV' where archived = false and name = 'Softball 16U - Bertrand';
