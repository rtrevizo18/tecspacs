// TEC (Technical Excellence Component) - equivalent to Snippet
export interface TEC {
  _id: string;
  title: string;
  description: string;
  language: string;
  content: string; // renamed from 'code'
  tags: string[];
  createdBy: {
    _id: string;
    username: string;
  }; // User object from backend
  createdAt: string; // ISO string from backend
  updatedAt: string; // ISO string from backend
  isPublic?: boolean; // optional, defaults to true
}

// PAC (Package Component) - for future package management
export interface PAC {
  _id: string;
  name: string;
  description: string;
  dependencies: string[];
  files: string[];
  createdBy: {
    _id: string;
    username: string;
  }; // User object from backend
  createdAt: string;
  updatedAt: string;
}

// User interface - matches Auth0 + backend structure
export interface User {
  _id: string; // Backend user ID
  auth0Id: string; // Auth0 user ID
  username: string; // Backend username
  email: string;
  bio?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  __v?: number; // MongoDB version field
  // TEC/PAC arrays from backend
  tecs: TEC[]; // Array of TEC objects
  pacs: PAC[]; // Array of PAC objects
  // Legacy fields for backward compatibility
  id?: string;
  name?: string; // Derived from username
  createdSnippets?: string[];
  savedSnippets?: string[];
  // New TEC/PAC fields
  createdTECs?: string[];
  createdPACs?: string[];
  savedTECs?: string[];
  savedPACs?: string[];
}

// Legacy Snippet interface for backward compatibility during migration
export interface Snippet {
  id: string;
  title: string;
  description: string;
  code: string;
  language: string;
  tags: string[];
  authorId: string;
  authorName: string;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
}

// Helper function to convert TEC to Snippet for UI compatibility
export function tecToSnippet(tec: TEC, authorName?: string): Snippet {
  return {
    id: tec._id,
    title: tec.title,
    description: tec.description,
    code: tec.content,
    language: tec.language,
    tags: tec.tags,
    authorId: tec.createdBy._id,
    authorName: authorName || tec.createdBy.username || 'Unknown',
    createdAt: new Date(tec.createdAt),
    updatedAt: new Date(tec.updatedAt),
    isPublic: tec.isPublic ?? true,
  };
}