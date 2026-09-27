#!/usr/bin/env node
/**
 * Regenerates the web app's content from the native iOS app's Swift seed files, so both apps
 * always ship the same exercises, techniques, premade Kata's, martial arts, quotes and Dutch UI
 * strings.
 *
 *   npm run sync-content
 *
 * Reads:  ../Kiai/Content/*.swift and ../Kiai/Resources/Localizable.xcstrings
 * Writes: src/data/generated/*.ts  (do not edit those by hand)
 *
 * The parser understands the small Swift subset used by the seed files: calls with labelled
 * arguments, string/number/bool/nil literals, arrays, tuples, `.enumCase` and `.init(...)`.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const webRoot = join(here, '..')
const iosContent = join(webRoot, '..', 'Kiai', 'Content')
const iosResources = join(webRoot, '..', 'Kiai', 'Resources')
const outDir = join(webRoot, 'src', 'data', 'generated')

// ---------------------------------------------------------------------------------------------
// Tokenizer
// ---------------------------------------------------------------------------------------------

function tokenize(src) {
  const tokens = []
  let i = 0
  while (i < src.length) {
    const ch = src[i]
    if (/\s/.test(ch)) { i++; continue }
    if (src.startsWith('//', i)) { i = src.indexOf('\n', i); if (i < 0) break; continue }
    if (src.startsWith('/*', i)) { i = src.indexOf('*/', i) + 2; continue }
    if (ch === '"') {
      let value = ''
      i++
      while (src[i] !== '"') {
        if (src[i] === '\\') {
          const next = src[i + 1]
          if (next === 'u' && src[i + 2] === '{') {
            const end = src.indexOf('}', i)
            value += String.fromCodePoint(parseInt(src.slice(i + 3, end), 16))
            i = end + 1
            continue
          }
          if (next === '(') {
            // Interpolation only appears in code (never in seed values) — skip it balanced.
            let depth = 0
            i += 1
            do {
              if (src[i] === '(') depth++
              else if (src[i] === ')') depth--
              i++
            } while (depth > 0 && i < src.length)
            value += '{…}'
            continue
          }
          value += next === 'n' ? '\n' : next === 't' ? '\t' : next
          i += 2
          continue
        }
        value += src[i++]
      }
      i++
      tokens.push({ t: 'str', v: value })
      continue
    }
    const num = /^-?\d[\d_]*(\.\d+)?/.exec(src.slice(i, i + 32))
    if (num && !/[A-Za-z_]/.test(src[i - 1] ?? '')) {
      tokens.push({ t: 'num', v: Number(num[0].replaceAll('_', '')) })
      i += num[0].length
      continue
    }
    const ident = /^[A-Za-z_][A-Za-z0-9_]*/.exec(src.slice(i, i + 64))
    if (ident) { tokens.push({ t: 'id', v: ident[0] }); i += ident[0].length; continue }
    tokens.push({ t: 'p', v: ch })
    i++
  }
  return tokens
}

// ---------------------------------------------------------------------------------------------
// Expression parser
// ---------------------------------------------------------------------------------------------

class Parser {
  constructor(tokens, pos = 0) { this.tk = tokens; this.pos = pos }
  peek(o = 0) { return this.tk[this.pos + o] }
  next() { return this.tk[this.pos++] }
  isP(v, o = 0) { const t = this.peek(o); return t && t.t === 'p' && t.v === v }
  expect(v) { const t = this.next(); if (!t || t.v !== v) throw new Error(`Expected ${v}, got ${t && t.v}`); return t }

  value() {
    const t = this.peek()
    if (!t) throw new Error('Unexpected end of input')
    if (t.t === 'str' || t.t === 'num') { this.next(); return t.v }
    if (t.t === 'p' && t.v === '[') return this.array()
    if (t.t === 'p' && t.v === '(') { this.next(); const items = this.list(')'); return items.map((x) => x.value) }
    if (t.t === 'p' && t.v === '.') {
      this.next()
      const name = this.next().v
      if (this.isP('(')) { this.next(); return { __call: name, args: this.list(')') } }
      return name
    }
    if (t.t === 'id') {
      this.next()
      if (t.v === 'true') return true
      if (t.v === 'false') return false
      if (t.v === 'nil') return null
      if (this.isP('.') && this.peek(1)?.t === 'id') { this.next(); return this.next().v } // Kind.motivation
      if (this.isP('(')) { this.next(); return { __call: t.v, args: this.list(')') } }
      return t.v
    }
    throw new Error(`Unexpected token ${JSON.stringify(t)}`)
  }

  array() {
    this.expect('[')
    const items = []
    while (!this.isP(']')) {
      items.push(this.value())
      if (this.isP(',')) this.next()
    }
    this.expect(']')
    return items
  }

  /** Argument list until `close`. Returns [{label, value}]. */
  list(close) {
    const args = []
    while (!this.isP(close)) {
      let label = null
      if (this.peek()?.t === 'id' && this.isP(':', 1)) { label = this.next().v; this.next() }
      args.push({ label, value: this.value() })
      if (this.isP(',')) this.next()
    }
    this.expect(close)
    return args
  }
}

/** Finds every `Name(` call in a file and parses its labelled arguments into objects. */
function findCalls(src, name) {
  const tokens = tokenize(src)
  const results = []
  for (let i = 0; i < tokens.length - 1; i++) {
    if (tokens[i].t === 'id' && tokens[i].v === name && tokens[i + 1].t === 'p' && tokens[i + 1].v === '(') {
      const p = new Parser(tokens, i + 2)
      results.push(labelled(p.list(')')))
      i = p.pos - 1
    }
  }
  return results
}

function labelled(args) {
  const obj = {}
  for (const { label, value } of args) obj[label ?? `_${Object.keys(obj).length}`] = unwrap(value)
  return obj
}

function unwrap(value) {
  if (Array.isArray(value)) return value.map(unwrap)
  if (value && typeof value === 'object' && value.__call) return { __call: value.__call, ...labelled(value.args) }
  return value
}

const read = (file) => readFileSync(join(iosContent, file), 'utf8')

// ---------------------------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------------------------

const exercises = [...findCalls(read('SeedExercises.swift'), 'ExerciseSeed'), ...findCalls(read('SeedExercisesExtra.swift'), 'ExerciseSeed')]
  .map((e) => ({
    slug: e.slug,
    name: e.name,
    summary: e.summary,
    instructions: e.instructions,
    tips: e.tips,
    category: e.category,
    difficulty: e.difficulty,
    equipment: e.equipment ?? [],
    arts: e.arts ?? [],
    targets: e.targets,
    duration: e.duration,
    bilateral: e.bilateral ?? false,
    symbol: e.symbol,
  }))

const techniques = findCalls(read('SeedTechniques.swift'), 'TechniqueSeed').map((t) => ({
  slug: t.slug,
  art: t.art,
  name: t.name,
  nativeName: t.nativeName ?? null,
  group: t.group,
  difficulty: t.difficulty,
  summary: t.summary,
  steps: t.steps,
  keyPoints: t.keyPoints,
  mistakes: t.mistakes,
  symbol: t.symbol,
  rounds: t.rounds ?? 5,
  work: t.work ?? 45,
  rest: t.rest ?? 15,
  bothSides: t.bothSides ?? true,
}))

const phaseFor = { warm: 'warmup', core: 'main', cool: 'cooldown' }
const workouts = findCalls(read('SeedWorkouts.swift'), 'WorkoutSeed').map((w) => ({
  key: w.key,
  name: w.name,
  subtitle: w.subtitle,
  symbol: w.symbol,
  tint: w.tint,
  art: w.art ?? null,
  difficulty: w.difficulty ?? 'beginner',
  items: w.items.map((call) => ({ slug: call._0, duration: call._1, phase: phaseFor[call.__call] })),
}))

const arts = findCalls(read('MartialArtCatalog.swift'), 'MartialArt').map((a) => ({
  id: a.id,
  name: a.name,
  origin: a.origin,
  symbol: a.symbol,
  tint: a.tint,
  tagline: a.tagline,
  about: a.about,
  focusAreas: a.focusAreas,
  stretches: a.stretches.map((r) => ({ slug: r.slug, why: r.why })),
  drills: a.drills.map((r) => ({ slug: r.slug, why: r.why })),
}))

const quotesSrc = read('Quotes.swift')
const rawStart = quotesSrc.indexOf('private static let raw')
const rawTokens = tokenize(quotesSrc.slice(quotesSrc.indexOf('= [', rawStart) + 2))
const quotes = new Parser(rawTokens).array().map(([text, kind], id) => ({ id, text, kind }))
const kindLabels = Object.fromEntries([...quotesSrc.matchAll(/case (\w+) = "([^"]+)"/g)].map((m) => [m[1], m[2]]))

// Non-English UI strings from the String Catalog — every locale it carries, generically, so
// adding a language is "translate in Xcode, then re-run this script", never a code change here.
const catalog = JSON.parse(readFileSync(join(iosResources, 'Localizable.xcstrings'), 'utf8'))
const locales = new Set()
for (const entry of Object.values(catalog.strings)) {
  for (const locale of Object.keys(entry.localizations ?? {})) locales.add(locale)
}
const translations = {}
for (const locale of locales) {
  const table = {}
  for (const [key, entry] of Object.entries(catalog.strings)) {
    const value = entry.localizations?.[locale]?.stringUnit?.value
    if (value) table[key] = value
  }
  translations[locale] = table
}

// ---------------------------------------------------------------------------------------------
// Validation — fail loudly rather than ship broken references.
// ---------------------------------------------------------------------------------------------

const slugs = new Set(exercises.map((e) => e.slug))
const artIds = new Set(arts.map((a) => a.id))
const problems = []
for (const w of workouts) for (const item of w.items) if (!slugs.has(item.slug)) problems.push(`Workout ${w.key} → unknown exercise ${item.slug}`)
for (const a of arts) for (const r of [...a.stretches, ...a.drills]) if (!slugs.has(r.slug)) problems.push(`Art ${a.id} → unknown exercise ${r.slug}`)
for (const t of techniques) if (!artIds.has(t.art)) problems.push(`Technique ${t.slug} → unknown art ${t.art}`)
for (const e of exercises) for (const art of e.arts) if (!artIds.has(art)) problems.push(`Exercise ${e.slug} → unknown art ${art}`)
if (problems.length) {
  console.error('Content validation failed:\n' + problems.join('\n'))
  process.exit(1)
}

// ---------------------------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------------------------

mkdirSync(outDir, { recursive: true })
const header = `// AUTO-GENERATED by scripts/sync-content.mjs from the native app's seed files.\n// Do not edit by hand — change the Swift seed files and run \`npm run sync-content\`.\n\n`

function emit(file, typeImport, exportName, type, data) {
  const body = `${header}import type { ${typeImport} } from '../types'\n\nexport const ${exportName}: ${type} = ${JSON.stringify(data, null, 2)}\n`
  writeFileSync(join(outDir, file), body)
}

emit('exercises.ts', 'Exercise', 'EXERCISES', 'Exercise[]', exercises)
emit('techniques.ts', 'Technique', 'TECHNIQUES', 'Technique[]', techniques)
emit('workouts.ts', 'PremadeWorkout', 'PREMADE_WORKOUTS', 'PremadeWorkout[]', workouts)
emit('arts.ts', 'MartialArt', 'MARTIAL_ARTS', 'MartialArt[]', arts)
writeFileSync(
  join(outDir, 'quotes.ts'),
  `${header}import type { Quote, QuoteKind } from '../types'\n\nexport const QUOTE_KIND_LABELS: Record<QuoteKind, string> = ${JSON.stringify(kindLabels, null, 2)}\n\nexport const QUOTES: Quote[] = ${JSON.stringify(quotes, null, 2)}\n`
)
const localeExports = []
for (const [locale, table] of Object.entries(translations)) {
  const exportName = locale.toUpperCase()
  writeFileSync(join(outDir, `${locale}.ts`), `${header}export const ${exportName}: Record<string, string> = ${JSON.stringify(table, null, 2)}\n`)
  localeExports.push(`${locale}: ${Object.keys(table).length}`)
}
// One barrel so lib/i18n.ts doesn't need to know the locale list either.
writeFileSync(
  join(outDir, 'translations.ts'),
  `${header}${Object.keys(translations).map((l) => `import { ${l.toUpperCase()} } from './${l}'`).join('\n')}\n\n` +
    `export const TRANSLATIONS: Record<string, Record<string, string>> = {\n` +
    Object.keys(translations).map((l) => `  ${l}: ${l.toUpperCase()},`).join('\n') +
    `\n}\n`
)

console.log(
  `Synced ${exercises.length} exercises, ${techniques.length} techniques, ${workouts.length} premade Kata's, ` +
    `${arts.length} martial arts, ${quotes.length} quotes, translations for [${localeExports.join(', ')}].`
)
