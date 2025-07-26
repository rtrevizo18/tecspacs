import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import StickyNote from "../components/StickyNote";
import LanguageTag from "../components/LanguageTag";
import OutlineButton from "../components/OutlineButton";
import { getPACById, getCurrentUser, getUserById } from "../data/mockData";
import DashedLine from "../components/DashedLine";

const ViewPAC: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const pac = id ? getPACById(id) : null;
  const currentUser = getCurrentUser();
  const navigate = useNavigate();
  
  // Look up the author user data
  const author = pac ? getUserById(pac.author) : null;

  if (!pac) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <StickyNote variant="pink">
          <h2 className="text-xl font-bold text-text-primary mb-2">
            PAC Not Found
          </h2>
          <p className="text-text-accent">
            The PAC you're looking for doesn't exist or has been removed.
          </p>
        </StickyNote>
      </div>
    );
  }

  const isOwner = currentUser && (currentUser.id === pac.author || currentUser.auth0Id === pac.author);

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* User Info Row - Outside sticky note */}
        <div className="flex items-center justify-between text-sm text-text-accent mb-2">
          <div className="flex items-center gap-2">
            <Link to={`/user/${pac.author}`}>
              <div className="w-6 h-6 bg-sticky-default border border-pen-black rounded-full flex items-center justify-center font-bold hover:opacity-80 transition-opacity">
                {author?.name.charAt(0).toUpperCase() || 'U'}
              </div>
            </Link>
            <Link
              to={`/user/${pac.author}`}
              className="font-bold hover:underline"
            >
              {author?.name || 'Unknown'}
            </Link>
            <span>{formatDistanceToNow(new Date(pac.createdAt))} ago</span>
            {/* PAC Type label */}
            <span className="px-3 py-1 text-xs font-bold border-2 border-pen-black rounded-full shadow-sm bg-green-500 text-white">
              PAC
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {isOwner && (
              <>
                <OutlineButton size="small" onClick={() => navigate(`/edit-pac/${pac._id}`)}>
                  Edit
                </OutlineButton>
                <OutlineButton size="small" variant="danger" onClick={() => {}}>
                  Delete
                </OutlineButton>
              </>
            )}
          </div>
        </div>

        {/* Dependencies Tags - Outside sticky note */}
        <div className="flex flex-wrap gap-2 mb-3">
          {pac.dependencies.map((dep) => (
            <LanguageTag key={dep} language={dep.trim()} />
          ))}
        </div>

        {/* Main Content - Inside sticky note */}
        <StickyNote variant="blue" className="mb-6">
          <h1 className="text-2xl font-bold text-text-primary mb-4">
            {pac.name}
          </h1>

          {/* Description */}
          <DashedLine text={pac.description} />

          {/* Package Details */}
          <div className="mb-4 bg-white border border-pen-black rounded p-4 notebook-lines">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Dependencies */}
              <div>
                <h3 className="font-bold text-text-primary mb-2">Dependencies ({pac.dependencies.length})</h3>
                <div className="space-y-1 text-sm">
                  {pac.dependencies.length > 0 ? (
                    pac.dependencies.map((dep, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-pen-black rounded-full"></span>
                        <code className="bg-gray-100 px-1 rounded text-xs">{dep}</code>
                      </div>
                    ))
                  ) : (
                    <span className="text-text-accent">No dependencies</span>
                  )}
                </div>
              </div>

              {/* Files */}
              <div>
                <h3 className="font-bold text-text-primary mb-2">Files ({pac.files.length})</h3>
                <div className="space-y-1 text-sm">
                  {pac.files.length > 0 ? (
                    pac.files.map((file, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-pen-black rounded-full"></span>
                        <code className="bg-gray-100 px-1 rounded text-xs">{file}</code>
                      </div>
                    ))
                  ) : (
                    <span className="text-text-accent">No files specified</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex justify-between items-center text-sm text-text-accent border-t border-pen-black pt-4">
            <div className="flex gap-4">
              <span>👁️ 12 views</span>
              <span>📦 {pac.dependencies.length} dependencies</span>
              <span>📁 {pac.files.length} files</span>
            </div>
            <div>Last updated {formatDistanceToNow(new Date(pac.updatedAt))} ago</div>
          </div>
        </StickyNote>

        {/* Related PACs */}
        <StickyNote variant="green" size="small">
          <h3 className="font-bold text-text-primary mb-3">
            More PACs from {author?.name || 'Unknown'}
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-primary">
                CSS Utilities Package
              </span>
              <span className="text-text-accent">1 week ago</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-primary">
                Python Data Tools
              </span>
              <span className="text-text-accent">2 weeks ago</span>
            </div>
          </div>
        </StickyNote>
      </div>
    </div>
  );
};

export default ViewPAC;