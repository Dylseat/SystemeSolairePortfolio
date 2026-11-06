// Une ligne de parcours : un poste, une formation…
export type Entry = {
  title: string
  place: string
  period: string
  details?: string[]
}

export type Link = {
  label: string
  href: string
}

export type InfoPanelData = {
  id: string
  label: string
  description?: string
  items?: string[]
  entries?: Entry[]
  links?: Link[]
  imageUrl?: string
  // Lien vers le CV en PDF, proposé en téléchargement
  cvUrl?: string
  // Section pas encore terminée : affiche un badge « En construction »
  inProgress?: boolean
}

export type PlanetData = InfoPanelData & {
  color: string
  size: number
  orbitRadius: number
  angle: number
  speed: number
}

export type MoonData = PlanetData & {
  // Inclinaison de l'orbite, en radians
  inclination: number
}

export const profile = {
  name: 'Dylan Diaz',
  title: 'Développeur web · CFC Informaticien – Développement d’applications',
}

export const sunData: InfoPanelData = {
  id: 'presentation',
  label: 'Présentation',
  description:
    'Titulaire d’un CFC en développement d’applications. Autonome, organisé, avec un esprit d’équipe et d’analyse. 4 ans d’expérience en C# / .NET au sein d’une équipe Scrum : maintenance, correction de bugs et tests à tous les niveaux (unitaires, fonctionnels, end-to-end). Passionné par le jeu vidéo, aujourd’hui tourné vers le développement web, pratiqué à travers un site personnel.',
  items: [
    'CFC Informaticien – Développement d’applications',
    '4 ans d’expérience en C# / .NET',
    'Français (langue maternelle), anglais B2 (professionnel)',
    'Développement de jeux vidéo sur Unity (autoformation, créativité)',
    'Compétition de versus fighting (discipline, mental)',
    'Basketball (esprit d’équipe), science-fiction (imagination)',
  ],
  imageUrl: '/images/Profile.jpg',
  // Version sans téléphone, adresse, date de naissance ni nationalité
  cvUrl: '/CV-Dylan-Diaz.pdf',
}

export const planets: PlanetData[] = [
  {
    id: 'competences',
    label: 'Compétences',
    description: 'Les domaines dans lesquels je peux intervenir.',
    items: [
      'Développement web',
      'Développement logiciel',
      'Tests logiciels',
      'Maintenance applicative',
      'Documentation technique',
      'Travail en équipe agile',
    ],
    color: '#3b82f6',
    size: 0.35,
    orbitRadius: 3,
    angle: 0,
    speed: 0.5,
  },
  {
    id: 'technologies',
    label: 'Technologies',
    description: 'Les langages, outils et méthodes que j’utilise au quotidien.',
    items: [
      'Langages : C#, JavaScript, TypeScript, Python, Bash',
      'Frameworks : .NET, React, Node.js, Three.js, WordPress',
      'Bases de données : PostgreSQL, MariaDB, SQL',
      'Outils : Git, GitLab, GitHub, Docker, Markdown, GoatCounter',
      'Méthodes : Scrum, Git Flow, CI/CD, tests automatisés, API REST, BPMN, ticketing',
    ],
    color: '#06b6d4',
    size: 0.35,
    orbitRadius: 4.2,
    angle: (3 * Math.PI) / 4,
    speed: 0.4,
  },
  {
    id: 'experiences',
    label: 'Expériences',
    description: 'Mon apprentissage en entreprise et mes activités à côté.',
    entries: [
      {
        title: 'Apprenti Informaticien Développeur d’applications',
        place: 'Objectis, Yverdon',
        period: '2023 – 2026',
        details: [
          'Évolution et maintenance d’une plateforme .NET',
          'Correction de bugs et traitement de tickets (Redmine)',
          'Écriture d’environ 500 tests unitaires',
          'Intégration et gestion des traductions',
          'Release notes rédigées en anglais (Markdown)',
          'Générateur de licences en ligne de commande (C#), conçu et développé seul : génération de clés signées et chiffrées avec date d’expiration, pour gérer l’accès des clients aux composants et plugins du logiciel (avec ou sans template)',
        ],
      },
      {
        title: 'Apprenti Informaticien Développeur d’applications',
        place: 'Orif, Vaulruz',
        period: '2022 – 2023',
        details: [
          'Rédaction de documentation technique',
          'Carte interactive de la Suisse (Python, Tkinter, Pillow) : un clic sur la carte affiche le canton correspondant, grâce à la détection de couleur et à un algorithme de remplissage (flood fill)',
          'Générateur de mots de passe (Python, Tkinter) : transformation d’un script (V1) en application graphique (V2), de la rédaction du cahier des charges au choix du framework ; longueur et types de caractères paramétrables (lettres, chiffres, caractères spéciaux)',
        ],
      },
      {
        title: 'Développeur web – Structure e-sport Versus Fighting',
        place: 'Dream Team',
        period: '2018 – aujourd’hui',
        details: ['Développement et maintenance du site web (WordPress)'],
      },
    ],
    color: '#22c55e',
    size: 0.45,
    orbitRadius: 5.4,
    angle: Math.PI,
    speed: 0.3,
  },
  {
    id: 'formation',
    label: 'Formation',
    entries: [
      {
        title: 'CFC Informaticien – Développement d’applications',
        place: 'EPSIC, Lausanne',
        period: '2022 – 2026',
      },
      {
        title: 'Cursus Game Programming & Game Art',
        place: 'SAE Institute, Genève',
        period: '2016 – 2020',
      },
      {
        title: 'Cursus Électronicien',
        place: 'CPNV, Yverdon',
        period: '2013 – 2015',
      },
    ],
    color: '#a855f7',
    size: 0.4,
    orbitRadius: 6.6,
    angle: Math.PI / 2,
    speed: 0.2,
  },
  {
    id: 'mini-jeu',
    label: 'Mini-jeu',
    description:
      'Bientôt disponible : un mini-jeu inspiré de Space Invaders avec un système de score.',
    items: ['Gameplay arcade', 'Scoreboard', 'Classement', 'Sauvegarde des scores'],
    inProgress: true,
    color: '#f97316',
    size: 0.55,
    orbitRadius: 7.8,
    angle: -Math.PI / 4,
    speed: 0.15,
  },
]

export const moonData: MoonData = {
  id: 'contact',
  label: 'Contact',
  description: 'Une question, une opportunité ? Écris-moi.',
  links: [
    { label: 'Email', href: 'mailto:dyl0301@protonmail.com' },
    { label: 'GitHub', href: 'https://github.com/Dylseat' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/dylseat' },
  ],
  color: '#cbd5e1',
  size: 0.18,
  orbitRadius: 1.9,
  angle: Math.PI / 3,
  speed: 0.6,
  inclination: 0.45,
}

export const sections: InfoPanelData[] = [sunData, ...planets, moonData]
