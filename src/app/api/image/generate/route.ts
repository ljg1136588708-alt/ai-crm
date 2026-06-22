// POST /api/image/generate — text-to-image or image-to-image via APIYI (Nano Banana 2)
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

const APIYI_BASE = 'https://api.apiyi.com/v1';
const MODEL = 'gemini-3.1-flash-image';

const STYLE_PROMPTS: Record<string, string> = {
  '写实摄影': 'photorealistic, professional photography, detailed texture, natural lighting',
  '动漫': 'anime style, vibrant colors, clean lines, cel shading',
  '水彩': 'watercolor painting style, soft edges, translucent colors',
  '素描': 'pencil sketch, monochrome, detailed linework, hand-drawn',
  '赛博朋克': 'cyberpunk style, neon lights, futuristic city, high contrast',
  '油画': 'oil painting style, rich textures, visible brush strokes',
  '电影感': 'cinematic lighting, film grain, anamorphic lens, dramatic composition',
  '仙侠': 'Chinese xianxia fantasy style, ethereal, flowing robes, mystical atmosphere, guofeng',
  '日漫': 'Japanese manga style, expressive, dynamic composition, screen tone',
  '复古': 'vintage retro style, warm tones, film photography look, analog',
  '科幻': 'sci-fi style, futuristic technology, space, sleek design',
  'Q版': 'chibi style, cute proportions, big head small body, adorable, kawaii',
  '贴纸': 'sticker design, white border, die-cut look, flat vector colors',
  '游戏CG': 'video game CG render, highly detailed, dramatic lighting, unreal engine',
  '手办': 'figurine photography, miniature, shallow depth of field, collectible',
  '美漫': 'American comic book style, bold ink lines, halftone dots, superhero',
  '废土科幻': 'post-apocalyptic wasteland, desolate, gritty, Mad Max style',
  '3D卡通': '3D cartoon render, Pixar-style, smooth, colorful, playful',
  '吉卜力': 'Studio Ghibli style, hand-drawn animation, whimsical, nature-rich, soft colors',
  '国漫2D': 'Chinese donghua 2D style, elegant, ink-wash influence, guochao',
  '国漫3D': 'Chinese donghua 3D style, detailed character, dynamic poses, guoman',
};

const SIZES: Record<string, string> = {
  '1:1': '1024x1024', '2:3': '1024x1536', '3:2': '1536x1024',
  '3:4': '1024x1536', '4:3': '1536x1024', '9:16': '1024x1792',
  '16:9': '1792x1024', '21:9': '2560x1080',
};

const FREE_QUOTA = 30;
const FREE_STYLES = ['写实摄影', '动漫', '水彩', '电影感', '赛博朋克', '油画', '素描', 'Q版'];

// Create the user row on first use. Idempotent: won't overwrite an existing row's quota.
async function ensureUser(supabase: any, clerkId: string) {
  await supabase.from('users').upsert(
    { clerk_id: clerkId, quota_remaining: FREE_QUOTA, quota_total: FREE_QUOTA },
    { onConflict: 'clerk_id', ignoreDuplicates: true },
  );
}

// Atomically check + deduct one credit via DB function (race-safe row lock).
async function checkQuota(supabase: any, clerkId: string) {
  const { data } = await supabase.rpc('decrement_quota', { p_clerk_id: clerkId });
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return { allowed: false, remaining: 0, isPro: false };
  return {
    allowed: row.allowed,
    remaining: row.remaining,
    total: row.total ?? FREE_QUOTA,
    isPro: row.is_pro,
  };
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { getServiceClient } = await import('@/lib/supabase/client');
  const supabase = getServiceClient();

  await ensureUser(supabase, userId);
  const quota = await checkQuota(supabase, userId);
  if (!quota.allowed) {
    return NextResponse.json({ error: 'Free quota used. Please upgrade.', quota: quota.remaining }, { status: 402 });
  }

  const isPro = quota.isPro || false;
  const body = await req.json();
  const { prompt, referenceImage, style, aspectRatio, format } = body as {
    prompt?: string; referenceImage?: string; style?: string;
    aspectRatio?: string; format?: string;
  };

  if (!prompt && !referenceImage) {
    return NextResponse.json({ error: 'Provide prompt or reference image' }, { status: 400 });
  }

  // Free users: restrict to 8 popular styles
  if (!isPro && style && !FREE_STYLES.includes(style)) {
    return NextResponse.json({ error: 'This style requires Pro. Free users have access to 8 styles.' }, { status: 402 });
  }

  const styleAddon = style && STYLE_PROMPTS[style] ? `, ${STYLE_PROMPTS[style]}` : '';
  const fullPrompt = `${prompt || 'A beautiful image'}${styleAddon}`;
  const size = aspectRatio ? (SIZES[aspectRatio] || '1024x1024') : undefined;
  const outputFormat = format === 'jpg' ? 'jpeg' : (format === 'webp' ? 'webp' : 'png');

  try {
    const bodyObj: Record<string, unknown> = {
      model: MODEL,
      prompt: fullPrompt,
      n: 1,
      ...(size ? { size } : {}),
    };

    // Try passing reference image — APIYI may support it
    if (referenceImage) {
      bodyObj.image = referenceImage;
    }

    const response = await fetch(`${APIYI_BASE}/images/generations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.APIYI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyObj),
    });

    const result = await response.json();
    if (!response.ok) {
      // If APIYI rejects 'image' param for image-to-image, fall back
      if (referenceImage && result.error?.param === 'image') {
        // Retry without image param
        delete bodyObj.image;
        const retryResp = await fetch(`${APIYI_BASE}/images/generations`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.APIYI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ...bodyObj, prompt: `${fullPrompt}\n[Style transfer from uploaded photo]` }),
        });
        const retryResult = await retryResp.json();
        if (!retryResp.ok) {
          throw new Error(retryResult.error?.message || `API error ${retryResp.status}`);
        }
        // Use retry result
        return processResult(retryResult, outputFormat, userId, fullPrompt, size || 'auto', quota, supabase, isPro);
      }
      throw new Error(result.error?.message || `API error ${response.status}`);
    }

    return processResult(result, outputFormat, userId, fullPrompt, size || 'auto', quota, supabase, isPro);
  } catch (err: any) {
    if (!isPro) {
      await supabase.rpc('add_quota', { p_clerk_id: userId, p_amount: 1 });
    }
    console.error('Image generation error:', err);
    const msg = err.message || '';
    const userMsg = msg.includes('key') || msg.includes('auth') || msg.includes('token')
      ? 'Service temporarily unavailable. Please try again later.'
      : msg.includes('rate') || msg.includes('limit')
        ? 'Too many requests. Please wait a moment.'
        : 'Generation failed. Please try again.';
    return NextResponse.json({ error: userMsg }, { status: 500 });
  }
}

async function processResult(
  result: any, outputFormat: string, userId: string,
  fullPrompt: string, size: string, quota: any, supabase: any, isPro: boolean
) {
  const imageData = result.data?.[0];
  let base64 = imageData?.b64_json;
  if (!base64 && imageData?.url) {
    const imageResp = await fetch(imageData.url);
    const blob = await imageResp.arrayBuffer();
    base64 = Buffer.from(blob).toString('base64');
  }
  if (!base64) {
    if (!isPro) {
      await supabase.rpc('add_quota', { p_clerk_id: userId, p_amount: 1 });
    }
    return NextResponse.json({ error: 'No image returned' }, { status: 500 });
  }

  const mimeType = outputFormat === 'jpeg' ? 'image/jpeg' : outputFormat === 'webp' ? 'image/webp' : 'image/png';

  let buffer = Buffer.from(base64, 'base64');

  // Add watermark for free users
  if (!isPro) {
    try {
      const sharp = (await import('sharp')).default;
      const metadata = await sharp(buffer).metadata();
      const w = metadata.width || 1024;
      const fontSize = Math.max(24, Math.round(w / 25));
      const svgWatermark = `<svg width="${w}" height="${metadata.height || 1024}">
        <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central"
          font-size="${fontSize}" font-family="Arial, sans-serif" font-weight="bold"
          fill="rgba(255,255,255,0.35)" stroke="rgba(0,0,0,0.25)" stroke-width="2">
          AI Foto
        </text>
      </svg>`;
      buffer = Buffer.from(await sharp(buffer)
        .composite([{ input: Buffer.from(svgWatermark), top: 0, left: 0 }])
        .toBuffer());
    } catch (e) {
      // Watermark failed — store original
      console.warn('Watermark failed, storing original:', e);
    }
  }

  const filename = `${userId}/${Date.now()}.${outputFormat}`;
  const dataUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;
  await supabase.storage.from('generations').upload(filename, buffer, { contentType: mimeType, upsert: false });
  const { data: urlData } = supabase.storage.from('generations').getPublicUrl(filename);

  await supabase.from('generations').insert({
    clerk_id: userId, image_url: urlData.publicUrl, prompt: fullPrompt,
  });

  return NextResponse.json({
    success: true, image: dataUrl, imageUrl: urlData.publicUrl,
    size, format: outputFormat, prompt: fullPrompt,
    quota: { remaining: quota.remaining, total: quota.total },
  });
}
