import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import StickyNote from "../components/StickyNote";
import NotebookInput from "../components/NotebookInput";
import OutlineButton from "../components/OutlineButton";
import LanguageTag from "../components/LanguageTag";
import DashedLine from "../components/DashedLine";
import { useAuthContext } from "../contexts/AuthContext";
import { apiService } from "../services/api";
import { PAC } from "../types";

const EditPAC: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, accessToken } = useAuthContext();
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [dependencies, setDependencies] = useState<string[]>([]);
  const [files, setFiles] = useState<string[]>([]);
  const [customDependency, setCustomDependency] = useState("");
  const [customFile, setCustomFile] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const commonDependencies = [
    "react", "typescript", "@types/react", "express", "mongoose", 
    "axios", "lodash", "moment", "uuid", "dotenv", "cors", "helmet"
  ];

  const commonFileTypes = [
    "index.ts", "package.json", "README.md", "tsconfig.json", 
    "webpack.config.js", "babel.config.js", ".gitignore", "Dockerfile"
  ];

  // Fetch PAC data on component mount
  useEffect(() => {
    const fetchPAC = async () => {
      if (!id) {
        setError("No PAC ID provided");
        setIsLoading(false);
        return;
      }

      try {
        const pac = await apiService.getPacById(id);
        
        // Check if current user owns this PAC
        if (currentUser && pac.createdBy._id !== currentUser._id) {
          setError("You don't have permission to edit this PAC");
          setIsLoading(false);
          return;
        }

        // Populate form with PAC data
        setName(pac.name);
        setDescription(pac.description);
        setDependencies(pac.dependencies);
        setFiles(pac.files);
      } catch (error) {
        console.error('Error fetching PAC:', error);
        setError('Failed to load PAC');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPAC();
  }, [id, currentUser]);

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

  const handleAddCustomDependency = () => {
    if (customDependency.trim() && !dependencies.includes(customDependency.trim())) {
      setDependencies([...dependencies, customDependency.trim()]);
      setCustomDependency("");
    }
  };

  const handleAddCustomFile = () => {
    if (customFile.trim() && !files.includes(customFile.trim())) {
      setFiles([...files, customFile.trim()]);
      setCustomFile("");
    }
  };

  const handleCustomDependencyKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustomDependency();
    }
  };

  const handleCustomFileKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustomFile();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePAC();
  };

  const updatePAC = async () => {
    if (!currentUser || !accessToken || !id) {
      alert("Please log in to update this PAC");
      return;
    }

    if (!name.trim() || !description.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    setIsUpdating(true);

    try {
      const updatedPACData = {
        name: name.trim(),
        description: description.trim(),
        dependencies: dependencies,
        files: files,
      };

      console.log("Updating PAC:", updatedPACData);
      
      const updatedPAC = await apiService.updatePac(accessToken, id, updatedPACData);
      
      console.log("PAC updated successfully:", updatedPAC);
      alert("PAC updated successfully!");
      
      // Navigate back to the PAC view page
      navigate(`/view-pac/${id}`);
    } catch (error) {
      console.error("Error updating PAC:", error);
      alert("Failed to update PAC. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen p-4">
        <div className="container mx-auto max-w-4xl pt-20">
          <StickyNote variant="pink" className="text-center">
            <h1 className="text-2xl font-bold text-pen-black">
              Please log in to edit a PAC
            </h1>
          </StickyNote>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen p-4">
        <div className="container mx-auto max-w-4xl pt-20">
          <StickyNote variant="blue" className="text-center">
            <h1 className="text-2xl font-bold text-pen-black">
              Loading PAC...
            </h1>
          </StickyNote>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4">
        <div className="container mx-auto max-w-4xl pt-20">
          <StickyNote variant="pink" className="text-center">
            <h1 className="text-2xl font-bold text-pen-black mb-4">
              {error}
            </h1>
            <OutlineButton onClick={() => navigate('/')}>
              Go to Dashboard
            </OutlineButton>
          </StickyNote>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="container mx-auto max-w-4xl pt-20">
        <h1 className="text-3xl font-bold text-pen-black mb-6">Edit PAC</h1>
        
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
                <DashedLine text="Dependencies" className="mb-4" />
                
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
                
                {/* Custom dependency input */}
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="Add custom dependency..."
                    value={customDependency}
                    onChange={(e) => setCustomDependency(e.target.value)}
                    onKeyDown={handleCustomDependencyKeyDown}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-pen-black transition-colors"
                  />
                  <OutlineButton
                    size="small"
                    onClick={handleAddCustomDependency}
                    type="button"
                    disabled={!customDependency.trim()}
                  >
                    Add
                  </OutlineButton>
                </div>
                
                {/* Common dependencies */}
                <div className="mb-2">
                  <span className="text-sm text-gray-600 mb-2 block">Common dependencies:</span>
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
              </div>

              {/* Files */}
              <div>
                <DashedLine text="Files" className="mb-4" />
                
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
                
                {/* Custom file input */}
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="Add custom file (e.g., src/utils.ts, config/database.js)..."
                    value={customFile}
                    onChange={(e) => setCustomFile(e.target.value)}
                    onKeyDown={handleCustomFileKeyDown}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-pen-black transition-colors"
                  />
                  <OutlineButton
                    size="small"
                    onClick={handleAddCustomFile}
                    type="button"
                    disabled={!customFile.trim()}
                  >
                    Add
                  </OutlineButton>
                </div>
                
                {/* Common files */}
                <div className="mb-2">
                  <span className="text-sm text-gray-600 mb-2 block">Common files:</span>
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
              </div>

              {/* Additional Details */}
              <div className="bg-white p-4 rounded border border-pen-black notebook-lines">
                <h4 className="font-medium text-pen-black mb-2">Package Summary</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Dependencies:</strong> {dependencies.length} packages</p>
                  <p><strong>Files:</strong> {files.length} files</p>
                  <p><strong>Author:</strong> {currentUser.username || currentUser.name}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <OutlineButton 
                  variant="primary" 
                  size="medium"
                  onClick={() => {}}
                  type="submit"
                  disabled={isUpdating}
                >
                  {isUpdating ? "Updating..." : "Update PAC"}
                </OutlineButton>
                <OutlineButton 
                  variant="secondary" 
                  size="medium"
                  onClick={() => navigate(`/view-pac/${id}`)}
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

export default EditPAC;