import { trackEvent } from '../analytics'
import type { Link } from '../data/planets'

type LinkListProps = {
  links: Link[]
}

function LinkList({ links }: LinkListProps) {
  return (
    <ul className="flex flex-wrap gap-2">
      {links.map((link) => {
        const isExternal = link.href.startsWith('http')

        return (
          <li key={link.href}>
            <a
              href={link.href}
              target={isExternal ? '_blank' : undefined}
              rel={isExternal ? 'noreferrer' : undefined}
              onClick={() => trackEvent(`lien/${link.label.toLowerCase()}`, `Lien : ${link.label}`)}
              className="inline-block rounded-full bg-white px-4 py-2 text-sm text-slate-950 hover:bg-slate-200 print:bg-transparent print:p-0 print:underline"
            >
              {link.label}
              {/* À l'impression, afficher l'adresse puisqu'on ne peut pas cliquer */}
              <span className="hidden print:inline">
                {' '}
                : {link.href.replace(/^mailto:/, '')}
              </span>
            </a>
          </li>
        )
      })}
    </ul>
  )
}

export default LinkList
