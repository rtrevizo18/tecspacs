import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import StickyNote from './StickyNote';
import LanguageTag from './LanguageTag';
import { Snippet } from '../types';

interface SnippetCardProps {
  snippet: Snippet;
}

const SnippetCard: React.FC<SnippetCardProps> = ({ snippet }) => {
  const truncateTitle = (title: string, maxLength: number = 30) => {
    return title.length > maxLength ? title.substring(0, maxLength) + '...' : title;
  };

  const truncateCode = (code: string, maxLines: number = 3) => {
    const lines = code.split('\n');
    if (lines.length > maxLines) {
      return lines.slice(0, maxLines).join('\n') + '\n...';
    }
    return code;
  };

  const getRandomVariant = () => {
    const variants = ['default', 'pink', 'blue', 'green'] as const;
    return variants[Math.floor(Math.random() * variants.length)];
  };

  return (
    <Link to={`/view/${snippet.id}`}>
      <StickyNote variant={getRandomVariant()} className="h-64 transition-transform hover:scale-105 cursor-pointer">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-bold text-text-primary text-lg">
              {truncateTitle(snippet.title)}
            </h3>
            <button className="text-text-accent hover:text-red-500 text-lg">
              ♡
            </button>
          </div>

          {/* Language Tag */}
          <div className="mb-3">
            <LanguageTag language={snippet.language} />
          </div>

          {/* Code Preview */}
          <div className="flex-1 bg-white border border-pen-black rounded p-2 mb-3 overflow-hidden">
            <pre className="text-xs font-code text-text-primary whitespace-pre-wrap">
              {truncateCode(snippet.code)}
            </pre>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center text-sm text-text-accent">
            <span>by {snippet.authorName}</span>
            <span>{formatDistanceToNow(snippet.createdAt)} ago</span>
          </div>
        </div>
      </StickyNote>
    </Link>
  );
};

export default SnippetCard;