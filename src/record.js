// In-browser mp4 export: tab capture (cropped to the stage) + the music element's audio → MediaRecorder.
// No ffmpeg. Needs Chrome 126+ (MediaRecorder mp4); other browsers get the button disabled.

const types = ['video/mp4;codecs=avc1.640028,mp4a.40.2', 'video/mp4;codecs=avc1,mp4a.40.2', 'video/mp4']
export const recordMime = typeof MediaRecorder === 'undefined' ? undefined : types.find((t) => MediaRecorder.isTypeSupported(t))

// Step 1: the share prompt. Resolves once the viewer picks this tab; nothing is recorded yet.
export async function capture(stage, audio) {
  if (!recordMime) throw new Error('mp4 recording needs Chrome 126 or later')
  const screen = await navigator.mediaDevices.getDisplayMedia({
    video: { frameRate: 30 },
    audio: false,
    preferCurrentTab: true, // Chrome: offers "this tab" first
    selfBrowserSurface: 'include',
  })
  const [video] = screen.getVideoTracks()
  // Chrome region capture: keep only the stage, not the page around it.
  if (window.CropTarget && video.cropTo) await video.cropTo(await CropTarget.fromElement(stage))

  // Step 2: call after resetting the deck to slide 1. Starts the music from 0 and begins recording.
  const start = async () => {
    const tracks = [video]
    if (audio) {
      audio.currentTime = 0
      await audio.play()
      // captureStream taps the element without silencing it, so the viewer still hears the music
      tracks.push(...audio.captureStream().getAudioTracks())
    }
    const rec = new MediaRecorder(new MediaStream(tracks), { mimeType: recordMime, videoBitsPerSecond: 12_000_000 })
    const chunks = []
    rec.ondataavailable = (e) => chunks.push(e.data)
    const done = new Promise((resolve) => {
      rec.onstop = () => {
        resolve(new Blob(chunks, { type: recordMime }))
        // release the capture after the file is handed off (automated Chromium closes the tab on this)
        setTimeout(() => screen.getTracks().forEach((t) => t.stop()), 1000)
      }
    })
    const stop = () => rec.state !== 'inactive' && rec.stop()
    video.addEventListener('ended', stop) // viewer pressed Chrome's "Stop sharing"
    rec.start(1000)
    return { stop, done }
  }

  return { start, cancel: () => screen.getTracks().forEach((t) => t.stop()) }
}

export function download(blob, name) {
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: name })
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}
