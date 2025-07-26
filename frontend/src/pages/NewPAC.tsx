import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import StickyNote from "../components/StickyNote";
import NotebookInput from "../components/NotebookInput";
import OutlineButton from "../components/OutlineButton";
import LanguageTag from "../components/LanguageTag";
import { getCurrentUser } from "../data/mockData";
import { PAC } from "../types";

const NewPAC: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [dependencies, setDependencies] = useState<string[]>([]);
  const [files, setFiles] = useState<string[]>([]);

  const commonDependencies = [
    "react", "typescript", "@types/react", "express", "mongoose", 
    "axios", "lodash", "moment", "uuid", "dotenv", "cors", "helmet"
  ];

  const commonFileTypes = [
    "index.ts", "package.json", "README.md", "tsconfig.json", 
    "webpack.config.js", "babel.config.js", ".gitignore", "Dockerfile"
  ];

  const handleAddDependency = (dependency: string) => {
    if (dependency.trim() && !dependencies.includes(dependency.trim())) {
      setDependencies([...dependencies, dependency.trim()]);
    }
  };

  const handleRemoveDependency = (depToRemove: string) => {
    setDependencies(dependencies.filter(dep => dep !== depToRemove));
  };

  const handleAddFile = (file: string) => {
    if (file.trim() && !files.includes(file.trim())) {
      setFiles([...files, file.trim()]);
    }
  };

  const handleRemoveFile = (fileToRemove: string) => {
    setFiles(files.filter(file => file !== fileToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPAC();
  };

  const createPAC = () => {
    if (!currentUser) {
      alert("Please log in to create a PAC");
      return;
    }

    if (!name.trim() || !description.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    // Create new PAC object
    const newPAC: PAC = {
      _id: `pac_${Date.now()}`, // Temporary ID for demo
      name: name.trim(),
      description: description.trim(),
      dependencies: dependencies,
      files: files,
      author: currentUser.auth0Id || currentUser.id || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log("Creating PAC:", newPAC);
    
    // TODO: Call API to create PAC
    // apiService.createPac(accessToken, newPAC);
    
    alert("PAC created successfully!");
    navigate("/");
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen p-4">
        <div className="container mx-auto max-w-4xl pt-20">
          <StickyNote variant="pink" className="text-center">
            <h1 className="text-2xl font-bold text-pen-black">
              Please log in to create a PAC
            </h1>
          </StickyNote>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="container mx-auto max-w-4xl pt-20">
        <h1 className="text-3xl font-bold text-pen-black mb-6">Create New PAC</h1>
        
        <form onSubmit={handleSubmit}>
          <StickyNote variant="blue" className="mb-6">
            <div className="space-y-6">
              {/* Name */}
              <div>
                <NotebookInput
                  label="Package Name *"
                  type="text"
                  placeholder="Enter package name..."
                  value={name}
                  onChange={setName}
                />
              </div>

              {/* Description */}
              <div>
                <NotebookInput
                  label="Description *"
                  type="text"
                  placeholder="Brief description of what this package does..."
                  value={description}
                  onChange={setDescription}
                />
              </div>

              {/* Dependencies */}
              <div>
                <label className="block text-pen-black text-base mb-2 font-medium">
                  Dependencies
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {dependencies.map((dep) => (
                    <LanguageTag 
                      key={dep} 
                      language={dep} 
                      removable 
                      onRemove={() => handleRemoveDependency(dep)} 
                    />
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {commonDependencies.filter(dep => !dependencies.includes(dep)).map((dep) => (
                    <button
                      key={dep}
                      type="button"
                      onClick={() => handleAddDependency(dep)}
                      className="px-2 py-1 text-xs border border-gray-300 rounded text-gray-600 hover:border-pen-black hover:text-pen-black transition-colors"
                    >
                      + {dep}
                    </button>
                  ))}
                </div>
              </div>

              {/* Files */}
              <div>
                <label className="block text-pen-black text-base mb-2 font-medium">
                  Files
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {files.map((file) => (
                    <LanguageTag 
                      key={file} 
                      language={file} 
                      removable 
                      onRemove={() => handleRemoveFile(file)} 
                    />
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {commonFileTypes.filter(file => !files.includes(file)).map((file) => (
                    <button
                      key={file}
                      type="button"
                      onClick={() => handleAddFile(file)}
                      className="px-2 py-1 text-xs border border-gray-300 rounded text-gray-600 hover:border-pen-black hover:text-pen-black transition-colors"
                    >
                      + {file}
                    </button>
                  ))}
                </div>
              </div>

              {/* Additional Details */}
              <div className="bg-gray-50 p-4 rounded border border-gray-200">
                <h4 className="font-medium text-pen-black mb-2">Package Summary</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Dependencies:</strong> {dependencies.length} packages</p>
                  <p><strong>Files:</strong> {files.length} files</p>
                  <p><strong>Author:</strong> {currentUser.name}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <OutlineButton 
                  variant="primary" 
                  size="medium"
                  onClick={() => {}}
                  type="submit"
                >
                  Create PAC
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

export default NewPAC;