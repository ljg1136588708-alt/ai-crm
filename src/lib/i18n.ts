export type Locale = 'en' | 'zh';

const en = {
  aifoto: {
    landing: {
      signIn: 'Sign In', getStarted: 'Get Started',
      heroTitle: 'Your photos,',
      heroTitle2: 'any style you imagine',
      heroDesc: 'Upload a photo or describe what you want. AI generates stunning images in 20+ styles — anime, photorealistic, oil painting, cyberpunk, and more.',
      tryFree: 'Try Free — No Credit Card',
    },
    dashboard: {
      textToImage: '✍️ Text to Image',
      imageToImage: '📸 Image to Image',
      style: 'Style (optional)',
      aspectRatio: 'Aspect Ratio',
      uploadClick: 'Click to upload an image',
      uploadHint: 'JPG, PNG, WebP — max 10MB',
      changeImage: '🔄 Change',
      removeImage: 'Remove image',
      generate: '🚀 Generate',
      generating: '⏳ Generating…',
      download: '💾 Download',
      history: '📚 History',
      free: 'free',
      pro: '⭐ PRO · Unlimited',
      upgrade: 'Upgrade →',
      promptText: 'Describe the image you want…',
      promptImage: 'Optional: describe the style or changes you want…',
      quotaUsed: 'Free quota used up. Upgrade to Pro.',
      autoRatio: 'Auto',
      imageTooLarge: 'Image too large. Please use an image under 10MB.',
      genFailed: 'Generation failed. Please try again.',
      styleNames: {
        '写实摄影': 'Photorealistic', '动漫': 'Anime', '水彩': 'Watercolor', '素描': 'Sketch',
        '赛博朋克': 'Cyberpunk', '油画': 'Oil Painting', '电影感': 'Cinematic', '仙侠': 'Xianxia',
        '日漫': 'Manga', '复古': 'Vintage', '科幻': 'Sci-Fi', 'Q版': 'Chibi', '贴纸': 'Sticker',
        '游戏CG': 'Game CG', '手办': 'Figurine', '美漫': 'Comic', '废土科幻': 'Wasteland',
        '3D卡通': '3D Cartoon', '吉卜力': 'Ghibli', '国漫2D': 'Donghua 2D', '国漫3D': 'Donghua 3D',
      } as Record<string, string>,
    },
    pricing: {
      title: 'Upgrade to Pro',
      subtitle: 'Free trial: 50 generations. Pro: unlimited.',
      pro: 'PRO',
      perMo: '/mo',
      cancel: 'Cancel anytime',
      features: [
        'Unlimited image generations',
        'All 21 styles',
        'All aspect ratios & formats',
        'Generate from photos or text',
        'Priority generation speed',
        'Download in full resolution',
      ] as string[],
      subscribe: 'Subscribe — $9.99/mo',
      redirecting: 'Redirecting...',
      footer: 'Secure payment via PayPal. Cancel anytime.',
      signIn: 'Sign In',
      checkoutFailed: 'Checkout failed',
      networkError: 'Network error. Please try again.',
    },
    success: {
      loading: 'Confirming your subscription...',
      loadingDesc: 'This takes just a moment.',
      success: "You're a Pro! 🎉",
      successDesc: 'Unlimited generations unlocked. Go create something amazing.',
      error: 'Something went wrong',
      errorDesc: 'If you were charged, your Pro access will be active shortly.',
      goDashboard: 'Go to Dashboard',
    },
  },
};

const zh: typeof en = {
  aifoto: {
    landing: {
      signIn: '登录', getStarted: '免费开始',
      heroTitle: '你的照片，',
      heroTitle2: '任意风格',
      heroDesc: '上传照片或描述你想要的画面。AI 生成 20+ 风格的精美图片 — 动漫、写实、油画、赛博朋克等。',
      tryFree: '免费试用 — 无需绑卡',
    },
    dashboard: {
      textToImage: '✍️ 文生图',
      imageToImage: '📸 图生图',
      style: '风格（可选）',
      aspectRatio: '尺寸比例',
      uploadClick: '点击上传图片',
      uploadHint: '支持 JPG、PNG、WebP，最大 10MB',
      changeImage: '🔄 换图',
      removeImage: '移除图片',
      generate: '🚀 生成',
      generating: '⏳ 生成中…',
      download: '💾 下载',
      history: '📚 历史记录',
      free: '免费',
      pro: '⭐ PRO · 无限',
      upgrade: '升级 →',
      promptText: '描述你想要生成的图片…',
      promptImage: '可选：描述你想要的风格或变化…',
      quotaUsed: '免费额度已用完，请升级 Pro。',
      autoRatio: '智能',
      imageTooLarge: '图片太大，请使用 10MB 以内的图片。',
      genFailed: '生成失败，请重试。',
      styleNames: {
        '写实摄影': '写实摄影', '动漫': '动漫', '水彩': '水彩', '素描': '素描',
        '赛博朋克': '赛博朋克', '油画': '油画', '电影感': '电影感', '仙侠': '仙侠',
        '日漫': '日漫', '复古': '复古', '科幻': '科幻', 'Q版': 'Q版', '贴纸': '贴纸',
        '游戏CG': '游戏CG', '手办': '手办', '美漫': '美漫', '废土科幻': '废土科幻',
        '3D卡通': '3D卡通', '吉卜力': '吉卜力', '国漫2D': '国漫2D', '国漫3D': '国漫3D',
      },
    },
    pricing: {
      title: '升级到 Pro',
      subtitle: '免费试用：50 次生成。Pro：无限。',
      pro: 'PRO',
      perMo: '/月',
      cancel: '随时取消',
      features: [
        '无限次生成图片',
        '全部 21 种风格',
        '所有尺寸比例',
        '文生图 + 图生图',
        '优先生成速度',
        '高清原图下载',
      ],
      subscribe: '订阅 — $9.99/月',
      redirecting: '跳转中…',
      footer: 'PayPal 安全支付。随时取消。',
      signIn: '登录',
      checkoutFailed: '结算失败',
      networkError: '网络错误，请重试。',
    },
    success: {
      loading: '正在确认订阅…',
      loadingDesc: '稍等片刻。',
      success: '已是 Pro！🎉',
      successDesc: '无限生成已解锁。开始创作吧。',
      error: '出了点问题',
      errorDesc: '如已扣款，Pro 权限稍后会自动开通。',
      goDashboard: '进入 Dashboard',
    },
  },
};

const translations = { en, zh } as const;

export function getT(locale: Locale) { return translations[locale] || translations.en; }

export function switchLocale(next: Locale) {
  document.cookie = `locale=${next};path=/;max-age=31536000`;
  window.location.reload();
}
