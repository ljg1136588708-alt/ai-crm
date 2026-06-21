// POST /api/image/generate — text-to-image or image-to-image via OpenAI
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

const STYLE_PROMPTS: Record<string, string> = {
  '写实摄影': 'photorealistic, professional photography, detailed texture, natural lighting',
  '动漫': 'anime style, vibrant colors, clean lines',
  '水彩': 'watercolor painting style, soft edges, translucent colors',
  '素描': 'pencil sketch, monochrome, detailed linework',
  '赛博朋克': 'cyberpunk style, neon lights, futuristic city, high contrast',
  '油画': 'oil painting style, rich textures, brush strokes',
  '电影感': 'cinematic lighting, film grain, dramatic composition',
  '仙侠': 'Chinese xianxia fantasy style, ethereal, flowing robes, mystical atmosphere',
  '日漫': 'Japanese manga style, expressive, dynamic composition',
  '复古': 'vintage retro style, warm tones, film photography look',
  '科幻': 'sci-fi style, futuristic technology, space',
  'Q版': 'chibi style, cute, big head small body, adorable',
  '贴纸': 'sticker design, white border, die-cut look, flat colors',
  '游戏CG': 'video game CG render, highly detailed, dramatic lighting',
  '手办': 'figurine photography, miniature, shallow depth of field',
  '美漫': 'American comic book style, bold lines, halftone dots',
  '废土科幻': 'post-apocalyptic wasteland, desolate, gritty',
  '3D卡通': '3D cartoon render, Pixar-style, smooth, colorful',
  '吉卜力': 'Studio Ghibli style, hand-drawn animation, whimsical, nature-rich',
  '国漫2D': 'Chinese donghua 2D style, elegant, ink-wash influence',
  '国漫3D': 'Chinese donghua 3D style, detailed character, dynamic poses',
};

const SIZES: Record<string, string> = {
  '1:1': '1024x1024',
  '2:3': '1024x1536',
  '3:2': '1536x1024',
  '3:4': '1024x1536',
  '4:3': '1536x1024',
  '9:16': '1024x1792',
  '16:9': '1792x1024',
  '21:9': '2560x1080',
};

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { prompt, referenceImage, style, aspectRatio, format } = body as {
    prompt?: string;
    referenceImage?: string; // base64 data URL
    style?: string;
    aspectRatio?: string;
    format?: string;
  };

  if (!prompt && !referenceImage) {
    return NextResponse.json({ error: 'Provide prompt or reference image' }, { status: 400 });
  }

  // Build full prompt
  const styleAddon = style && STYLE_PROMPTS[style] ? `, ${STYLE_PROMPTS[style]}` : '';
  const fullPrompt = `${prompt || 'A beautiful image'}${styleAddon}`;

  // Determine size
  const size = SIZES[aspectRatio || '1:1'] || '1024x1024';
  const outputFormat = format === 'jpg' ? 'jpeg' : (format === 'webp' ? 'webp' : 'png');

  try {
    const params: any = {
      model: 'gpt-image-1.5',
      prompt: fullPrompt,
      n: 1,
      size,
      response_format: outputFormat === 'jpeg' ? 'b64_json' : 'b64_json',
    };

    // Image-to-image: pass reference as input image
    if (referenceImage) {
      // GPT Image API uses the 'image' parameter for image-to-image
      params.image = referenceImage;
    }

    const response = await openai.images.generate(params);

    const imageData = response.data?.[0];
    const base64 = imageData?.b64_json;
    if (!imageData || !base64) {
      return NextResponse.json({ error: 'No image returned' }, { status: 500 });
    }

    // Return base64 image
    const mimeType = outputFormat === 'jpeg' ? 'image/jpeg' : outputFormat === 'webp' ? 'image/webp' : 'image/png';
    const dataUrl = `data:${mimeType};base64,${base64}`;

    return NextResponse.json({
      success: true,
      image: dataUrl,
      size,
      format: outputFormat,
      prompt: fullPrompt,
    });
  } catch (err: any) {
    console.error('Image generation error:', err);
    return NextResponse.json({ error: err.message || 'Generation failed' }, { status: 500 });
  }
}
