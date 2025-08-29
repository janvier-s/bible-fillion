# Bible Fillion - Formats Numériques Multiples

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Licence](<https://img.shields.io/badge/licence-CC0%201.0%20(Domaine%20Public)-lightgrey.svg>)
![Validation](https://img.shields.io/badge/validation-✅%20Pass-brightgreen.svg)

Ce dépôt a pour objectif de fournir la traduction de la Bible par l'abbé **Louis-Claude Fillion (1904)** dans le plus grand nombre de formats numériques possibles. Le texte source a été analysé et structuré à partir d'une version ePub pour garantir une base de données propre et fiable, servant de "Source Unique de Vérité".

Ce projet est destiné aussi bien aux développeurs cherchant à intégrer le texte biblique dans leurs applications, qu'aux chercheurs, aux graphistes ou simplement aux lecteurs désirant une version spécifique de ce texte.

---

## Table des Matières

1.  [**Pour les Utilisateurs : Télécharger les Fichiers Prêts à l'emploi**](#pour-les-utilisateurs--télécharger-les-fichiers-prêts-à-lemploi)
2.  [**Pour les Développeurs : Générer les Formats**](#pour-les-développeurs--générer-les-formats)
    - [Prérequis](#prérequis)
    - [Installation](#installation)
    - [Utilisation du Script de Build](#utilisation-du-script-de-build)
3.  [**Validation des Données**](#validation-des-données)
4.  [**Structure du Projet**](#structure-du-projet)
5.  [**Liste Complète des Formats Disponibles**](#liste-complète-des-formats-disponibles)
6.  [**Comment Contribuer**](#comment-contribuer)
7.  [**Licence**](#licence)

---

## Pour les Utilisateurs : Télécharger les Fichiers Prêts à l'emploi

Vous n'avez pas besoin d'être développeur pour utiliser ce projet ! La manière la plus simple d'obtenir tous les formats est de télécharger la dernière archive `.zip` depuis la page des **"Releases"** de ce dépôt.

Vous y trouverez les produits finis les plus populaires, tels que :

- **Bible-Fillion.epub** - Pour votre liseuse (Kobo, Apple Books) ou tablette.
- **Bible-Fillion.pdf** - Pour une lecture ou une impression de haute qualité.
- **Module-SWORD.zip** - Pour l'installer dans votre application biblique favorite.
- Et une archive complète de tous les autres formats.

<br>

> [!IMPORTANT]
> 👉 [**Cliquez ici pour accéder à la page des téléchargements (Releases)**](https://github.com/janvier-s/bible-fillion/releases) 

<br>

---

## Pour les Développeurs : Générer les Formats

Si vous souhaitez modifier le texte source, ajouter un nouveau format ou simplement régénérer les fichiers vous-même, suivez ces étapes.

### Prérequis

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) (version 16 ou supérieure)
- **Pour le module SWORD :** Les outils de build SWORD (voir script `20-build-sword-module.js`).
- **Pour le PDF de haute qualité :** Une distribution TeX comme [MacTeX](https://www.tug.org/mactex/) (macOS), [MiKTeX](https://miktex.org/download) (Windows), ou [TeX Live](https://www.tug.org/texlive/) (Linux).

### Installation

1.  **Clonez le dépôt :**

    ```bash
    git clone https://github.com/janvier-s/bible-fillion.git
    cd bible-fillion
    ```

2.  **Installez les dépendances :**
    ```bash
    npm install
    ```

### Utilisation du Script de Build

Le script `scripts/build.js` est un outil flexible qui vous permet de générer exactement ce dont vous avez besoin.

#### Mode Interactif (Recommandé)

Lancez le script sans argument pour afficher un menu interactif.

```bash
node scripts/build.js
```

Vous pourrez alors choisir les formats ou les groupes de formats à générer à l'aide des flèches et de la barre d'espace.

#### Mode Non-Interactif

Spécifiez les formats ou les groupes directement en arguments. C'est idéal pour l'automatisation.

- `node scripts/build.js html` (Génère uniquement le format HTML)
- `node scripts/build.js databases` (Génère tous les formats de base de données)
- `node scripts/build.js sword-module` (Génère le module SWORD et ses dépendances)
- `node scripts/build.js --all` (Génère tous les formats)

---

## Validation des Données

Pour garantir l'intégrité, la complétude et la continuité du texte biblique source, un script de validation a été créé. Il vérifie l'absence de versets manquants, de chapitres dupliqués ou de toute autre anomalie dans les fichiers `source/`.

Pour lancer la validation, exécutez :

```bash
node scripts/validate.js
```

---

## Structure du Projet

```
.
├── assets/             # Contient les ressources comme l'image de couverture et le template XeTeX.
├── formats/            # (Généré) Contient tous les fichiers finaux. N'est pas dans Git.
├── metadata/           # Contient les métadonnées (noms des livres, schémas, etc.).
├── scripts/            # Contient tous les scripts de génération et de validation.
├── source/             # La "Source de Vérité" : 73 fichiers JSON, un par livre.
├── build.js            # Le script de build principal.
└── README.md           # Ce fichier.
```

---

## Liste Complète des Formats Disponibles

| Catégorie              | Format / Extension        | Description / Cas d'Usage                                                     |
| ---------------------- | ------------------------- | ----------------------------------------------------------------------------- |
| **Produits Finis**     | `ePub (.epub)`            | Format standard pour liseuses (Kobo, Apple Books) et tablettes.               |
| **(Prêts à l'emploi)** | `PDF (via XeTeX)`         | PDF de haute qualité typographique, idéal pour l'impression et la lecture.    |
|                        | `Module SWORD (.zip)`     | **Module installable** pour des dizaines d'apps (AndBible, Xiphos, etc.).     |
| ---                    | ---                       | ---                                                                           |
| **Texte Source**       | `JSON (imbriqué)`         | La source de vérité. Structure intuitive : livre → chapitres → versets.       |
| **Texte & Web**        | `JSON (plat)`             | Idéal pour des recherches rapides de versets par clé (ex: `GEN.1.1`).         |
|                        | `JSONL (.jsonl)`          | Parfait pour le streaming de données et les outils de Big Data.               |
|                        | `Texte Brut (.txt)`       | Pour une lisibilité maximale et une compatibilité universelle.                |
|                        | `HTML (.html)`            | Pour une lecture simple et stylisée dans un navigateur web.                   |
|                        | `Markdown (.md)`          | Idéal pour la documentation et les générateurs de sites statiques.            |
|                        | `reStructuredText (.rst)` | Alternative à Markdown, utilisée par Sphinx et dans l'écosystème Python.      |
| **Lecteur**            | `HTML / TXT (lecteur)`    | Versions sans numéros de versets pour une lecture fluide et immersive.        |
| **Bases de Données**   | `SQLite (.sqlite)`        | Base de données unique, sans serveur. Parfaite pour les apps mobiles/desktop. |
|                        | `SQL (.sql)`              | Script de création et d'insertion pour MySQL, PostgreSQL, etc.                |
|                        | `CSV (.csv)`              | Pour l'analyse de données dans des tableurs (Excel) ou avec Python/R.         |
| **Interchange**        | `USFM (.usfm)`            | **Standard de l'industrie.** Requis pour YouVersion, BibleGateway, etc.       |
|                        | `OSIS (XML)`              | Standard XML pour les textes bibliques, utilisé par SWORD.                    |
|                        | `USFX (XML)`              | Représentation XML directe du format USFM.                                    |
|                        | `XML (générique)`         | Un format XML simple et personnalisé pour une interopérabilité facile.        |
| **Logiciels Spéc.**    | `VPL (.vpl)`              | Format "un verset par ligne" pour des logiciels comme BibleWorks.             |

---

## Comment Contribuer

Les contributions sont les bienvenues !

- **Signaler une coquille :** Si vous trouvez une erreur dans le texte, merci d'ouvrir une [**"Issue"**](https://github.com/janvier-s/bible-fillion/issues) en précisant le livre, le chapitre et le verset.
- **Suggérer un format :** Vous avez une idée pour un nouveau format utile ? Ouvrez une "Issue" pour en discuter.
- **Améliorer un script :** N'hésitez pas à "forker" le dépôt et à soumettre une "Pull Request".

---

## Licence

Le texte de la Bible Fillion (1904) est dans le **domaine public**.

Tout le code source, les scripts et les données structurées de ce projet sont également dédiés au domaine public sous la licence [Creative Commons Zéro (CC0 1.0 Universal)](https://creativecommons.org/publicdomain/zero/1.0/deed.fr). Vous êtes libre de copier, modifier, distribuer et utiliser ce travail, y compris à des fins commerciales, sans aucune restriction.
