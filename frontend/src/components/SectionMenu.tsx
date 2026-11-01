import type { InfoPanelData } from '../data/planets'

type SectionMenuProps = {
  sections: InfoPanelData[]
  selectedId: string | null
  onSelect: (id: string) => void
  onOpenTextView: () => void
}

function SectionMenu({
  sections,
  selectedId,
  onSelect,
  onOpenTextView,
}: SectionMenuProps) {
  return (
    <nav
      aria-label="Sections du portfolio"
      className="absolute inset-x-0 top-0 flex gap-2 overflow-x-auto [scrollbar-width:none] px-4 py-4 md:inset-x-auto md:left-6 md:top-6 md:max-w-[calc(100%-25rem)] md:flex-wrap md:p-0"
    >
      {sections.map((section) => {
        const isActive = section.id === selectedId

        return (
          <button
            key={section.id}
            aria-current={isActive ? 'true' : undefined}
            className={`shrink-0 rounded-full px-4 py-2 text-sm backdrop-blur transition-colors ${
              isActive
                ? 'bg-white text-slate-950'
                : 'bg-black/50 text-white hover:bg-white/20'
            }`}
            onClick={() => onSelect(section.id)}
          >
            {section.label}
          </button>
        )
      })}

      <button
        className="shrink-0 rounded-full border border-white/30 px-4 py-2 text-sm text-white backdrop-blur transition-colors hover:bg-white/20"
        onClick={onOpenTextView}
      >
        Version texte
      </button>
    </nav>
  )
}

export default SectionMenu
