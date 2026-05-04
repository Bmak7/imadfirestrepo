# Enterprise Climat Social App (Local-First)

Application React professionnelle pour diagnostic du climat social, avec stockage local IndexedDB.

## Roles

- **Admin**
  - Authentification obligatoire
  - Compte par defaut: `admin1@gmail.com` / `admin@123`
  - Cree les comptes **Chef de Service**
  - Lance des campagnes en utilisant un **questionnaire statique** (issu du document)
  - Assigne une campagne a tous les services ou a une selection
  - Consulte les analyses globales

- **Chef de Service**
  - Authentification obligatoire
  - Consulte les campagnes assignees
  - Genere les QR codes pour ses employes
  - Analyse les reponses de son service (KPI + details)

- **Employe**
  - Acces via QR code/lien
  - Repond au questionnaire statique
  - Reponses anonymes stockees localement

## Questionnaire statique

Le questionnaire est fixe (35 questions Likert + 3 questions ouvertes), structure en 7 axes:
1. Relations de travail
2. Leadership et supervision
3. Communication interne
4. Conditions et environnement de travail
5. Sante, securite et environnement (HSE)
6. Motivation et satisfaction professionnelle
7. Equite interne

## Stack

- React + React Router
- Tailwind CSS
- IndexedDB via `idb`
- QR codes via `qrcode.react`

## Design system

- UI enterprise moderne (palette bleu/gris avec accents orange/vert)
- Dashboard cards, tables, formulaires accessibles et navigation role-based
- Etats hover/focus coherents, messages d erreur visuels et structure clavier-friendly

## Run

```bash
npm install
npm run dev
```

## Acces reseau pour QR code

Pour que des employes sur le meme reseau scannent le QR code:

```bash
npm run dev:network
```

Puis utilisez dans le dashboard Chef une URL de type `http://IP_DE_VOTRE_MACHINE:5173`.
# imadfirestrepo
