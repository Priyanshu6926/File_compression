// ─────────────────────────────────────────────────────────────────
// PicSize Pro — Background Service Worker (Manifest V3)
// ─────────────────────────────────────────────────────────────────

// Update extension badge when file inputs are found on a page
chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.type === 'INPUTS_AVAILABLE' && sender.tab?.id) {
    chrome.action.setBadgeText({ text: String(msg.count), tabId: sender.tab.id })
    chrome.action.setBadgeBackgroundColor({ color: '#f5d547', tabId: sender.tab.id })
  }
  if (msg.type === 'INPUT_PICKED') {
    // Forward pick event to popup (handled in popup.js listener)
    chrome.runtime.sendMessage(msg).catch(() => {})
  }
})

// Clear badge when tab navigates away
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'loading') {
    chrome.action.setBadgeText({ text: '', tabId })
  }
})

// On install — set default API URL
chrome.runtime.onInstalled.addListener(async () => {
  const existing = await chrome.storage.sync.get(['apiUrl'])
  if (!existing.apiUrl) {
    await chrome.storage.sync.set({ apiUrl: 'http://localhost:3000' })
  }
  console.log('[PicSize Pro] Installed — default API: http://localhost:3000')
})
