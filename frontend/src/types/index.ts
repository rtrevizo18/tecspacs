export interface Snippet {
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

export interface User {
  id: string;
  name: string;
  email: string;
  bio?: string;
  avatar?: string;
  createdSnippets: string[];
  savedSnippets: string[];
}