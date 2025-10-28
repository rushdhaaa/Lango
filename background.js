// background.js - Fixed & Clean
let recognition = null;
let isRecording = false;

// Default settings
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    voiceFeedback: false,
    darkMode: false,
    chatHistory: [],
    apiKey: ""
  });
});

// Listen for messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "startRecording") {
    startRecording(sendResponse);
    return true;
  }
  if (request.action === "stopRecording") {
    stopRecording();
    sendResponse({ status: "stopped" });
  }
  if (request.action === "processCommand") {
    processCommand(request.command, sendResponse);
    return true;
  }
  if (request.action === "getPageContent") {
    chrome.scripting.executeScript({
      target: { tabId: sender.tab.id },
      func: () => document.body.innerText.slice(0, 1000)
    }, (results) => {
      sendResponse({ content: results[0].result });
    });
    return true;
  }
});

// Voice Recording
function startRecording(sendResponse) {
  if (!recognition) {
    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onresult = (e) => {
      const text = e.results[0][0].transcript;
      isRecording = false;
      sendResponse({ transcript: text });
    };

    recognition.onerror = () => {
      isRecording = false;
      sendResponse({ error: "Microphone error" });
    };
  }

  if (!isRecording) {
    isRecording = true;
    recognition.start();
  }
}

function stopRecording() {
  if (recognition && isRecording) {
    recognition.stop();
    isRecording = false;
  }
}

// Process AI Command
async function processCommand(command, sendResponse) {
  const { apiKey } = await chrome.storage.local.get("apiKey");
  if (!apiKey || apiKey === "AIzaSyDkQAAnC7QqykjIjoqFfvr5pKEdAQsG2Us") {
    sendResponse({ response: "Please add your Gemini API key in Settings." });
    return;
  }

  // Simulate AI response (replace with real Gemini Nano later)
  const responses = {
    "summarize this page": "• Key point 1\n• Key point 2\n• Key point 3",
    "hello": "Hi! I'm LANGO, your voice-powered friend!",
    "translate": "Translated text here..."
  };
// Listen for popup message
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "openSidePanel") {
    chrome.sidePanel.open({ windowId: chrome.windows.WINDOW_ID_CURRENT });
  }
});
  const response = responses[command.toLowerCase()] || 
    `You said: "${command}". (AI response coming soon!)`;

  sendResponse({ response });
}

// Keyboard Shortcut
chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-lango") {
    chrome.sidePanel.open({ windowId: chrome.windows.WINDOW_ID_CURRENT });
  }
});