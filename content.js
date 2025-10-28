// content.js
// Detect if user is reading or writing
chrome.runtime.sendMessage({ action: "getPageContent" }, (response) => {
  if (response.content) {
    // Detect if page has article-like content
    const isReading = document.querySelector("article") || document.body.innerText.length > 500;
    const isWriting = document.activeElement.tagName === "TEXTAREA" || document.activeElement.isContentEditable;

    // Send context to sidepanel
    chrome.runtime.sendMessage({
      action: "updateContext",
      context: {
        isReading,
        isWriting,
        pageContent: response.content
      }
    });
  }
});

// Listen for focus events to detect writing
document.addEventListener("focusin", (event) => {
  if (event.target.tagName === "TEXTAREA" || event.target.isContentEditable) {
    chrome.runtime.sendMessage({
      action: "updateContext",
      context: { isWriting: true }
    });
  }
});