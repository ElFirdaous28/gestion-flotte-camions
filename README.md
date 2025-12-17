# Application de Gestion de Flotte

Un système complet de gestion de flotte construit avec la pile MERN (MongoDB, Express, React, Node.js) pour gérer les camions, les remorques, les pneus, les trajets, les conducteurs et les calendriers de maintenance.

## 📋 Table des matières

- [Fonctionnalités](#fonctionnalités)
- [Structure du projet](#structure-du-projet)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Initialisation des données](#initialisation-des-données-de-base)
- [Lancer l'application](#lancer-lapplication)
- [Tests](#tests)
- [Déploiement Docker](#déploiement-docker)
- [Documentation API](#documentation-api)
- [Technologies](#technologies)
- [Contribution](#contribution)
- [FAQ & Dépannage](#-faq--dépannage)
- [Licence](#licence)

## ✨ Fonctionnalités

### Fonctionnalités Admin
- **Tableau de bord**: Vue d'ensemble des opérations de flotte
- **Gestion des camions**: Opérations CRUD pour les camions (immatriculation, marque, modèle, suivi kilométrage)
- **Gestion des remorques**: Gestion des remorques et leurs spécifications
- **Gestion des pneus**: Suivi de l'inventaire et du cycle de vie des pneus
- **Gestion des trajets**: Créer et surveiller les trajets de livraison
- **Gestion des conducteurs**: Gérer les profils et les affectations des conducteurs
- **Gestion de la maintenance**: 
  - Suivi des calendriers de maintenance
  - Affichage des alertes et de l'historique de maintenance
  - Définition des règles de maintenance personnalisées
  - Notifications de maintenance automatiques
- **Rapports**: Générer des rapports administratifs
- **Paramètres**: Configuration du système

### Fonctionnalités Conducteur
- **Tableau de bord**: Statistiques personnelles et affectations
- **Mes trajets**: Afficher et gérer les trajets affectés
- **Paramètres**: Mettre à jour les préférences personnelles

### Sécurité
- Authentification basée sur JWT
- Contrôle d'accès basé sur les rôles (Admin, Conducteur)
- Validation des demandes avec schémas Zod
- Hachage sécurisé des mots de passe

### Notifications
- Alertes de maintenance en temps réel
- Notifications par email via Mailtrap
- Architecture événementielle avec EventEmitter

## 📁 Structure du Projet

```
fleet-management-app/
├── backend/
│   ├── .env.example               # Modèle de variables d'environnement
│   ├── .eslintrc.json             # Configuration ESLint
│   ├── .prettierrc                # Règles de formatage du code
│   ├── jest.config.js             # Configuration Jest
│   ├── server.js                  # Point d'entrée du serveur
│   ├── package.json               # Dépendances
│   ├── controllers/               # Contrôleurs des routes
│   ├── models/                    # Schémas MongoDB
│   ├── routes/                    # Routes API
│   ├── schemas/                   # Schémas de validation Zod
│   ├── services/                  # Logique métier
│   ├── middleware/                # Middleware personnalisé
│   ├── tests/                     # Fichiers de test
│   ├── seeders/                   # Seeders de base de données
│   ├── utils/                     # Fonctions utilitaires
├── frontend/
│   ├── .env.example               # Modèle de variables d'environnement
│   ├── .eslintrc.js               # Configuration ESLint
│   ├── .prettierrc                # Règles de formatage du code
│   ├── vite.config.js             # Configuration Vite
│   ├── tailwind.config.js         # Configuration Tailwind CSS
│   ├── postcss.config.js          # Configuration PostCSS
│   ├── package.json               # Dépendances
│   ├── index.html                 # Point d'entrée HTML
│   ├── jsconfig.json              # Configuration JavaScript
│   ├── public/                    # Ressources statiques
│   └── src/
│       ├── components/            # Composants React réutilisables
│       ├── pages/                 # Composants de pages
│       ├── layouts/               # Composants de mise en page
│       ├── features/              # Slices Redux
│       └── assets/                # Images et médias
├── docker-compose.yml             # Configuration Docker Compose
└── README.md                       # Ce fichier
```

## 📋 Prérequis

- **Node.js** >= 18.x
- **npm** >= 6.x ou **yarn**
- **MongoDB** >= 4.x
- **Docker** & **Docker Compose** (optionnel)
- **Git**

## 🚀 Installation

### 1. Cloner le Référentiel

```bash
git clone https://github.com/AsforDounia/fleet-management-app.git
cd fleet-management-app
```

### 2. Installer les Dépendances du Backend

```bash
cd backend
npm install
```

### 3. Installer les Dépendances du Frontend

```bash
cd ../frontend
npm install
```

## ⚙️ Configuration

### Configuration du Backend

1. Créer un fichier `.env` dans le répertoire `backend` :

```bash
cp backend/.env.example backend/.env
```

2. Remplir les variables d'environnement requises :

```env
PORT=5000

MONGO_URI=mongodb://localhost:27017/fleet-management

JWT_SECRET=your-secret-key-here

MAILTRAP_HOST=sandbox.smtp.mailtrap.io
MAILTRAP_PORT=465
MAILTRAP_USER=your-mailtrap-user
MAILTRAP_PASS=your-mailtrap-password
EMAIL_FROM=noreply@fleet-management.com
```

**Note**: Obtenez les identifiants Mailtrap sur [mailtrap.io](https://mailtrap.io)

### Configuration du Frontend

1. Créer un fichier `.env` dans le répertoire `frontend` :

```bash
cp frontend/.env.example frontend/.env
```

2. Remplir les variables d'environnement requises :

```env
VITE_API_URL=http://localhost:5000/api
VITE_PORT=5173
```

## � Initialisation des Données de Base

Pour peupler la base de données avec des données de test et de développement, utilisez le seeder principal:

### Exécuter le Master Seeder

```bash
cd backend
npm run seed:all
```

Le **masterSeeder** crée automatiquement:

| Ressource | Quantité | Description |
|-----------|----------|-------------|
| 👥 Utilisateurs | 10 | 1 admin + 9 chauffeurs |
| 🚛 Camions | 10 | Différentes marques et modèles |
| 🚐 Remorques | 10 | Diverses capacités de charge |
| 🛞 Pneus | 15 | Stocks et montages variés |
| 📍 Trajets | 10 | Trajets terminés, en cours et planifiés |
| ⛽ Ravitaillements | 10 | Historique de carburant |
| 🔧 Règles de Maintenance | 6 | Règles périodiques configurées |
| 📋 Journal Maintenance | 5 | Historique des opérations |
| 🔔 Notifications | 3 | Alertes de maintenance |


**⚠️ Important**: Modifiez les mots de passe par défaut en production!

### Réinitialiser les Données

Le seeder supprime automatiquement les collections existantes avant de les remplir. Pour une réinitialisation complète:

```bash
cd backend
npm run seed:all
```

Cela supprimera et recréera toutes les données.

## �🏃 Lancer l'Application

### Mode Développement

#### Démarrer MongoDB

```bash
# Utiliser MongoDB localement
mongod

# Ou utiliser Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

#### Démarrer le Serveur Backend

```bash
cd backend
npm run dev
```

Le backend s'exécutera sur `http://localhost:5000`

#### Démarrer le Serveur Frontend

```bash
cd frontend
npm run dev
```

Le frontend s'exécutera sur `http://localhost:5173`

### Mode Production

#### Backend

```bash
cd backend
npm run build
npm start
```

#### Frontend

```bash
cd frontend
npm run build
npm preview
```

## 🧪 Tests

### Tests du Backend

```bash
cd backend
npm test

# Exécuter un fichier de test spécifique
npm test -- camion.test.js
```

La suite de tests inclut:
- ✅ Tests d'authentification
- ✅ Tests de gestion des camions
- ✅ Tests d'autorisation des routes
- ✅ Tests de gestion des erreurs

## 🐳 Déploiement Docker

### Utiliser Docker Compose

1. Construire et démarrer tous les services :

```bash
docker-compose up -d --build
```

2. Vérifier que les services s'exécutent :

```bash
docker-compose ps
```

3. Afficher les logs :

```bash
docker-compose logs -f
```

4. Arrêter les services :

```bash
docker-compose down
```

### Services Docker

- **Backend**: Serveur API Node.js (port 5000)
- **Frontend**: Serveur développement React (port 5173)
- **MongoDB**: Base de données NoSQL (port 27017)

### Images Docker

Chaque service a son propre Dockerfile optimisé:

**Backend Dockerfile** (`backend/Dockerfile`)
- Image de base: Node.js 18 Alpine
- Optimisé pour le développement et la production
- Expose le port 5000
- Volume: `/app`

**Frontend Dockerfile** (`frontend/Dockerfile`)
- Build multi-étapes pour optimiser la taille
- Image de base: Node.js 18 Alpine
- Utilise `serve` pour servir l'application
- Expose le port 5173
- Volume: `/app`

**Docker Compose** (`docker-compose.yml`)
- Gère l'orchestration des services (backend, frontend, MongoDB)
- Variables d'environnement configurables
- Volumes persistants pour les données
- Réseaux internes pour la communication inter-services

Pour reconstruire les images après des modifications:
```bash
docker-compose up -d --build
```

## 📚 Documentation API

Pour la documentation API complète et détaillée, consultez le dossier [backend/docs](backend/docs).

### Itinéraires d'Authentification

**POST** `/api/auth/login`
- Se connecter avec email et mot de passe
- Retourne le token JWT et les données utilisateur

**POST** `/api/auth/logout`
- Se déconnecter et invalider le token

**POST** `/api/auth/refresh`
- Rafraîchir le token JWT
- Nécessite l'authentification

### Itinéraires Camions

**GET** `/api/camions`
- Récupérer tous les camions
- Nécessite l'authentification

**POST** `/api/camions`
- Créer un nouveau camion
- Nécessite le rôle admin

**PUT** `/api/camions/:id`
- Mettre à jour les informations du camion
- Nécessite le rôle admin

**DELETE** `/api/camions/:id`
- Supprimer un camion
- Nécessite le rôle admin

### Itinéraires Maintenance

**GET** `/api/maintenance`
- Récupérer tous les enregistrements de maintenance

**GET** `/api/maintenance/alerts`
- Récupérer les alertes de maintenance actives

**GET** `/api/maintenance/journal`
- Afficher l'historique du journal de maintenance

**GET** `/api/maintenance/rules`
- Récupérer les règles de maintenance

### Itinéraires Pneus

**GET** `/api/pneus`
- Récupérer tous les pneus
- Nécessite l'authentification

**GET** `/api/pneus/:id`
- Récupérer un pneu spécifique
- Nécessite l'authentification

**POST** `/api/pneus`
- Ajouter un nouveau pneu
- Nécessite le rôle admin

**PUT** `/api/pneus/:id`
- Mettre à jour les informations du pneu
- Nécessite le rôle admin

**DELETE** `/api/pneus/:id`
- Supprimer un pneu
- Nécessite le rôle admin

### Itinéraires Trajets

**GET** `/api/trajets`
- Récupérer tous les trajets
- Nécessite l'authentification

**GET** `/api/trajets/:id`
- Récupérer un trajet spécifique
- Nécessite l'authentification

**POST** `/api/trajets`
- Créer un nouveau trajet
- Nécessite le rôle admin

**PUT** `/api/trajets/:id`
- Mettre à jour un trajet
- Nécessite le rôle admin

**DELETE** `/api/trajets/:id`
- Supprimer un trajet
- Nécessite le rôle admin

### Itinéraires Remorques

**GET** `/api/remorques`
- Récupérer toutes les remorques
- Nécessite l'authentification

**GET** `/api/remorques/:id`
- Récupérer une remorque spécifique
- Nécessite l'authentification

**POST** `/api/remorques`
- Ajouter une nouvelle remorque
- Nécessite le rôle admin

**PUT** `/api/remorques/:id`
- Mettre à jour les informations de la remorque
- Nécessite le rôle admin

**DELETE** `/api/remorques/:id`
- Supprimer une remorque
- Nécessite le rôle admin

### Itinéraires Utilisateurs

**GET** `/api/users`
- Récupérer tous les utilisateurs
- Nécessite le rôle admin

**GET** `/api/users/:id`
- Récupérer les détails d'un utilisateur
- Nécessite l'authentification

**PUT** `/api/users/:id`
- Mettre à jour un profil utilisateur
- L'utilisateur ne peut modifier que son profil

**DELETE** `/api/users/:id`
- Supprimer un utilisateur
- Nécessite le rôle admin

### Itinéraires Ravitaillement

**GET** `/api/ravitaillement`
- Récupérer tous les ravitaillements
- Nécessite l'authentification

**GET** `/api/ravitaillement/:id`
- Récupérer un ravitaillement spécifique
- Nécessite l'authentification

**POST** `/api/ravitaillement`
- Enregistrer un nouveau ravitaillement
- Nécessite le rôle admin/chauffeur

**PUT** `/api/ravitaillement/:id`
- Mettre à jour un ravitaillement
- Nécessite le rôle admin

**DELETE** `/api/ravitaillement/:id`
- Supprimer un ravitaillement
- Nécessite le rôle admin

### Itinéraires Notifications

**GET** `/api/notifications`
- Récupérer toutes les notifications
- Nécessite l'authentification

**GET** `/api/notifications/non-lues`
- Récupérer les notifications non lues
- Nécessite l'authentification

**PUT** `/api/notifications/:id/marquer-comme-lu`
- Marquer une notification comme lue
- Nécessite l'authentification

**DELETE** `/api/notifications/:id`
- Supprimer une notification
- Nécessite l'authentification

### Itinéraires Rapports

**GET** `/api/rapports/resume`
- Récupérer un résumé général
- Nécessite le rôle admin

**GET** `/api/rapports/trajets`
- Récupérer le rapport sur les trajets
- Nécessite le rôle admin

**GET** `/api/rapports/maintenance`
- Récupérer le rapport sur la maintenance
- Nécessite le rôle admin

**GET** `/api/rapports/carburant`
- Récupérer le rapport sur la consommation de carburant
- Nécessite le rôle admin

**GET** `/api/rapports/export-pdf`
- Exporter les rapports en PDF
- Nécessite le rôle admin

## 🛠 Technologies

### Backend
- **Node.js & Express**: Framework serveur
- **MongoDB & Mongoose**: Base de données NoSQL et ODM
- **JWT**: Authentification
- **Zod**: Validation de schémas
- **Jest & Supertest**: Framework de test
- **Node-cron**: Planification de tâches
- **Mailtrap**: Service d'email
- **EventEmitter**: Architecture événementielle

### Frontend
- **React 18**: Bibliothèque d'interface utilisateur
- **Vite**: Outil de construction
- **Redux Toolkit**: Gestion d'état
- **React Router**: Routage côté client
- **React Hook Form**: Gestion de formulaires
- **Zod**: Validation de schémas
- **Tailwind CSS**: Styling
- **Shadcn UI**: Bibliothèque de composants
- **React Icons**: Bibliothèque d'icônes

## 🤝 Contribution

1. Forker le référentiel
2. Créer une branche de fonctionnalité: `git checkout -b feature/amazing-feature`
3. Valider les modifications: `git commit -m 'Add amazing feature'`
4. Pousser vers la branche: `git push origin feature/amazing-feature`
5. Ouvrir une Pull Request

## ❓ FAQ & Dépannage

### Q: Le backend ne démarre pas avec l'erreur "Cannot find module"
**A:** Assurez-vous d'avoir installé les dépendances:
```bash
cd backend
npm install
```

### Q: La connexion à MongoDB échoue
**A:** Vérifiez que:
1. MongoDB est en cours d'exécution (`mongod` ou via Docker)
2. La variable `MONGO_URI` dans `.env` est correcte
3. Le service MongoDB n'a pas atteint sa limite de connexions

### Q: Les tests échouent
**A:** 
- Nettoyez les dépendances: `npm ci` (au lieu de `npm install`)
- Supprimez `node_modules` et réinstallez: `rm -rf node_modules && npm install`
- Assurez-vous que MongoDB est actif pour les tests

### Q: Le frontend n'affiche pas l'API
**A:** Vérifiez:
1. `VITE_API_URL` dans `frontend/.env` pointe vers le bon endpoint
2. Le backend est démarré et accessible
3. Les CORS sont configurés correctement dans le backend

### Q: Les Dockerfiles ne compilent pas
**A:** 
- Assurez-vous que Docker est installé et actif
- Nettoyez les images: `docker system prune -a`
- Reconstruisez: `docker-compose up -d --build`

### Q: Mon port 5000 ou 5173 est déjà en utilisation
**A:** Changez le port dans `package.json` ou `.env`:
```env
PORT=5001  # ou un autre port disponible
VITE_PORT=5174
```

### Q: Comment réinitialiser la base de données complètement?
**A:** 
```bash
cd backend
npm run seed:all  # Réinsère toutes les données de base
# Ou supprimez manuellement:
db.dropDatabase()  # Dans MongoDB Shell
```

### Q: Comment générer une nouvelle clé JWT secrète?
**A:** Dans `backend/.env`, remplacez `JWT_SECRET` par:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Q: Puis-je exécuter l'application en production?
**A:** Oui, voir la section **Mode Production** pour les commandes. Assurez-vous que:
- Les variables d'environnement sont correctement configurées
- MongoDB est sur un serveur distant sécurisé
- JWT_SECRET est une clé forte et aléatoire
- Les logs sont activés et surveillés

## 📝 Licence

Ce projet est sous licence MIT - consultez le fichier LICENSE pour plus de détails.

## 👥 Support

Pour les problèmes, questions ou retours, veuillez contacter [noreply@fleet.com](mailto:noreply@fleet.com)
---

**Dernière mise à jour**: 16 décembre 2025
**Version**: 1.0.0
