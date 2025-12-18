// Content script to convert percentages to odds on web pages

(function() {
  'use strict';

  // Conversion functions
  function percentageToDecimalOdds(percentage) {
    return 100 / percentage;
  }

  function percentageToAmericanOdds(percentage) {
    const decimalOdds = percentageToDecimalOdds(percentage);
    if (decimalOdds >= 2.0) {
      return '+' + Math.round((decimalOdds - 1) * 100);
    } else {
      return '-' + Math.round(100 / (decimalOdds - 1));
    }
  }

  function formatOdds(percentage, format) {
    if (format === 'american') {
      return percentageToAmericanOdds(percentage);
    } else {
      return percentageToDecimalOdds(percentage).toFixed(2);
    }
  }

  // Find and replace percentages in text nodes
  function convertPercentages(node, format) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent;
      // Match percentages: numbers with optional decimals followed by %
      // Exclude if already part of an odds format (e.g., +150, -200, 2.50)
      const percentageRegex = /(\d+\.?\d*)\s*%/g;
      
      let match;
      let lastIndex = 0;
      const fragments = [];
      let hasMatches = false;

      while ((match = percentageRegex.exec(text)) !== null) {
        const percentage = parseFloat(match[1]);
        
        // Only convert valid percentages (between 0 and 100)
        if (percentage > 0 && percentage < 100) {
          hasMatches = true;
          
          // Add text before the match
          if (match.index > lastIndex) {
            fragments.push(document.createTextNode(text.substring(lastIndex, match.index)));
          }
          
          // Create the odds replacement
          const odds = formatOdds(percentage, format);
          const span = document.createElement('span');
          span.className = 'odds-converter-replacement';
          span.textContent = odds;
          span.setAttribute('data-original', match[0]); // Store original percentage
          span.title = `${match[0]} → ${format === 'american' ? 'American' : 'European'} odds`;
          span.style.cssText = 'background-color: #fff3cd; padding: 1px 3px; border-radius: 3px; cursor: help;';
          fragments.push(span);
          
          lastIndex = match.index + match[0].length;
        }
      }

      if (hasMatches) {
        // Add remaining text
        if (lastIndex < text.length) {
          fragments.push(document.createTextNode(text.substring(lastIndex)));
        }

        // Replace the text node with fragments
        const parent = node.parentNode;
        fragments.forEach(fragment => parent.insertBefore(fragment, node));
        parent.removeChild(node);
        return true;
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      // Skip script, style, and already processed elements
      if (node.tagName === 'SCRIPT' || 
          node.tagName === 'STYLE' || 
          node.classList.contains('odds-converter-replacement') ||
          node.classList.contains('odds-converter-processed')) {
        return false;
      }

      // Process child nodes
      let modified = false;
      const children = Array.from(node.childNodes);
      children.forEach(child => {
        if (convertPercentages(child, format)) {
          modified = true;
        }
      });

      if (modified) {
        node.classList.add('odds-converter-processed');
      }
      return modified;
    }
    return false;
  }

  // Main conversion function
  function performConversion(format) {
    // Remove existing replacements
    document.querySelectorAll('.odds-converter-replacement').forEach(el => {
      const parent = el.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(el.textContent), el);
        parent.normalize();
      }
    });

    // Remove processed markers
    document.querySelectorAll('.odds-converter-processed').forEach(el => {
      el.classList.remove('odds-converter-processed');
    });

    // Convert percentages in the body
    convertPercentages(document.body, format);
  }

  // Listen for messages from popup/background
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'convert') {
      performConversion(request.format);
      sendResponse({success: true});
    } else if (request.action === 'disable') {
      // Remove all conversions
      document.querySelectorAll('.odds-converter-replacement').forEach(el => {
        const parent = el.parentNode;
        if (parent) {
          // Try to restore original percentage if stored
          const originalText = el.getAttribute('data-original') || el.textContent;
          parent.replaceChild(document.createTextNode(originalText), el);
          parent.normalize();
        }
      });
      document.querySelectorAll('.odds-converter-processed').forEach(el => {
        el.classList.remove('odds-converter-processed');
      });
      sendResponse({success: true});
    } else if (request.action === 'getFormat') {
      chrome.storage.sync.get(['oddsFormat'], (result) => {
        sendResponse({format: result.oddsFormat || 'american'});
      });
      return true; // Keep channel open for async response
    }
  });

  // Initial conversion on page load
  chrome.storage.sync.get(['oddsFormat', 'enabled'], (result) => {
    const format = result.oddsFormat || 'american';
    const enabled = result.enabled !== false; // Default to enabled
    
    if (enabled) {
      // Wait for page to be fully loaded
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          setTimeout(() => performConversion(format), 500);
        });
      } else {
        setTimeout(() => performConversion(format), 500);
      }

      // Watch for dynamically added content
      const observer = new MutationObserver(() => {
        if (result.enabled !== false) {
          performConversion(format);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  });
})();

