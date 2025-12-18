// Popup script to handle user preferences

document.addEventListener('DOMContentLoaded', () => {
  const enabledToggle = document.getElementById('enabledToggle');
  const oddsFormatSelect = document.getElementById('oddsFormat');
  const refreshBtn = document.getElementById('refreshBtn');
  const exampleOdds = document.getElementById('exampleOdds');

  // Load saved preferences
  chrome.storage.sync.get(['oddsFormat', 'enabled'], (result) => {
    if (result.oddsFormat) {
      oddsFormatSelect.value = result.oddsFormat;
    }
    if (result.enabled !== undefined) {
      enabledToggle.checked = result.enabled;
    }
    updateExample();
  });

  // Update example when format changes
  function updateExample() {
    const format = oddsFormatSelect.value;
    const percentage = 50;
    if (format === 'american') {
      const decimalOdds = 100 / percentage;
      exampleOdds.textContent = '+' + Math.round((decimalOdds - 1) * 100);
    } else {
      exampleOdds.textContent = (100 / percentage).toFixed(2);
    }
  }

  // Handle format change
  oddsFormatSelect.addEventListener('change', () => {
    const format = oddsFormatSelect.value;
    chrome.storage.sync.set({ oddsFormat: format }, () => {
      updateExample();
      // Notify content script to update
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'convert',
          format: format
        });
      });
    });
  });

  // Handle enable/disable toggle
  enabledToggle.addEventListener('change', () => {
    const enabled = enabledToggle.checked;
    chrome.storage.sync.set({ enabled: enabled }, () => {
      // Notify content script
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (enabled) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'convert',
            format: oddsFormatSelect.value
          });
        } else {
          // Remove conversions
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'disable'
          });
        }
      });
    });
  });

  // Handle refresh button
  refreshBtn.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.reload(tabs[0].id);
    });
  });
});

