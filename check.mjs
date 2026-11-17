// Validates every deck listed in projects.js: `node check.mjs`
import assert from 'node:assert'
import projects from './projects.js'
import { normalize } from './src/deck.js'

assert(projects.length > 0, 'projects.js lists no projects')
assert.throws(() => normalize({ title: 'Empty', slides: [] }), /slides/) // the validator itself rejects bad decks
for (const id of projects) {
  const deck = normalize((await import(`./projects/${id}/deck.js`)).default)
  console.log(`ok ${id}: ${deck.slides.length} slides`)
}
