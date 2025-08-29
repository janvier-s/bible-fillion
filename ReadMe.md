# Bible Fillion 1904 (complète) - Édition numérique en plus de 20 formats pour lecteurs, développeurs et chercheurs.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Licence](<https://img.shields.io/badge/licence-CC0%201.0%20(Domaine%20Public)-lightgrey.svg>)
![Validation](https://img.shields.io/badge/validation-✅%20Pass-brightgreen.svg)

Ce dépôt a pour objectif de fournir la traduction de la Bible par l'abbé **Louis-Claude Fillion (1904)** dans le plus grand nombre de formats numériques possibles. Le texte source a été analysé et structuré à partir d'une version ePub pour garantir une base de données propre et fiable, servant de "Source Unique de Vérité".

Ce projet est destiné aussi bien aux développeurs cherchant à intégrer le texte biblique dans leurs applications, qu'aux chercheurs, aux graphistes ou simplement aux lecteurs désirant une version spécifique de ce texte. ePub, PDF, SQLite, USFM, OSIS, JSON et plus.

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
8.  [**La Bible**](#la-bible)

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
├── formats/            # (Généré) Contient tous les fichiers finaux.
├── metadata/           # Contient les métadonnées (noms des livres, schémas, etc.).
├── scripts/            # Contient tous les scripts de génération et de validation.
├── source/             # La "Source de Vérité" : 73 fichiers , un par livre.
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
| **Texte Source**       | ` (imbriqué)`         | La source de vérité. Structure intuitive : livre → chapitres → versets.       |
| **Texte & Web**        | ` (plat)`             | Idéal pour des recherches rapides de versets par clé (ex: `GEN.1.1`).         |
|                        | `L (.l)`          | Parfait pour le streaming de données et les outils de Big Data.               |
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

---

# LA BIBLE

La Bible, du grec _ta biblia_ (les livres), est la compilation de no Saintes Écritures. Fondement majeur de notre culture Chrétienne, son influence est planétaire. Plus de 40 millions d'exemplaires sont vendus chaque année.

Composée de 73 livres, la Bible se répartit en deux grandes sections: 46 livres pour l'Ancien Testament et 27 livres pour le Nouveau Testament. Sa rédaction s'étend sur plusieurs siècles: vers le IXe av. J.-C. au début du Ier siècle ap. J.-C.

L'Ancien Testament est composé du Pentateuque (les cinq premiers livres), des livres "prophétiques", "poétiques" et "historiques". Écrit en langue hébraïque, l'Ancien Testament raconte la relation d'alliance entre Dieu et son peuple, dans l'attente du Messie et l'espérance de l'accomplissement des promesses de Dieu.

Les Chrétiens recourent à la totalité des écrits bibliques, Ancien et Nouveau Testament.

Rédigée par plusieurs auteurs, la Bible expose la révélation du mystère de Dieu et son projet de salut dans l'histoire humaine. Elle transcrit la progression de cette révélation à travers les grands événements, parmi lesquels nous pouvons citer la Création et le péché des origines, la chute de la tour de Babel et la dispersionde l'humanité sur toute la terre, l'appel de Dieu adressé à Abraham et l'épopée des patriarches, la sortie d'Égypte et le don de la Loi à Moïse, l'entrée en Terre promise et l'institution des rois, la construction du Temple de Jérusalem et les manquements du peuple élu, le déclin de la royauté d'Israël et l'envoi des prophètes, la déportation à Babylone et le retour de l'exil.

Cette histoire du salut est rapportée dans l'Ancien Testament ou Ancienne Alliance. Chrétiens, nous reconnaissons dans la venue de Jésus-Christ son point culminant. Pour nous, l'annonce de la bonne nouvelle de Jésus-Christ et sa réception dans la foi réalisent le salut de l'humanité. Par sa passion, sa mort et sa résurrection, Jésus de Nazareth a fondé l'Église, la communauté des croyants. Les écrits qui rapportent ces événements forment le Nouveau Testament rédigé en grec, langue commune du Proche-Orient au début de l'ère chrétienne.

---

## La Bible Fillion

Prêtre philosophe de l'Église catholique, Louis-Claude Fillion est né le 25 juin 1843 en Saône-et-Loire et mort en 1927. Ordonné prêtre en 1867, admis dans la compagnie de Saint-Sulpice, il fut professeur d'Écriture sainte et d'hébreu au grand séminaire de Reims de 1871 à 1874, et au grand séminaire de Lyon de 1874 à 1893. Au mois d'octobre 1893, il fut nommé à l'Institut Catholique de Paris où il occupa la chaire d'exégèse et d'Écriture Sainte.

Dix ans plus tard, il devint membre de la Commission Biblique. D'une vaste érudition, très au fait des travaux modernes, il écrivit de nombreux livres d'exégèse qui le rattachent à une école de pensée plutôt modérée.

La Bible Fillion, établie entre 1888 et 1904, était au départ destinée aux séminaristes. Elle fut traduite du latin d'après la Vulgate de saint Jérôme, qui uniformisa pour la première fois, à la fin du Ve siècle, les textes bibliques établis par les Septante. La Vulgate est le premier livre à avoir été imprimé par Gutenberg.

Ce canon reflète la tradition catholique, qui reconnaît les 46 livres de l’Ancien Testament (y compris les livres deutérocanoniques) et les 27 livres du Nouveau Testament. L’ordre suit l’influence de la Septante (LXX), traduction grecque des Écritures hébraïques utilisée par les premiers chrétiens, et qui comprenait les livres deutérocanoniques. La séquence précise des livres correspond à l’agencement traditionnel catholique, tel qu’il fut confirmé au Concile de Trente (1546), où l’Église catholique a officiellement défini son canon.

Le langage est précis et sans ostentation et donne une lecture traditionnelle des textes bibliques.

---

<p align="center">
Que le Seigneur bénisse votre lecture et votre entreprise avec ce texte. Que sa Parole puisse éclairer votre intelligence, apaiser votre cœur et fortifier l'esprit de tous ceux qui sont en recherche de Vérité. Et que la Lumière de Dieu éclaire votre chemin, vous guide, et vous bénisse dans touts vos projets. Nous le demandons par Jésus-Christ, Notre Seigneur, qui vit et Règne dans l'unité du Saint-Esprit, Dieu, pour les siècles des siècles. Amen.
</p>
<p align="center">
  <em>Pour la Gloire de Dieu et le Salut du Monde</em>
</p>
