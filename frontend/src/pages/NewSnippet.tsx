import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import StickyNote from "../components/StickyNote";
import UnderlineInput from "../components/UnderlineInput";
import OutlineButton from "../components/OutlineButton";
import LanguageTag from "../components/LanguageTag";
import { getCurrentUser } from "../data/mockData";

const NewSnippet: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(true);
  const [newTag, setNewTag] = useState("");
  const [showTagInput, setShowTagInput] = useState(false);

  const commonLanguages = [
    "javascript", "typescript", "python", "css", "html", "react", 
    "nodejs", "sql", "yaml", "json", "bash", "java", "go", "rust"
  ];

  const commonTags = [
    "react", "typescript", "component", "hook", "api", "tutorial", 
    "example", "utility", "helper", "database", "frontend", "backend"
  ];

  const handleAddTag = (tag: string) => {
    if (tag.trim() && !tags.includes(tag.trim())) {
      setTags([...tags, tag.trim()]);
    }
    setNewTag("");
    setShowTagInput(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createSnippet();
  };

  const createSnippet = () => {
    if (!currentUser) {
      alert("Please log in to create snippets");
      return;
    }

    if (!title.trim() || !code.trim() || !language.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    const newSnippet = {
      id: Math.random().toString(36).substr(2, 9),
      title: title.trim(),
      description: description.trim(),
      code: code.trim(),
      language: language.trim(),
      tags: tags,
      authorId: currentUser.id,
      authorName: currentUser.name,
      createdAt: new Date(),
      updatedAt: new Date(),
      isPublic: isPublic
    };

    console.log("New snippet created:", newSnippet);
    navigate("/");
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen p-4">
        <div className="container mx-auto max-w-4xl pt-20">
          <StickyNote variant="pink" className="text-center">
            <h1 className="text-2xl font-bold text-pen-black mb-2">Authentication Required</h1>
            <p className="text-accent">Please log in to create snippets.</p>
          </StickyNote>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="container mx-auto max-w-4xl pt-20">
        <StickyNote variant="blue" size="large">
          <h1 className="text-3xl font-bold text-pen-black mb-6">Create New Snippet</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <UnderlineInput
                label="Title *"
                type="text"
                placeholder="Enter snippet title"
                value={title}
                onChange={setTitle}
              />
            </div>

            <div>
              <UnderlineInput
                label="Description"
                type="text"
                placeholder="Describe what your snippet does"
                value={description}
                onChange={setDescription}
              />
            </div>

            <div>
              <label className="block text-pen-black font-bold mb-2">Language *</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full p-2 border-b-2 border-pen-black bg-transparent text-pen-black focus:outline-none"
              >
                <option value="">Select a language</option>
                {commonLanguages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-pen-black font-bold mb-2">Tags</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map((tag) => (
                  <div key={tag} className="relative">
                    <LanguageTag language={tag} />
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {commonTags.filter(tag => !tags.includes(tag)).slice(0, 8).map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleAddTag(tag)}
                    className="px-2 py-1 text-xs border border-pen-black bg-white hover:bg-gray-100 transition-colors"
                  >
                    + {tag}
                  </button>
                ))}
              </div>

              {showTagInput ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag(newTag)}
                    placeholder="Enter new tag"
                    className="flex-1 p-2 border-b-2 border-pen-black bg-transparent focus:outline-none"
                    autoFocus
                  />
                  <OutlineButton 
                    variant="primary" 
                    size="small" 
                    onClick={() => handleAddTag(newTag)}
                  >
                    Add
                  </OutlineButton>
                  <OutlineButton 
                    variant="secondary" 
                    size="small" 
                    onClick={() => setShowTagInput(false)}
                  >
                    Cancel
                  </OutlineButton>
                </div>
              ) : (
                <OutlineButton 
                  variant="secondary" 
                  size="small" 
                  onClick={() => setShowTagInput(true)}
                >
                  Add Custom Tag
                </OutlineButton>
              )}
            </div>

            <div>
              <label className="block text-pen-black font-bold mb-2">Code *</label>
              <div className="border border-pen-black bg-white">
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Paste your code here..."
                  className="w-full p-4 font-code text-sm resize-none border-none outline-none bg-transparent min-h-64"
                  rows={12}
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-3 text-pen-black font-bold">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="w-4 h-4"
                />
                Make this snippet public
              </label>
              <p className="text-sm text-accent mt-1">
                {isPublic ? "Anyone can view this snippet" : "Only you can view this snippet"}
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <OutlineButton variant="primary" size="large" onClick={createSnippet}>
                Create Snippet
              </OutlineButton>
              <OutlineButton 
                variant="secondary" 
                size="large" 
                onClick={() => navigate("/")}
              >
                Cancel
              </OutlineButton>
            </div>
          </form>
        </StickyNote>
      </div>
    </div>
  );
};

export default NewSnippet;