import { useCallback, useEffect, useRef, useState } from 'react';
import { streamChat } from '../api/chat';
import {
    createConversation,
    deleteConversation,
    getConversation,
    getConversations,
    saveConversation,
} from '../utils/conversationStorage';
import ChatHistory from './ChatHistory';
import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';

export default function ChatWindow() {
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [conversations, setConversations] = useState(() => getConversations());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const abortRef = useRef(null);
  const bottomRef = useRef(null);
  const convIdRef = useRef(null);

  // Keep ref in sync so streaming callbacks see latest value
  useEffect(() => {
    convIdRef.current = conversationId;
  }, [conversationId]);

  const refreshList = useCallback(() => {
    setConversations(getConversations());
  }, []);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const persistConversation = useCallback(
    (msgs, id) => {
      if (!id) {
        const conv = createConversation(msgs);
        saveConversation(conv);
        setConversationId(conv.id);
        convIdRef.current = conv.id;
        refreshList();
        return conv.id;
      }
      const existing = getConversation(id);
      if (existing) {
        existing.messages = msgs;
        existing.updatedAt = new Date().toISOString();
        saveConversation(existing);
        refreshList();
      }
      return id;
    },
    [refreshList],
  );

  const handleSend = useCallback(
    (text) => {
      const userMsg = { role: 'user', content: text };
      const assistantMsg = { role: 'assistant', content: '' };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      const allMessages = [...messages, userMsg];

      streamChat(allMessages, {
        signal: controller.signal,
        onToken: (token) => {
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            updated[updated.length - 1] = {
              ...last,
              content: last.content + token,
            };
            return updated;
          });
          scrollToBottom();
        },
        onDone: () => {
          setIsStreaming(false);
          abortRef.current = null;
          scrollToBottom();
          // Persist after assistant finishes
          setMessages((prev) => {
            const id = convIdRef.current;
            persistConversation(prev, id);
            return prev;
          });
        },
        onError: (err) => {
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: 'assistant',
              content: `⚠️ Error: ${err.message}`,
            };
            return updated;
          });
          setIsStreaming(false);
          abortRef.current = null;
        },
      });
    },
    [messages, scrollToBottom, persistConversation],
  );

  const handleSelectConversation = useCallback(
    (id) => {
      if (isStreaming) return;
      const conv = getConversation(id);
      if (conv) {
        setMessages(conv.messages);
        setConversationId(id);
      }
      setSidebarOpen(false);
    },
    [isStreaming],
  );

  const handleNewChat = useCallback(() => {
    if (isStreaming) return;
    setMessages([]);
    setConversationId(null);
    setSidebarOpen(false);
  }, [isStreaming]);

  const handleDeleteConversation = useCallback(
    (id) => {
      deleteConversation(id);
      if (conversationId === id) {
        setMessages([]);
        setConversationId(null);
      }
      refreshList();
    },
    [conversationId, refreshList],
  );

  return (
    <div className="chat-layout">
      {/* Sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`chat-sidebar${sidebarOpen ? ' open' : ''}`}>
        <ChatHistory
          conversations={conversations}
          activeId={conversationId}
          onSelect={handleSelectConversation}
          onNewChat={handleNewChat}
          onDelete={handleDeleteConversation}
        />
      </aside>

      {/* Main chat area */}
      <div className="chat-window">
        <div className="chat-toolbar">
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen((o) => !o)}
            title="Toggle chat history"
          >
            ☰
          </button>
        </div>
        <div className="chat-messages">
          {messages.length === 0 && (
            <div className="chat-empty">Send a message to start chatting.</div>
          )}
          {messages.map((msg, i) => (
            <ChatMessage
              key={i}
              role={msg.role}
              content={msg.content}
              isLoading={
                isStreaming &&
                i === messages.length - 1 &&
                msg.role === 'assistant' &&
                !msg.content
              }
            />
          ))}
          <div ref={bottomRef} />
        </div>
        <ChatInput onSend={handleSend} disabled={isStreaming} />
      </div>
    </div>
  );
}
