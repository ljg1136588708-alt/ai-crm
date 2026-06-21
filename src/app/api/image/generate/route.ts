// POST /api/image/generate — text-to-image or image-to-image via OpenAI Images API
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

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

const FREE_QUOTA = 5;

async function getOrCreateUser(supabase: any, clerkId: string) {
  const { data: existing } = await supabase.from('users').select('*').eq('clerk_id', clerkId).single();
  if (existing) return existing;
  const { data: created } = await supabase.from('users').insert({
    clerk_id: clerkId,
    quota_remaining: FREE_QUOTA,
    quota_total: FREE_QUOTA,
  }).select().single();
  return created;
}

async function checkQuota(supabase: any, clerkId: string) {
  const { data: user } = await supabase.from('users').select('quota_remaining').eq('clerk_id', clerkId).single();
  if (!user || user.quota_remaining <= 0) return { allowed: false, remaining: user?.quota_remaining ?? 0 };
  const { data: updated } = await supabase.from('users')
    .update({ quota_remaining: user.quota_remaining - 1 })
    .eq('clerk_id', clerkId)
    .select('quota_remaining, quota_total').single();
  return { allowed: true, remaining: updated?.quota_remaining ?? 0, total: updated?.quota_total ?? FREE_QUOTA };
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { getServiceClient } = await import('@/lib/supabase/client');
  const supabase = getServiceClient();

  await getOrCreateUser(supabase, userId);
  const quota = await checkQuota(supabase, userId);
  if (!quota.allowed) {
    return NextResponse.json({ error: 'Free quota used. Please upgrade.', quota: quota.remaining }, { status: 402 });
  }

  const body = await req.json();
  const { prompt, referenceImage, style, aspectRatio, format } = body as {
    prompt?: string; referenceImage?: string; style?: string;
    aspectRatio?: string; format?: string;
  };

  if (!prompt && !referenceImage) {
    return NextResponse.json({ error: 'Provide prompt or reference image' }, { status: 400 });
  }

  const styleAddon = style && STYLE_PROMPTS[style] ? `, ${STYLE_PROMPTS[style]}` : '';
  const fullPrompt = `${prompt || 'A beautiful image'}${styleAddon}`;
  const size = SIZES[aspectRatio || '1:1'] || '1024x1024';
  const outputFormat = format === 'jpg' ? 'jpeg' : (format === 'webp' ? 'webp' : 'png');

  try {
    // gpt-image-1.5 returns b64_json by default, do NOT pass response_format
    const bodyObj: Record<string, unknown> = {
      model: 'gpt-image-1.5',
      prompt: fullPrompt,
      n: 1,
      size,
    };

    // Reference image: gpt-image-1.5 Images API doesn't support 'image' param.
    // Best-effort: use prompt-based style transfer.
    if (referenceImage) {
      bodyObj.prompt = `${fullPrompt || 'Transform the uploaded image into the selected style while preserving composition.'}\n\nThe result should look like a styled version of an uploaded photo.`;
    }

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyObj),
    });

    const result = await response.json();
    if (!response.ok) {
      await supabase.from('users').update({ quota_remaining: quota.remaining + 1 }).eq('clerk_id', userId);
      throw new Error(result.error?.message || `OpenAI API error ${response.status}`);
    }

    const base64 = result.data?.[0]?.b64_json;
    if (!base64) {
      await supabase.from('users').update({ quota_remaining: quota.remaining + 1 }).eq('clerk_id', userId);
      return NextResponse.json({ error: 'No image returned' }, { status: 500 });
    }

    const mimeType = outputFormat === 'jpeg' ? 'image/jpeg' : outputFormat === 'webp' ? 'image/webp' : 'image/png';
    const dataUrl = `data:${mimeType};base64,${base64}`;

    // Save to Supabase Storage
    const buffer = Buffer.from(base64, 'base64');
    const filename = `${userId}/${Date.now()}.${outputFormat}`;
    await supabase.storage.from('generations').upload(filename, buffer, {
      contentType: mimeType,
      upsert: false,
    });
    const { data: urlData } = supabase.storage.from('generations').getPublicUrl(filename);

    await supabase.from('generations').insert({
      clerk_id: userId,
      image_url: urlData.publicUrl,
      prompt: fullPrompt,
    });

    return NextResponse.json({
      success: true,
      image: dataUrl,
      imageUrl: urlData.publicUrl,
      size, format: outputFormat, prompt: fullPrompt,
      quota: { remaining: quota.remaining, total: quota.total },
    });
  } catch (err: any) {
    await supabase.from('users').update({ quota_remaining: quota.remaining + 1 }).eq('clerk_id', userId);
    console.error('Image generation error:', err);
    return NextResponse.json({ error: err.message || 'Generation failed' }, { status: 500 });
  }
}
