# Arabic Songs - Frontend

A React web application for learning Arabic through song translations.

## Features

- **Home Page**: Search for Arabic songs by name and artist, view translations with line-by-line and word-by-word breakdowns
- **Vocabulary Page**: Save and manage selected phrases/words from song translations
- **Profile Page**: User profile with learning statistics, settings, and sign in/out functionality

## Getting Started

### Prerequisites

- Node.js (v20.15.0 or higher recommended)
- npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to the URL shown in the terminal (typically `http://localhost:5173`)

## Project Structure

```
src/
  ├── components/        # Reusable components
  │   ├── Header.jsx    # Page header with menu button
  │   └── NavDrawer.jsx # Navigation sidebar
  ├── pages/            # Page components
  │   ├── Home.jsx      # Main page with song search and translations
  │   ├── Vocabulary.jsx # Saved vocabulary words
  │   └── Profile.jsx   # User profile page
  ├── utils/            # Utility functions
  │   └── vocabulary.js # Vocabulary storage helpers (localStorage)
  ├── App.jsx           # Main app component with routing
  └── main.jsx          # Entry point
```

## Features in Detail

### Home Page
- Search for songs by name and artist
- View translations with:
  - Dialect information
  - Line-by-line translations (English, Arabic, Transliteration)
  - Word-by-word breakdowns
- Select text from translations to add to vocabulary
- Add selected phrases to vocabulary with one click

### Vocabulary Page
- View all saved words/phrases
- Delete words from vocabulary
- See word count

### Profile Page
- User authentication (demo implementation)
- Learning statistics (songs learned, study time)
- App settings section
- Sign in/out functionality

## Data Storage

Currently uses `localStorage` for:
- Vocabulary words
- User sign-in state

**Note**: This is temporary for development. The backend API and database integration will replace this when the backend is complete.

## Backend Integration

The frontend is ready to connect to the backend API. Currently, it uses mock data for song translations. When the backend is ready:

1. Update the API endpoint in `Home.jsx` (search function)
2. Replace mock translation responses with actual API calls
3. Implement proper authentication for the Profile page

## Building for Production

```bash
npm run build
```

The production build will be in the `dist/` directory.

## Development Notes

- The app uses React Router for navigation
- Responsive design optimized for mobile and desktop
- Modern UI with clean, minimalist styling
- Text selection and vocabulary saving fully functional
