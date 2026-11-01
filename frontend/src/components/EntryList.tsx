import type { Entry } from '../data/planets'

type EntryListProps = {
  entries: Entry[]
}

function EntryList({ entries }: EntryListProps) {
  return (
    <ol className="space-y-5">
      {entries.map((entry) => (
        <li key={`${entry.place}-${entry.period}`}>
          <p className="font-semibold">{entry.title}</p>
          <p className="text-sm text-slate-400 print:text-slate-600">
            {entry.place} · {entry.period}
          </p>
          {entry.details && (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              {entry.details.map((detail) => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ol>
  )
}

export default EntryList
