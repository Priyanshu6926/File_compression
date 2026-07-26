// ─────────────────────────────────────────────────────────────────
// PicSize Pro — Popup Script
// ─────────────────────────────────────────────────────────────────

// ── PRESET DEFINITIONS ─────────────────────────────────────────
const PRESETS = {
  'passport-india': { targetSizeKB: 50,   format: 'jpeg', width: 413, height: 531, crop: 'center', filename: 'passport-india.jpg'   },
  'passport-us':    { targetSizeKB: 240,  format: 'jpeg', width: 600, height: 600, crop: 'center', filename: 'passport-us.jpg'       },
  'aadhar':         { targetSizeKB: 20,   format: 'jpeg', width: 213, height: 213, crop: 'center', filename: 'aadhar-photo.jpg'      },
  'linkedin':       { targetSizeKB: 8000, format: 'jpeg', width: 400, height: 400, crop: 'center', filename: 'linkedin-profile.jpg'  },
  'whatsapp':       { targetSizeKB: 100,  format: 'jpeg', width: 500, height: 500, crop: 'center', filename: 'whatsapp-dp.jpg'       },
  'custom':         null,
}

// ── STATE ───────────────────────────────────────────────────────
let selectedFile     = null   // File object from user
let compressedBuffer = null   // ArrayBuffer of compressed result
let compressedMime   = 'image/jpeg'
let compressedSize   = 0
let originalSize     = 0
let selectedPreset   = 'custom'
let targetInputIndex = 0      // which file input on the page to target
let apiUrl           = 'http://localhost:3000'

// ── DOM REFS ────────────────────────────────────────────────────
const $ = (id) => document.getElementById(id)

// ── INIT ────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  // Load saved API URL
  const stored = await chrome.storage.sync.get(['apiUrl', 'targetInputIndex'])
  if (stored.apiUrl) apiUrl = stored.apiUrl
  $('apiUrlInput').value = apiUrl
  if (stored.targetInputIndex != null) targetInputIndex = stored.targetInputIndex

  // Scan the page for file inputs
  await scanPage()

  wireEvents()
})

// ── PAGE SCAN ───────────────────────────────────────────────────
async function scanPage() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab?.id) { setStatus('error', 'Cannot access this page'); return }

    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const inputs = Array.from(document.querySelectorAll('input[type="file"]'))
        return inputs.map((inp, i) => ({
          index: i,
          id: inp.id || '',
          name: inp.name || '',
          accept: inp.accept || '',
          label: (() => {
            // Try to find associated label text
            const labelEl = inp.id ? document.querySelector(`label[for="${inp.id}"]`) : null
            return (labelEl?.textContent || inp.getAttribute('aria-label') || '').trim().slice(0, 60)
          })()
        }))
      }
    })

    const inputs = results[0]?.result ?? []
    if (inputs.length > 0) {
      setStatus('active', `${inputs.length} file input${inputs.length > 1 ? 's' : ''} detected on this page`)
      updateTargetInfo(inputs)
    } else {
      setStatus('warning', 'No file inputs found — navigate to a form page')
      $('targetSelector') && $('targetSelector').classList.add('hidden')
    }
  } catch (e) {
    setStatus('error', 'Cannot access this page (restricted URL)')
  }
}

function updateTargetInfo(inputs) {
  if (!$('targetInfo')) return
  const t = inputs[targetInputIndex] || inputs[0]
  if (!t) return
  const desc = t.label || t.name || t.id || `Input #${t.index + 1}`
  $('targetInfo').textContent = inputs.length > 1
    ? `#${targetInputIndex + 1} of ${inputs.length}: ${desc}`
    : `Auto: ${desc}`
}

// ── STATUS ──────────────────────────────────────────────────────
function setStatus(type, text) {
  const dot = $('statusDot')
  dot.className = 'status-dot ' + (type === 'active' ? 'active' : type === 'warning' ? 'warning' : type === 'error' ? 'error' : '')
  $('statusText').textContent = text
}

// ── WIRE EVENTS ─────────────────────────────────────────────────
function wireEvents() {
  // Settings toggle
  $('settingsBtn').addEventListener('click', () => {
    $('settingsPanel').classList.toggle('hidden')
  })

  // Save API URL
  $('saveApiBtn').addEventListener('click', async () => {
    apiUrl = $('apiUrlInput').value.trim().replace(/\/$/, '')
    await chrome.storage.sync.set({ apiUrl })
    $('settingsPanel').classList.add('hidden')
    flashStatus('✅ API URL saved!')
  })

  // Rescan
  $('rescanBtn').addEventListener('click', scanPage)

  // Drop zone click → open file picker
  $('dropZone').addEventListener('click', () => $('fileInput').click())

  // Drag events
  $('dropZone').addEventListener('dragover', (e) => { e.preventDefault(); $('dropZone').classList.add('dragover') })
  $('dropZone').addEventListener('dragleave', () => $('dropZone').classList.remove('dragover'))
  $('dropZone').addEventListener('drop', (e) => {
    e.preventDefault()
    $('dropZone').classList.remove('dragover')
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  })

  // File input change
  $('fileInput').addEventListener('change', (e) => {
    const file = e.target.files[0]
    if (file) handleFile(file)
    e.target.value = ''
  })

  // Change file
  $('changeFileBtn').addEventListener('click', () => {
    selectedFile = null
    compressedBuffer = null
    show('dropZone'); hide('previewWrap')
    hide('presetSection'); hide('customSection'); hide('filenameSection')
    hide('compressSection'); hide('resultSection')
    $('fileInput').click()
  })

  // Preset buttons
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      selectedPreset = btn.dataset.preset
      applyPreset(selectedPreset)
    })
  })

  // Compress
  $('compressBtn').addEventListener('click', compress)

  // Inject
  $('injectBtn').addEventListener('click', injectIntoPage)

  // Download
  $('downloadBtn').addEventListener('click', downloadFile)

  // Pick target input
  $('pickInputBtn')?.addEventListener('click', startPickMode)
}

// ── FILE HANDLING ────────────────────────────────────────────────
function handleFile(file) {
  selectedFile = file
  originalSize = file.size
  compressedBuffer = null

  // Show preview
  const url = URL.createObjectURL(file)
  $('previewImg').src = url
  $('previewName').textContent = file.name
  $('previewSize').textContent = formatBytes(file.size)
  hide('dropZone'); show('previewWrap')

  // Show subsequent sections
  show('presetSection'); show('customSection'); show('filenameSection'); show('compressSection')
  hide('resultSection')

  // Default filename
  const base = file.name.replace(/\.[^.]+$/, '')
  const ext = $('formatSelect').value === 'jpeg' ? 'jpg' : $('formatSelect').value
  $('filenameInput').value = `compressed-${base}.${ext}`

  // Reset to custom preset
  applyPreset(selectedPreset)
}

// ── PRESET APPLICATION ───────────────────────────────────────────
function applyPreset(id) {
  const preset = PRESETS[id]
  if (!preset) {
    // Custom — show fields, keep current values
    show('customSection')
    return
  }

  // Fill fields from preset
  $('targetSize').value = preset.targetSizeKB
  $('formatSelect').value = preset.format
  $('widthInput').value  = preset.width  || ''
  $('heightInput').value = preset.height || ''
  $('smartCrop').checked = !!preset.crop
  $('filenameInput').value = preset.filename

  // For non-custom presets, hide custom fields (they're auto-set)
  if (id !== 'custom') {
    hide('customSection')
    show('customSection') // keep visible but auto-filled for transparency
  }

  // Update filename extension when format changes
  updateFilenameExt()
}

$('formatSelect')?.addEventListener('change', updateFilenameExt)
function updateFilenameExt() {
  const ext = $('formatSelect').value === 'jpeg' ? 'jpg' : $('formatSelect').value
  const current = $('filenameInput').value
  $('filenameInput').value = current.replace(/\.[^.]+$/, '') + '.' + ext
}

// ── COMPRESSION ──────────────────────────────────────────────────
async function compress() {
  if (!selectedFile) return

  const btn = $('compressBtn')
  btn.disabled = true
  btn.innerHTML = '<span class="spinner"></span> COMPRESSING...'

  hide('resultSection')

  try {
    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('targetSizeKB', $('targetSize').value)
    formData.append('format', $('formatSelect').value)

    const w = $('widthInput').value.trim()
    const h = $('heightInput').value.trim()
    if (w) formData.append('width', w)
    if (h) formData.append('height', h)
    if ($('smartCrop').checked) formData.append('crop', 'center')

    const res = await fetch(`${apiUrl}/api/compress`, {
      method: 'POST',
      body: formData,
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(err.error || `HTTP ${res.status}`)
    }

    const blob = await res.blob()
    compressedBuffer = await blob.arrayBuffer()
    compressedMime   = blob.type || 'image/jpeg'
    compressedSize   = Number(res.headers.get('X-New-Size')) || blob.size
    const hitFloor   = res.headers.get('X-Hit-Floor') === 'true'

    // Update result UI
    $('newSize').textContent = formatBytes(compressedSize)
    const saved = Math.round((1 - compressedSize / originalSize) * 100)
    $('savings').textContent = `↓ ${saved}% saved`
    $('savings').style.display = saved > 0 ? '' : 'none'
    $('warningBox').classList.toggle('hidden', !hitFloor)

    show('resultSection')
    hideStatus()
  } catch (err) {
    showInjectStatus('error', `❌ ${err.message}`)
  } finally {
    btn.disabled = false
    btn.innerHTML = '<span>⚡ COMPRESS AGAIN</span>'
  }
}

// ── FILE INJECTION ────────────────────────────────────────────────
async function injectIntoPage() {
  if (!compressedBuffer) return

  const filename = $('filenameInput').value.trim() || 'compressed-image.jpg'

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab?.id) throw new Error('No active tab found')

    // Convert buffer to base64 for message passing (ArrayBuffer is not directly serializable)
    const uint8 = new Uint8Array(compressedBuffer)
    const base64 = btoa(String.fromCharCode(...uint8))

    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: injectFileIntoInput,
      args: [base64, filename, compressedMime, targetInputIndex],
    })

    const result = results[0]?.result
    if (result?.success) {
      showInjectStatus('success', `✅ ${result.message}`)
      // Update badge on extension icon
      chrome.action.setBadgeText({ text: '✓', tabId: tab.id })
      chrome.action.setBadgeBackgroundColor({ color: '#17cf97', tabId: tab.id })
    } else {
      throw new Error(result?.error || 'Injection failed')
    }
  } catch (err) {
    showInjectStatus('error', `❌ ${err.message}`)
  }
}

// This function runs IN THE PAGE CONTEXT (injected via scripting.executeScript)
function injectFileIntoInput(base64Data, filename, mimeType, inputIndex) {
  try {
    // Decode base64 → Uint8Array
    const binary = atob(base64Data)
    const bytes  = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)

    // Create File object
    const file = new File([bytes], filename, { type: mimeType, lastModified: Date.now() })

    // Find all file inputs on the page
    const inputs = Array.from(document.querySelectorAll('input[type="file"]'))
    if (inputs.length === 0) return { success: false, error: 'No file inputs found on this page' }

    const target = inputs[inputIndex] || inputs[0]
    if (!target) return { success: false, error: 'Target input not found' }

    // ── THE MAGIC: DataTransfer API ──────────────────────────
    const dt = new DataTransfer()
    dt.items.add(file)
    target.files = dt.files
    // ─────────────────────────────────────────────────────────

    // Dispatch events so React/Vue/Angular forms detect the change
    target.dispatchEvent(new Event('change', { bubbles: true }))
    target.dispatchEvent(new Event('input',  { bubbles: true }))
    // Also dispatch a custom event some frameworks listen to
    target.dispatchEvent(new InputEvent('change', { bubbles: true, cancelable: true }))

    // Visual feedback — highlight the injected input briefly
    const originalOutline = target.style.outline
    const originalBoxShadow = target.style.boxShadow
    target.style.outline = '3px solid #17cf97'
    target.style.boxShadow = '0 0 12px rgba(23,207,151,0.5)'
    setTimeout(() => {
      target.style.outline = originalOutline
      target.style.boxShadow = originalBoxShadow
    }, 2500)

    // Scroll to the input so user can see it
    target.scrollIntoView({ behavior: 'smooth', block: 'center' })

    const label = target.id
      ? (document.querySelector(`label[for="${target.id}"]`)?.textContent || '').trim()
      : ''

    return {
      success: true,
      message: `Injected "${filename}" → ${label || target.name || `input #${(inputIndex || 0) + 1}`}`
    }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

// ── PICK INPUT MODE ──────────────────────────────────────────────
async function startPickMode() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab?.id) return

    showInjectStatus('info', '🎯 Click a file input on the page...')

    // Inject click listener into page
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: activatePickMode,
    })

    // Listen for the user's pick result
    chrome.runtime.onMessage.addListener(function onPick(msg) {
      if (msg.type === 'INPUT_PICKED') {
        targetInputIndex = msg.index
        chrome.storage.sync.set({ targetInputIndex })
        $('targetInfo').textContent = `#${msg.index + 1}: ${msg.label || msg.name || `Input #${msg.index + 1}`}`
        hideStatus()
        chrome.runtime.onMessage.removeListener(onPick)
      }
    })
  } catch (e) {
    console.error('Pick mode error:', e)
  }
}

function activatePickMode() {
  const inputs = Array.from(document.querySelectorAll('input[type="file"]'))
  if (inputs.length === 0) return

  // Highlight all inputs
  inputs.forEach((inp, i) => {
    inp.style.outline = '3px dashed #f5d547'
    inp.style.boxShadow = '0 0 16px rgba(245,213,71,0.6)'
    inp.dataset.picksizeIndex = i

    const handler = (e) => {
      e.preventDefault()
      e.stopPropagation()
      // Reset all highlights
      inputs.forEach(el => {
        el.style.outline = ''
        el.style.boxShadow = ''
        el.removeEventListener('click', el._picksizeHandler, true)
      })
      // Notify popup
      const label = inp.id
        ? (document.querySelector(`label[for="${inp.id}"]`)?.textContent || '').trim()
        : ''
      chrome.runtime.sendMessage({
        type: 'INPUT_PICKED',
        index: i,
        name: inp.name || '',
        label: label,
      })
    }
    inp._picksizeHandler = handler
    inp.addEventListener('click', handler, true)
  })

  // Auto-cancel after 10s
  setTimeout(() => {
    inputs.forEach(el => {
      el.style.outline = ''
      el.style.boxShadow = ''
    })
  }, 10000)
}

// ── DOWNLOAD ─────────────────────────────────────────────────────
function downloadFile() {
  if (!compressedBuffer) return
  const blob = new Blob([compressedBuffer], { type: compressedMime })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = $('filenameInput').value.trim() || 'compressed-image.jpg'
  a.click()
  URL.revokeObjectURL(url)
}

// ── HELPERS ──────────────────────────────────────────────────────
function show(id) { $(id)?.classList.remove('hidden') }
function hide(id) { $(id)?.classList.add('hidden')    }

function showInjectStatus(type, msg) {
  const el = $('injectStatus')
  el.textContent = msg
  el.className = `inject-status ${type}`
  el.classList.remove('hidden')
}
function hideStatus() {
  $('injectStatus')?.classList.add('hidden')
}

function flashStatus(msg) {
  const old = $('statusText').textContent
  $('statusText').textContent = msg
  setTimeout(() => { $('statusText').textContent = old }, 2000)
}

function formatBytes(bytes) {
  if (bytes < 1024)       return `${bytes} B`
  if (bytes < 1024*1024)  return `${(bytes/1024).toFixed(1)} KB`
  return `${(bytes/(1024*1024)).toFixed(2)} MB`
}
