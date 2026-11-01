import EntryList from './EntryList'
import LinkList from './LinkList'
import ProfilePhoto from './ProfilePhoto'
import { moonData, planets, profile, sunData } from '../data/planets'

// Le mini-jeu fait partie de l'expérience 3D, pas du CV
const cvSections = planets.filter((planet) => planet.id !== 'mini-jeu')

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
            <h1 className="text-3xl font-bold">{profile.name}</h1>
            <p className="mt-1 text-lg text-orange-300 print:text-slate-700">
              {profile.title}
            </p>
            <p className="mt-3 text-slate-300 print:text-slate-700">
              {sunData.description}
            </p>
          </div>
        </header>

        {moonData.links && (
          <div className="mt-6">
            <LinkList links={moonData.links} />
          </div>
        )}

        <ul className="mt-6 flex flex-wrap gap-2">
          {sunData.items?.map((item) => (
            <li
              key={item}
              className="rounded-lg bg-white/10 px-3 py-1 text-sm print:border print:border-slate-300 print:bg-transparent"
            >
              {item}
            </li>
          ))}
        </ul>

        {cvSections.map((section) => (
          <section
            key={section.id}
            className="mt-10 border-t border-white/10 pt-8 print:border-slate-300"
          >
            <h2 className="text-2xl font-semibold">{section.label}</h2>
            {section.description && (
              <p className="mt-2 text-slate-300 print:text-slate-700">
                {section.description}
              </p>
            )}
            {section.items && (
              <ul className="mt-4 list-disc space-y-1 pl-5">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
            {section.entries && (
              <div className="mt-4">
                <EntryList entries={section.entries} />
              </div>
            )}
          </section>
        ))}
      </article>
    </div>
  )
}

export default CvView
