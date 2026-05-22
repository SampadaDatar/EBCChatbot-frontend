const STORAGE_KEY = 'ai_chat_conversations';

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeAll(conversations) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch {
    // localStorage full or unavailable (private browsing)
  }
}

export function getConversations() {
  return readAll()
    .map(({ id, title, createdAt, updatedAt }) => ({ id, title, createdAt, updatedAt }))
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

export function getConversation(id) {
  return readAll().find((c) => c.id === id) || null;
}

export function saveConversation(conversation) {
  const all = readAll();
  const idx = all.findIndex((c) => c.id === conversation.id);
  if (idx >= 0) {
    all[idx] = conversation;
  } else {
    all.push(conversation);
  }
  writeAll(all);
}

export function deleteConversation(id) {
  writeAll(readAll().filter((c) => c.id !== id));
}

export function generateTitle(messages) {
  const first = messages.find((m) => m.role === 'user');
  if (!first) return 'New chat';
  const text = first.content.trim().replace(/\s+/g, ' ');
  return text.length > 50 ? text.slice(0, 50) + '…' : text;
}

export function createConversation(messages) {
  return {
    id: crypto.randomUUID(),
    title: generateTitle(messages),
    messages,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
