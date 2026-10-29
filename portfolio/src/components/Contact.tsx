import { useState } from 'react';
import { profile } from '../data/profile';
import { SectionHead } from './ui/SectionHead';

export function Contact() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
    } catch {
      // 老浏览器 / 非 HTTPS 环境下退化为选中文本
      const input = document.createElement('input');
      input.value = profile.email;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      input.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="section contact" id="contact">
      <div className="wrap">
        <SectionHead no="⑧" title="联系" en="Contact" center />

        <p className="mono">想聊项目、找合作，或者只是想问一句“这个怎么做的”</p>

        <button className="contact__mail" type="button" onClick={handleCopy}>
          <svg viewBox="0 0 20 16" width="18" height="15" fill="none" aria-hidden="true">
            <rect x="0.5" y="0.5" width="19" height="15" stroke="currentColor" />
            <path d="M1 1.5 10 9l9-7.5" stroke="currentColor" />
          </svg>
          {profile.email}
        </button>

        <p className={`contact__hint${copied ? ' is-copied' : ''}`}>
          {copied ? '已复制到剪贴板' : '点击复制邮箱'}
        </p>

        <div className="contact__rows">
          <span>{profile.school}</span>
          <span>{profile.location}</span>
          <span>{profile.coords}</span>
        </div>
      </div>
    </section>
  );
}
