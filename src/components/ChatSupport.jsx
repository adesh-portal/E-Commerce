import React, { useEffect, useRef, useState } from 'react';
import { MessageSquare, Send, X, Loader2, Bot, User } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

const ChatSupport = ({ isOpen, onClose, onProductSelect }) => {
  const [messages, setMessages] = useState([
    { id: 'init', role: 'bot', text: 'Hi! I can help answer questions and suggest products. Try “wireless headphones under $100”.' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setMessages((prev) => [...prev, { id: Date.now().toString(), role: 'user', text }]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { id: `${Date.now()}-bot`, role: 'bot', text: data.reply, suggestions: data.suggestions || [] },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { id: `${Date.now()}-err`, role: 'bot', text: 'Sorry, something went wrong. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl flex flex-col border-l border-[#f3ede7]">
        <div className="flex items-center justify-between p-4 border-b border-[#f3ede7] bg-[#f8f5f1]">
          <div className="flex items-center gap-2">
            <MessageSquare className="text-[#e88330]" />
            <h2 className="font-semibold text-[#1b140e]">AI Chat Support</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#f3ede7] rounded">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
          {messages.map((m) => (
            <div key={m.id} className={`flex items-start gap-3 ${m.role === 'user' ? 'justify-end' : ''}`}>
              {m.role === 'bot' && (
                <div className="w-8 h-8 rounded-full bg-[#e88330] text-white flex items-center justify-center">
                  <Bot size={16} />
                </div>
              )}
              <div className={`${m.role === 'user' ? 'bg-[#e88330] text-white' : 'bg-[#f8f5f1] text-[#1b140e] border border-[#f3ede7]'} px-3 py-2 rounded-lg max-w-[75%]`}>
                <div className="text-sm whitespace-pre-wrap">{m.text}</div>
                {m.suggestions && m.suggestions.length > 0 && (
                  <div className="mt-3 grid grid-cols-1 gap-3">
                    {m.suggestions.map((p) => (
                      <div key={p._id} className="flex gap-3 p-2 bg-white border border-[#f3ede7] rounded-lg hover:shadow cursor-pointer" onClick={() => onProductSelect?.(p)}>
                        <img src={p.images?.[0] || p.image || 'https://via.placeholder.com/64'} alt={p.name} className="w-16 h-16 object-cover rounded" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-[#1b140e] truncate">{p.name}</div>
                          <div className="text-xs text-[#976f4e] truncate">{p.brand || p.category}</div>
                          <div className="text-sm font-semibold text-[#e88330]">${p.price}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {m.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-[#1b140e] text-white flex items-center justify-center">
                  <User size={16} />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Loader2 className="animate-spin" size={16} /> Thinking…
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="p-3 border-t border-[#f3ede7] bg-[#f8f5f1] flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Ask a question or describe what you want..."
            className="flex-1 border border-[#f3ede7] rounded-lg px-3 h-10 focus:outline-none focus:ring-2 focus:ring-[#e88330]"
          />
          <button onClick={send} className="h-10 px-4 rounded-lg bg-[#e88330] text-white flex items-center gap-2 hover:bg-[#d67429]">
            <Send size={16} />
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatSupport;


