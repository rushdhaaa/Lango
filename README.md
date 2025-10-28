# LANGO: Your Voice-Powered Chrome Companion 🌸

LANGO is an AI-powered Chrome Extension built for the Google Chrome Built-in AI Challenge 2025. It integrates Gemini Nano APIs to provide voice-activated summarization, translation, rewriting, and more, all within a beautiful baby pink-themed side panel.

## Features
- **Voice Activation**: Use press-to-talk (Spacebar) to issue commands like "Summarize this page" or "Translate this screenshot".
- **Multimodal Input**: Upload images (OCR), audio, or documents for summarization, translation, or rewriting.
- **Context Awareness**: Suggests actions based on whether you're reading or writing.
- **Tab & Search Control**: Open/close tabs or search with voice/text commands.
- **Interactive UI**: Baby pink-themed chat interface with smooth animations and accessibility features.

## Installation
1. Clone or download this repository.
2. Open Chrome and go to `chrome://extensions/`.
3. Enable "Developer mode" (top right).
4. Click "Load unpacked" and select the `lango` folder.
5. Replace `YOUR_GEMINI_API_KEY` in `background.js` with your Gemini Nano API key.
6. Ensure icons are placed in `src/assets/`.

## Permissions
- `activeTab`, `tabs`, `scripting`: For page content extraction and tab control.
- `storage`: To save chat history and settings.
- `microphone`: For voice input.
- `sidePanel`: To display the chat interface.
- `fileSystem`: For file uploads.

## Usage
- Click the LANGO icon or use `Ctrl+Shift+L` to open the side panel.
- Tap the mic or press `Spacebar` to start voice input.
- Type commands or upload files for AI processing.
- Use quick action buttons for common tasks like summarizing or translating.
- Toggle settings for voice feedback or dark mode.

## Notes
- Gemini Nano API integration is a placeholder. Update `background.js` with actual endpoints and keys.
- Tesseract.js is included for OCR; ensure a stable internet connection for loading.

Enjoy LANGO, your friendly AI companion! 🌷