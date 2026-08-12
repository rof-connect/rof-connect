ROF Connect — Cahier des charges de déploiement

Projet : Portail web et application de Royal On Field (académie baseball & softball, Québec) Objectif : Déployer un site public + espace membres sécurisé sur un domaine propre Prototype de référence : rof-connect.jsx (fourni avec ce document)

Comment utiliser ce document

Ce cahier des charges est destiné à Claude Code. Ouvre Claude Code, dépose ce fichier et rof-connect.jsx dans un dossier, puis écris :

« Lis ROF-Connect-cahier-des-charges.md et rof-connect.jsx, puis guide-moi étape par étape pour déployer ce projet. Commence par vérifier ce que j'ai déjà et dis-moi exactement quoi faire de mon côté. »

Claude Code fait le reste du travail technique. Tes actions manuelles sont listées à la section 9.

1. Contexte

Royal On Field est un OBNL québécois de baseball et softball, avec des équipes de 8 à 16 ans plus des programmes élite (JV, Varsity). L'organisation compte plusieurs équipes, chacune avec ses entraîneurs, ses athlètes et leurs parents.

Le prototype rof-connect.jsx est fonctionnel et validé : il contient toute la logique métier, la structure de données et le design final. La migration consiste à remplacer sa couche de stockage (clé-valeur du prototype) par une vraie base de données avec authentification, et à ajouter le téléversement de fichiers.

Ne pas repartir de zéro. Reprendre les composants, la palette, les libellés français et la structure du prototype.

2. Pile technique retenue
Couche	Choix	Pourquoi
Framework	Next.js (App Router, TypeScript)	Rendu serveur pour le SEO du site public, API intégrée
Base de données + Auth + Stockage	Supabase	Postgres géré, auth intégrée, stockage de fichiers, hébergement de données au Canada disponible
Styles	Tailwind CSS	Déjà utilisé dans le prototype
Hébergement	Vercel	Déploiement Git automatique, domaine personnalisé, HTTPS inclus
Dépôt	GitHub	Requis par Vercel

Coût cible : domaine ~20 $/an. Les paliers gratuits de Supabase et Vercel suffisent au volume de ROF (quelques centaines d'utilisateurs).

Important — hébergement des données : à la création du projet Supabase, choisir une région canadienne (ca-central-1). Les fiches contiennent des renseignements personnels de mineurs; la Loi 25 québécoise impose des obligations de protection et l'hébergement au Canada simplifie la conformité.

3. Rôles et permissions
Rôle	Portée	Droits
Admin (direction)	Toute l'organisation	Tout, plus : gestion des équipes, tableau de bord organisationnel, export global
Coach	Son ou ses équipes	Publier/supprimer tout contenu de l'équipe, gérer les statuts, voir les fiches complètes, messagerie
Membre (athlète + parents)	Sa propre équipe	Consulter le contenu selon son statut, confirmer les présences, messagerie, modifier son profil

Un compte membre est partagé entre l'athlète et ses parents — c'est voulu : les communications privées avec un entraîneur restent ainsi visibles d'un parent, une bonne pratique en sport mineur.

Un coach peut être rattaché à plusieurs équipes (table de jonction).

4. Modèle de données

Toutes les tables ont id uuid primary key default gen_random_uuid(), created_at timestamptz default now().

organizations

Pour permettre une éventuelle multi-organisation. Une seule ligne au départ (Royal On Field).

name, slug
teams
org_id → organizations
name (ex. « Softball 14U — Di Peco »)
sport : enum baseball | softball
season_year int
archived bool default false
profiles

Étend auth.users (id identique à l'utilisateur Supabase).

id uuid → auth.users
full_name, email, phone
role : enum admin | coach | member
team_members

Rattache un profil à une équipe, avec le statut de division.

team_id → teams, profile_id → profiles
role_in_team : enum coach | athlete
status_id int (1–8, voir section 5)
unique (team_id, profile_id)
athlete_details

Fiche d'inscription. Séparée de profiles car elle contient des données sensibles.

profile_id → profiles (unique)
birth_date date
position, throws, bats (texte)
guardian_name, guardian_phone, guardian_email
medical_notes text
photo_consent bool
fieldlevel_url text
contents

Table unique pour toutes les sections, avec un champ JSON pour les données propres au type. Simplifie énormément par rapport à huit tables.

team_id → teams
kind : enum agenda | news | season | plan | relay | video | gamechanger | signal
min_status int default 1 — statut minimum requis pour voir (voir section 5)
title text
body jsonb — champs spécifiques au type
event_date date null — rempli pour agenda, sert au tri et au filtrage
created_by → profiles

Champs body par type (reprendre exactement ceux du prototype) :

agenda : type, heure, lieu, note
news : date, texte, photo_url, video_url
season : phase, periode, frequence, focus, objectifs
plan : date, focus, contenu
relay : situation, relayeur, coupeur, couvertures, note
video : url, categorie, note
gamechanger : widget_id, team_url, note
signal : sequence, note
attendance
content_id → contents (un événement d'agenda)
profile_id → profiles
response : enum yes | no
unique (content_id, profile_id)
messages
team_id → teams
channel : enum team | private
thread_profile_id → profiles null — pour les fils privés, l'athlète concerné
author_id → profiles
content text
read_by uuid[] default '{}'
media
team_id, uploaded_by
storage_path text, kind : photo | video
content_id → contents null — si rattaché à une nouvelle
5. Statuts de division

Constante partagée, identique au prototype. Le contenu est filtré par min_status : un membre voit un contenu si son status_id ≥ min_status du contenu.

id	Nom	Description
1	Prospect	Nouveau joueur·euse intéressé·e à joindre le programme
2	Mineur	Joueurs et joueuses de 8 à 10 ans
3	Majeur	Joueurs et joueuses de 11 et 12 ans
4	Intermédiaire	Baseball seulement — joueurs de 13 ans
5	Junior	Joueurs de 14 ans · joueuses de 13 et 14 ans
6	Senior	Joueurs et joueuses de 15 et 16 ans
7	JV	Joueuses élites Prospect — 14 ans et +
8	Varsity	Joueuses élites Premier — 14 ans et +

Toute nouvelle inscription démarre à Prospect (1). Seuls coach et admin peuvent changer un statut.

6. Sécurité — RLS (Row Level Security)

Activer RLS sur toutes les tables. C'est le cœur de la sécurité; sans ça, n'importe quel utilisateur authentifié peut lire toutes les données.

Politiques à implémenter :

profiles — chacun lit et modifie le sien; coach et admin lisent ceux de leurs équipes.
athlete_details — lecture par le propriétaire, par les coachs de ses équipes, et par l'admin. Aucun autre accès (données médicales).
team_members — lecture par les membres de la même équipe; écriture réservée à coach/admin.
contents — lecture si l'utilisateur est membre de l'équipe et que son status_id ≥ min_status. Coach et admin voient tout, sans filtre de statut. Écriture réservée à coach/admin de l'équipe.
attendance — un membre écrit uniquement sa propre réponse; coach et admin lisent toutes celles de leur équipe.
messages — canal team : lisible par tous les membres de l'équipe. Canal private : lisible uniquement par l'athlète concerné (thread_profile_id) et les coachs de l'équipe.
media — lecture par les membres de l'équipe; écriture par tous les membres (les athlètes peuvent envoyer une vidéo de leur élan), suppression par coach/admin ou l'auteur.

Créer une fonction SQL is_team_member(team_id, profile_id) et is_team_staff(team_id, profile_id) pour éviter la répétition dans les politiques.

Écrire des tests de RLS : créer deux comptes de test dans des équipes différentes et vérifier qu'aucun ne voit les données de l'autre. Ne pas passer à l'étape suivante avant que ces tests passent.

7. Fonctionnalités
7.1 Site public (pas d'authentification)

Reprendre intégralement le composant SiteWeb du prototype. Sections : héro avec statistiques, L'expérience Royal (3 piliers), Voies de développement (12/14/16 ans), Programme scolaire, Placement & recrutement, Palmarès, Admission.

À ajouter par rapport au prototype :

Métadonnées SEO et Open Graph (aperçu enrichi quand le lien est partagé sur Facebook/Instagram)
Favicon : le R couronné
Les textes des sections doivent être modifiables par l'admin depuis l'espace membres (table site_content, paires clé-valeur) plutôt que codés en dur
7.2 Espace membres

Reprendre les onglets du prototype : Agenda, Nouvelles, Saison, Plans, Relais, Vidéos, GC, Signaux, Messages, Profil, plus Joueurs (coach) et Équipes + Direction (admin).

Nouveautés par rapport au prototype :

a) Téléversement direct de photos et vidéos — c'est la principale valeur ajoutée du déploiement.

Supabase Storage, buckets privés avec URL signées
Compression des images côté client avant envoi
Limite : 10 Mo par photo, 200 Mo par vidéo
Les athlètes peuvent envoyer une vidéo dans leur fil privé (élan, mécanique de lancer) pour rétroaction du coach

b) Notifications

Courriel (Supabase + Resend ou équivalent) : nouvel événement, nouveau message privé, rappel de confirmation de présence 48 h avant un événement
Notifications push web si le temps le permet (phase 2)

c) Messagerie en temps réel — utiliser Supabase Realtime plutôt que le bouton « Actualiser » du prototype.

d) Import Excel — conserver la fonctionnalité et les gabarits téléchargeables (agenda, nouvelles, saison, relais). Le code de parsing du prototype (SheetJS) est réutilisable tel quel.

e) Export CSV — conserver, avec les 14 colonnes de la fiche d'inscription.

f) Widget GameChanger — conserver window.GC.team.schedule.init. Le SDK GameChanger peut exiger que le domaine soit déclaré; vérifier après déploiement.

7.3 Inscription

Formulaire en une page : nom de l'athlète, courriel du parent, mot de passe, équipe, date de naissance, position, lance/frappe, coordonnées du parent, notes médicales, consentement photo.

Le courriel du parent sert d'identifiant de connexion (Supabase Auth, courriel + mot de passe, avec vérification par courriel).

Nouvelle inscription = statut Prospect, en attente d'assignation par un coach.

8. Design

Reprendre exactement la palette et la typographie du prototype.

Palette : noir profond #05070C (fond), bleu royal #2C5FE0, bleu poudre #7FC4EC (couleur signature des uniformes — accents, R du logo, onglets actifs), or #E8B93F (boutons principaux, statistiques, titres de champion).

Typographie : Barlow Condensed (titres, majuscules), Inter (texte courant), Playfair Display (le R du logo), Dancing Script (« Earn the crown. »).

Logo : le composant SVG LogoR du prototype — R bleu poudre contouré de blanc, couronne dorée. Le décliner en favicon et en icône d'app.

Mobile d'abord : la majorité des usages se feront sur téléphone, souvent au terrain. Prévoir une PWA (manifeste + service worker) pour l'ajout à l'écran d'accueil et un mode hors-ligne minimal (consultation du calendrier et des signaux sans réseau).

Toute l'interface est en français québécois. Écriture inclusive légère (« joueurs et joueuses », « athlètes »), sans surcharge.

9. Étapes de déploiement — ce que Nick doit faire lui-même

Claude Code s'occupe du code, des migrations, des tests et des commandes. Ces cinq actions demandent un compte ou un paiement et doivent être faites par Nick :

Créer trois comptes gratuits : GitHub, Supabase, Vercel (~5 min chacun)
Acheter le domaine — royalonfield.ca ou .com, ~20 $/an chez n'importe quel registraire
Créer le projet Supabase en choisissant la région Canada (ca-central-1), puis copier les clés (URL, anon key, service_role key) dans le fichier .env.local quand Claude Code le demande
Connecter le dépôt GitHub à Vercel (quelques clics dans l'interface Vercel)
Pointer le domaine vers Vercel — ajouter deux enregistrements DNS chez le registraire; Vercel affiche exactement quoi copier. Prévoir jusqu'à quelques heures de propagation.

Durée réaliste : une demi-journée à une journée, dont la majorité en attente pendant que Claude Code travaille.

10. Ordre de réalisation

Ne pas tout faire d'un coup. Ordre recommandé, avec validation à chaque étape :

Projet Next.js + Tailwind + connexion Supabase, déployé sur Vercel avec une page d'accueil vide → valider que le déploiement fonctionne
Schéma de base de données + politiques RLS + tests de sécurité → ne pas continuer tant que les tests ne passent pas
Authentification (inscription, connexion, rôles) + création manuelle des équipes par l'admin
Site public complet (reprise du composant SiteWeb)
Espace membres : Agenda + présences (le cœur de l'usage quotidien)
Nouvelles + téléversement de photos
Messagerie temps réel
Saison, Plans, Relais, Vidéos, Signaux, GC
Tableau de bord Direction, exports, imports Excel
Notifications courriel, PWA, favicon, métadonnées SEO
Domaine personnalisé + tests sur iPhone et Android réels

Lancement recommandé : une seule équipe pilote pendant 2 à 3 semaines avant d'ouvrir à toute l'organisation.

11. Notes de conformité
Loi 25 (Québec) : les fiches contiennent des renseignements personnels de mineurs, dont des données médicales. Prévoir une politique de confidentialité accessible depuis le site, un consentement explicite à l'inscription (déjà présent pour les photos — ajouter un consentement général au traitement des données), et une procédure de suppression sur demande.
Consentement photo : déjà modélisé (photo_consent). L'interface doit permettre à l'admin de filtrer rapidement les athlètes sans consentement avant toute publication de photos d'équipe.
Rétention : prévoir l'archivage des équipes en fin de saison (archived) plutôt que la suppression, mais permettre la suppression complète d'un compte sur demande d'un parent.
