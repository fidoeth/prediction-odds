# Percentage to Odds Converter - Chrome Extension

A Chrome extension that automatically converts percentages to sportsbook odds on web pages. Supports both American and European (decimal) odds formats.

## Features

- 🔄 **Automatic Conversion**: Automatically finds and converts percentages to odds on any webpage
- 🇺🇸 **American Odds**: Display odds in American format (e.g., +150, -200)
- 🇪🇺 **European Odds**: Display odds in European/decimal format (e.g., 2.50, 1.50)
- 🎛️ **Toggle Control**: Enable/disable conversion with a simple toggle

## Installation

### Step 1: Load the Extension

1. Open Google Chrome
2. Navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in the top-right corner)
4. Click **Load unpacked**
5. Select the `percent-to-odds` folder containing the extension files
6. The extension should now appear in your extensions list

### Step 2: Use the Extension

1. Click the extension icon in the Chrome toolbar
2. Toggle the conversion on/off as needed
3. Select your preferred odds format (American or European)
4. Navigate to any webpage - percentages will automatically be converted to odds!

## How It Works

The extension scans web pages for percentage values (e.g., "50%", "75.5%") and converts them to sportsbook odds:

- **American Odds**:

  - For percentages < 50%: Positive odds (e.g., 25% → +300)
  - For percentages > 50%: Negative odds (e.g., 75% → -300)

- **European Odds**:
  - Decimal format (e.g., 50% → 2.00, 25% → 4.00)

## Conversion Formulas

- **European Odds** = 100 / Percentage
- **American Odds**:
  - If European Odds ≥ 2.0: `+(European Odds - 1) × 100`
  - If European Odds < 2.0: `-100 / (European Odds - 1)`

## Files Structure

```
percent-to-odds/
├── manifest.json       # Extension manifest (Manifest V3)
├── content.js          # Content script that performs conversions
├── popup.html          # Extension popup interface
├── popup.js            # Popup logic and event handlers
├── popup.css           # Popup styling
├── background.js       # Background service worker
├── icons/              # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md           # This file
```

## Privacy

This extension:

- ✅ Only runs on web pages you visit
- ✅ Stores preferences locally (odds format, enabled/disabled state)
- ✅ Does not collect or transmit any data
- ✅ Does not require internet access

## Troubleshooting

- **Conversions not appearing**:
  - Check that the extension is enabled in the popup
  - Try refreshing the page
  - Some websites may use special formatting that prevents detection
- **Format not changing**: Click the refresh button in the popup or reload the page

## License

This project is open source and available for personal use.
