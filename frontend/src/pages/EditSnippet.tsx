import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import StickyNote from "../components/StickyNote";
import NotebookInput from "../components/NotebookInput";
import OutlineButton from "../components/OutlineButton";
import LanguageTag from "../components/LanguageTag";
import { getCurrentUser, getSnippetById } from "../data/mockData";

const EditSnippet: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const currentUser = getCurrentUser();
  const snippet = id ? getSnippetById(id) : null;
  
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

  // Pre-populate form with existing snippet data
  useEffect(() => {
    if (snippet) {
      setTitle(snippet.title);
      setDescription(snippet.description || "");
      setCode(snippet.code);
      setLanguage(snippet.language);
      setTags(snippet.tags);
      setIsPublic(snippet.isPublic);
    }
  }, [snippet]);

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
    updateSnippet();
  };

  const updateSnippet = () => {
    if (!currentUser || !snippet) {
      alert("Unable to update snippet");
      return;
    }

    if (!title.trim() || !code.trim() || !language.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    const updatedSnippet = {
      ...snippet,
      title: title.trim(),
      description: description.trim(),
      code: code.trim(),
      language: language.trim(),
      tags: tags,
      updatedAt: new Date(),
      isPublic: isPublic
    };

    console.log("Snippet updated:", updatedSnippet);
    navigate(`/view/${snippet.id}`);
  };

  if (!snippet) {
    return (
      <div className="min-h-screen p-4">
        <div className="container mx-auto max-w-4xl pt-20">
          <StickyNote variant="pink" className="text-center">
            <h1 className="text-2xl font-bold text-pen-black mb-2">Snippet Not Found</h1>
            <p className="text-accent">The snippet you're trying to edit doesn't exist.</p>
          </StickyNote>
        </div>
      </div>
    );
  }

  if (!currentUser || currentUser.id !== snippet.authorId) {
    return (
      <div className="min-h-screen p-4">
        <div className="container mx-auto max-w-4xl pt-20">
          <StickyNote variant="pink" className="text-center">
            <h1 className="text-2xl font-bold text-pen-black mb-2">Access Denied</h1>
            <p className="text-accent">You can only edit your own snippets.</p>
          </StickyNote>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="container mx-auto max-w-4xl pt-20">
        <StickyNote variant="blue" size="large">
          <h1 className="text-3xl font-bold text-pen-black mb-6">Edit Snippet</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <NotebookInput
                label="Title *"
                type="text"
                placeholder="Enter snippet title"
                value={title}
                onChange={setTitle}
              />
            </div>

            <div>
              <NotebookInput
                label="Description"
                type="text"
                placeholder="Describe what your snippet does"
                value={description}
                onChange={setDescription}
              />
            </div>

            <div className="mb-6">
              <div className="flex items-baseline">
                <span className="text-text-primary font-medium mr-2 min-w-fit">
                  Language *:
                </span>
                <div className="flex-1 relative">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-transparent border-0 outline-none text-text-primary py-1 px-1 appearance-none cursor-pointer"
                    style={{
                      backgroundImage: `repeating-linear-gradient(
                        to right,
                        transparent,
                        transparent 4px,
                        #000000 4px,
                        #000000 8px
                      )`,
                      backgroundPosition: '0 100%',
                      backgroundSize: '100% 1px',
                      backgroundRepeat: 'repeat-x',
                      paddingBottom: '2px'
                    }}
                  >
                    <option value="">Select a language</option>
                    {commonLanguages.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang.charAt(0).toUpperCase() + lang.slice(1)}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-1 top-1 pointer-events-none">
                    ▼
                  </div>
                </div>
              </div>
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
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTag(newTag)}
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
              <OutlineButton variant="primary" size="large" onClick={updateSnippet}>
                Update Snippet
              </OutlineButton>
              <OutlineButton 
                variant="secondary" 
                size="large" 
                onClick={() => navigate(`/view/${snippet.id}`)}
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

export default EditSnippet;