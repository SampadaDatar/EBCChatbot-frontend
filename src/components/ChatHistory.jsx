import { formatRelativeTime } from '../utils/timeFormat';

export default function ChatHistory({
  conversations,
  activeId,
  onSelect,
  onNewChat,
  onDelete,
}) {
  return (
    <div className="chat-history">
      <div className="chat-history-header">
        <span className="chat-history-title">Chat History</span>
        <button
          className="new-chat-btn"
          onClick={onNewChat}
          title="New chat"
        >
          + New Chat
        </button>
      </div>

      <div className="chat-history-list">
        {conversations.length === 0 && (
          <div className="chat-history-empty">No previous chats</div>
        )}
        {conversations.map((conv) => (
          <div
            key={conv.id}
            className={`chat-history-item${conv.id === activeId ? ' active' : ''}`}
            onClick={() => onSelect(conv.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(conv.id);
              }
            }}
          >
            <div className="chat-history-item-content">
              <div className="chat-history-item-title">{conv.title}</div>
              <div className="chat-history-item-time">
                {formatRelativeTime(conv.updatedAt)}
              </div>
            </div>
            <button
              className="chat-history-delete"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(conv.id);
              }}
              title="Delete conversation"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
