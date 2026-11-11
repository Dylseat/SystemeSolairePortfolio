# Tests

🇫🇷 **Français** · 🇬🇧 [English](TESTS.md)

Trois niveaux de tests, tous lancés automatiquement par la CI GitHub Actions à chaque push sur `main` et à chaque pull request (voir [guide CI/CD](.github/workflows/README.fr.md)).

| Niveau | Outil | Où | Ce qui est testé |
| --- | --- | --- | --- |
| Unitaires | Vitest + Testing Library | `frontend/src/**/*.test.ts(x)` | Une brique isolée : les données, un hook, un composant |
| Fonctionnels | Vitest + Testing Library | `frontend/src/App.test.tsx` | Plusieurs briques ensemble, dans un navigateur simulé (jsdom) |
| End-to-end | Playwright | `frontend/e2e/` | Le vrai site (build de production) dans un vrai Chromium, sur bureau et sur mobile |

## Lancer les tests

```bash
cd frontend
npm test              # unitaires et fonctionnels
npm run test:watch    # idem, relancés à chaque modification
npm run test:e2e      # end-to-end (la première fois : npx playwright install chromium)
```

## Tests unitaires

### Données du CV — `src/data/planets.test.ts`

| Test | Pourquoi |
| --- | --- |
| Chaque section a un id unique | Le menu, la caméra et le panneau retrouvent une section par son id : un doublon ouvrirait la mauvaise |
| La présentation est en premier, le contact est présent | Ordre du menu attendu |
| Chaque section a du contenu | Évite un panneau vide après une modification du contenu |
| Chaque entrée a un titre, un lieu et une période | Une expérience ou une formation incomplète serait visible par un recruteur |
| Les liens sont en `https://` ou `mailto:` | Pas de lien cassé ou non sécurisé |
| Aucune donnée personnelle sensible | Garde-fou : ni téléphone, ni date de naissance, ni adresse postale sur le site public |
| La photo de profil existe | Pas d'image cassée dans le panneau et la version texte |
| Compétences et technologies sont deux planètes qui se suivent, comme sur le CV | Le site et le CV restent organisés de la même façon |
| Les orbites des planètes ne se chevauchent pas | Deux planètes ne peuvent pas se traverser en tournant |
| La Lune tourne entre le Soleil et la première planète | Elle ne traverse ni le Soleil ni une planète |
| Le mini-jeu est jouable et n'est plus signalé « en construction » | Le bouton « Jouer » apparaît dans son panneau |

### Hook — `src/hooks/useMediaQuery.test.ts`

| Test | Pourquoi |
| --- | --- |
| Détecte un petit écran | Déclenche la mise en page mobile |
| Détecte « réduire les animations » | Accessibilité : orbites figées, caméra sans transition |
| Se met à jour quand l'écran change | Rotation du téléphone, fenêtre redimensionnée |
| Arrête d'écouter au démontage | Pas de fuite mémoire |

### Mini-jeu — `src/game/*.test.ts`

La logique du jeu est séparée de l'affichage : elle se teste sans WebGL, et la même logique servira à la version 2D.

| Test | Pourquoi |
| --- | --- |
| La partie commence à la vague 1, avec 3 vies et un score nul | Point de départ connu |
| Le vaisseau se déplace au clavier sans sortir de l'écran, et pas plus vite en diagonale | Commandes justes |
| Le tir respecte une cadence maximale | On ne peut pas tirer à chaque image |
| Un ennemi touché est détruit et rapporte ses points | Score correct |
| Un choc fait perdre une vie, puis le vaisseau est invulnérable un moment | Pas de vies perdues en rafale |
| Sans vie, la partie s'arrête | Fin de partie |
| Une vague terminée lance la suivante, plus nombreuse et plus variée | Difficulté progressive |
| Même graine, même partie | Parties reproductibles dans les tests |
| WASD (QWERTZ) et ZQSD (AZERTY) sont lus par la position physique des touches, flèches et Espace compris | Le jeu marche avec les claviers suisses et français |
| Le meilleur score, le volume et le choix « son coupé » sont gardés dans le navigateur ; un volume invalide est ignoré ; rien ne plante quand le stockage est bloqué | Pas de plantage en navigation privée |
| Le pilote automatique de la démo tire, se place sous l'ennemi le plus proche, esquive les tirs et marque des points (`autopilot.test.ts`) | La démo du panneau montre une vraie partie |
| Le dessin 2D affiche une partie en cours ou terminée sans erreur (`render2d.test.ts`) | Base de la démo sur écran tactile et de la future version mobile |
| Le vaisseau autour de la planète vise les ennemis à tour de rôle, orange compris, saute ceux qui ont explosé ou que la planète cache, et ne tire jamais à travers la planète (simulation de 60 s) (`orbitBattleLogic.test.ts`) | L'aperçu montre bien les trois ennemis du jeu, avec des tirs crédibles |

### Statistiques — `src/analytics.test.ts`

| Test | Pourquoi |
| --- | --- |
| Un événement est envoyé à GoatCounter | Les clics comptés apparaissent dans le tableau de bord |
| Rien ne se passe si GoatCounter est absent ou bloqué | Le site fonctionne avec un bloqueur de pub (Brave…) et pendant les tests |
| Une erreur de GoatCounter ne fait pas planter le site | Une statistique perdue n'est pas grave |

### Composants

| Fichier | Tests | Pourquoi |
| --- | --- | --- |
| `LinkList.test.tsx` | Un lien par entrée ; liens externes dans un nouvel onglet (`noreferrer`) ; email dans le même onglet ; adresse en clair pour l'impression ; clic compté dans les statistiques | Le visiteur ne quitte pas le portfolio ; le PDF imprimé reste utile |
| `CvDownloadLink.test.tsx` | Lien vers le PDF avec l'attribut `download` ; téléchargement compté dans les statistiques | Le recruteur repart avec un vrai CV |
| `EntryList.test.tsx` | Titre, lieu et période ; détails affichés quand ils existent ; pas de liste vide ; ordre respecté | Lisibilité des expériences et formations |
| `InfoPanel.test.tsx` | Tout le contenu affiché ; fonctionne sans description ; photo seulement si présente ; CV PDF seulement si présent ; démo et bouton « Jouer » seulement pour le mini-jeu ; démo en 3D quand le jeu est jouable (ordinateur), en 2D sinon, avec le message « version mobile en construction » quand il n'est pas jouable ; badge « En construction » seulement si besoin ; bouton « Fermer » | Le panneau s'adapte à chaque section |
| `SectionMenu.test.tsx` | Un bouton par section + « Version texte » ; section active signalée (`aria-current`) ; bon id transmis | Navigation et accessibilité (lecteurs d'écran) |
| `CvView.test.tsx` | Nom et titre ; toutes les sections sauf le mini-jeu ; liens de contact ; impression (comptée dans les statistiques) ; téléchargement du CV en PDF ; bouton retour seulement si la 3D est disponible | La version texte est ce que lit un recruteur pressé |
| `StartHint.test.tsx` | Texte d'aide ; ne bloque pas les clics ; écran de chargement annoncé aux lecteurs d'écran | Accessibilité |
| `GameOverlay.test.tsx` | Écran d'accueil avec les commandes ; « Commencer » lance la partie (comptée dans les statistiques) ; écran de fin avec le score ; record gardé seulement s'il est battu ; musique lancée en boucle dès l’écran d’accueil, gardée en fin de partie et à « Rejouer » sans revenir au début, lancée par « Commencer » si le navigateur l’avait refusée, éteinte en fondu d’une seconde en quittant (tout de suite si le son est coupé) ; volume réglé avec le curseur et retenu ; son coupé et remis avec la touche M ; bouger le curseur remet le son ; crédit de la musique ; fermeture par Échap ou « Quitter » | Le jeu s'ouvre, se joue et se quitte proprement |
| `GamePreview3D.test.tsx` | Démo 3D du panneau : vraie scène du jeu, partie déjà avancée, jouée par le pilote automatique ; recommence quand il perd ; image fixe avec « réduire les animations » | Sur ordinateur, l'aperçu ressemble au vrai jeu |

## Tests fonctionnels — `src/App.test.tsx`

La scène 3D est remplacée par un faux composant, car jsdom n'a pas WebGL.

| Test | Pourquoi |
| --- | --- |
| Sans WebGL, la version texte s'affiche directement | Un appareil sans 3D voit quand même le CV, pas un écran vide |
| Avec WebGL, la scène s'affiche | Cas normal |
| « Version texte » ouvre le CV et ajoute `#cv` à l'adresse | Lien partageable |
| « Retour » revient à la 3D et retire `#cv` | Aller-retour sans recharger |
| Arriver avec `#cv` ouvre le CV | Le lien envoyé à un recruteur fonctionne |
| Changer `#cv` dans l'adresse suit l'affichage | Navigation cohérente |
| Les ouvertures de la version texte sont comptées, depuis le menu et par un lien `#cv` | Savoir si les recruteurs utilisent la version texte |

## Tests end-to-end — `e2e/portfolio.spec.ts`

Lancés sur deux appareils : **bureau** (Chrome) et **mobile** (Pixel 7).

| Test | Pourquoi |
| --- | --- |
| La page se charge et toutes les sections s'ouvrent sans erreur JavaScript | Détecte un plantage (écran vide) comme celui rencontré en développement |
| Ouvrir une section depuis le menu, puis la fermer (Échap et « Fermer ») | Parcours principal du visiteur |
| Les liens de contact sont corrects | Un recruteur doit pouvoir écrire |
| Cliquer sur le Soleil ouvre la présentation (bureau) | Vérifie le clic dans la scène 3D elle-même |
| La version texte s'ouvre depuis le menu et on peut revenir | Parcours du recruteur pressé |
| Le lien `#cv` ouvre directement la version texte, sans le mini-jeu | Lien partageable |
| Sur mobile, le menu tient sur une ligne et le panneau s'ouvre en bas | Mise en page mobile |
| Avec « réduire les animations », les animations sont coupées | Accessibilité |
| Chaque ouverture de section est comptée une fois dans les statistiques | Savoir quelles sections intéressent les visiteurs, sans compter deux fois la même |
| Sur bureau, le mini-jeu montre sa démo 3D (pas la 2D) dans le panneau, se lance depuis sa planète, se joue (déplacement et tir) sans erreur, puis se quitte avec Échap | Le jeu fonctionne dans un vrai navigateur |
| Sur mobile, le panneau du mini-jeu prévient que la version mobile est en construction, sans bouton « Jouer », mais avec la démo 2D (pas la 3D) | Le visiteur sur téléphone sait pourquoi il ne peut pas jouer |

## Rapports dans GitHub Actions

- **Résumé du job** : pour chaque niveau, un tableau en français (réussis, échecs, erreurs, ignorés, durée), le détail des échecs et la liste de tous les tests, dans l'onglet *Summary* du run. Il est généré par [`frontend/scripts/test-summary.mjs`](frontend/scripts/test-summary.mjs) à partir des rapports JUnit.
- **Annotations** : un test qui échoue est signalé directement sur la ligne concernée.
- **Artefact `rapport-playwright`** : le rapport HTML complet des tests end-to-end, avec captures d'écran et traces des échecs (à télécharger depuis la page du run).
