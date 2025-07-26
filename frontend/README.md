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

The app will be available at [http://localhost:3000](http://localhost:3000) or other ports if alr in use.

