// Routing: project index at /, a deck at /?p=<id>. Then the player: stage scaling, navigation,
// autoplay, music, fullscreen, recording, controls.
import projects from '../projects.js'
import { normalize } from './deck.js'
import { h, renderSlide, enter, exit } from './slide.js'
import { capture, download, recordMime } from './record.js'

const { gsap } = window
gsap.config({ nullTargetWarn: false }) // slide timelines target every layout's parts; most slides lack some

const icon = (d) => `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="${d}" fill="currentColor"/></svg>`
const icons = {
  prev: 'M15.4 6.6 14 5.2 7.2 12l6.8 6.8 1.4-1.4L10 12z',
  next: 'M8.6 17.4 10 18.8l6.8-6.8L10 5.2 8.6 6.6 14 12z',
  play: 'M8 5v14l11-7z',
  pause: 'M7 5h4v14H7zm6 0h4v14h-4z',
  music: 'M12 3v10.6A4 4 0 1 0 14 17V7h4V3z',
  musicOff: 'M4.3 3 3 4.3l9 9V13.6A4 4 0 1 0 14 17v-1.7l5.7 5.7 1.3-1.3zM14 7h4V3h-6v5.2l2 2z',
  enterFs: 'M5 5h5v2H7v3H5zm9 0h5v5h-2V7h-3zM5 14h2v3h3v2H5zm12 0h2v5h-5v-2h3z',
  record: 'M12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12z',
  exitFs: 'M8 5h2v5H5V8h3zm6 0h2v3h3v2h-5zM5 14h5v5H8v-3H5zm9 0h5v2h-3v3h-2z',
}

const root = document.getElementById('root')
const id = new URLSearchParams(location.search).get('p')
const loadDeck = async (pid) => (await import(`../projects/${pid}/deck.js`)).default

if (!id) {
  // index: one card per project, cover = the first slide's image
  const decks = await Promise.all(projects.map(async (pid) => [pid, await loadDeck(pid)]))
  root.append(
    h(
      'main',
      { class: 'index' },
      h('h1', {}, 'Projects'),
      h(
        'ul',
        {},
        decks.map(([pid, d]) => {
          const m = d.slides[0].media
          const cover = m && !Array.isArray(m) && `assets/${pid}/${m.src}`
          return h(
            'li',
            {},
            h(
              'a',
              { href: `?p=${pid}` },
              h('span', { class: 'index__cover' }, cover && h('img', { src: cover, alt: '' })),
              h('span', { class: 'index__title' }, d.title),
              h('span', { class: 'index__meta' }, `${d.slides.length} slides`),
            ),
          )
        }),
      ),
    ),
  )
} else if (!projects.includes(id)) {
  root.append(h('p', { class: 'missing' }, `No project "${id}". Add projects/${id}/deck.js and list it in projects.js.`))
} else {
  const [deck, logo] = await Promise.all([loadDeck(id).then(normalize), fetch('assets/logo.svg').then((r) => r.text())])
  play(deck, `assets/${id}/`, logo)
}

function play(deck, dir, logo) {
  document.title = deck.title
  const last = deck.slides.length - 1
  const hold = deck.holdSeconds * 1000
  const audio = deck.music ? Object.assign(new Audio(dir + deck.music), { loop: true, volume: 0.4 }) : null

  // Stage: fixed 1440x810. Windowed it never scales above 1440px wide; fullscreen scales up to fill.
  const stage = h('div', { class: 'stage' })
  const box = h('div', { class: 'stage-box' }, stage)
  root.append(h('div', { class: 'viewport' }, box))
  const fit = () => {
    let s = Math.min(innerWidth / 1440, innerHeight / 810)
    if (!document.fullscreenElement) s = Math.min(s, 1)
    box.style.width = `${1440 * s}px`
    box.style.height = `${810 * s}px`
    stage.style.transform = `scale(${s})`
  }

  const nav = document.querySelector('.controls')
  const btn = Object.fromEntries([...nav.querySelectorAll('[data-act]')].map((b) => [b.dataset.act, b]))
  const count = nav.querySelector('.controls__count')
  btn.music.title = audio ? 'Music (M)' : 'No music file in assets/<project>/'
  btn.record.title = recordMime ? 'Record mp4 (R): replays the deck from slide 1 with music' : 'Recording needs Chrome 126+'
  btn.prev.innerHTML = icon(icons.prev)
  btn.next.innerHTML = icon(icons.next)
  btn.record.innerHTML = icon(icons.record)
  nav.hidden = false

  let index = 0 // target slide
  let shown = 0 // slide on screen; lags index while the old slide plays its exit
  let prev = -1 // slide shown before the current one
  let done = -1 // slide whose timeline last completed
  let autoplay = true
  let musicOn = true
  let recording = false
  let recorder = null
  let current = null // { el, ctx, tl } of the slide on screen
  let leaving = false
  let timer // autoplay advance, or the recording stop

  // logo + footer are identical across consecutive content slides, so they hold still between them
  const sharesChrome = (a, b) => deck.slides[a]?.layout === 'content' && deck.slides[b]?.layout === 'content'

  function update() {
    count.textContent = `${index + 1} / ${last + 1}`
    btn.prev.disabled = index === 0
    btn.next.disabled = index === last
    btn.auto.setAttribute('aria-pressed', autoplay)
    btn.auto.innerHTML = icon(autoplay ? icons.pause : icons.play)
    btn.music.disabled = !audio
    btn.music.setAttribute('aria-pressed', musicOn)
    btn.music.innerHTML = icon(musicOn ? icons.music : icons.musicOff)
    btn.record.disabled = !recordMime
    btn.fs.setAttribute('aria-pressed', !!document.fullscreenElement)
    btn.fs.innerHTML = icon(document.fullscreenElement ? icons.exitFs : icons.enterFs)
    nav.hidden = recording
  }

  function mount() {
    current?.ctx.revert()
    current?.el.remove()
    leaving = false
    const i = shown
    const el = renderSlide(deck.slides[i], deck.title, dir, logo)
    stage.append(el)
    current = { el, ...enter(el, !sharesChrome(prev, i), () => ((done = i), schedule())) }
  }

  function go(i) {
    i = Math.min(last, Math.max(0, i))
    if (i === index) return
    index = i
    done = -1
    clearTimeout(timer)
    update()
    if (leaving) return // the running exit reads `index` when it ends, so rapid presses land on the latest slide
    leaving = true
    exit(current.el, current, sharesChrome(shown, index), () => {
      prev = shown
      shown = index
      mount()
    })
  }

  // Autoplay: hold, then advance once the current slide has finished animating. Stops on the last slide.
  // While recording, stop after the last slide has finished and held.
  function schedule() {
    clearTimeout(timer)
    if (done !== index) return
    if (autoplay && index < last) return void (timer = setTimeout(() => go(index + 1), hold))
    if (autoplay) (autoplay = false), update() // ending on its own leaves the music running
    if (recording) timer = setTimeout(() => recorder?.stop(), hold)
  }

  // Browsers block sound until the viewer interacts, so a blocked start retries on the first click or key.
  let unretry = () => {}
  function setMusic(on) {
    musicOn = on
    update()
    unretry()
    if (!audio) return
    if (!on) return audio.pause()
    const retry = () => musicOn && audio.play().catch(() => setMusic(false))
    const events = ['pointerdown', 'keydown']
    audio.play().catch(() => {
      if (!musicOn) return
      events.forEach((e) => addEventListener(e, retry, { once: true }))
      unretry = () => events.forEach((e) => removeEventListener(e, retry))
    })
  }

  // Autoplay and music move together: play starts both (from the top if on the last slide), pause stops both.
  function toggleAutoplay() {
    autoplay = !autoplay
    if (autoplay && index === last) go(0)
    if (audio) setMusic(autoplay)
    update()
    schedule()
  }

  const toggleFs = () => (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen())

  // Record: share prompt, then replay the deck from slide 1 with music and save an mp4 when autoplay ends.
  async function toggleRecord() {
    if (recorder) return recorder.stop()
    autoplay = false
    clearTimeout(timer)
    update()
    let cap
    try {
      cap = await capture(box, audio)
    } catch {
      return // prompt dismissed or unsupported
    }
    recording = true
    prev = -1
    index = shown = 0
    done = -1
    mount()
    update()
    try {
      recorder = await cap.start()
      autoplay = true
      if (audio) setMusic(true)
      update()
      schedule()
      download(await recorder.done, `${deck.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.mp4`)
    } catch {
      cap.cancel()
    } finally {
      recorder = null
      recording = false
      update()
    }
  }

  btn.prev.onclick = () => go(index - 1)
  btn.next.onclick = () => go(index + 1)
  btn.auto.onclick = toggleAutoplay
  btn.music.onclick = () => setMusic(!musicOn)
  btn.record.onclick = toggleRecord
  btn.fs.onclick = toggleFs

  addEventListener('resize', fit)
  document.addEventListener('fullscreenchange', () => (fit(), update()))
  addEventListener('keydown', (e) => {
    if (e.target.closest?.('button') && (e.key === ' ' || e.key === 'Enter')) return
    if (['ArrowRight', 'PageDown', ' '].includes(e.key)) go(index + 1)
    else if (['ArrowLeft', 'PageUp'].includes(e.key)) go(index - 1)
    else if (e.key === 'Home') go(0)
    else if (e.key === 'End') go(last)
    else if (e.key === 'f') toggleFs()
    else if (e.key === 'a') toggleAutoplay()
    else if (e.key === 'm' && audio) setMusic(!musicOn)
    else if (e.key === 'r' && recordMime) toggleRecord()
    else return
    e.preventDefault()
  })

  fit()
  mount()
  setMusic(true)
}
