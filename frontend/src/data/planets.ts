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
  title: 'Développeur d’applications CFC · C# / .NET',
}

export const sunData: InfoPanelData = {
  id: 'presentation',
  label: 'Présentation',
  description:
    'Informaticien CFC fraîchement diplômé, avec 4 ans d’expérience en entreprise sur une plateforme industrielle en C# / .NET : maintenance, correction de bugs, tests unitaires et outils internes. À l’aise en équipe Scrum et dans le suivi par tickets.',
  items: [
    'CFC Informaticien – Développement d’applications',
    '4 ans d’expérience en C# / .NET',
    'Français (langue maternelle), anglais B2',
    'Analyse, esprit d’équipe, organisation, autonomie',
    'Passionné de jeux vidéo, de science-fiction et de basketball',
  ],
  imageUrl: '/images/Profile.jpg',
}

export const planets: PlanetData[] = [
  {
    id: 'competences',
    label: 'Compétences',
    description: 'Les langages, outils et méthodes que j’utilise au quotidien.',
    items: [
      'Langages : C#, JavaScript, TypeScript, Python, Bash',
      'Frameworks : .NET, React, Node.js, Three.js, WordPress',
      'Bases de données : PostgreSQL, SQL',
      'Outils : Git, GitLab, GitHub, Docker, Markdown, Microsoft Office',
      'Méthodes : Scrum, Git Flow, CI/CD, tests unitaires, API REST, BPMN, ticketing',
    ],
    color: '#3b82f6',
    size: 0.35,
    orbitRadius: 3,
    angle: 0,
    speed: 0.5,
  },
  {
    id: 'experiences',
    label: 'Expériences',
    description: 'Mon apprentissage en entreprise et mes activités à côté.',
    entries: [
      {
        title: 'Apprenti Informaticien Développeur d’applications CFC',
        place: 'Objectis, Yverdon',
        period: '2023 – 2026',
        details: [
          'Évolution et maintenance d’une plateforme .NET',
          'Correction de bugs et traitement de tickets',
          'Écriture d’environ 500 tests unitaires',
          'Projet : générateur de licences interne',
          'Intégration et gestion des traductions',
          'Release notes rédigées en anglais (Markdown)',
        ],
      },
      {
        title: 'Apprenti Informaticien Développeur d’applications CFC',
        place: 'Orif, Vaulruz',
        period: '2022 – 2023',
        details: [
          'Shooter vertical développé à 3 (Python, Pygame)',
          'Projet : carte interactive de la Suisse',
          'Rédaction de documentation technique',
        ],
      },
      {
        title: 'Développeur web & joueur e-sport – Versus Fighting',
        place: 'Dream Team, structure e-sport',
        period: '2018 – aujourd’hui',
        details: [
          'Développement et maintenance du site web',
          'Joueur en compétition de versus fighting',
        ],
      },
    ],
    color: '#22c55e',
    size: 0.45,
    orbitRadius: 4.5,
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
    orbitRadius: 6,
    angle: Math.PI / 2,
    speed: 0.2,
  },
  {
    id: 'mini-jeu',
    label: 'Mini-jeu',
    description: 'Un mini-jeu inspiré de Space Invaders avec un système de score.',
    items: ['Gameplay arcade', 'Scoreboard', 'Classement', 'Sauvegarde des scores'],
    color: '#f97316',
    size: 0.55,
    orbitRadius: 7.5,
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
