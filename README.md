# Briefly - AI Meeting Prep & Summary

Briefly is a Chrome Extension that provides AI-powered meeting preparation and summarization tools. It integrates with Google Calendar to help users prepare for upcoming meetings and get intelligent summaries of past meetings.

## Features

- **Meeting Summarization**: Intelligent summaries of past meetings with contextual insights (First Tab)
- **Meeting Preparation**: AI-assisted preparation for upcoming meetings with intelligent briefs (Second Tab)
- **Smart Range Selection**: Flexible time windows with ISO week boundaries (Mon-Sun)
- **Weekly Retrospectives**: Special Last Week mode for Briefs tab with AI-generated insights
- **AI-Powered Content**: GPT-3.5 integration for intelligent meeting preparation and summaries
- **Google Calendar Integration**: Seamless access to your calendar data with event preprocessing
- **Intelligent Caching**: Smart caching system to avoid regenerating unchanged content
- **Batch Processing**: Efficient handling of multiple events with progress tracking

## Setup

### Environment Configuration

1. **Create a `.env` file** in the project root with your credentials:
   ```bash
   # Google OAuth credentials
   GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here
   
   # OpenAI API key
   OPENAI_API_KEY=your_openai_api_key_here
   ```

2. **Run the build script** to generate the configuration files:
   ```bash
   node build.js
   ```

   This will:
   - Generate `manifest.json` from `manifest.template.json`
   - Generate `config.js` with your actual credentials
   - Validate that all required environment variables are present

3. **Load the extension** in Chrome from the generated files

**Note**: The `config.js` file is generated from your `.env` file and contains sensitive credentials. It's automatically added to `.gitignore` to prevent accidental commits. Never commit your actual credentials to version control.

### Required Credentials

- **Google OAuth2**: Client ID and Client Secret from Google Cloud Console
- **OpenAI API**: API key from OpenAI platform

## Usage

### Summarize Tab (First Tab)
- **Default Range**: Last Week
- **Purpose**: Generate AI-powered summaries of past meetings
- **Features**: 
  - Unified range selector
  - Concise meeting summaries with purpose and highlights
  - Role context for interview-like meetings
  - Copy individual summaries or entire days

### Briefs Tab (Second Tab)
- **Default Range**: This Week
- **Purpose**: Generate AI-powered preparation briefs for upcoming meetings
- **Features**:
  - Same unified range selector as Summarize tab
  - Weekly retrospective for Last Week mode
  - Detailed prep cards with company info and questions

### Range Options (Unified)
- **Last Week**: Start = Monday of previous week 00:00, End = Sunday of previous week 23:59:59
- **Today**: Start = today 00:00, End = today 23:59:59
- **Tomorrow**: Start = tomorrow 00:00, End = tomorrow 23:59:59
- **This Week**: Start = Monday of current week 00:00, End = Sunday of current week 23:59:59
- **Custom Date**: Start = selected date 00:00, End = selected date 23:59:59

### Weekly Retrospective (Briefs - Last Week)
When selecting "Last Week" in the Briefs tab, the extension generates:
- **Themes**: Concrete patterns from the week's meetings
- **Wins**: Key accomplishments and successes
- **Blockers/Risks**: Challenges and potential issues
- **Improvements**: Specific, actionable suggestions for next week

### Event Processing
Each calendar event is intelligently processed to extract:
- Event title and timing
- Attendee information (name/email)
- Location or meeting links (Google Meet, Zoom)
- Description (trimmed to 800 characters)
- Company inference from attendee domains
- Meeting type classification

### AI Content Generation
Content is generated using GPT-3.5 with:
- **Temperature**: 0.3 (for consistent, focused output)
- **Max Tokens**: 300-500 (for concise content)
- **Format**: Structured Markdown with appropriate sections
- **Minimal Mode**: For vague events, generates minimal content

## Development

The extension is built with:
- **Manifest V3**: Latest Chrome extension manifest version
- **Vanilla JavaScript**: No external dependencies except OpenAI API
- **Chrome Identity API**: For secure OAuth authentication
- **Chrome Storage API**: For local data persistence and caching
- **OpenAI GPT-3.5**: For intelligent content generation
- **Marked.js**: For Markdown rendering
- **Tab Persistence**: Chrome storage for remembering last active tab

### File Structure

```
briefly/
├── manifest.json          # Extension configuration (generated)
├── manifest.template.json # Template for manifest generation
├── popup.html            # Main popup interface
├── popup.css             # Popup styling
├── popup.js              # Main functionality and logic
├── config.js             # Configuration with API keys (generated)
├── build.js              # Build script for generating config files
├── background.js         # Service worker
├── icons/                # Extension icons
├── .env                  # Environment variables (not in version control)
├── .env.example          # Example environment file
├── README.md             # This file
├── LICENSE               # License information
└── .gitignore           # Git ignore rules
```

## Security Notes

- **Environment Variables**: All sensitive credentials are stored in a `.env` file (not committed to version control)
- **Generated Config**: The `config.js` file is automatically generated from environment variables using `node build.js`
- **Template Files**: `manifest.template.json` contains placeholders that get replaced during build
- **Git Protection**: Both `.env` and `config.js` are automatically excluded from version control
- **Local Development**: Each developer maintains their own `.env` file locally
- **Never commit your actual Google OAuth credentials or OpenAI API key to version control**
- The extension only requests calendar read access
- All authentication tokens are stored locally in Chrome storage
- Tokens automatically expire and require re-authentication
- Content cache is stored locally and can be cleared with one click
- Privacy-first approach: minimal data storage, no external data transmission except to Google Calendar API and OpenAI API

## Privacy Features

- **Lite Mode**: Only calendar data is accessed
- **Minimal Storage**: Content cached locally with event ID + update timestamp
- **One-Click Clear**: "Clear all data" button removes all cached information
- **No Tracking**: No analytics or user behavior tracking
- **Local Processing**: All data processing happens locally before API calls
- **Tab Persistence**: Only stores last active tab preference

## Testing Checklist

- [ ] Tab order: Summarize (first), Briefs (second), Settings (third)
- [ ] Tab persistence between sessions
- [ ] Range selector parity across tabs (same base options)
- [ ] Briefs tab adds Last Week option in Previous dropdown
- [ ] ISO week boundaries (Monday-Sunday)
- [ ] This Week default for both tabs
- [ ] Last Week generates weekly retrospective + per-event briefs
- [ ] Inline OAuth flow stays on current tab
- [ ] Progress indicators work during generation
- [ ] Copy buttons function for individual, day, and all content
- [ ] Error handling for API failures
- **Authentication flow works end-to-end
- [ ] Vague titles produce minimal output
- [ ] Cached content reuse works correctly

## License

© 2025 Boris Dedejski. All rights reserved. Unauthorized copying, modification, or distribution of this software is prohibited.
