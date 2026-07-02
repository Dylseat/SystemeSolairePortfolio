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
    <div className="absolute right-6 top-6 w-80 rounded-2xl bg-black/70 p-5 text-white backdrop-blur">
      {imageUrl && (
      <div className="mb-4 h-32 w-32 overflow-hidden rounded-full">
        <img
          src={imageUrl}
          alt={title}
          className="translate-y-5 -translate-x-3 h-full w-full scale-[2.5] object-cover object-top"
        />
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