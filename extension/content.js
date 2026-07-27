// ─────────────────────────────────────────────────────────────────
// PicSize Pro — Content Script
// Runs on every page. Handles:
//  1. File input detection & smart rule parsing from DOM
//  2. Receiving injected files from the popup
//  3. Visual toast notifications
// ─────────────────────────────────────────────────────────────────

(function () {
  'use strict'

  // Avoid double-injection
  if (window.__picSizeProInjected) return
  window.__picSizeProInjected = true

  // ── Toast Notification ────────────────────────────────────────
  function showToast(message, type = 'success') {
    const existing = document.getElementById('__picsize-toast')
    if (existing) existing.remove()

    const toast = document.createElement('div')
    toast.id = '__picsize-toast'

    const colors = {
      success: { bg: '#17cf97', border: '#000', text: '#000' },
      error:   { bg: '#ff5c5c', border: '#000', text: '#000' },
      info:    { bg: '#f5d547', border: '#000', text: '#000' },
    }
    const c = colors[type] || colors.success

    Object.assign(toast.style, {
      position:     'fixed',
      top:          '20px',
      right:        '20px',
      zIndex:       '2147483647',
      background:   c.bg,
      border:       `2px solid ${c.border}`,
      color:        c.text,
      fontFamily:   "'Courier New', Courier, monospace",
      fontWeight:   '900',
      fontSize:     '13px',
      padding:      '12px 18px',
      boxShadow:    '4px 4px 0 0 #000',
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      maxWidth:     '340px',
      lineHeight:   '1.4',
      opacity:      '0',
      transform:    'translateY(-10px)',
      transition:   'all 0.2s ease',
      pointerEvents: 'none',
    })

    toast.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;">
        <span style="font-size:16px;">${type === 'success' ? '✅' : type === 'error' ? '❌' : '⚡'}</span>
        <span>${message}</span>
      </div>
      <div style="font-size:10px;font-weight:normal;margin-top:4px;opacity:0.7;">PicSize Pro Upload Assistant</div>
    `

    document.body.appendChild(toast)

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        toast.style.opacity = '1'
        toast.style.transform = 'translateY(0)'
      })
    })

    setTimeout(() => {
      toast.style.opacity = '0'
      toast.style.transform = 'translateY(-10px)'
      setTimeout(() => toast.remove(), 300)
    }, 4000)
  }

  // ── DOM Smart Rule Parser ──────────────────────────────────────
  // Inspects an input element and surrounding container text for upload rules
  function parseInputRules(inp) {
    const rules = {
      targetSizeKB: null,
      format: null,
      width: null,
      height: null,
      confidence: 0,
      detectedSnippet: '',
      domain: window.location.hostname,
    }

    // 1. Direct input HTML attributes
    const accept = inp.getAttribute('accept') || ''
    if (accept.includes('png')) rules.format = 'png'
    else if (accept.includes('webp')) rules.format = 'webp'
    else if (accept.includes('jpg') || accept.includes('jpeg')) rules.format = 'jpeg'

    const maxBytesAttr = inp.getAttribute('data-max-size') || inp.getAttribute('max-size') || inp.getAttribute('size-limit')
    if (maxBytesAttr) {
      const bytes = parseInt(maxBytesAttr, 10)
      if (!isNaN(bytes)) rules.targetSizeKB = Math.round(bytes > 10000 ? bytes / 1024 : bytes)
    }

    // 2. Gather surrounding DOM text (label, parent container, sibling hints)
    let contextText = ''
    if (inp.id) {
      const label = document.querySelector(`label[for="${inp.id}"]`)
      if (label) contextText += ' ' + label.textContent
    }
    const parentContainer = inp.closest('.form-group, fieldset, form, div, tr, td, p')
    if (parentContainer) contextText += ' ' + parentContainer.textContent

    // Clean text
    const cleanText = contextText.replace(/\s+/g, ' ').trim()

    // 3. Regex match max file size (e.g. "max 50KB", "under 200 KB", "below 1MB", "less than 50 kb")
    const sizeMatch = cleanText.match(/(?:max|under|below|less than|up to|within|not exceeding)\s*:?\s*(\d+(?:\.\d+)?)\s*(kb|mb|bytes|b)/i)
    if (sizeMatch) {
      let val = parseFloat(sizeMatch[1])
      const unit = sizeMatch[2].toLowerCase()
      if (unit === 'mb') val *= 1024
      if (unit === 'bytes' || unit === 'b') val /= 1024
      rules.targetSizeKB = Math.round(val)
      rules.confidence += 40
      rules.detectedSnippet = sizeMatch[0]
    }

    // 4. Regex match dimensions (e.g. "413x531", "200 x 200 px", "35x45 mm")
    const dimMatch = cleanText.match(/(\d{2,4})\s*x\s*(\d{2,4})\s*(?:px|pixels)?/i)
    if (dimMatch) {
      rules.width = parseInt(dimMatch[1], 10)
      rules.height = parseInt(dimMatch[2], 10)
      rules.confidence += 30
      if (!rules.detectedSnippet) rules.detectedSnippet = dimMatch[0]
      else rules.detectedSnippet += ' · ' + dimMatch[0]
    }

    // 5. Regex format detection in text if attribute missed it
    if (!rules.format) {
      const fmtMatch = cleanText.match(/\b(jpeg|jpg|png|webp|avif|tiff)\b/i)
      if (fmtMatch) {
        rules.format = fmtMatch[1].toLowerCase() === 'jpg' ? 'jpeg' : fmtMatch[1].toLowerCase()
        rules.confidence += 20
      }
    } else {
      rules.confidence += 20
    }

    return rules
  }

  // ── Message Listener ─────────────────────────────────────────
  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.type === 'PING') {
      sendResponse({ alive: true, inputCount: getFileInputCount() })
      return true
    }

    if (msg.type === 'SHOW_TOAST') {
      showToast(msg.message, msg.toastType || 'success')
      sendResponse({ ok: true })
      return true
    }

    if (msg.type === 'HIGHLIGHT_INPUTS') {
      highlightFileInputs()
      sendResponse({ ok: true })
      return true
    }

    if (msg.type === 'GET_INPUTS') {
      const inputs = Array.from(document.querySelectorAll('input[type="file"]'))
      sendResponse({
        count: inputs.length,
        domain: window.location.hostname,
        inputs: inputs.map((inp, i) => {
          const parsed = parseInputRules(inp)
          return {
            index: i,
            id: inp.id || '',
            name: inp.name || '',
            accept: inp.accept || '',
            label: getInputLabel(inp),
            parsedRules: parsed,
          }
        })
      })
      return true
    }
  })

  // ── Utilities ─────────────────────────────────────────────────
  function getFileInputCount() {
    return document.querySelectorAll('input[type="file"]').length
  }

  function getInputLabel(inp) {
    if (inp.id) {
      const label = document.querySelector(`label[for="${inp.id}"]`)
      if (label) return label.textContent.trim().slice(0, 60)
    }
    const ariaLabel = inp.getAttribute('aria-label')
    if (ariaLabel) return ariaLabel.trim().slice(0, 60)
    return ''
  }

  function highlightFileInputs() {
    const inputs = document.querySelectorAll('input[type="file"]')
    inputs.forEach((inp) => {
      const orig = inp.style.outline
      inp.style.outline = '3px dashed #f5d547'
      inp.style.boxShadow = '0 0 16px rgba(245,213,71,0.5)'
      setTimeout(() => {
        inp.style.outline = orig
        inp.style.boxShadow = ''
      }, 3000)
    })
  }

  // ── Observe DOM for dynamically added file inputs ─────────────
  const observer = new MutationObserver(() => {
    const count = getFileInputCount()
    if (count > 0) {
      chrome.runtime.sendMessage({ type: 'INPUTS_AVAILABLE', count }).catch(() => {})
    }
  })
  observer.observe(document.body, { childList: true, subtree: true })

})()
