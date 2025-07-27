import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import StickyNote from "../components/StickyNote";
import NotebookInput from "../components/NotebookInput";
import OutlineButton from "../components/OutlineButton";
import LanguageTag from "../components/LanguageTag";
import { useAuthContext } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { apiService } from "../services/api";
// import { TEC } from "../types"; // Unused - TEC structure defined by API

const NewTEC: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, accessToken } = useAuthContext();
  const { showSuccess, showError } = useToast();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [language, setLanguage] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(true);
  const [newTag, setNewTag] = useState("");
  const [showTagInput, setShowTagInput] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

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
    createTEC();
  };

  const createTEC = async () => {
    if (!currentUser || !accessToken) {
      showError("Please log in to create a TEC");
      return;
    }

    if (!title.trim() || !description.trim() || !content.trim() || !language.trim()) {
      showError("Please fill in all required fields");
      return;
    }

    setIsCreating(true);
    
    try {
      const newTECData = {
        title: title.trim(),
        description: description.trim(),
        content: content.trim(),
        language: language.trim(),
        tags: tags,
      };

      console.log("Creating TEC:", newTECData);
      
      const createdTEC = await apiService.createTec(accessToken, newTECData);
      
      console.log("TEC created successfully:", createdTEC);
      showSuccess("TEC created successfully!");
      
      // Navigate to the newly created TEC
      navigate(`/view/${createdTEC._id}`);
    } catch (error) {
      console.error("Error creating TEC:", error);
      showError("Failed to create TEC. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen p-4">
        <div className="container mx-auto max-w-4xl pt-20">
          <StickyNote variant="pink" className="text-center">
            <h1 className="text-2xl font-bold text-pen-black">
              Please log in to create a TEC
            </h1>
          </StickyNote>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="container mx-auto max-w-4xl pt-20">
        <h1 className="text-3xl font-bold text-pen-black mb-6">Create New TEC</h1>
        
        <form onSubmit={handleSubmit}>
          <StickyNote variant="default" className="mb-6">
            <div className="space-y-6">
              {/* Title */}
              <div>
                <NotebookInput
                  label="Title *"
                  type="text"
                  placeholder="Enter TEC title..."
                  value={title}
                  onChange={setTitle}
                />
              </div>

              {/* Description */}
              <div>
                <NotebookInput
                  label="Description *"
                  type="text"
                  placeholder="Brief description of what this TEC does..."
                  value={description}
                  onChange={setDescription}
                />
              </div>

              {/* Language */}
              <div>
                <label className="block text-pen-black text-base mb-2 font-medium">
                  Language *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    list="languages"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    placeholder="Select or type language..."
                    className="w-full bg-transparent border-b-2 border-dashed border-pen-black focus:outline-none focus:border-solid text-pen-black text-base pb-1"
                  />
                  <datalist id="languages">
                    {commonLanguages.map((lang) => (
                      <option key={lang} value={lang} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-pen-black text-base mb-2 font-medium">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {tags.map((tag) => (
                    <LanguageTag 
                      key={tag} 
                      language={tag} 
                      removable 
                      onRemove={() => handleRemoveTag(tag)} 
                    />
                  ))}
                  {showTagInput ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTag(newTag);
                          }
                        }}
                        placeholder="Add tag..."
                        className="px-2 py-1 border border-pen-black rounded text-sm"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => handleAddTag(newTag)}
                        className="px-2 py-1 bg-pen-black text-white rounded text-sm"
                      >
                        Add
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowTagInput(true)}
                      className="px-3 py-1 border-2 border-dashed border-pen-black rounded text-sm text-pen-black hover:border-solid transition-all"
                    >
                      + Add Tag
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {commonTags.filter(tag => !tags.includes(tag)).slice(0, 8).map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleAddTag(tag)}
                      className="px-2 py-1 text-xs border border-gray-300 rounded text-gray-600 hover:border-pen-black hover:text-pen-black transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="block text-pen-black text-base mb-2 font-medium">
                  Code Content *
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste your code here..."
                  rows={12}
                  className="w-full p-4 border-2 border-pen-black rounded bg-white font-mono text-sm text-pen-black resize-vertical focus:outline-none notebook-grid"
                />
              </div>

              {/* Public/Private Toggle */}
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-pen-black text-base">Make this TEC public</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <OutlineButton 
                  variant="primary" 
                  size="medium"
                  onClick={() => {}}
                  type="submit"
                  disabled={isCreating}
                >
                  {isCreating ? "Creating..." : "Create TEC"}
                </OutlineButton>
                <OutlineButton 
                  variant="secondary" 
                  size="medium"
                  onClick={() => navigate("/")}
                  type="button"
                >
                  Cancel
                </OutlineButton>
              </div>
            </div>
          </StickyNote>
        </form>
      </div>
    </div>
  );
};

export default NewTEC;