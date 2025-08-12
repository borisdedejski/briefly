# Briefly - AI Meeting Prep & Summary

Briefly is a Chrome Extension that provides AI-powered meeting preparation and summarization tools. It integrates with Google Calendar to help users prepare for upcoming meetings and get intelligent summaries of past meetings.

## Features

- **Meeting Preparation**: AI-assisted preparation for upcoming meetings
- **Meeting Summarization**: Intelligent summaries of past meetings
- **Google Calendar Integration**: Seamless access to your calendar data
- **Secure Authentication**: OAuth2 integration with Google

## Getting Started

### Prerequisites

1. **Google Cloud Project**: You'll need to create a Google Cloud project and enable the Google Calendar API
2. **OAuth2 Credentials**: Create OAuth2 credentials for a Chrome Extension

### Setup Instructions

1. **Clone or download this repository**
2. **Configure Google OAuth2**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable the Google Calendar API
   - Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
   - Choose "Chrome Extension" as application type
   - Add your extension ID to the allowed origins
   - Copy the Client ID and Client Secret

3. **Update the extension configuration**:
   - Open `manifest.json`
   - Replace `YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com` with your actual Client ID
   - Open `popup.js`
   - Replace `YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com` with your actual Client ID
   - Replace `YOUR_CLIENT_SECRET` with your actual Client Secret

4. **Add icon files**:
   - Place your icon files in the `icons/` directory
   - Update `manifest.json` if using different filenames

5. **Load the extension in Chrome**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `briefly` directory containing your extension files

6. **Test the extension**:
   - Click the Briefly extension icon in your Chrome toolbar
   - Go to the Settings tab
   - Click "Sign in with Google"
   - Complete the OAuth flow

### Development

The extension is built with:
- **Manifest V3**: Latest Chrome extension manifest version
- **Vanilla JavaScript**: No external dependencies
- **Chrome Identity API**: For secure OAuth authentication
- **Chrome Storage API**: For local data persistence

### File Structure

```
briefly/
├── manifest.json          # Extension configuration
├── popup.html            # Main popup interface
├── popup.css             # Popup styling
├── popup.js              # Popup functionality and auth
├── background.js         # Service worker
├── icons/                # Extension icons
├── README.md             # This file
├── LICENSE               # License information
└── .gitignore           # Git ignore rules
```

## Security Notes

- Never commit your actual Google OAuth credentials to version control
- The extension only requests calendar read access
- All authentication tokens are stored locally in Chrome storage
- Tokens automatically expire and require re-authentication

## License

© 2025 Boris Dedejski. All rights reserved. Unauthorized copying, modification, or distribution of this software is prohibited.
