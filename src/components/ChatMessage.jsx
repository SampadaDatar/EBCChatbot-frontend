import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function CitationList({ citations }) {
  if (!citations?.length) return null;

  const handleCitationClick = (e, url) => {
    e.preventDefault();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="citations">
      <div className="citations-label">Sources:</div>
      <ul className="citations-list">
        {citations.map((c, i) => (
          <li key={i}>
            {c.type === 'url' ? (
              <a 
                href={c.url} 
                onClick={(e) => handleCitationClick(e, c.url)}
              >
                {c.title}
              </a>
            ) : (
              <span className="citation-file">{c.filename}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ChatMessage({ role, content, citations, isLoading = false }) {
  const isUser = role === 'user';

  return (
    <div className={`chat-message ${isUser ? 'user' : 'assistant'}`}>
      <div className="message-bubble">
        {isUser ? (
          content
        ) : isLoading ? (
          <div className="typing-indicator" aria-label="Assistant is typing">
            <span />
            <span />
            <span />
          </div>
        ) : (
          <>
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({node, ...props}) => (
                  <a {...props} target="_blank" rel="noopener noreferrer" />
                )
              }}
            >
              {content}
            </ReactMarkdown>
            <CitationList citations={citations} />
          </>
        )}
      </div>
    </div>
  );
}
