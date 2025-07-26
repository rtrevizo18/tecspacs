import React from "react";
import { mockSnippets } from "../data/mockData";
import SnippetCard from "../components/SnippetCard";
import Sidebar from "../components/Sidebar";

const Dashboard: React.FC = () => {
  return (
    <div className="pt-20 min-h-screen flex">
      {/* Sidebar */}
      <div className="fixed left-0 top-20 h-[calc(100vh-5rem)] overflow-y-auto">
        <Sidebar />
      </div>

      {/* Main Contents with left margin for sidebar */}
      <div className="flex-1 ml-80">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-text-primary mb-2">
              Featured Snippets
            </h1>
            <p className="text-text-accent">
              Discover and share code snippets with the community
            </p>
          </div>

          {/* Snippet Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mockSnippets
              .filter((snippet) => snippet.isPublic)
              .map((snippet) => (
                <SnippetCard key={snippet.id} snippet={snippet} />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
