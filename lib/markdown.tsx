import React from 'react';

export const renderMarkdown = (text: string) => {
  // Split by double newlines for paragraphs
  const parts = text.split(/\n\n+/);

  return parts.map((part, i) => {
    // Handle Headers (H1 - H3)
    if (part.startsWith('### ')) {
       return <h3 key={i} className="text-base font-semibold text-white mt-4 mb-2">{part.substring(4)}</h3>;
    }
    if (part.startsWith('## ')) {
       return <h2 key={i} className="text-lg font-semibold text-white mt-5 mb-3">{part.substring(3)}</h2>;
    }
    if (part.startsWith('# ')) {
       return <h1 key={i} className="text-xl font-semibold text-white mt-6 mb-4">{part.substring(2)}</h1>;
    }

    // Handle Bulleted Lists
    if (part.match(/^[•*-] /m)) {
        const items = part.split('\n');
        return (
            <ul key={i} className="list-disc list-outside ml-5 my-3 space-y-1 text-white/90">
                {items.map((item, idx) => {
                    const content = item.replace(/^[•*-] /, '');
                    // Bold handling inside list items
                    const contentWithBold = content.split(/\*\*(.+?)\*\*/g).map((segment, j) =>
                        j % 2 === 1 ? <strong key={j} className="font-semibold text-white">{segment}</strong> : segment
                    );
                    return <li key={idx} className="pl-1">{contentWithBold}</li>;
                })}
            </ul>
        );
    }

    // Handle Numbered Lists
    if (part.match(/^\d\./)) {
        const items = part.split('\n');
        return (
            <div key={i} className="flex flex-col gap-2 my-3 pl-1">
                {items.map((item, idx) => {
                    const match = item.match(/^(\d+\.)\s+(.*)/);
                    if (!match) return null;
                    const [_, num, content] = match;
                    
                    const contentWithBold = content.split(/\*\*(.+?)\*\*/g).map((segment, j) =>
                        j % 2 === 1 ? <strong key={j} className="font-semibold text-white">{segment}</strong> : segment
                    );
                    return (
                        <div key={idx} className="flex gap-3 text-white/90">
                            <span className="font-mono text-white/40 text-sm mt-0.5 select-none">{num}</span>
                            <p className="leading-relaxed">{contentWithBold}</p>
                        </div>
                    );
                })}
            </div>
        );
    }

    // Handle bold **text**
    const withBold = part.split(/\*\*(.+?)\*\*/g).map((segment, j) =>
      j % 2 === 1 ? <strong key={j} className="font-semibold text-white">{segment}</strong> : segment
    );

    // Handle line breaks within a paragraph
    const withBreaks: React.ReactNode[] = [];
    withBold.forEach((segment, j) => {
      if (typeof segment === 'string') {
        const lines = segment.split('\n');
        lines.forEach((line, k) => {
          withBreaks.push(line);
          if (k < lines.length - 1) withBreaks.push(<br key={`br-${j}-${k}`} />);
        });
      } else {
        withBreaks.push(segment);
      }
    });

    return <p key={i} className={`text-[15px] lg:text-[16px] leading-7 text-white/90 ${i > 0 ? 'mt-3' : ''}`}>{withBreaks}</p>;
  });
};
