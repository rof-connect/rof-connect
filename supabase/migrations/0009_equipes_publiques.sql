-- Site public : la Direction choisit quelles équipes sont visibles, leur ordre et leur texte.
-- (La colonne « sport » existe déjà depuis 0001.)
alter table teams
  add column if not exists visible_public boolean not null default false,
  add column if not exists ordre_affichage int,
  add column if not exists description_publique text,
  add column if not exists nom_public text;

comment on column teams.visible_public is 'Affichée sur le site public (royalonfield.ca). Faux par défaut.';
comment on column teams.ordre_affichage is 'Ordre sur le site public (petit = en premier). Vide = tri par défaut.';
comment on column teams.description_publique is 'Courte description affichée sur le site public (facultatif).';
comment on column teams.nom_public is 'Nom affiché sur le site public (ex. « 14U »). Vide = déduit du nom interne.';
