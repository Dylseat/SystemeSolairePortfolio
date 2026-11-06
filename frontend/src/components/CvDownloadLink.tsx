import { trackEvent } from '../analytics'

type CvDownloadLinkProps = {
  href: string
  className?: string
}

function CvDownloadLink({ href, className = '' }: CvDownloadLinkProps) {
  return (
    <a
      href={href}
      download
      onClick={() => trackEvent('telecharger-cv', 'Téléchargement du CV (PDF)')}
      className={`inline-block rounded-full bg-orange-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-orange-300 ${className}`}
    >
      <span aria-hidden="true">📄 </span>Télécharger mon CV (PDF)
    </a>
  )
}

export default CvDownloadLink
