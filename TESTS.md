# Tests

Trois niveaux de tests, tous lancés automatiquement par la CI GitHub Actions à chaque push sur `main` et à chaque pull request.

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
| Les orbites des planètes ne se chevauchent pas | Deux planètes ne peuvent pas se traverser en tournant |
| La Lune tourne entre le Soleil et la première planète | Elle ne traverse ni le Soleil ni une planète |

### Hook — `src/hooks/useMediaQuery.test.ts`

| Test | Pourquoi |
| --- | --- |
| Détecte un petit écran | Déclenche la mise en page mobile |
| Détecte « réduire les animations » | Accessibilité : orbites figées, caméra sans transition |
| Se met à jour quand l'écran change | Rotation du téléphone, fenêtre redimensionnée |
| Arrête d'écouter au démontage | Pas de fuite mémoire |

### Composants

| Fichier | Tests | Pourquoi |
| --- | --- | --- |
| `LinkList.test.tsx` | Un lien par entrée ; liens externes dans un nouvel onglet (`noreferrer`) ; email dans le même onglet ; adresse en clair pour l'impression | Le visiteur ne quitte pas le portfolio ; le PDF imprimé reste utile |
| `EntryList.test.tsx` | Titre, lieu et période ; détails affichés quand ils existent ; pas de liste vide ; ordre respecté | Lisibilité des expériences et formations |
| `InfoPanel.test.tsx` | Tout le contenu affiché ; fonctionne sans description ; photo seulement si présente ; bouton « Fermer » | Le panneau s'adapte à chaque section |
| `SectionMenu.test.tsx` | Un bouton par section + « Version texte » ; section active signalée (`aria-current`) ; bon id transmis | Navigation et accessibilité (lecteurs d'écran) |
| `CvView.test.tsx` | Nom et titre ; toutes les sections sauf le mini-jeu ; liens de contact ; impression ; bouton retour seulement si la 3D est disponible | La version texte est ce que lit un recruteur pressé |
| `StartHint.test.tsx` | Texte d'aide ; ne bloque pas les clics ; écran de chargement annoncé aux lecteurs d'écran | Accessibilité |

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

## Rapports dans GitHub Actions

- **Résumé du job** : un tableau des tests réussis et échoués pour chaque niveau (onglet *Summary* du run).
- **Checks** : un rapport par niveau, visible sur le commit et dans la pull request.
- **Annotations** : un test qui échoue est signalé directement sur la ligne concernée.
- **Artefact `rapport-playwright`** : le rapport HTML complet des tests end-to-end, avec captures d'écran et traces des échecs (à télécharger depuis la page du run).
