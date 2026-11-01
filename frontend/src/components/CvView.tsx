import ProfilePhoto from './ProfilePhoto'
import { planets, sunData } from '../data/planets'

type CvViewProps = {
  // Absent quand la 3D n'est pas disponible : la vue texte est alors la seule vue
  onClose?: () => void
}

function CvView({ onClose }: CvViewProps) {
  return (
    <div className="fixed inset-0 overflow-y-auto bg-slate-950 text-slate-100 print:static print:bg-white print:text-black">
      <article className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8 flex flex-wrap gap-3 print:hidden">
          {onClose && (
            <button
              className="rounded-full bg-white px-4 py-2 text-sm text-slate-950 hover:bg-slate-200"
              onClick={onClose}
            >
              Retour au système solaire
            </button>
          )}
          <button
            className="rounded-full bg-slate-800 px-4 py-2 text-sm hover:bg-slate-700"
            onClick={() => window.print()}
          >
            Imprimer / enregistrer en PDF
          </button>
        </div>

        <header className="flex flex-col gap-6 sm:flex-row sm:items-center">
          {sunData.imageUrl && (
            <ProfilePhoto src={sunData.imageUrl} alt="Photo de profil" />
          )}
          <div>
            <h1 className="text-3xl font-bold">{sunData.label}</h1>
            <p className="mt-3 text-slate-300 print:text-slate-700">
              {sunData.description}
            </p>
          </div>
        </header>

        <ul className="mt-6 flex flex-wrap gap-2">
          {sunData.items.map((item) => (
            <li
              key={item}
              className="rounded-lg bg-white/10 px-3 py-1 text-sm print:border print:border-slate-300 print:bg-transparent"
            >
              {item}
            </li>
          ))}
        </ul>

        {planets.map((section) => (
          <section
            key={section.id}
            className="mt-10 border-t border-white/10 pt-8 print:border-slate-300"
          >
            <h2 className="text-2xl font-semibold">{section.label}</h2>
            <p className="mt-2 text-slate-300 print:text-slate-700">
              {section.description}
            </p>
            <ul className="mt-4 list-disc space-y-1 pl-5">
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ))}
      </article>
    </div>
  )
}

export default CvView
