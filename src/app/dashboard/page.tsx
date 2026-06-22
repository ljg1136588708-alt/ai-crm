'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useT } from '@/components/locale-provider';

const STYLES = [
  '写实摄影', '动漫', '水彩', '素描', '赛博朋克', '油画', '电影感',
  '仙侠', '日漫', '复古', '科幻', 'Q版', '贴纸', '游戏CG', '手办',
  '美漫', '废土科幻', '3D卡通', '吉卜力', '国漫2D', '国漫3D',
];

const STYLE_EMOJI: Record<string, string> = {
  '写实摄影': '📷', '动漫': '🎨', '水彩': '🖌️', '素描': '✏️', '赛博朋克': '🤖',
  '油画': '🖼️', '电影感': '🎬', '仙侠': '🧚', '日漫': '🌸', '复古': '📻',
  '科幻': '🚀', 'Q版': '🍬', '贴纸': '🏷️', '游戏CG': '🎮', '手办': '🗿',
  '美漫': '💥', '废土科幻': '🌵', '3D卡通': '🧸', '吉卜力': '🌿', '国漫2D': '📜', '国漫3D': '💎',
};

const RATIOS = ['智能', '1:1', '2:3', '3:2', '3:4', '4:3', '9:16', '16:9', '21:9'];

// Best aspect ratio for each style
const STYLE_RATIO: Record<string, string> = {
  '电影感': '21:9',
  '赛博朋克': '21:9',
  '废土科幻': '21:9',
  '写实摄影': '3:2',
  '游戏CG': '16:9',
  '仙侠': '9:16',
  '动漫': '2:3',
  '日漫': '2:3',
  '国漫2D': '2:3',
  '国漫3D': '9:16',
  '油画': '3:4',
  '水彩': '3:4',
  '素描': '3:4',
  '吉卜力': '16:9',
  '科幻': '21:9',
  'Q版': '1:1',
  '贴纸': '1:1',
  '手办': '2:3',
  '美漫': '3:2',
  '3D卡通': '16:9',
  '复古': '3:2',
};

type GenerationResult = {
  id?: number;
  image: string;       // base64 data URL or Supabase URL
  imageUrl?: string;   // Supabase public URL (persisted in history)
  prompt: string;
  timestamp: number;
};

export default function GeneratePage() {
  const t = useT().aifoto.dashboard;
  const [tab, setTab] = useState<'text' | 'image'>('text');
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('');
  const [aspectRatio, setAspectRatio] = useState('智能');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [history, setHistory] = useState<GenerationResult[]>([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);
  const PAGE_SIZE = 12;
  const [quota, setQuota] = useState<{ remaining: number; total: number; isPro: boolean } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Load quota on mount and after each generation
  const fetchQuota = () => {
    fetch('/api/image/quota').then(r => r.json()).then(d => {
      if (d.remaining !== undefined) setQuota(d);
    }).catch(() => {});
  };

  // Load history from Supabase (paginated)
  const fetchHistory = (page = 1) => {
    const offset = (page - 1) * PAGE_SIZE;
    fetch(`/api/image/history?limit=${PAGE_SIZE}&offset=${offset}`).then(r => r.json()).then(d => {
      if (d.items) {
        setHistory(d.items.map((item: any) => ({
          id: item.id,
          image: item.image_url || '',
          prompt: item.prompt || '',
          timestamp: new Date(item.created_at).getTime(),
        })));
        setHistoryTotal(d.total || 0);
        setHistoryPage(page);
      }
    }).catch(() => {});
  };

  const deleteHistoryItem = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const res = await fetch(`/api/image/history?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      // If this was the only item on the last page, go back
      const remaining = history.length - 1;
      if (remaining === 0 && historyPage > 1) {
        fetchHistory(historyPage - 1);
      } else {
        fetchHistory(historyPage);
      }
    }
  };

  const totalPages = Math.ceil(historyTotal / PAGE_SIZE);

  useEffect(() => {
    fetchQuota();
    fetchHistory();
  }, []);

  // After generating, refresh history from Supabase
  const refreshHistory = () => {
    fetchHistory(1);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setError(t.imageTooLarge);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setReferenceImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const generate = async () => {
    if (tab === 'text' && !prompt.trim()) return;
    if (tab === 'image' && !referenceImage) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/image/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: tab === 'text' ? prompt : prompt || undefined,
          referenceImage: tab === 'image' ? referenceImage : undefined,
          style,
          aspectRatio: aspectRatio === '智能' ? undefined : aspectRatio,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 402) {
          setQuota({ remaining: 0, total: data.quota ?? 5, isPro: false });
          throw new Error(t.quotaUsed);
        }
        throw new Error(data.error || t.genFailed);
      }

      const genResult: GenerationResult = {
        image: data.image,
        imageUrl: data.imageUrl,
        prompt: data.prompt,
        timestamp: Date.now(),
      };
      setResult(genResult);
      refreshHistory();
      // Refresh quota
      if (data.quota) setQuota(data.quota);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const download = async () => {
    if (!result) return;
    const src = result.image;
    // If it's a remote URL (e.g., Supabase), fetch it first
    if (src.startsWith('http')) {
      try {
        const resp = await fetch(src);
        const blob = await resp.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `generated-${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);
      } catch {
        // Fallback: just open in new tab
        window.open(src, '_blank');
      }
    } else {
      // Base64 data URL — direct download
      const a = document.createElement('a');
      a.href = src;
      a.download = `generated-${Date.now()}.png`;
      a.click();
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Quota badge */}
      {quota && (
        <div className="flex items-center justify-between mb-4">
          {quota.isPro ? (
            <span className="text-xs px-2 py-1 rounded-full bg-violet-100 text-violet-700 font-medium">
              {t.pro}
            </span>
          ) : (
            <div className="flex items-center gap-3">
              <span className={`text-xs px-2 py-1 rounded-full ${quota.remaining > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                {quota.remaining} / {quota.total} {t.free}
              </span>
              <Link href="/pricing" className="text-xs text-violet-600 font-medium hover:underline">{t.upgrade}</Link>
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-zinc-100 rounded-lg p-1">
        {(['text', 'image'] as const).map((m) => (
          <button
            key={m}
            onClick={() => { setTab(m); setResult(null); setError(''); }}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === m ? 'bg-white text-violet-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            {m === 'text' ? t.textToImage : t.imageToImage}
          </button>
        ))}
      </div>

      {/* Image upload */}
      {tab === 'image' && (
        <div className="mb-4">
          {referenceImage ? (
            <div className="relative flex justify-center">
              <div className="relative group">
                <img
                  src={referenceImage}
                  alt="Reference"
                  className="max-w-full max-h-72 rounded-xl border border-zinc-200 shadow-sm object-contain"
                />
                <div className="absolute inset-0 rounded-xl bg-black/0 group-hover:bg-black/10 transition-colors" />
                <button
                  onClick={() => setReferenceImage(null)}
                  className="absolute top-3 right-3 w-7 h-7 bg-white/90 hover:bg-white border border-zinc-200 text-zinc-600 hover:text-zinc-900 rounded-full text-sm flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  title={t.removeImage}
                >
                  ×
                </button>
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                className="ml-4 px-4 py-2 border border-dashed border-zinc-300 rounded-lg text-xs text-zinc-400 hover:text-violet-600 hover:border-violet-300 transition-colors flex items-center gap-1"
              >
                {t.changeImage}
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-zinc-300 rounded-xl p-10 text-center cursor-pointer hover:border-violet-400 hover:bg-violet-50/30 transition-colors"
            >
              <div className="text-4xl mb-3">🖼️</div>
              <p className="text-sm text-zinc-500 font-medium">{t.uploadClick}</p>
              <p className="text-xs text-zinc-400 mt-1">{t.uploadHint}</p>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
        </div>
      )}

      <div className="mb-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={tab === 'text' ? t.promptText : t.promptImage}
          rows={3}
          className="w-full border border-zinc-200 rounded-lg px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent"
        />
      </div>

      {/* Style selector */}
      <div className="mb-4">
        <p className="text-xs text-zinc-400 mb-2">{t.style}</p>
        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
          {STYLES.map((s) => (
            <button
              key={s}
              onClick={() => {
                const nextStyle = style === s ? '' : s;
                setStyle(nextStyle);
                // Only auto-select ratio if user hasn't manually picked one
                if (nextStyle && STYLE_RATIO[nextStyle] && aspectRatio === '智能') {
                  setAspectRatio(STYLE_RATIO[nextStyle]);
                } else if (!nextStyle) {
                  setAspectRatio('智能');
                }
              }}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                style === s ? 'bg-violet-600 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              {(STYLE_EMOJI[s] || '')} {t.styleNames[s] || s}
            </button>
          ))}
        </div>
      </div>

      {/* Aspect ratio */}
      <div className="mb-4">
        <p className="text-xs text-zinc-400 mb-2">{t.aspectRatio}</p>
        <div className="flex gap-1.5">
          {RATIOS.map((r) => (
            <button
              key={r}
              onClick={() => setAspectRatio(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                aspectRatio === r ? 'bg-violet-600 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              {r === '智能' ? t.autoRatio : r}
            </button>
          ))}
        </div>
      </div>

      {/* Generate button */}
      <Button
        onClick={generate}
        disabled={loading || (tab === 'text' && !prompt.trim()) || (tab === 'image' && !referenceImage)}
        className="w-full py-3 text-base bg-violet-600 hover:bg-violet-700 disabled:bg-zinc-300"
      >
        {loading ? t.generating : t.generate}
      </Button>

      {/* Error */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="mt-6">
          <div className="rounded-xl overflow-hidden border border-zinc-200">
            <img src={result.image} alt="Generated" className="w-full" />
          </div>
          <p className="text-xs text-zinc-400 mt-2 truncate">{result.prompt}</p>
          <Button onClick={download} className="mt-3 w-full" variant="outline">
            {t.download}
          </Button>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="mt-12">
          <h2 className="text-lg font-semibold mb-4">{t.history}</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {history.filter(item => item.image && item.image.length > 10).map((item, i) => (
              <div key={item.id || i} className="relative group">
                <button
                  onClick={() => setResult(item)}
                  className="w-full aspect-square rounded-lg overflow-hidden border border-zinc-200 hover:border-violet-400 transition-colors"
                >
                  <img src={item.image} alt="" className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).parentElement!.style.display = 'none';
                    }}
                  />
                </button>
                <button
                  onClick={(e) => item.id && deleteHistoryItem(item.id, e)}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500/80 hover:bg-red-600 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => fetchHistory(historyPage - 1)}
                disabled={historyPage <= 1}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 text-zinc-600 hover:bg-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                {t.prev}
              </button>
              <span className="text-xs text-zinc-400">
                {historyPage} / {totalPages}
              </span>
              <button
                onClick={() => fetchHistory(historyPage + 1)}
                disabled={historyPage >= totalPages}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 text-zinc-600 hover:bg-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                {t.next}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
