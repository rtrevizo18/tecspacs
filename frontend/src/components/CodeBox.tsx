import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeBoxProps {
  code: string;
  language: string;
  editable?: boolean;
}

const CodeBox: React.FC<CodeBoxProps> = ({ code, language, editable = false }) => {
  if (editable) {
    return (
      <div className="border border-pen-black rounded-none bg-white font-code notebook-grid">
        <textarea
          value={code}
          readOnly={!editable}
          className="w-full p-4 font-code text-sm resize-none border-none outline-none bg-transparent"
          rows={Math.max(4, code.split('\n').length)}
        />
      </div>
    );
  }

  return (
    <div className="border border-pen-black rounded-none bg-white overflow-hidden notebook-grid">
      <SyntaxHighlighter
        language={language.toLowerCase()}
        style={oneLight}
        customStyle={{
          margin: 0,
          padding: '1rem',
          background: 'transparent',
          fontFamily: "'Fira Code', 'Monaco', monospace",
          fontSize: '0.875rem'
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeBox;