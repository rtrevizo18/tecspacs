# Tecspacs Frontend MVP

A personal + collaborative snippet/package manager for developers. This MVP focuses on the web frontend using TypeScript + Tailwind CSS, with a sticky notes aesthetic on a sketch book background. No authentication is required yet — login/register flow will purely be only UI for now, auth will be added later.

---

## Theme & Visual Design

### Color Palette

```
Background: #FFFFFF (sketch book white)
Border: #000000 (pen-like black outlines)
Grid Lines: #E5E5E5 (subtle grid paper lines)

Sticky Note Variants:
- Default: #FFDC97 (warm yellow)
- Variant 2: #FFDEEA (soft pink)
- Variant 3: #BEE3F8 (light blue)
- Variant 4: #C6F6D5 (mint green)

Text: #2D3748 (dark gray for readability)
Accent: #4A5568 (medium gray for secondary text)
```

### Typography

- **Primary Font**: Roboto (Google Fonts)
- **Code Font**: Fira Code or Monaco for syntax highlighting

### Design Philosophy

- **Sticky Notes Aesthetic**: All cards, forms, and interactive elements should resemble Post-it notes
- **Sketch Book Background**: Subtle grid paper texture/lines
- **Drop Shadows**: Consistent shadow underneath sticky note elements for depth
- **Hand-drawn Feel**: Slightly rounded corners, organic spacing

---

## Component Library

### 1. Sticky Note Cards

```typescript
interface StickyNoteProps {
  variant?: "default" | "pink" | "blue" | "green";
  size?: "small" | "medium" | "large";
  shadow?: boolean;
  children: React.ReactNode;
}
```

- Used for: Forms, snippet cards, profile cards
- Features: Rounded corners (8px), drop shadow, paper texture

### 2. Code Display Box

```typescript
interface CodeBoxProps {
  code: string;
  language: string;
  editable?: boolean;
}
```

- Square/rectangular with black border only (no fill)
- Syntax highlighting with Prism.js or similar
- Monospace font (Fira Code recommended)

### 3. Underline Input Fields

```typescript
interface UnderlineInputProps {
  label: string;
  type?: "text" | "email" | "password";
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}
```

- No border except bottom underline
- Label appears above the underline
- Focus state: thicker underline

### 4. Language Tags

```typescript
interface LanguageTagProps {
  language: string;
  removable?: boolean;
  onRemove?: () => void;
}
```

- Horizontally elongated sticky note style
- Small size with rounded corners
- Color varies by language type (use variant colors)

### 5. Outline Buttons

```typescript
interface OutlineButtonProps {
  variant?: "primary" | "secondary" | "danger";
  size?: "small" | "medium" | "large";
  onClick: () => void;
  children: React.ReactNode;
}
```

- Border only (no fill)
- Bold text
- Hover state: subtle background tint

---

## Data Structure

### Snippet Interface

```typescript
interface Snippet {
  id: string;
  title: string;
  code: string;
  language: string;
  tags: string[];
  authorId: string;
  authorName: string;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  bio?: string;
  avatar?: string;
  createdSnippets: string[]; // snippet IDs
  savedSnippets: string[]; // snippet IDs
}
```

---

## Page Specifications

### 1. Dashboard (`/`)

**Layout**: Grid of sticky note cards
**Features**:

- Search bar in navbar filters results in real-time
- Each snippet card shows:
  - Title (truncated if long)
  - Language tags
  - Author name
  - Created date (relative: "2 days ago")
  - Save/unsave heart icon
- Sidebar sections:
  - "My Snippets" (if logged in)
  - "Saved Snippets" (if logged in)
  - Login/Register buttons (if not logged in)
  - "New Snippet" button (if logged in)

### 2. New Snippet (`/new`)

**Layout**: Single large sticky note form
**Form Fields**:

- Title: Underline input
- Language: Dropdown with search/create functionality
- Tags: Multi-select with tag chips
- Code: Large code input box with syntax highlighting
- Public/Private toggle
  **Actions**: Submit button, Cancel button

### 3. View Snippet (`/view/[id]`)

**Layout**: Large sticky note with code display
**Sections**:

- Header: Title, author, date, save button
- Tags: Language and custom tags
- Code: Large syntax-highlighted code box
- Actions: Edit (if owner), Delete (if owner), Fork button

### 4. Navigation Bar

**Always Visible**: Fixed top navigation
**Logged In State**:

- Left: Logo (links to `/`)
- Center: Search bar with live suggestions
- Right: User avatar dropdown (Profile, Settings, Logout)

**Logged Out State**:

- Left: Logo (links to `/`)
- Center: Search bar
- Right: Login + Register buttons

### 5. User Profile (`/user/[uid]`)

**Layout**: Profile sticky note + snippet grid
**Profile Section**:

- Avatar placeholder
- Name and bio
- Join date
- Stats: # snippets created, # saved

**Content Tabs**:

- "My Snippets": User's created snippets
- "Saved Snippets": User's saved snippets
  **Actions**: Edit profile (if own profile), Follow (if other user)

### 6. Authentication Pages

#### Login (`/login`)

**Layout**: Centered sticky note form
**Fields**: Email, Password (both underline inputs)
**Actions**: Login button, "Forgot Password?" link, "Sign Up" link

#### Register (`/register`)

**Layout**: Centered sticky note form
**Fields**: Name, Email, Password, Confirm Password
**Actions**: Register button, "Sign In" link

#### Reset Password (`/resetpass`)

**Layout**: Centered sticky note form  
**Fields**: Email, New Password, Confirm Password
**Actions**: Reset button, "Back to Login" link

---

## Technical Requirements

### State Management

- React Context for user authentication state
- Local state for forms and UI interactions
- Consider Zustand for more complex state if needed

### Routing

- React Router v6
- Protected routes for authenticated-only pages
- Dynamic routes for user profiles and snippet views

### Responsive Design

- Mobile-first approach
- Sticky notes stack vertically on mobile
- Sidebar becomes bottom navigation on mobile
- Search bar collapses to icon on small screens

### Performance

- Code syntax highlighting: Use react-syntax-highlighter
- Virtual scrolling for large snippet lists
- Image optimization for avatars
- Lazy loading for snippet content

---

## Implementation Priority

### Phase 1 (Core MVP)

1. Component library setup
2. Dashboard with dummy data
3. View snippet page
4. Basic navigation

### Phase 2 (Content Management)

1. New snippet creation
2. Edit snippet functionality
3. Search and filtering

### Phase 3 (User Features)

1. Authentication pages (UI only)
2. User profiles
3. Save/unsave functionality
4. Responsive design polish

---

## Dummy Data Structure

Create realistic sample data with:

- 20-30 snippets across different languages (JavaScript, Python, CSS, etc.)
- 3-5 mock users
- Various snippet lengths and complexity
- Mix of public/private snippets
- Saved relationships between users and snippets

This will help demonstrate all features during development and testing.
