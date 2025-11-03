// ClaimReady VA Tracker Chrome Extension
// Background service worker

chrome.runtime.onInstalled.addListener(() => {
  console.log('ClaimReady VA Tracker installed');
});

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Handle extension messages here if needed
  return true; // Keep channel open for async responses
});

