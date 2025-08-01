// Handles extension-level APIs and cross-tab communication

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'whatsapp_tab') {
    handleWhatsAppOpen(request.url).then(sendResponse);
    return true; // Keep message channel open for async response
  }
});

async function handleWhatsAppOpen(url) {
  try {
    const tabs = await chrome.tabs.query({ url: '*://web.whatsapp.com/*' });

    if (tabs.length > 0) {
      const tab = tabs[0];
      await chrome.tabs.update(tab.id, { /*url,*/ active: true }); // Just focus the existing tab
      await chrome.windows.update(tab.windowId, { focused: true });
    } else {
      await chrome.tabs.create({ url, active: true });
    }
  } catch (error) {
    console.error('Error opening WhatsApp:', error);
  }
};