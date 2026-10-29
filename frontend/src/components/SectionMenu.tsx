import type { InfoPanelData } from '../data/planets'

type SectionMenuProps = {
  sections: InfoPanelData[]
  selectedId: string | null
  onSelect: (id: string) => void
}

function SectionMenu({ sections, selectedId, onSelect }: SectionMenuProps) {
  return (
    <nav
      aria-label="Sections du portfolio"
      className="absolute left-6 top-6 flex max-w-[calc(100%-3rem)] flex-wrap gap-2"
    >
      {sections.map((section) => {
        const isActive = section.id === selectedId

        return (
          <button
            key={section.id}
            aria-current={isActive ? 'true' : undefined}
            className={`rounded-full px-4 py-2 text-sm backdrop-blur transition-colors ${
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
    </nav>
  )
}

export default SectionMenu
