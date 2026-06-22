'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

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
const FORMATS = ['PNG', 'JPG', 'WebP'];

type GenerationResult = {
  image: string;       // base64 data URL (for current result display)
  imageUrl?: string;   // Supabase public URL (persisted in history)
  prompt: string;
  timestamp: number;
};

export default function GeneratePage() {
  const [tab, setTab] = useState<'text' | 'image'>('text');
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [format, setFormat] = useState('PNG');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [history, setHistory] = useState<GenerationResult[]>([]);
  const [quota, setQuota] = useState<{ remaining: number; total: number; isPro: boolean } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Load quota on mount and after each generation
  const fetchQuota = () => {
    fetch('/api/image/quota').then(r => r.json()).then(d => {
      if (d.remaining !== undefined) setQuota(d);
    }).catch(() => {});
  };

  useEffect(() => {
    fetchQuota();
  }, []);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('generation-history');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Filter out entries with no valid image URL
        setHistory(parsed.filter((item: GenerationResult) => item.image && item.image.length > 50));
      }
    } catch {}
  }, []);

  const saveToHistory = (item: GenerationResult) => {
    // Don't save base64 image to localStorage (too large).
    // Store URL and prompt only.
    const slim = {
      image: item.imageUrl || '',  // use Supabase URL for thumbnail
      prompt: item.prompt,
      timestamp: item.timestamp,
    };
    const updated = [slim as GenerationResult, ...history].slice(0, 50);
    setHistory(updated);
    try {
      localStorage.setItem('generation-history', JSON.stringify(updated));
    } catch {
      // localStorage full — oldest items will be dropped on next save
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setError('Image too large. Please use an image under 10MB.');
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
          format: format.toLowerCase(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 402) {
          setQuota({ remaining: 0, total: data.quota ?? 5, isPro: false });
          throw new Error('Free quota used up. Upgrade to Pro.');
        }
        throw new Error(data.error || 'Failed');
      }

      const genResult: GenerationResult = {
        image: data.image,
        imageUrl: data.imageUrl,
        prompt: data.prompt,
        timestamp: Date.now(),
      };
      setResult(genResult);
      saveToHistory(genResult);
      // Refresh quota
      if (data.quota) setQuota(data.quota);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const download = () => {
    if (!result) return;
    const a = document.createElement('a');
    a.href = result.image;
    a.download = `generated-${Date.now()}.${format.toLowerCase()}`;
    a.click();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Quota badge */}
      {quota && (
        <div className="flex items-center justify-between mb-4">
          {quota.isPro ? (
            <span className="text-xs px-2 py-1 rounded-full bg-violet-100 text-violet-700 font-medium">
              ⭐ PRO · Unlimited
            </span>
          ) : (
            <>
              <span className={`text-xs px-2 py-1 rounded-full ${quota.remaining > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                {quota.remaining} / {quota.total} free
              </span>
              {quota.remaining === 0 && (
                <Link href="/pricing" className="text-xs text-violet-600 font-medium hover:underline">Upgrade →</Link>
              )}
            </>
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
            {m === 'text' ? '✍️ 文生图' : '📸 图生图'}
          </button>
        ))}
      </div>

      {/* Input area */}
      {tab === 'image' && (
        <div className="mb-4">
          {referenceImage ? (
            <div className="relative inline-block">
              <img src={referenceImage} alt="Reference" className="w-48 h-48 object-cover rounded-lg border" />
              <button
                onClick={() => setReferenceImage(null)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
              >×</button>
            </div>
          ) : (
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-zinc-300 rounded-lg p-8 text-center cursor-pointer hover:border-violet-400 transition-colors"
            >
              <div className="text-3xl mb-2">📁</div>
              <p className="text-sm text-zinc-500">点击上传图片</p>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
        </div>
      )}

      <div className="mb-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={tab === 'text' ? '描述你想要生成的图片…' : '可选：描述你想要的风格或变化…'}
          rows={3}
          className="w-full border border-zinc-200 rounded-lg px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent"
        />
      </div>

      {/* Style selector */}
      <div className="mb-4">
        <p className="text-xs text-zinc-400 mb-2">风格（可选）</p>
        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
          {STYLES.map((s) => (
            <button
              key={s}
              onClick={() => setStyle(style === s ? '' : s)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                style === s ? 'bg-violet-600 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              {(STYLE_EMOJI[s] || '')} {s}
            </button>
          ))}
        </div>
      </div>

      {/* Aspect ratio */}
      <div className="mb-4">
        <p className="text-xs text-zinc-400 mb-2">尺寸比例</p>
        <div className="flex gap-1.5">
          {RATIOS.map((r) => (
            <button
              key={r}
              onClick={() => setAspectRatio(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                aspectRatio === r ? 'bg-violet-600 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Format */}
      <div className="mb-6">
        <p className="text-xs text-zinc-400 mb-2">输出格式</p>
        <div className="flex gap-1.5">
          {FORMATS.map((f) => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                format === f ? 'bg-violet-600 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              {f}
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
        {loading ? '⏳ 生成中…' : '🚀 生成'}
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
            💾 下载
          </Button>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="mt-12">
          <h2 className="text-lg font-semibold mb-4">📚 历史记录</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {history.filter(item => item.image && item.image.length > 10).map((item, i) => (
              <button
                key={i}
                onClick={() => setResult(item)}
                className="aspect-square rounded-lg overflow-hidden border border-zinc-200 hover:border-violet-400 transition-colors"
              >
                <img src={item.image} alt="" className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).parentElement!.style.display = 'none';
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
