'use client';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useT } from '@/components/locale-provider';
import { Sparkles, X, Loader2, MessageCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface Message {
  role: 'user' | 'ai';
  text: string;
}

export function QueryPanel() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const t = useT();

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo(0, listRef.current.scrollHeight);
  }, [messages]);

  const send = async () => {
    const q = input.trim();
    if (!q || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: q }]);
    setLoading(true);

    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();
      const answer = data?.data?.answer || data?.error || t.query.error;
      setMessages(prev => [...prev, { role: 'ai', text: answer }]);
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: t.query.networkError }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-violet-600 text-white shadow-lg hover:bg-violet-700 transition-colors flex items-center justify-center z-50"
        >
          <MessageCircle size={20} />
        </button>
      )}

      {open && (
        <Card className="fixed bottom-6 right-6 w-96 h-[500px] shadow-2xl flex flex-col z-50 border-violet-200">
          <div className="flex items-center justify-between p-4 border-b shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-violet-600" />
              <span className="font-semibold text-sm">{t.query.askAI}</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-zinc-400 hover:text-zinc-600">
              <X size={16} />
            </button>
          </div>

          <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-zinc-400 text-sm py-8">
                <p className="mb-2">{t.query.tryAsking}</p>
                <div className="space-y-1">
                  {t.query.suggestions.map((q) => (
                    <button
                      key={q}
                      onClick={() => { setInput(q); inputRef.current?.focus(); }}
                      className="block w-full text-left px-3 py-1.5 rounded-md hover:bg-zinc-100 text-zinc-600 transition-colors"
                    >
                      "{q}"
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`text-sm leading-relaxed ${m.role === 'user' ? 'text-right' : ''}`}>
                <span className={`inline-block max-w-[85%] rounded-xl px-3 py-2 ${
                  m.role === 'user'
                    ? 'bg-violet-600 text-white'
                    : 'bg-zinc-100 text-zinc-800'
                }`}>
                  {m.text}
                </span>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-zinc-400 text-sm">
                <Loader2 size={14} className="animate-spin" />
                {t.query.thinking}
              </div>
            )}
          </div>

          <div className="p-4 border-t shrink-0 flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder={t.query.placeholder}
              className="flex-1"
            />
            <Button onClick={send} disabled={loading || !input.trim()} size="sm">
              {t.query.send}
            </Button>
          </div>
        </Card>
      )}
    </>
  );
}
