// Renders one slide to DOM and builds its GSAP enter / exit timelines.
const { gsap } = window

// Named motion presets. Timelines pick from these, never raw numbers (px distances aside).
export const ease = { enter: 'power4.out', draw: 'power3.inOut', exit: 'power2.in' }
export const dur = { fast: 0.3, base: 0.5, slow: 0.75 }
export const stagger = 0.07

// Tiny element builder. Strings become text nodes, so deck copy is never parsed as HTML.
export function h(tag, props = {}, ...kids) {
  const el = document.createElement(tag)
  for (const [k, v] of Object.entries(props)) {
    if (v == null || v === false) continue
    if (k === 'class') el.className = v
    else el.setAttribute(k, v)
  }
  el.append(...kids.flat(Infinity).filter((k) => k != null && k !== false && k !== ''))
  return el
}

// Constant, trusted markup only (icons, the local logo file).
const markup = (html, el = h('span')) => {
  el.innerHTML = html
  return el
}

const pad = (n) => String(n).padStart(2, '0')

const placeholderIcon =
  '<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path d="M4 5h16v14H4zM4 15l4.5-4.5 4 4 2.5-2.5 5 5M15 9.5h.01" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
const tick = '<i class="check__fill"></i><svg viewBox="0 0 16 16"><path d="M3.5 8.5l3 3 6-7" pathLength="1"/></svg>'

// dir = 'assets/<id>/'. A missing photo is dropped; a missing screenshot shows a labelled placeholder,
// so decks can be laid out before the real captures exist.
function mediaView(m, dir) {
  const img = h('img', { src: dir + m.src, alt: m.label })
  if (m.kind === 'photo') {
    const el = h('div', { class: 'photo' }, img)
    img.onerror = () => el.remove()
    return el
  }
  const body = h('div', { class: 'frame__body' }, img)
  img.onerror = () =>
    body.replaceChildren(
      h('div', { class: 'frame__empty' }, markup(placeholderIcon).firstChild, h('p', { class: 'frame__label' }, m.label), h('p', { class: 'frame__file' }, m.src)),
    )
  return h('figure', { class: 'frame' }, h('div', { class: 'frame__bar', 'aria-hidden': 'true' }, h('i'), h('i'), h('i')), body)
}

function marker(variant, n) {
  if (variant === 'numbered') return h('span', { class: 'num num--sm' }, pad(n))
  if (variant === 'plain') return null
  if (variant === 'checks') return markup(tick, h('span', { class: 'check', 'aria-hidden': 'true' }))
  return h('span', { class: 'dot' })
}

const copy = (it, textClass) => [
  h('p', { class: textClass }, it.text),
  it.tag && h('span', { class: 'tag' }, it.tag),
  it.note && h('p', { class: 'note' }, it.note),
]

function groupCard(g, start, dir) {
  return h(
    'div',
    { class: `card card--${g.variant}` },
    g.media && mediaView(g.media, dir),
    h('div', { class: 'card__head' }, h('h3', {}, g.heading), g.tag && h('span', { class: 'tag tag--muted' }, g.tag)),
    h(
      'ol',
      { class: 'card__items', style: `--n: ${g.items.length}` },
      g.variant === 'steps' && h('span', { class: 'rail' }),
      g.items.map((it, i) => h('li', { class: 'card__item' }, marker(g.variant, start + i), h('div', {}, copy(it, 'card__text')))),
    ),
    g.note && h('p', { class: 'note card__note' }, g.note),
  )
}

export function renderSlide(slide, deckTitle, dir, logo) {
  const logoEl = () => markup(logo, h('div', { class: 'logo' })) // inlined so CSS can colour it (root svg has fill="none")
  const pair = Array.isArray(slide.media) ? slide.media : null
  const media = pair ? null : slide.media

  if (slide.layout === 'title') {
    const [lead, ...meta] = slide.items
    return h(
      'div',
      { class: 'slide slide--title' },
      media && mediaView(media, dir),
      logoEl(),
      h(
        'div',
        { class: 'slide__body' },
        h(
          'div',
          { class: 'title-block' },
          h('span', { class: 'bar' }),
          slide.kicker && h('p', { class: 'kicker' }, slide.kicker),
          h('h1', { class: 'heading' }, slide.heading),
          lead && h('p', { class: 'item lead' }, lead.text),
        ),
      ),
      meta.length > 0 && h('div', { class: 'meta' }, meta.map((m) => h('p', {}, m.text))),
    )
  }

  const numbered = slide.marker === 'number'
  const plain = numbered ? '' : ' items--plain'
  const items = () =>
    slide.items.map((it, i) =>
      h(
        'li',
        { class: 'item' },
        numbered ? h('span', { class: 'num' }, pad(i + 1)) : h('span', { class: 'item__line' }),
        h('div', { class: 'item__copy' }, copy(it, 'item__text')),
        it.media && mediaView(it.media, dir),
      ),
    )
  const stack = () => h('ol', { class: `items items--stack${plain}` }, items())

  let body
  if (slide.groups.length) {
    let n = 1 // numbering continues across groups
    body = h(
      'div',
      { class: 'groups' },
      slide.groups.map((g, i) => {
        const card = [i > 0 && h('span', { class: 'link', 'aria-hidden': 'true' }), groupCard(g, n, dir)]
        n += g.items.length
        return card
      }),
    )
  } else if (slide.aside?.variant === 'steps') {
    // a step sequence reads left to right: items in columns, the journey across the full width below
    body = h('div', { class: 'split split--below' }, h('ol', { class: 'items items--row items--plain' }, items()), groupCard(slide.aside, 1, dir))
  } else if (slide.aside) body = h('div', { class: 'split' }, stack(), groupCard(slide.aside, 1, dir))
  else if (pair) body = h('div', { class: 'split split--shot' }, stack(), h('div', { class: 'pair' }, mediaView(pair[0], dir), mediaView(pair[1], dir)))
  else if (media?.kind === 'screenshot') body = h('div', { class: 'split split--shot' }, stack(), mediaView(media, dir))
  else if (media) body = stack()
  else body = h('ol', { class: `items items--row${plain}` }, items())

  const dense = slide.items.some((it) => it.media) || slide.groups.some((g) => g.media)
  const kind = pair ? ' slide--screenshot' : media ? ` slide--${media.kind}` : ''
  return h(
    'div',
    { class: `slide slide--content${dense ? ' slide--dense' : ''}${kind}` },
    media?.kind === 'photo' && mediaView(media, dir),
    logoEl(),
    h('div', { class: 'slide__body' }, slide.kicker && h('p', { class: 'kicker' }, slide.kicker), h('h1', { class: 'heading' }, slide.heading), body),
    h('p', { class: 'footer' }, deckTitle),
  )
}

// One timeline per slide, scoped to the slide element. Returns { ctx, tl } for exit() and cleanup.
export function enter(el, chromeEnters, onComplete) {
  let tl
  const ctx = gsap.context(() => {
    tl = gsap.timeline({ onComplete })
    const steps = el.querySelectorAll('.split--below .card__item').length
    const up = { y: 28, autoAlpha: 0, duration: dur.base, ease: ease.enter }
    if (chromeEnters) tl.from('.logo, .footer', { autoAlpha: 0, duration: dur.fast }, 0)
    tl // photos settle from a slight zoom; a side panel also wipes in from the right
      .from('.photo img', { scale: 1.12, duration: dur.slow * 2.5, ease: ease.enter }, 0)
      .from('.slide--content .photo', { clipPath: 'inset(0% 0% 0% 100%)', duration: dur.slow, ease: ease.draw }, 0)
      .from('.kicker', { ...up, y: 12 }, 0.1)
      // heading wipes up out of a mask rather than fading like everything else
      .from('.heading', { clipPath: 'inset(0% 0% 100% 0%)', y: 40, duration: dur.slow, ease: ease.enter }, '<0.1')
      .from('.bar', { scaleY: 0, duration: dur.slow, ease: ease.draw }, '<')
      .from('.item', { ...up, stagger }, '<0.45')
      .from('.item__line', { scaleX: 0, duration: dur.base, ease: ease.draw, stagger }, '<')
      .from('.card', { ...up, stagger: stagger * 2 }, '<0.1')
      .from('.frame:not(.pair > .frame)', { ...up, y: 20, stagger }, '<0.15')
      // overlapping pair: back frame slides in from the left, front from the right, meeting in the middle
      .from('.pair > .frame:first-child', { autoAlpha: 0, x: -360, duration: dur.slow, ease: ease.enter }, '<')
      .from('.pair > .frame:last-child', { autoAlpha: 0, x: 360, duration: dur.slow, ease: ease.enter }, '<')
      .from('.link', { scaleX: 0, duration: dur.base, ease: ease.draw }, '<0.3')
      .from('.split:not(.split--below) .rail', { scaleY: 0, duration: dur.slow, ease: ease.draw }, '<')
      .from('.card__item:not(.split--below .card__item)', { autoAlpha: 0, x: -12, duration: dur.fast, ease: ease.enter, stagger: stagger / 2 }, '<0.1')
      // horizontal journey: the rail draws left to right and each step lands as the rail reaches it
      .from('.split--below .rail', { scaleX: 0, duration: steps * dur.fast, ease: 'none' }, '<')
      .from('.split--below .card__item', { autoAlpha: 0, y: 12, duration: dur.base, ease: ease.enter, stagger: dur.fast }, '<')
      .from('.meta > *', { autoAlpha: 0, duration: dur.base, stagger }, '<0.2')

    // checklist: after the items are in, each box fills and its tick draws, one at a time
    tl.from('.check__fill', { scale: 0, duration: dur.fast, ease: ease.enter, stagger: dur.base })
      .from('.check path', { strokeDashoffset: 1, duration: dur.fast, ease: ease.draw, stagger: dur.base }, '<0.15')

    if (matchMedia('(prefers-reduced-motion: reduce)').matches) tl.timeScale(tl.duration() / 0.4)
  }, el)
  return { ctx, tl }
}

// Exit: content lifts and fades, then the whole slide fades to the white stage.
// chromeStays: logo + footer hold still because the next slide shows them too.
export function exit(el, { ctx, tl }, chromeStays, onExited) {
  tl.pause()
  ctx.add(() => {
    const out = { autoAlpha: 0, duration: dur.fast, ease: ease.exit }
    const t = gsap.timeline({ onComplete: onExited })
    if (chromeStays) t.to('.slide__body', { ...out, y: -24 }).to('.slide > .photo', out, 0)
    else t.to('.logo, .slide__body, .footer, .meta', { ...out, y: -24, stagger: stagger / 2 }).to(el, out, '<0.1')
  })
}
