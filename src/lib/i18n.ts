export type Locale = 'en' | 'zh';

const en = {
  common: { signIn: 'Sign In', signUp: 'Get Started Free', pricing: 'Pricing', loading: 'Loading...' },
  landing: {
    badge: '🚀 Early access — free while in beta',
    heroTitle: 'The CRM that fills itself.',
    heroSub: 'Connect Gmail. AI scans your emails, extracts contacts & deals, and drafts follow-ups. Zero data entry. No training required.',
    howItWorks: 'How it works',
    step1Title: 'Connect Gmail', step1Desc: 'One click OAuth. AI only scans business emails, skips newsletters and spam.',
    step2Title: 'AI Builds Pipeline', step2Desc: 'Claude reads your conversations, extracts contacts and deals, places them on a Kanban board.',
    step3Title: 'Get Reminders', step3Desc: 'AI notices stale conversations and drafts follow-up emails in your voice. You approve and send.',
    features: 'Features',
    feature1Title: 'Zero Data Entry', feature1Desc: 'AI extracts contacts, companies, and deals from your existing Gmail conversations.',
    feature2Title: 'Pipeline on Autopilot', feature2Desc: 'Deals automatically move through Lead → Contacted → Negotiation → Won.',
    feature3Title: 'AI Drafts, You Send', feature3Desc: 'Daily follow-up reminders with pre-written emails. Read, edit, click send.',
    vsOldGuard: 'vs The Old Guard',
    ctaTitle: 'Stop paying for 95% of features you never touch.',
    ctaSub: '$19/month. Cancel anytime. 14-day free trial.',
    footer: '© 2026 AI CRM. Built for solo founders who hate data entry.',
    tryFree: 'Try Free — No Credit Card', viewPricing: 'View Pricing',
  },
  pricing: {
    title: 'Simple, transparent pricing', sub: '14-day free trial on all plans. No credit card required.',
    monthly: 'Pro — Monthly', yearly: 'Pro — Yearly', perMonth: '/month',
    billedAnnually: '$168 billed annually', savePercent: 'Save 26%', startTrial: 'Start Free Trial',
  },
  dashboard: {
    pipeline: 'Pipeline', contacts: 'Contacts', followups: 'Follow-ups', settings: 'Settings',
    connectGmail: 'Connect Gmail', scanEmails: 'Scan Emails', loadDemo: 'Load Demo Data', scanning: 'Scanning…',
    noGmailTitle: 'Connect your Gmail to get started', noGmailDesc: 'Connect Gmail to build your pipeline automatically',
    readyScan: 'Ready to scan your inbox', settingUp: 'Setting up your account…', gmailConnected: 'Gmail connected as',
    stages: { lead: 'Lead', contacted: 'Contacted', negotiation: 'Negotiation', won: 'Won', lost: 'Lost' },
  },
  contacts: {
    title: 'Contacts', sub: 'extracted from your emails', searchPlaceholder: 'Search by name, email, or company…',
    noContacts: 'No contacts yet', back: 'Back to Contacts', lastContact: 'Last contact:',
  },
  followups: {
    title: 'Follow-ups', generate: 'Generate Reminders', generating: 'Generating…',
    allCaughtUp: 'All caught up!', draftSubject: 'AI Draft', clickToExpand: 'click to expand',
    openInGmail: 'Open in Gmail',
  },
  settings: {
    title: 'Settings', sub: 'Manage your account and integrations',
    gmailConnection: 'Gmail Connection', gmailNotConnected: 'Not connected', gmailConnected: 'Connected as',
    plan: 'Plan', freeTrial: 'Free Trial', daysRemaining: 'days remaining', upgradePro: 'Upgrade to Pro',
    account: 'Account', joined: 'Joined', connected: 'Connected',
  },
  query: { askAI: 'Ask AI about your CRM', placeholder: 'Ask anything…', send: 'Send', thinking: 'Thinking…' },
  onboarding: { title: 'Connect your Gmail', connectGmail: 'Connect Gmail', backToDashboard: 'Back to Dashboard' },
};

const zh: typeof en = {
  common: { signIn: '登录', signUp: '免费开始', pricing: '定价', loading: '加载中…' },
  landing: {
    badge: '🚀 内测中 — 免费使用',
    heroTitle: '能自动填充的 CRM',
    heroSub: '连接 Gmail，AI 自动扫描邮件、提取联系人和交易、起草跟进邮件。零录入，零学习成本。',
    howItWorks: '三步开始',
    step1Title: '连接 Gmail', step1Desc: '一键授权。AI 只扫描商务邮件，自动跳过促销。',
    step2Title: 'AI 自动建 Pipeline', step2Desc: 'Claude 读取邮件，自动提取联系人和交易，放到看板上。',
    step3Title: '收到提醒', step3Desc: 'AI 发现久未联系的人，自动起草跟进邮件。你审核后点发送。',
    features: '核心功能',
    feature1Title: '零数据录入', feature1Desc: 'AI 从你的 Gmail 中自动提取联系人、公司和交易。不用你动手。',
    feature2Title: 'Pipeline 自动驾驶', feature2Desc: '交易随进度自动在线索→已联系→谈判中→已成交之间流转。',
    feature3Title: 'AI 起草，你来发送', feature3Desc: '每日跟进提醒 + 预先写好的邮件。读一下，点发送。',
    vsOldGuard: 'vs 传统 CRM',
    ctaTitle: '别再为 95% 你用不到的功能付费了。',
    ctaSub: '$19/月。随时取消。14 天免费试用。',
    footer: '© 2026 AI CRM. 为讨厌填数据的独立创始人而建。',
    tryFree: '免费试用 — 无需绑卡', viewPricing: '查看定价',
  },
  pricing: {
    title: '简单透明的定价', sub: '所有方案 14 天免费试用，无需信用卡。',
    monthly: 'Pro — 按月', yearly: 'Pro — 按年', perMonth: '/月',
    billedAnnually: '$168 按年付费', savePercent: '节省 26%', startTrial: '免费试用',
  },
  dashboard: {
    pipeline: 'Pipeline', contacts: '联系人', followups: '跟进', settings: '设置',
    connectGmail: '连接 Gmail', scanEmails: '扫描邮件', loadDemo: '加载 Demo', scanning: '扫描中…',
    noGmailTitle: '连接 Gmail 开始使用', noGmailDesc: '连接 Gmail 自动构建你的 Pipeline',
    readyScan: '准备扫描收件箱', settingUp: '正在初始化账户…', gmailConnected: '已连接 Gmail：',
    stages: { lead: '线索', contacted: '已联系', negotiation: '谈判中', won: '已成交', lost: '已丢失' },
  },
  contacts: {
    title: '联系人', sub: '从邮件中自动提取', searchPlaceholder: '搜索姓名、邮箱或公司…',
    noContacts: '暂无联系人', back: '返回联系人', lastContact: '最后联系：',
  },
  followups: {
    title: '跟进提醒', generate: '生成提醒', generating: '生成中…',
    allCaughtUp: '全部搞定！', draftSubject: 'AI 草稿', clickToExpand: '点击展开', openInGmail: '在 Gmail 中打开',
  },
  settings: {
    title: '设置', sub: '管理你的账户和集成',
    gmailConnection: 'Gmail 连接', gmailNotConnected: '未连接', gmailConnected: '已连接',
    plan: '套餐', freeTrial: '免费试用', daysRemaining: '天剩余', upgradePro: '升级到 Pro',
    account: '账户', joined: '注册于', connected: '已连接',
  },
  query: { askAI: '向 AI 提问', placeholder: '问任何问题…', send: '发送', thinking: '思考中…' },
  onboarding: { title: '连接你的 Gmail', connectGmail: '连接 Gmail', backToDashboard: '返回 Dashboard' },
};

const translations = { en, zh } as const;

export function getT(locale: Locale) { return translations[locale] || translations.en; }

export function detectLocale(): Locale {
  if (typeof document === 'undefined') return 'en';
  return document.cookie.includes('locale=zh') ? 'zh' : 'en';
}

export function switchLocale(next: Locale) {
  document.cookie = `locale=${next};path=/;max-age=31536000`;
  window.location.reload();
}
