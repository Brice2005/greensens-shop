# Plan GREENSEN SHOP

## Approche
GREENSEN SHOP reprend la séparation claire du projet micro-finance fourni : une interface de présentation, des routes React, une couche serveur tRPC, une couche d’accès aux données et un modèle relationnel. La persistance cible PostgreSQL externe via `PG_DATABASE_URL`, sans secret dans le dépôt. En l’absence de cette variable, l’interface reste navigable en mode démonstration avec des données locales explicites.

Le modèle relationnel couvre `users`, `seller_profiles`, `categories`, `products`, `orders`, `order_items`, `seller_requests` et `favorites`. Les rôles sont `client`, `seller` et `admin`; un client peut déposer une demande vendeur, l’administrateur la valide, puis le vendeur publie son catalogue. Les commandes imposent une quantité minimale de 10 kg par ligne.

## Structure
- `client/src/pages/Home.tsx` : expérience d’achat et tableaux de bord contextualisés.
- `client/src/App.tsx` : routes publiques et pages fonctionnelles.
- `client/src/index.css` : système visuel, responsive et composants de marque.
- `server/routers.ts` : procédures tRPC destinées aux catalogues, paniers et commandes.
- `server/db.ts` : connexion PostgreSQL optionnelle et requêtes persistantes.
- `drizzle/schema.ts` : schéma PostgreSQL Drizzle.
- `public/manus-routes.json` : manifeste des routes de page.

## Direction artistique choisie
Trois pistes : marché éditorial organique (0,07), dashboard agricole dense (0,06), minimalisme coopératif premium (0,08). Choix : **marché éditorial organique**.

- **Design Movement** : identité de coopérative agricole contemporaine, entre carnet de récolte et commerce de proximité.
- **Principes** : confiance visible, information directe, rythme éditorial, actions tactiles.
- **Couleurs** : vert forêt pour la confiance, lime doux pour la récolte, crème papier pour la chaleur, orange terre cuite pour les alertes d’action.
- **Layout** : navigation latérale légère et grandes respirations, avec une colonne éditoriale de mise en avant au-dessus d’un catalogue asymétrique.
- **Signature** : marque en capsule, pastilles de disponibilité, cartes produits avec bandeau de saison.
- **Interaction** : chaque action confirme le contexte : poids minimum visible, provenance et vendeur toujours proches du prix.
- **Animation** : transitions de 180–260 ms, apparition douce des cartes, aucun mouvement décoratif excessif.
- **Typographie** : DM Sans pour l’interface, Fraunces pour les accroches éditoriales.
- **Essence** : l’approvisionnement agricole en gros, lisible et direct. Personnalité : fiable, fraîche, engagée.
- **Voix** : « Des récoltes qui tiennent leurs promesses. » / « Ajoutez au panier, nous préparons le départ. »
- **Logo** : wordmark GREENSEN dans une capsule, avec un point de semence à la place du point du I.
- **Couleur propriétaire** : vert “canopée” `#174C3C`.
