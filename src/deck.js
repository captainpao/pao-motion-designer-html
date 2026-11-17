// The deck spec. Projects author plain data in projects/<id>/deck.js; normalize() fills defaults and
// fails loudly on a malformed deck, so mistakes surface on load instead of as a half-rendered slide.
//
// Deck   { title, holdSeconds = 2.5, music?: file in assets/<id>/, slides: Slide[1+] }
// Slide  { layout: 'title'|'content', kicker?, heading, items = [], marker = 'number'|'none',
//          groups = [], aside?: Group, media?: Media | [Media, Media] }
// Group  { heading, tag?, items: Item[1+], note?, media?, variant = 'numbered'|'plain'|'bullets'|'steps'|'checks' }
// Item   { text, tag?, note?, media? }
// Media  { kind: 'photo'|'screenshot', src: file in assets/<id>/, label: alt text + placeholder caption }

const fail = (path, msg) => {
  throw new Error(`deck${path}: ${msg}`)
}
const text = (v, path, optional = false) => {
  if (optional && v === undefined) return
  if (typeof v !== 'string') fail(path, 'expected text')
}
const oneOf = (v, options, path) => {
  if (!options.includes(v)) fail(path, `expected one of ${options.join(', ')}`)
  return v
}
const list = (v, path, min = 0) => {
  if (!Array.isArray(v) || v.length < min) fail(path, `expected a list of at least ${min}`)
  return v
}

function media(m, path) {
  oneOf(m?.kind, ['photo', 'screenshot'], `${path}.kind`)
  text(m.src, `${path}.src`)
  text(m.label, `${path}.label`)
  return m
}

function item(it, path) {
  text(it?.text, `${path}.text`)
  text(it.tag, `${path}.tag`, true)
  text(it.note, `${path}.note`, true)
  if (it.media) media(it.media, `${path}.media`)
  return it
}

function group(g, path) {
  text(g?.heading, `${path}.heading`)
  text(g.tag, `${path}.tag`, true)
  text(g.note, `${path}.note`, true)
  if (g.media) media(g.media, `${path}.media`)
  const variant = oneOf(g.variant ?? 'numbered', ['numbered', 'plain', 'bullets', 'steps', 'checks'], `${path}.variant`)
  return { ...g, variant, items: list(g.items, `${path}.items`, 1).map((it, i) => item(it, `${path}.items[${i}]`)) }
}

function slide(s, path) {
  oneOf(s?.layout, ['title', 'content'], `${path}.layout`)
  text(s.kicker, `${path}.kicker`, true)
  text(s.heading, `${path}.heading`)
  if (Array.isArray(s.media)) {
    if (s.media.length !== 2) fail(`${path}.media`, 'expected one media or a pair')
    s.media.forEach((m, i) => media(m, `${path}.media[${i}]`))
  } else if (s.media) media(s.media, `${path}.media`)
  return {
    ...s,
    marker: oneOf(s.marker ?? 'number', ['number', 'none'], `${path}.marker`),
    items: list(s.items ?? [], `${path}.items`).map((it, i) => item(it, `${path}.items[${i}]`)),
    groups: list(s.groups ?? [], `${path}.groups`).map((g, i) => group(g, `${path}.groups[${i}]`)),
    aside: s.aside && group(s.aside, `${path}.aside`),
  }
}

export function normalize(d) {
  text(d?.title, '.title')
  text(d.music, '.music', true)
  const holdSeconds = d.holdSeconds ?? 2.5
  if (!(typeof holdSeconds === 'number' && holdSeconds > 0)) fail('.holdSeconds', 'expected a positive number')
  return { ...d, holdSeconds, slides: list(d.slides, '.slides', 1).map((s, i) => slide(s, `.slides[${i}]`)) }
}
