import React, { useState } from "react";
import StickyNote from "./StickyNote";
import OutlineButton from "./OutlineButton";
import CodeBox from "./CodeBox";

interface AIPanelProps {
  type: "TEC" | "PAC";
  itemId: string;
  onSummarize?: (id: string) => void;
  onImprove?: (id: string) => void;
}

const AIPanel: React.FC<AIPanelProps> = ({
  type,
  itemId,
  onSummarize,
  onImprove,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<
    "main" | "summary" | "improvement"
  >("main");
  const [results, setResults] = useState<{
    summary?: string;
    improvement?: string;
  }>({});

  const handleSummarize = async () => {
    setIsLoading("summary");
    setCurrentView("summary");
    // Simulate API call
    setTimeout(() => {
      const mockSummary = `This ${type.toLowerCase()} demonstrates a clean implementation of ${
        type === "TEC" ? "code logic" : "package structure"
      }. It shows best practices for ${
        type === "TEC" ? "writing maintainable code" : "organizing dependencies"
      } and can be useful for developers working on similar projects.`;

      setResults((prev) => ({ ...prev, summary: mockSummary }));
      setIsLoading(null);
      onSummarize?.(itemId);
    }, 2000);
  };

  const handleImprove = async () => {
    setIsLoading("improvement");
    setCurrentView("improvement");
    // Simulate API call
    setTimeout(() => {
      const mockImprovement = `AI Suggestions for improvement:

1. Add error handling for edge cases
2. Consider using TypeScript for better type safety
3. Implement proper validation for inputs
4. Add unit tests for critical functions
5. Consider performance optimizations like memoization
6. Add comprehensive documentation`;

      setResults((prev) => ({ ...prev, improvement: mockImprovement }));
      setIsLoading(null);
      onImprove?.(itemId);
    }, 2000);
  };

  const handleBack = () => {
    setCurrentView("main");
  };

  const handleUpdate = async () => {
    setIsLoading("update");
    try {
      // Mock POST request to update the TEC code
      const response = await fetch(`/api/tecs/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`, // Assuming token is stored in localStorage
        },
        body: JSON.stringify({
          content: results.improvement,
        }),
      });

      if (response.ok) {
        console.log("TEC updated successfully");
        // Optionally show success message or redirect
        setCurrentView("main");
      } else {
        console.error("Failed to update TEC");
      }
    } catch (error) {
      console.error("Error updating TEC:", error);
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <>
      {/* Floating AI Assistant Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
          transition-transform duration-300
          ${!isExpanded && "hover:scale-110"}
        `}
        style={{
          position: "fixed",
          bottom: "-100px",
          right: "-50px",
          zIndex: 9999,
        }}
        title="AI Assistant"
      >
        <img
          src={isExpanded ? "/close.png" : "/open.png"}
          alt={isExpanded ? "Close AI Assistant" : "Open AI Assistant"}
          className="w-[200px] h-[200px] object-contain drop-shadow-lg hover:drop-shadow-xl"
        />
      </button>

      {/* AI Assistant Panel */}
      {isExpanded && (
        <div
          className="fixed z-40 w-80"
          style={{
            bottom: "100px",
            right: "50px",
          }}
        >
          <StickyNote
            variant="green"
            className="relative overflow-hidden border-2 border-dashed border-purple-300"
          >
            {/* Main View */}
            {currentView === "main" && (
              <>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-text-primary">
                        ✨ AI Assistant
                      </h3>
                      <p className="text-xs text-text-accent">
                        Powered by Gemini AI
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="p-1 hover:bg-black/10 rounded transition-colors"
                    title="Close AI Assistant"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Features */}
                <div className="space-y-3">
                  {/* Summarize Feature */}
                  <div className="border border-pen-black  p-3 bg-white/50">
                    <div className="flex items-center gap-2 mb-2">
                      <svg
                        className="w-4 h-4 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <span className="font-medium text-sm">Smart Summary</span>
                    </div>
                    <p className="text-xs text-text-accent mb-3">
                      Generate an intelligent summary of this{" "}
                      {type.toLowerCase()}'s content and purpose.
                    </p>
                    <OutlineButton
                      size="small"
                      onClick={handleSummarize}
                      disabled={isLoading === "summary"}
                      className="w-full"
                    >
                      {isLoading === "summary" ? (
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 border border-t-2 border-purple-600 rounded-full animate-spin"></div>
                          Analyzing...
                        </div>
                      ) : (
                        "✨ Summarize"
                      )}
                    </OutlineButton>
                  </div>

                  {/* Improve Feature - Only for TECs */}
                  {type === "TEC" && (
                    <div className="border border-pen-black rounded-lg p-3 bg-white/50">
                      <div className="flex items-center gap-2 mb-2">
                        <svg
                          className="w-4 h-4 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span className="font-medium text-sm">
                          Code Enhancement
                        </span>
                      </div>
                      <p className="text-xs text-text-accent mb-3">
                        Get AI suggestions to improve code quality, performance,
                        and best practices.
                      </p>
                      <OutlineButton
                        size="small"
                        onClick={handleImprove}
                        disabled={isLoading === "improvement"}
                        className="w-full"
                      >
                        {isLoading === "improvement" ? (
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 border border-t-2 border-blue-600 rounded-full animate-spin"></div>
                            Enhancing...
                          </div>
                        ) : (
                          "🚀 Improve Code"
                        )}
                      </OutlineButton>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Summary Result View */}
            {currentView === "summary" && (
              <>
                {/* Header with Back Button */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleBack}
                      className="p-1 hover:bg-black/10 rounded transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-text-primary">AI Summary</h3>
                      <p className="text-xs text-text-accent">
                        Powered by Gemini AI
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="p-1 hover:bg-black/10 rounded transition-colors"
                    title="Close AI Assistant"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Content */}
                {isLoading === "summary" ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border border-t-2 border-purple-600 rounded-full animate-spin"></div>
                      <span>Analyzing...</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="bg-white/70 border border-pen-black  p-4 notebook-lines mb-3">
                      <p className="text-sm text-text-primary leading-relaxed">
                        {results.summary}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <OutlineButton
                        size="small"
                        onClick={() =>
                          navigator.clipboard.writeText(results.summary || "")
                        }
                      >
                        📋 Copy
                      </OutlineButton>
                    </div>
                  </>
                )}
              </>
            )}

            {/* Improvement Result View */}
            {currentView === "improvement" && (
              <>
                {/* Header with Back Button */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleBack}
                      className="p-1 hover:bg-black/10 rounded transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.5 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-text-primary">
                        AI Code Improvements
                      </h3>
                      <p className="text-xs text-text-accent">
                        Powered by Gemini AI
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="p-1 hover:bg-black/10 rounded transition-colors"
                    title="Close AI Assistant"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Content */}
                {isLoading === "improvement" ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border border-t-2 border-blue-600 rounded-full animate-spin"></div>
                      <span>Enhancing...</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <CodeBox code={results.improvement || ""} language="text" />
                    <div className="flex gap-2 mt-3">
                      <OutlineButton
                        size="small"
                        onClick={() =>
                          navigator.clipboard.writeText(
                            results.improvement || ""
                          )
                        }
                      >
                        📋 Copy
                      </OutlineButton>
                      <OutlineButton
                        size="small"
                        onClick={handleUpdate}
                        disabled={isLoading === "update"}
                        variant="primary"
                      >
                        {isLoading === "update" ? (
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 border border-t-2 border-blue-600 rounded-full animate-spin"></div>
                            Updating...
                          </div>
                        ) : (
                          "🔄 Update"
                        )}
                      </OutlineButton>
                    </div>
                  </>
                )}
              </>
            )}

            {/* Decorative Elements */}
            <div className="absolute top-2 right-2 w-2 h-2 bg-purple-400 rounded-full opacity-30"></div>
            <div className="absolute bottom-2 left-2 w-1 h-1 bg-blue-400 rounded-full opacity-40"></div>
          </StickyNote>
        </div>
      )}
    </>
  );
};

export default AIPanel;
