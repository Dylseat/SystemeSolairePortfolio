import ProfilePhoto from './ProfilePhoto'

type InfoPanelProps = {
  title: string
  description: string
  items: string[]
  imageUrl?: string
  onClose: () => void
}

function InfoPanel({
  title,
  description,
  items,
  imageUrl,
  onClose,
}: InfoPanelProps) {
  return (
    // Sur mobile : tiroir en bas de l'écran. Sur grand écran : panneau en haut à droite
    <div className="absolute inset-x-0 bottom-0 max-h-[55%] overflow-y-auto rounded-t-2xl bg-black/80 p-5 text-white backdrop-blur md:inset-x-auto md:bottom-auto md:right-6 md:top-6 md:max-h-[calc(100%-3rem)] md:w-80 md:rounded-2xl md:bg-black/70">
      {imageUrl && (
        <div className="mb-4">
          <ProfilePhoto src={imageUrl} alt={title} />
        </div>
      )}

      <h2 className="text-2xl font-bold">{title}</h2>

      <p className="mt-3 text-sm text-slate-300">
        {description}
      </p>

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