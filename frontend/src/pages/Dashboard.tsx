import React, { useState } from "react";
import { mockTECs, mockPACs, getUserById } from "../data/mockData";
import ItemCard from "../components/ItemCard";
import Sidebar from "../components/Sidebar";

const Dashboard: React.FC = () => {
  const [filter, setFilter] = useState<"all" | "tecs" | "pacs">("all");

  // Get all items and filter them
  const allTECs = mockTECs.filter((tec) => tec.isPublic !== false);
  const allPACs = mockPACs;

  const getFilteredItems = () => {
    const tecItems = allTECs.map((tec) => ({
      ...tec,
      itemType: "TEC" as const,
    }));
    const pacItems = allPACs.map((pac) => ({
      ...pac,
      itemType: "PAC" as const,
    }));

    const allItems = [...tecItems, ...pacItems];

    switch (filter) {
      case "tecs":
        return allItems.filter((item) => item.itemType === "TEC");
      case "pacs":
        return allItems.filter((item) => item.itemType === "PAC");
      default:
        return allItems;
    }
  };

  const filteredItems = getFilteredItems();

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
                  TecSpacs Feed
                </h1>
                <p className="text-text-accent">
                  Discover and share TECs and PACs with the community
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
                  All ({allTECs.length + allPACs.length})
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
                  TECs ({allTECs.length})
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
                  PACs ({allPACs.length})
                </button>
              </div>
            </div>
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-6">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => {
                const user = getUserById(item.author) || {
                  name: "Unknown",
                  auth0Id: item.author,
                };
                return (
                  <ItemCard
                    key={`${item.itemType.toLowerCase()}-${item._id}`}
                    item={item}
                    type={item.itemType}
                    authorName={user?.name || "Unknown"}
                    authorInitial={user?.name?.charAt(0).toUpperCase() || "?"}
                  />
                );
              })
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
