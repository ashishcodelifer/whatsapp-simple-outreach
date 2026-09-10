const API_URL = 'https://lead-gen-dashboard-backend.onrender.com';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type !== 'SAVE_LEAD') return;
  fetch(`${API_URL}/api/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message.lead),
  })
    .then(async (response) => ({ ok: response.ok, data: await response.json() }))
    .then(sendResponse)
    .catch((error) => sendResponse({ ok: false, error: error.message }));
  return true;
});
