import EntryList from './EntryList'
import LinkList from './LinkList'
import ProfilePhoto from './ProfilePhoto'
import type { InfoPanelData } from '../data/planets'

type InfoPanelProps = {
  section: InfoPanelData
  onClose: () => void
}

function InfoPanel({ section, onClose }: InfoPanelProps) {
  const { label, description, items, entries, links, imageUrl } = section

  return (
    // Sur mobile : tiroir en bas de l'écran. Sur grand écran : panneau en haut à droite
    <div className="absolute inset-x-0 bottom-0 max-h-[55%] overflow-y-auto rounded-t-2xl bg-black/80 p-5 text-white backdrop-blur md:inset-x-auto md:bottom-auto md:right-6 md:top-6 md:max-h-[calc(100%-3rem)] md:w-96 md:rounded-2xl md:bg-black/70">
      {imageUrl && (
        <div className="mb-4">
          <ProfilePhoto src={imageUrl} alt={label} />
        </div>
      )}

      <h2 className="text-2xl font-bold">{label}</h2>

      {description && (
        <p className="mt-3 text-sm text-slate-300">
          {description}
        </p>
      )}

      {items && (
        <ul className="mt-4 space-y-2 text-sm">
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
