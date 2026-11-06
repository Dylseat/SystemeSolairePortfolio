import { lazy, Suspense } from 'react'
import CvDownloadLink from './CvDownloadLink'
import EntryList from './EntryList'
import LinkList from './LinkList'
import ProfilePhoto from './ProfilePhoto'
import type { InfoPanelData } from '../data/planets'

// Démo du mini-jeu, chargée seulement à l'ouverture de son panneau
const GamePreview = lazy(() => import('../game/GamePreview'))

type InfoPanelProps = {
  section: InfoPanelData
  onClose: () => void
  onPlay?: () => void
}

function InfoPanel({ section, onClose, onPlay }: InfoPanelProps) {
  const { label, description, items, entries, links, imageUrl, cvUrl, playable, inProgress } =
    section

  return (
    // Sur mobile : tiroir en bas de l'écran. Sur grand écran : panneau en haut à droite
    <div className="absolute inset-x-0 bottom-0 max-h-[55%] overflow-y-auto rounded-t-2xl bg-black/80 p-5 text-white backdrop-blur md:inset-x-auto md:bottom-auto md:right-6 md:top-6 md:max-h-[calc(100%-3rem)] md:w-96 md:rounded-2xl md:bg-black/70">
      {imageUrl && (
        <div className="mb-4">
          <ProfilePhoto src={imageUrl} alt={label} />
        </div>
      )}

      <h2 className="text-2xl font-bold">{label}</h2>

      {inProgress && (
        <p className="mt-2 inline-block rounded-full border border-amber-400/40 bg-amber-400/15 px-3 py-1 text-xs font-semibold text-amber-300">
          <span aria-hidden="true">🚧 </span>En construction
        </p>
      )}

      {description && (
        <p className="mt-3 text-sm text-slate-300">
          {description}
        </p>
      )}

      {cvUrl && <CvDownloadLink href={cvUrl} className="mt-4" />}

      {playable && (
        <div className="mt-4">
          <Suspense fallback={<div className="h-56 w-full rounded-xl bg-slate-950" />}>
            <GamePreview />
          </Suspense>
        </div>
      )}

      {playable && onPlay && (
        <button
          className="mt-4 inline-block rounded-full bg-orange-400 px-5 py-2 text-sm font-semibold text-slate-950 hover:bg-orange-300"
          onClick={onPlay}
        >
          <span aria-hidden="true">🎮 </span>Jouer
        </button>
      )}

      {/* Jeu indisponible ici (écran tactile) : on prévient plutôt que de cacher la section */}
      {playable && !onPlay && (
        <p className="mt-4 rounded-lg border border-amber-400/40 bg-amber-400/15 px-3 py-2 text-sm text-amber-200">
          <span aria-hidden="true">🚧 </span>Version mobile en construction : pour l’instant, le
          jeu se joue sur ordinateur, au clavier.
        </p>
      )}

      {items && inProgress && (
        <h3 className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Fonctionnalités prévues
        </h3>
      )}

      {items && (
        <ul className={`${inProgress ? 'mt-2' : 'mt-4'} space-y-2 text-sm`}>
          {items.map((item) => (
            <li
              key={item}
              className="rounded-lg bg-white/10 px-3 py-2 text-slate-100"
            >
              {item}
            </li>
          ))}
        </ul>
      )}

      {entries && (
        <div className="mt-4">
          <EntryList entries={entries} />
        </div>
      )}

      {links && (
        <div className="mt-4">
          <LinkList links={links} />
        </div>
      )}

      <button
        className="mt-4 rounded-lg bg-slate-700 px-4 py-2 text-sm hover:bg-slate-600"
        onClick={onClose}
      >
        Fermer
      </button>
    </div>
  )
}

export default InfoPanel
