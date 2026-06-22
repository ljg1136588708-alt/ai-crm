// POST /api/image/generate — text-to-image or image-to-image via APIYI (Nano Banana 2)
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

const APIYI_BASE = 'https://api.apiyi.com/v1';
const APIYI_GEMINI_BASE = 'https://api.apiyi.com/v1beta';
const MODEL = 'gemini-3.1-flash-image';
// The Gemini-native generateContent endpoint expects the -preview model id
// (per APIYI's image-edit docs), unlike the OpenAI-compatible images endpoint.
const EDIT_MODEL = 'gemini-3.1-flash-image-preview';

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

const FREE_QUOTA = 12;
const FREE_STYLES = ['写实摄影', '动漫', '水彩', '电影感', '赛博朋克', '油画', '素描', 'Q版'];

// Create the user row on first use. Idempotent: won't overwrite an existing row's quota.
// Refund one credit (called on generation failure)
async function refundQuota(supabase: any, clerkId: string) {
  const { data: user } = await supabase.from('users').select('quota_remaining').eq('clerk_id', clerkId).single();
  if (user) {
    await supabase.from('users').update({ quota_remaining: user.quota_remaining + 1 }).eq('clerk_id', clerkId);
  }
}

async function ensureUser(supabase: any, clerkId: string) {
  const { data: exists } = await supabase.from('users').select('clerk_id').eq('clerk_id', clerkId).single();
  if (!exists) {
    const { error } = await supabase.from('users').insert({
      clerk_id: clerkId, quota_remaining: FREE_QUOTA, quota_total: FREE_QUOTA,
    });
    // Surface insert failures instead of swallowing them — a failed insert here
    // (e.g. a NOT NULL column the app doesn't populate) silently breaks quota.
    if (error) console.error('ensureUser: failed to create user row:', error.message, error.details || '');
  }
}

// Check + deduct one credit inline (no DB function dependency)
async function checkQuota(supabase: any, clerkId: string) {
  const { data: user } = await supabase
    .from('users')
    .select('quota_remaining, quota_total, is_pro')
    .eq('clerk_id', clerkId)
    .single();

  if (!user) return { allowed: false, remaining: 0, total: FREE_QUOTA, isPro: false };
  if (user.is_pro) return { allowed: true, remaining: -1, total: -1, isPro: true };

  // Repair corrupted quota
  if (!user.quota_total || user.quota_total <= 0) {
    await supabase.from('users').update({ quota_remaining: FREE_QUOTA, quota_total: FREE_QUOTA }).eq('clerk_id', clerkId);
    user.quota_remaining = FREE_QUOTA;
    user.quota_total = FREE_QUOTA;
  }

  if (user.quota_remaining <= 0) {
    return { allowed: false, remaining: 0, total: user.quota_total, isPro: false };
  }

  // Deduct
  const { data: updated } = await supabase
    .from('users')
    .update({ quota_remaining: user.quota_remaining - 1 })
    .eq('clerk_id', clerkId)
    .eq('quota_remaining', user.quota_remaining)  // optimistic lock
    .select('quota_remaining, quota_total')
    .single();

  if (!updated) {
    // Race condition — retry once
    return checkQuota(supabase, clerkId);
  }

  return {
    allowed: true,
    remaining: updated.quota_remaining,
    total: updated.quota_total,
    isPro: false,
  };
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Parse and validate the request BEFORE touching quota, so a rejected
  // request (empty prompt, locked style) never costs the user a credit.
  const body = await req.json();
  const { prompt, referenceImage, style, aspectRatio } = body as {
    prompt?: string; referenceImage?: string; style?: string;
    aspectRatio?: string;
  };

  if (!prompt && !referenceImage) {
    return NextResponse.json({ error: 'Provide prompt or reference image' }, { status: 400 });
  }

  const { getServiceClient } = await import('@/lib/supabase/client');
  const supabase = getServiceClient();

  await ensureUser(supabase, userId);

  // Read pro status first so the free-style gate can reject without deducting.
  const { data: statusRow } = await supabase.from('users').select('is_pro').eq('clerk_id', userId).single();
  const isPro = statusRow?.is_pro || false;

  // Free users: restrict to 8 popular styles
  if (!isPro && style && !FREE_STYLES.includes(style)) {
    return NextResponse.json({ error: 'This style requires Pro. Free users have access to 8 styles.' }, { status: 402 });
  }

  const quota = await checkQuota(supabase, userId);
  if (!quota.allowed) {
    return NextResponse.json({ error: 'Free quota used. Please upgrade.', quota: quota.remaining }, { status: 402 });
  }

  const styleAddon = style && STYLE_PROMPTS[style] ? `, ${STYLE_PROMPTS[style]}` : '';
  const fullPrompt = `${prompt || 'A beautiful image'}${styleAddon}`;
  const size = aspectRatio ? (SIZES[aspectRatio] || '1024x1024') : undefined;

  try {
    // Text-to-image uses the OpenAI-compatible endpoint; image-to-image/editing
    // uses the Gemini-native generateContent endpoint (per APIYI docs).
    const base64 = referenceImage
      ? await editImage(fullPrompt, referenceImage, aspectRatio)
      : await generateImage(fullPrompt, size);

    return await saveAndRespond(base64, userId, fullPrompt, size || aspectRatio || 'auto', quota, supabase);
  } catch (err: any) {
    if (!isPro) {
      await refundQuota(supabase, userId);
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

// Text-to-image via the OpenAI-compatible /v1/images/generations endpoint.
async function generateImage(fullPrompt: string, size?: string): Promise<string> {
  const resp = await fetch(`${APIYI_BASE}/images/generations`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.APIYI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model: MODEL, prompt: fullPrompt, n: 1, ...(size ? { size } : {}) }),
  });
  const result = await resp.json();
  if (!resp.ok) throw new Error(result.error?.message || `API error ${resp.status}`);

  const imageData = result.data?.[0];
  let base64 = imageData?.b64_json;
  if (!base64 && imageData?.url) {
    const imageResp = await fetch(imageData.url);
    base64 = Buffer.from(await imageResp.arrayBuffer()).toString('base64');
  }
  if (!base64) throw new Error('No image returned');
  return base64;
}

// Image-to-image / editing via Gemini-native generateContent.
// The reference image arrives as a data URL; Gemini needs the raw base64 and
// MIME type passed separately in an inlineData part.
async function editImage(fullPrompt: string, referenceImage: string, aspectRatio?: string): Promise<string> {
  const m = /^data:(image\/[a-zA-Z0-9.+-]+);base64,([\s\S]*)$/.exec(referenceImage);
  const inlineMime = m?.[1] || 'image/png';
  const inlineData = m?.[2] || referenceImage;

  const reqBody = {
    contents: [{
      parts: [
        { text: fullPrompt },
        { inlineData: { mimeType: inlineMime, data: inlineData } },
      ],
    }],
    generationConfig: {
      responseModalities: ['IMAGE'],
      ...(aspectRatio ? { imageConfig: { aspectRatio } } : {}),
    },
  };

  const resp = await fetch(`${APIYI_GEMINI_BASE}/models/${EDIT_MODEL}:generateContent`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.APIYI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(reqBody),
  });
  const result = await resp.json();
  if (!resp.ok) throw new Error(result.error?.message || `API error ${resp.status}`);

  const parts = result.candidates?.[0]?.content?.parts || [];
  const base64 = parts.find((p: any) => p.inlineData?.data)?.inlineData?.data;
  if (!base64) throw new Error('No image returned');
  return base64;
}

async function saveAndRespond(
  base64: string, userId: string,
  fullPrompt: string, size: string, quota: any, supabase: any
) {
  // APIYI (Nano Banana 2) only outputs PNG.
  const mimeType = 'image/png';
  const dataUrl = `data:${mimeType};base64,${base64}`;

  const buffer = Buffer.from(base64, 'base64');
  const filename = `${userId}/${Date.now()}.png`;
  await supabase.storage.from('generations').upload(filename, buffer, { contentType: mimeType, upsert: false });
  const { data: urlData } = supabase.storage.from('generations').getPublicUrl(filename);

  await supabase.from('generations').insert({
    clerk_id: userId, image_url: urlData.publicUrl, prompt: fullPrompt,
  });

  return NextResponse.json({
    success: true, image: dataUrl, imageUrl: urlData.publicUrl,
    size, format: 'png', prompt: fullPrompt,
    quota: { remaining: quota.remaining, total: quota.total },
  });
}
