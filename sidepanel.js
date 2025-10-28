// sidepanel.js
const { createElement: h, useState, useEffect } = React;

const LangoApp = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [context, setContext] = useState({ isReading: false, isWriting: false });
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({ voiceFeedback: false, darkMode: false });

  // Load settings and chat history
  useEffect(() => {
    chrome.storage.local.get(["voiceFeedback", "darkMode", "chatHistory"], (data) => {
      setSettings({
        voiceFeedback: data.voiceFeedback || false,
        darkMode: data.darkMode || false
      });
      setMessages(data.chatHistory || []);
    });

    // Listen for context updates
    chrome.runtime.onMessage.addListener((request) => {
      if (request.action === "updateContext") {
        setContext(request.context);
      }
    });

    // Keyboard shortcut for mic
    document.addEventListener("keydown", (e) => {
      if (e.code === "Space" && !e.target.tagName.match(/INPUT|TEXTAREA/)) {
        toggleRecording();
      }
    });
  }, []);

  // Toggle dark mode
  useEffect(() => {
    document.body.style.background = settings.darkMode ? "#333333" : "#ffcce7";
    document.querySelector(".chat-area").style.background = settings.darkMode ? "#444444" : "#ffffff";
  }, [settings.darkMode]);

  // Handle voice input
  const toggleRecording = () => {
    if (isRecording) {
      chrome.runtime.sendMessage({ action: "stopRecording" });
      setIsRecording(false);
    } else {
      setIsRecording(true);
      chrome.runtime.sendMessage({ action: "startRecording" }, (response) => {
        if (response.transcript) {
          setInput(response.transcript);
          handleSend(response.transcript);
        } else {
          setMessages([...messages, { role: "ai", text: "Sorry, I couldn't hear you. Try again? 🌷" }]);
        }
        setIsRecording(false);
      });
    }
  };

  // Handle text input
  const handleSend = async (text = input) => {
    if (!text.trim()) return;
    const newMessages = [...messages, { role: "user", text }];
    setMessages(newMessages);
    setInput("");

    // Get page content if needed
    let pageContent = "";
    if (text.toLowerCase().includes("summarize this page")) {
      await new Promise((resolve) => {
        chrome.runtime.sendMessage({ action: "getPageContent" }, (response) => {
          pageContent = response.content;
          resolve();
        });
      });
    }

    // Process command
    chrome.runtime.sendMessage({
      action: "processCommand",
      command: { prompt: text, context: pageContent }
    }, (response) => {
      setMessages([...newMessages, { role: "ai", text: response.response }]);
      if (settings.voiceFeedback) {
        speak(response.response);
      }
    });

    // Save chat history
    chrome.storage.local.set({ chatHistory: newMessages });
  };

  // Handle file upload (image, audio, document)
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type.startsWith("image/")) {
      // OCR with Tesseract.js
      const { data: { text } } = await Tesseract.recognize(file);
      setMessages([...messages, { role: "user", text: `Uploaded image: ${text}` }]);
      handleSend(`Summarize: ${text}`);
    } else if (file.type.startsWith("audio/")) {
      // Placeholder for audio transcription
      setMessages([...messages, { role: "ai", text: "Audio transcription coming soon! 🌸" }]);
    } else if (file.type === "application/pdf" || file.type.includes("text")) {
      const text = await file.text();
      setMessages([...messages, { role: "user", text: `Uploaded document: ${text.slice(0, 100)}...` }]);
      handleSend(`Summarize: ${text}`);
    }
  };

  // Text-to-Speech
  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    speechSynthesis.speak(utterance);
  };

  // Quick actions
  const quickActions = [
    { label: "Summarize", command: "Summarize this page" },
    { label: "Translate", command: "Translate this page" },
    { label: "Rewrite", command: "Rewrite this paragraph professionally" },
    { label: "Proofread", command: "Proofread this text" },
    { label: "Search", command: "Search for AI in education" },
    { label: "Open Tab", command: "Open new tab for climate news" }
  ];

  return h("div", { className: "h-full flex flex-col" }, [
    h("div", { className: "header" }, [
      h("h1", { className: "title" }, "LANGO"),
      h("div", { className: "flex gap-2" }, [
        h("button", {
          className: `mic-btn ${isRecording ? "recording" : ""}`,
          onClick: toggleRecording
        }, h("img", { src: chrome.runtime.getURL("assets/mic.png"), alt: "Mic", width: 20 })),
        h("input", {
          type: "file",
          id: "fileUpload",
          className: "hidden",
          onChange: handleFileUpload,
          accept: "image/*,audio/*,.pdf,.txt"
        }),
        h("label", {
          htmlFor: "fileUpload",
          className: "upload-btn"
        }, h("img", { src: chrome.runtime.getURL("assets/upload.png"), alt: "Upload", width: 20 })),
        h("button", {
          className: "upload-btn",
          onClick: () => setShowSettings(true)
        }, h("img", { src: chrome.runtime.getURL("assets/settings.png"), alt: "Settings", width: 20 })),
        h("button", {
          className: "upload-btn",
          onClick: () => setMessages([])
        }, h("img", { src: chrome.runtime.getURL("assets/newchat.png"), alt: "New Chat", width: 20 }))
      ])
    ]),
    h("div", { className: "chat-area" }, [
      messages.length === 0 && h("p", { className: "text-center text-gray-500 p-4" }, 
        "Hey there 🌸, I’m LANGO — your voice-powered AI companion. Just say ‘Summarize this page’ or tap the mic to begin!"
      ),
      messages.map((msg, i) => 
        h("div", { key: i, className: `bubble ${msg.role}` }, msg.text)
      )
    ]),
    h("div", { className: "quick-actions" }, 
      quickActions.map(action => 
        h("button", {
          key: action.label,
          className: "quick-btn",
          onClick: () => handleSend(action.command)
        }, action.label)
      )
    ),
    h("div", { className: "input-area" }, [
      h("input", {
        className: "input-box",
        value: input,
        onChange: (e) => setInput(e.target.value),
        onKeyPress: (e) => e.key === "Enter" && handleSend(),
        placeholder: "Type or speak your command..."
      }),
      h("button", {
        className: "send-btn",
        onClick: () => handleSend()
      }, "❤️")
    ]),
    showSettings && h("div", { className: "settings-modal" }, [
      h("div", { className: "settings-content" }, [
        h("h2", { className: "text-lg font-semibold mb-4" }, "Settings"),
        h("label", { className: "flex items-center mb-2" }, [
          h("input", {
            type: "checkbox",
            checked: settings.voiceFeedback,
            onChange: () => {
              const newSettings = { ...settings, voiceFeedback: !settings.voiceFeedback };
              setSettings(newSettings);
              chrome.storage.local.set(newSettings);
            }
          }),
          h("span", { className: "ml-2" }, "Voice Feedback")
        ]),
        h("label", { className: "flex items-center mb-2" }, [
          h("input", {
            type: "checkbox",
            checked: settings.darkMode,
            onChange: () => {
              const newSettings = { ...settings, darkMode: !settings.darkMode };
              setSettings(newSettings);
              chrome.storage.local.set(newSettings);
            }
          }),
          h("span", { className: "ml-2" }, "Dark Mode")
        ]),
        h("button", {
          className: "quick-btn mt-4",
          onClick: () => setShowSettings(false)
        }, "Close")
      ])
    ])
  ]);
};

ReactDOM.render(h(LangoApp), document.getElementById("root"));