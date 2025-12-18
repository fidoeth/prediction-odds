// Background service worker for the extension

// Set default preferences on installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['oddsFormat', 'enabled'], (result) => {
    if (!result.oddsFormat) {
      chrome.storage.sync.set({ oddsFormat: 'american' });
    }
    if (result.enabled === undefined) {
      chrome.storage.sync.set({ enabled: true });
    }
  });
});

