import React, { useState, useEffect, useMemo } from "react";
import ItemCard from "../components/ItemCard";
import Sidebar from "../components/Sidebar";
import LoadingCard from "../components/LoadingCard";
import { apiService } from "../services/api";
import { TEC, PAC } from "../types";
import { useSearchContext } from "../contexts/SearchContext";

const Dashboard: React.FC = () => {
  const [filter, setFilter] = useState<"all" | "tecs" | "pacs">("all");
  const [allTECs, setAllTECs] = useState<TEC[]>([]);
  const [allPACs, setAllPACs] = useState<PAC[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { searchQuery, clearSearch } = useSearchContext();

  // Fetch all TECs and PACs from API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const [tecsResponse, pacsResponse] = await Promise.all([
          apiService.getAllTecs(),
          apiService.getAllPacs()
        ]);
        
        // Filter out private TECs (only show public ones)
        const publicTECs = tecsResponse.filter((tec) => tec.isPublic !== false);
        setAllTECs(publicTECs);
        setAllPACs(pacsResponse);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data');
        // Keep empty arrays on error
        setAllTECs([]);
        setAllPACs([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredItems = useMemo(() => {
    const tecItems = allTECs.map((tec) => ({
      ...tec,
      itemType: "TEC" as const,
    }));
    const pacItems = allPACs.map((pac) => ({
      ...pac,
      itemType: "PAC" as const,
    }));

    let allItems = [...tecItems, ...pacItems];

    // Apply type filter
    switch (filter) {
      case "tecs":
        allItems = allItems.filter((item) => item.itemType === "TEC");
        break;
      case "pacs":
        allItems = allItems.filter((item) => item.itemType === "PAC");
        break;
      default:
        // Keep all items
        break;
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      allItems = allItems.filter((item) => {
        // Search in title
        const title = item.itemType === "TEC" ? item.title : item.name;
        if (title?.toLowerCase().includes(query)) return true;

        // Search in description
        if (item.description?.toLowerCase().includes(query)) return true;

        // Search in language (for TECs)
        if (item.itemType === "TEC" && item.language?.toLowerCase().includes(query)) return true;

        // Search in tags (for TECs)
        if (item.itemType === "TEC" && item.tags?.some(tag => 
          tag.toLowerCase().includes(query)
        )) return true;

        // Search in dependencies (for PACs)
        if (item.itemType === "PAC" && item.dependencies?.some(dep => 
          dep.toLowerCase().includes(query)
        )) return true;

        // Search in content (for TECs)
        if (item.itemType === "TEC" && item.content?.toLowerCase().includes(query)) return true;

        return false;
      });
    }

    return allItems;
  }, [allTECs, allPACs, filter, searchQuery]);

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

            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-text-primary mb-2">
                  {searchQuery.trim() ? 'Search Results' : 'Feed'}
                </h1>
                <p className="text-text-accent">
                  {searchQuery.trim() 
                    ? `Results matching "${searchQuery}"`
                    : 'Discover and share TECs and PACs with the community'
                  }
                </p>
              </div>

              {/* Filter Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter("all")}
                  className={`px-4 py-2 text-sm font-bold border-2 border-pen-black rounded-sm transition-colors ${
                    filter === "all"
                      ? "bg-pen-black text-white"
                      : "bg-white text-pen-black hover:bg-gray-50"
                  }`}
                >
                  All ({isLoading ? "..." : allTECs.length + allPACs.length})
                </button>
                <button
                  onClick={() => setFilter("tecs")}
                  className={`px-4 py-2 text-sm font-bold border-2 border-pen-black rounded transition-colors flex items-center gap-2 ${
                    filter === "tecs"
                      ? "bg-sticky-blue text-pen-black"
                      : "bg-white text-pen-black hover:bg-sticky-blue hover:bg-opacity-50"
                  }`}
                >
                  <img src="/tec.png" alt="TEC" className="w-4 h-4" />
                  TECs ({isLoading ? "..." : allTECs.length})
                </button>
                <button
                  onClick={() => setFilter("pacs")}
                  className={`px-4 py-2 text-sm font-bold border-2 border-pen-black rounded transition-colors flex items-center gap-2 ${
                    filter === "pacs"
                      ? "bg-sticky-green text-pen-black"
                      : "bg-white text-pen-black hover:bg-sticky-green hover:bg-opacity-50"
                  }`}
                >
                  <img src="/pac.png" alt="PAC" className="w-4 h-4" />
                  PACs ({isLoading ? "..." : allPACs.length})
                </button>
              </div>
            </div>
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-6">
            {isLoading ? (
              <div className="col-span-full flex justify-center py-8">
                <LoadingCard 
                  message="Loading feed..." 
                  variant="blue"
                  size="medium"
                />
              </div>
            ) : error ? (
              <div className="col-span-full text-center py-8">
                <p className="text-text-accent text-lg">{error}</p>
              </div>
            ) : filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <ItemCard
                  key={`${item.itemType.toLowerCase()}-${item._id}`}
                  item={item}
                  type={item.itemType}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-text-accent text-lg">
                  No {filter === "all" ? "items" : filter.toUpperCase()} found.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
