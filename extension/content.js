// ─────────────────────────────────────────────────────────────────
// PicSize Pro — Content Script
// Runs on every page. Handles:
//  1. File input detection
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
    // Remove existing toast
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
      maxWidth:     '320px',
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
      <div style="font-size:10px;font-weight:normal;margin-top:4px;opacity:0.7;">PicSize Pro</div>
    `

    document.body.appendChild(toast)

    // Animate in
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        toast.style.opacity = '1'
        toast.style.transform = 'translateY(0)'
      })
    })

    // Auto dismiss
    setTimeout(() => {
      toast.style.opacity = '0'
      toast.style.transform = 'translateY(-10px)'
      setTimeout(() => toast.remove(), 300)
    }, 4000)
  }

  // ── Message Listener ─────────────────────────────────────────
  // The popup sends messages here via chrome.tabs.sendMessage
  // (Note: actual injection is done via scripting.executeScript,
  //  so this listener handles side-channel comms like toasts)
  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.type === 'PING') {
      // Popup pings to check if content script is alive
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
        inputs: inputs.map((inp, i) => ({
          index: i,
          id: inp.id || '',
          name: inp.name || '',
          accept: inp.accept || '',
          label: getInputLabel(inp),
        }))
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
  // (Some SPAs add inputs after page load — we stay ready)
  const observer = new MutationObserver(() => {
    const count = getFileInputCount()
    if (count > 0) {
      // Notify service worker that inputs are available
      chrome.runtime.sendMessage({ type: 'INPUTS_AVAILABLE', count }).catch(() => {})
    }
  })
  observer.observe(document.body, { childList: true, subtree: true })

})()
