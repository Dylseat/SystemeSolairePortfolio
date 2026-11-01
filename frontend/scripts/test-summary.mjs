// Transforme un rapport JUnit (Vitest ou Playwright) en résumé Markdown en français,
// affiché dans l'onglet « Summary » de GitHub Actions.
//
// Usage : node scripts/test-summary.mjs "Titre" chemin/rapport.xml >> "$GITHUB_STEP_SUMMARY"
import { existsSync, readFileSync } from 'node:fs'

const [title = 'Tests', reportPath] = process.argv.slice(2)

if (!reportPath || !existsSync(reportPath)) {
  console.log(`## ${title} — ⚠️ Aucun rapport trouvé\n`)
  console.log(`Le fichier \`${reportPath ?? '(non précisé)'}\` n'existe pas : les tests n'ont sans doute pas pu démarrer.\n`)
  process.exit(0)
}

const xml = readFileSync(reportPath, 'utf8')

function decode(text) {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&amp;/g, '&')
}

function attributes(source) {
  const result = {}
  for (const [, name, value] of source.matchAll(/([\w:-]+)="([^"]*)"/g)) {
    result[name] = decode(value)
  }
  return result
}

function statusOf(body) {
  if (/<failure\b/.test(body)) return 'failed'
  if (/<error\b/.test(body)) return 'error'
  if (/<skipped\b/.test(body)) return 'skipped'
  return 'passed'
}

function failureMessage(body) {
  const match = body.match(/<(?:failure|error)\b([^>]*?)(?:\/>|>([\s\S]*?)<\/(?:failure|error)>)/)
  if (!match) return ''
  const details = decode((match[2] ?? '').replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')).trim()
  return details || attributes(match[1]).message || ''
}

const suites = []
for (const [, suiteAttributes, suiteBody] of xml.matchAll(
  /<testsuite\b([^>]*)>([\s\S]*?)<\/testsuite>/g,
)) {
  const suite = { ...attributes(suiteAttributes), cases: [] }
  for (const [, caseAttributes, caseBody = ''] of suiteBody.matchAll(
    /<testcase\b([^>]*?)(?:\/>|>([\s\S]*?)<\/testcase>)/g,
  )) {
    const testCase = attributes(caseAttributes)
    suite.cases.push({
      name: testCase.name,
      time: Number(testCase.time ?? 0),
      status: statusOf(caseBody),
      message: failureMessage(caseBody),
    })
  }
  suites.push(suite)
}

// Playwright crée un groupe par fichier et par projet (bureau, mobile) : on les distingue
const nameCount = new Map()
for (const suite of suites) nameCount.set(suite.name, (nameCount.get(suite.name) ?? 0) + 1)
const suiteLabel = (suite) =>
  nameCount.get(suite.name) > 1 && suite.hostname ? `${suite.name} (${suite.hostname})` : suite.name

const cases = suites.flatMap((suite) => suite.cases.map((testCase) => ({ ...testCase, suite })))
const count = (status) => cases.filter((testCase) => testCase.status === status).length
const passed = count('passed')
const failed = count('failed')
const errors = count('error')
const skipped = count('skipped')

const rootTime = xml.match(/<testsuites\b[^>]*\btime="([\d.]+)"/)?.[1]
const totalTime = rootTime ? Number(rootTime) : cases.reduce((sum, testCase) => sum + testCase.time, 0)

function duration(seconds) {
  if (seconds < 59.995) return `${seconds.toFixed(2)} s`
  const minutes = Math.floor(seconds / 60)
  return `${minutes} min ${Math.round(seconds - minutes * 60)} s`
}

const icons = { passed: '✅', failed: '❌', error: '💥', skipped: '⏭️' }
const escapeCell = (text) => text.replace(/\|/g, '\\|').replace(/\n/g, ' ')

const problems = failed + errors
const verdict =
  cases.length === 0
    ? '⚠️ Aucun test exécuté'
    : problems === 0
      ? '✅ Tous les tests passent'
      : `❌ ${problems} test${problems > 1 ? 's' : ''} en échec`

const lines = [
  `## ${title} — ${verdict}`,
  '',
  '| Total | ✅ Réussis | ❌ Échecs | 💥 Erreurs | ⏭️ Ignorés | ⏱️ Durée |',
  '| ---: | ---: | ---: | ---: | ---: | ---: |',
  `| ${cases.length} | ${passed} | ${failed} | ${errors} | ${skipped} | ${duration(totalTime)} |`,
  '',
]

const failures = cases.filter((testCase) => testCase.status === 'failed' || testCase.status === 'error')
if (failures.length > 0) {
  lines.push('### Tests en échec', '')
  for (const testCase of failures) {
    lines.push(`**${icons[testCase.status]} ${suiteLabel(testCase.suite)} › ${testCase.name}**`, '')
    if (testCase.message) {
      const message = testCase.message.split('\n').slice(0, 20).join('\n')
      lines.push('```text', message, '```', '')
    }
  }
}

lines.push('<details>', '<summary>Détail de tous les tests</summary>', '')
for (const suite of suites) {
  lines.push(`#### ${suiteLabel(suite)}`, '', '| | Test | Durée |', '| --- | --- | ---: |')
  for (const testCase of suite.cases) {
    lines.push(`| ${icons[testCase.status]} | ${escapeCell(testCase.name)} | ${duration(testCase.time)} |`)
  }
  lines.push('')
}
lines.push('</details>', '')

console.log(lines.join('\n'))
