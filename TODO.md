# GREENSEN SHOP — livrables

## Catalogue client et recherche
- La page principale côté clients présente les différents produits disponibles.
- Une barre de recherche et des filtres permettent de rechercher par nom, catégorie, vendeur et disponibilité.
- Chaque fiche produit affiche le prix au kilogramme, le vendeur, la provenance et le minimum de 10 kg.

## Panier et commande en gros
- Le client dispose d’un panier.
- Le client ne peut acheter qu’en gros, avec un minimum de 10 kg par produit.
- Le panier calcule les sous-totaux, le total et empêche une quantité inférieure à 10 kg.
- Le client peut valider une commande et voir son statut.

## Comptes et rôles
- Le site propose une connexion client, vendeur et administrateur.
- Un client peut demander à devenir vendeur.
- L’administrateur peut consulter les demandes et gérer les utilisateurs, vendeurs, catégories, produits et commandes.

## Pages vendeurs
- Chaque vendeur dispose d’une page publique présentant son identité et tout son catalogue.
- L’espace vendeur synthétise les ventes, produits actifs et commandes à traiter.

## Historique client
- Le client dispose de l’historique de ses commandes avec date, lignes, montant et statut.

## Persistance PostgreSQL
- Le schéma Drizzle cible PostgreSQL et documente les tables utilisateurs, profils vendeurs, produits, commandes et lignes de commande.
- La connexion utilise exclusivement une variable protégée `PG_DATABASE_URL`; aucune valeur sensible n’est committée.

## Accès et commande client
- La boutique reste consultable sans compte.
- La commande déclenche une inscription ou une connexion obligatoire.
- L’inscription collecte le nom complet, l’adresse, le téléphone, l’e-mail et le mot de passe.
- Les coordonnées du client sont incluses dans la commande destinée au vendeur.

## Accès administrateur
- Une page dédiée `/admin/login` est prévue pour l’accès administrateur.

## Transport vendeur
- Chaque vendeur peut saisir un prix de transport en F CFA par kilogramme.
- Le tarif de transport est visible dans le catalogue et ajouté au total du panier.
