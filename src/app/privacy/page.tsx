'use client';
import Link from 'next/link';
import { useLocale } from '@/components/locale-provider';

const CONTACT = 'ljg1136588708@gmail.com';

const content = {
  zh: {
    title: '隐私政策',
    updated: '最后更新：2026年6月23日',
    back: '← 返回首页',
    intro: `AI Foto（"我们"）尊重并保护你的隐私。本政策说明我们在你使用本网站及服务时会收集哪些信息、如何使用与保护这些信息。使用本服务即表示你同意本政策。`,
    sections: [
      {
        h: '我们收集的信息',
        items: [
          '账户信息：通过第三方登录服务 Clerk 注册时提供的邮箱、姓名、头像等基础信息。',
          '生成内容：你输入的提示词、上传的参考图片，以及由此生成的图片。',
          '付款信息：订阅 Pro 时由 PayPal 处理，我们不存储你的银行卡或 PayPal 账户密码，仅记录订阅状态与订阅编号。',
          '使用数据：为保障服务正常运行所必需的基本日志（如请求时间、额度使用情况）。',
        ],
      },
      {
        h: '我们如何使用信息',
        items: [
          '提供并维护图片生成服务、管理你的免费额度与 Pro 订阅。',
          '保存你的生成历史，便于你随时查看与下载。',
          '处理订阅付款、开通或取消 Pro 权限。',
          '排查故障、防止滥用、改进服务质量。',
        ],
      },
      {
        h: '第三方服务',
        items: [
          '为提供服务，我们使用以下受信任的第三方：Clerk（账户与登录认证）、Supabase（数据库与图片存储）、PayPal（订阅付款）、以及 AI 图像生成服务提供方（处理你的提示词与参考图以生成图片）。',
          '这些服务方各自有其隐私政策，我们仅向其传输提供服务所必需的数据。',
        ],
      },
      {
        h: '数据存储与删除',
        items: [
          '你的生成图片存储在 Supabase。你可以在控制台随时删除单张历史记录，删除后对应图片会从存储中移除。',
          '如需删除账户及全部相关数据，请通过下方邮箱联系我们，我们会在合理时间内处理。',
        ],
      },
      {
        h: 'Cookie',
        items: [
          '我们使用必要的 Cookie 来维持登录状态（由 Clerk 提供）以及记住你的语言偏好。我们不使用广告追踪类 Cookie。',
        ],
      },
      {
        h: '未成年人',
        items: [
          '本服务不面向 13 岁以下儿童。如果你认为未成年人向我们提供了个人信息，请联系我们删除。',
        ],
      },
      {
        h: '政策变更',
        items: [
          '我们可能不时更新本政策，更新后会修改本页顶部的"最后更新"日期。重大变更我们会尽量显著提示。',
        ],
      },
      {
        h: '联系我们',
        items: [
          `如对本隐私政策有任何疑问，请联系：${CONTACT}`,
        ],
      },
    ],
  },
  en: {
    title: 'Privacy Policy',
    updated: 'Last updated: June 23, 2026',
    back: '← Back to home',
    intro: `AI Foto ("we", "us") respects and protects your privacy. This policy explains what information we collect when you use our website and services, and how we use and safeguard it. By using the service you agree to this policy.`,
    sections: [
      {
        h: 'Information We Collect',
        items: [
          'Account information: basic details such as email, name, and avatar provided when you sign up via our third-party auth provider, Clerk.',
          'Generated content: the prompts you enter, reference images you upload, and the images generated from them.',
          'Payment information: handled by PayPal when you subscribe to Pro. We do not store your card or PayPal credentials — only your subscription status and subscription ID.',
          'Usage data: basic logs required to operate the service (e.g. request times, quota usage).',
        ],
      },
      {
        h: 'How We Use Information',
        items: [
          'To provide and maintain the image generation service and manage your free quota and Pro subscription.',
          'To store your generation history so you can view and download it.',
          'To process subscription payments and activate or cancel Pro access.',
          'To troubleshoot, prevent abuse, and improve the service.',
        ],
      },
      {
        h: 'Third-Party Services',
        items: [
          'We rely on trusted third parties to operate: Clerk (accounts & authentication), Supabase (database & image storage), PayPal (subscription payments), and an AI image generation provider (which processes your prompts and reference images to generate results).',
          'Each provider has its own privacy policy. We only transmit the data necessary to provide the service.',
        ],
      },
      {
        h: 'Data Storage & Deletion',
        items: [
          'Your generated images are stored on Supabase. You can delete any history item from your dashboard at any time, which removes the corresponding file from storage.',
          'To delete your account and all related data, contact us at the email below and we will process it within a reasonable time.',
        ],
      },
      {
        h: 'Cookies',
        items: [
          'We use essential cookies to keep you signed in (provided by Clerk) and to remember your language preference. We do not use advertising or tracking cookies.',
        ],
      },
      {
        h: 'Children',
        items: [
          'The service is not directed to children under 13. If you believe a minor has provided us personal information, please contact us to remove it.',
        ],
      },
      {
        h: 'Changes to This Policy',
        items: [
          'We may update this policy from time to time and will revise the "Last updated" date above. We will try to prominently notify you of material changes.',
        ],
      },
      {
        h: 'Contact Us',
        items: [
          `If you have any questions about this Privacy Policy, contact us at: ${CONTACT}`,
        ],
      },
    ],
  },
};

export default function PrivacyPage() {
  const locale = useLocale();
  const t = content[locale] || content.en;

  return (
    <main className="min-h-screen">
      <nav className="flex items-center justify-between px-6 py-4 max-w-3xl mx-auto">
        <Link href="/" className="text-xl font-bold tracking-tight">AI Foto</Link>
        <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-900">{t.back}</Link>
      </nav>

      <article className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2">{t.title}</h1>
        <p className="text-sm text-zinc-400 mb-8">{t.updated}</p>
        <p className="text-zinc-600 leading-relaxed mb-8">{t.intro}</p>

        {t.sections.map((s) => (
          <section key={s.h} className="mb-8">
            <h2 className="text-lg font-semibold mb-3">{s.h}</h2>
            {s.items.map((p, i) => (
              <p key={i} className="text-zinc-600 leading-relaxed mb-2">{p}</p>
            ))}
          </section>
        ))}
      </article>
    </main>
  );
}
