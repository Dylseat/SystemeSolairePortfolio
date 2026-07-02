export type InfoPanelData = {
  label: string
  description: string
  items: string[]
  imageUrl?: string
}

export type PlanetData = InfoPanelData & {
  color: string
  size: number
  orbitRadius: number
  angle: number
  speed: number
}

export const sunData: InfoPanelData = {
  label: 'Présentation',
  description:
    'Je suis développeur d’applications, intéressé par le développement web, les interfaces interactives et les projets créatifs.',
  items: [
    'Développeur d’applications',
    'Intérêt pour React, TypeScript et la 3D web',
    'Passionné par les projets interactifs',
    'Portfolio sous forme de système solaire',
  ],
  imageUrl: '/images/Profile.jpg',
}

export const planets: PlanetData[] = [
  {
    label: 'Compétences',
    description: 'Mes compétences principales en développement web et logiciel.',
    items: ['React', 'TypeScript', 'C#', '.NET', 'Git', 'Azure DevOps'],
    color: '#3b82f6',
    size: 0.35,
    orbitRadius: 3,
    angle: 0,
    speed: 0.5,
  },
  {
    label: 'Expériences',
    description: 'Mes expériences professionnelles et projets réalisés en entreprise.',
    items: ['Développement .NET', 'Tests unitaires', 'CI/CD', 'Ticketing', 'Documentation'],
    color: '#22c55e',
    size: 0.45,
    orbitRadius: 4.5,
    angle: Math.PI,
    speed: 0.3,
  },
  {
    label: 'Formation',
    description: 'Mon parcours de formation dans le développement d’applications.',
    items: ['CFC informaticien', 'Développement d’applications', 'Projets scolaires', 'Autoformation'],
    color: '#a855f7',
    size: 0.4,
    orbitRadius: 6,
    angle: Math.PI / 2,
    speed: 0.2,
  },
  {
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