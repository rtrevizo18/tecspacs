# Tecspacs Frontend MVP

A personal + collaborative snippet/package manager for developers with a sticky notes aesthetic.

## Features Implemented (Phase 1 - Core MVP)

✅ **Component Library Setup**
- StickyNote: Customizable sticky note cards with different variants and sizes
- CodeBox: Syntax-highlighted code display with react-syntax-highlighter
- UnderlineInput: Clean input fields with underline styling
- LanguageTag: Color-coded tags for programming languages
- OutlineButton: Consistent button styling throughout the app

✅ **Dashboard with Dummy Data**
- Grid layout displaying code snippets as sticky note cards
- Each snippet shows title, language, author, creation date, and preview
- Sidebar with navigation and popular tags
- Sample data with 10+ realistic code snippets across different languages

✅ **View Snippet Page**
- Large sticky note layout for detailed snippet view
- Full syntax highlighting for code display
- Author information, tags, and metadata
- Action buttons for edit, delete, fork (UI only)
- Related snippets section

✅ **Basic Navigation**
- Fixed navigation bar with search functionality
- Logo linking to dashboard
- User avatar display (for logged-in state simulation)
- Clean sticky note aesthetic throughout

## Tech Stack

- **React 18** with TypeScript
- **React Router v6** for navigation
- **Tailwind CSS** for styling with custom sticky note theme
- **react-syntax-highlighter** for code display
- **date-fns** for relative date formatting

## Design System

### Color Palette
- Background: Sketch book white with subtle grid lines
- Sticky Notes: Yellow (#FFDC97), Pink (#FFDEEA), Blue (#BEE3F8), Green (#C6F6D5)
- Text: Dark gray (#2D3748) with medium gray accent (#4A5568)
- Borders: Black outlines for authentic sticky note feel

### Typography
- Primary: Roboto (Google Fonts)
- Code: Fira Code for monospace display

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── StickyNote.tsx   # Main sticky note wrapper
│   ├── CodeBox.tsx      # Syntax highlighted code display
│   ├── Navigation.tsx   # Top navigation bar
│   ├── SnippetCard.tsx  # Snippet preview cards
│   └── Sidebar.tsx      # Dashboard sidebar
├── pages/               # Main application pages
│   ├── Dashboard.tsx    # Home page with snippet grid
│   └── ViewSnippet.tsx  # Individual snippet view
├── data/               # Mock data and utilities
│   └── mockData.ts     # Sample snippets and users
├── types/              # TypeScript interfaces
│   └── index.ts        # Snippet and User interfaces
└── App.tsx             # Main routing component
```

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Sample Data

The app includes realistic mock data with:
- 10 code snippets across JavaScript, Python, TypeScript, CSS, SQL, etc.
- 4 mock users with different specialties
- Various snippet complexities and use cases
- Mix of public/private snippets for testing

## Next Steps (Future Phases)

- **Phase 2**: New snippet creation, editing, search and filtering
- **Phase 3**: Authentication UI, user profiles, save/unsave functionality
- **Enhanced Features**: Responsive design, virtual scrolling, advanced search
