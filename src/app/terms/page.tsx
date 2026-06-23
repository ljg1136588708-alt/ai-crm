'use client';
import Link from 'next/link';
import { useLocale } from '@/components/locale-provider';

const CONTACT = 'ljg1136588708@gmail.com';

const content = {
  zh: {
    title: '服务条款',
    updated: '最后更新：2026年6月23日',
    back: '← 返回首页',
    intro: `欢迎使用 AI Foto。使用本网站及服务即表示你同意以下条款。请仔细阅读。`,
    sections: [
      {
        h: '1. 服务说明',
        items: [
          'AI Foto 是一项基于 AI 的图片生成服务，允许你通过文字描述或上传参考图生成图片。我们可能随时改进、调整或暂停部分功能。',
        ],
      },
      {
        h: '2. 账户',
        items: [
          '你需通过第三方登录（Clerk）注册账户。你有责任妥善保管账户，并对账户下的所有活动负责。',
          '你应确保提供的信息真实有效，且你已达到所在地区的合法使用年龄。',
        ],
      },
      {
        h: '3. 可接受的使用',
        items: [
          '你不得使用本服务生成或上传任何违法、侵权、暴力、仇恨、色情、虚假误导或侵犯他人隐私与肖像权的内容。',
          '你不得滥用服务，包括但不限于自动化批量请求、绕过额度限制、攻击或干扰服务正常运行。',
          '你上传的参考图片须为你拥有合法权利的图片。因你上传内容引发的任何纠纷由你自行承担。',
        ],
      },
      {
        h: '4. 生成内容与知识产权',
        items: [
          '在遵守本条款的前提下，你对自己生成的图片享有使用权，可用于个人或商业用途。',
          '你需对自己输入的提示词、上传的素材及生成结果的使用合法性负责。',
          'AI 生成内容可能与他人结果相似，我们不保证其唯一性，也不对其用途承担责任。',
        ],
      },
      {
        h: '5. 订阅与付款',
        items: [
          '免费用户共享有限的生成额度（当前为 12 次）。Pro 订阅提供无限生成，分月付（$15/月）与年付（$120/年）。',
          '订阅通过 PayPal 处理，并会按所选周期自动续费，直到你取消。',
          '你可随时在 PayPal 中取消订阅；取消后你仍可使用 Pro 至当前已付费周期结束。',
          '除适用法律另有规定外，已支付的费用一般不予退还。如有疑问请联系我们。',
        ],
      },
      {
        h: '6. 免责声明',
        items: [
          '本服务按"现状"提供。我们不保证服务不中断、无错误，也不保证生成结果符合你的特定预期。',
          'AI 模型由第三方提供，其可用性与质量可能发生变化。',
        ],
      },
      {
        h: '7. 责任限制',
        items: [
          '在适用法律允许的最大范围内，对于因使用或无法使用本服务而产生的任何间接、偶然或后果性损失，我们不承担责任。',
        ],
      },
      {
        h: '8. 账户终止',
        items: [
          '若你违反本条款，我们有权暂停或终止你的账户。你也可随时停止使用并联系我们删除账户。',
        ],
      },
      {
        h: '9. 条款变更',
        items: [
          '我们可能不时更新本条款，更新后会修改本页顶部的"最后更新"日期。继续使用服务即表示你接受更新后的条款。',
        ],
      },
      {
        h: '10. 联系我们',
        items: [
          `如对本服务条款有任何疑问，请联系：${CONTACT}`,
        ],
      },
    ],
  },
  en: {
    title: 'Terms of Service',
    updated: 'Last updated: June 23, 2026',
    back: '← Back to home',
    intro: `Welcome to AI Foto. By using our website and services you agree to the following terms. Please read them carefully.`,
    sections: [
      {
        h: '1. The Service',
        items: [
          'AI Foto is an AI-based image generation service that lets you create images from text prompts or uploaded reference images. We may improve, change, or discontinue features at any time.',
        ],
      },
      {
        h: '2. Accounts',
        items: [
          'You register via our third-party authentication (Clerk). You are responsible for safeguarding your account and for all activity under it.',
          'You must provide accurate information and be of legal age to use the service in your jurisdiction.',
        ],
      },
      {
        h: '3. Acceptable Use',
        items: [
          'You may not use the service to generate or upload content that is illegal, infringing, violent, hateful, sexual, deceptive, or that violates others’ privacy or likeness rights.',
          'You may not abuse the service, including automated bulk requests, bypassing quota limits, or attacking or disrupting normal operation.',
          'Reference images you upload must be ones you have the legal right to use. You are solely responsible for any disputes arising from content you upload.',
        ],
      },
      {
        h: '4. Generated Content & IP',
        items: [
          'Subject to these terms, you may use the images you generate for personal or commercial purposes.',
          'You are responsible for the legality of your prompts, uploaded materials, and use of the results.',
          'AI-generated content may resemble others’ results; we do not guarantee uniqueness and are not responsible for how it is used.',
        ],
      },
      {
        h: '5. Subscriptions & Billing',
        items: [
          'Free users share a limited generation quota (currently 12). Pro offers unlimited generations, billed monthly ($15/mo) or yearly ($120/yr).',
          'Subscriptions are processed by PayPal and auto-renew each billing period until you cancel.',
          'You may cancel anytime in PayPal; after cancellation you keep Pro until the end of the current paid period.',
          'Except where required by applicable law, paid fees are generally non-refundable. Contact us with any questions.',
        ],
      },
      {
        h: '6. Disclaimers',
        items: [
          'The service is provided "as is". We do not guarantee uninterrupted or error-free service, nor that results will meet your specific expectations.',
          'AI models are provided by third parties and their availability and quality may change.',
        ],
      },
      {
        h: '7. Limitation of Liability',
        items: [
          'To the maximum extent permitted by law, we are not liable for any indirect, incidental, or consequential damages arising from your use of or inability to use the service.',
        ],
      },
      {
        h: '8. Termination',
        items: [
          'We may suspend or terminate your account if you violate these terms. You may also stop using the service at any time and contact us to delete your account.',
        ],
      },
      {
        h: '9. Changes to These Terms',
        items: [
          'We may update these terms from time to time and will revise the "Last updated" date above. Continued use means you accept the updated terms.',
        ],
      },
      {
        h: '10. Contact Us',
        items: [
          `If you have any questions about these Terms, contact us at: ${CONTACT}`,
        ],
      },
    ],
  },
};

export default function TermsPage() {
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
