/**
 * 网站生成器 —— 把 content/ 里的内容转换成 public/html/ 里的网页
 *
 * 这个脚本做的事：
 *   1. 读取 content/site.json       → 网站标题、简介、板块列表
 *   2. 读取 content/sections/*.md   → 10 个课程板块的内容
 *   3. 生成 public/html/ 目录：
 *        - html/index.html          入口页（作业要求的入口）
 *        - html/<板块>.html          每个板块一个页面
 *   4. 复制静态资源到 public/assets/
 *   5. 生成 public/admin/          在线编辑器后台
 *
 * 运行方式： npm run build
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { marked } from 'marked';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CONTENT = path.join(ROOT, 'content');
const SECTIONS_DIR = path.join(CONTENT, 'sections');
const PUBLIC = path.join(ROOT, 'public');
const HTML_OUT = path.join(PUBLIC, 'html');   // ← 入口目录：/html/
const ADMIN_SRC = path.join(ROOT, 'admin');

/* ---------- 工具函数 ---------- */

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function write(file, content) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, content, 'utf8');
}

function esc(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function slugify(text) {
  return String(text)
    .trim()
    .toLowerCase()
    .replace(/[\s]+/g, '-')
    .replace(/[^\w\u4e00-\u9fa5-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'section';
}

/* ---------- 读取数据 ---------- */

function loadSite() {
  const file = path.join(CONTENT, 'site.json');
  if (!fs.existsSync(file)) throw new Error('找不到 content/site.json');
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function loadSections() {
  if (!fs.existsSync(SECTIONS_DIR)) return [];
  const files = fs.readdirSync(SECTIONS_DIR).filter((f) => /\.md$/i.test(f));

  return files
    .map((file) => {
      const raw = fs.readFileSync(path.join(SECTIONS_DIR, file), 'utf8');
      const { data, content } = matter(raw);
      // 从文件名解析：去掉开头的数字编号前缀，剩下作为 id
      // 例如 "04-3d-design.md" → "3d-design"
      const base = file
        .replace(/\.md$/i, '')
        .replace(/^\d+[-_]/, '');
      return {
        file,
        id: data.id || slugify(base),
        title: data.title || file.replace(/\.md$/i, ''),
        order: typeof data.order === 'number' ? data.order : 999,
        html: marked.parse(content, { mangle: false, headerIds: true }),
      };
    })
    .sort((a, b) => a.order - b.order);
}

/* ---------- 页面模板 ---------- */

function layout({ site, title, description, body, activeId = '', sections = [] }) {
  // 板块导航（顶部下拉）
  const navHtml = sections
    .map((s) => {
      const active = s.id === activeId ? ' class="active"' : '';
      return `<a${active} href="${esc(s.id)}.html"><span class="nav-num">${esc(s.icon || '')}</span>${esc(s.title)}</a>`;
    })
    .join('\n          ');

  const linksHtml = (site.links || [])
    .map((l) => `<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.name)}</a>`)
    .join('\n        ');

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description || '')}">
  <link rel="icon" href="../assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="../assets/style.css">
</head>
<body>
  <header class="site-header">
    <div class="container header-inner">
      <a class="brand" href="index.html">
        <span class="brand-dot"></span>
        <span class="brand-name">${esc(site.title)}</span>
      </a>
      <button class="nav-toggle" id="navToggle" aria-label="展开菜单">
        <span></span><span></span><span></span>
      </button>
      <nav class="site-nav" id="siteNav">
          ${navHtml}
      </nav>
    </div>
  </header>

  <main class="site-main">
${body}
  </main>

  <footer class="site-footer">
    <div class="container">
      <div class="footer-links">
        ${linksHtml}
      </div>
      <p class="footer-text">${esc(site.footer || '')}</p>
    </div>
  </footer>

  <script>
    (function () {
      var t = document.getElementById('navToggle');
      var n = document.getElementById('siteNav');
      if (t && n) {
        t.addEventListener('click', function () {
          n.classList.toggle('open');
        });
        n.addEventListener('click', function (e) {
          if (e.target.tagName === 'A') n.classList.remove('open');
        });
      }
    })();
  </script>
</body>
</html>
`;
}

/* 入口页（首页）—— 列出 10 个板块 */
function renderIndex(site, sections) {
  const cards = sections
    .map(
      (s) => `        <a class="section-card" href="${esc(s.id)}.html">
          <span class="section-num">${esc(s.icon || '')}</span>
          <span class="section-title">${esc(s.title)}</span>
          <span class="section-arrow">→</span>
        </a>`
    )
    .join('\n');

  const body = `    <div class="container">
      <section class="hero">
        <img class="avatar" src="../assets/avatar.svg" alt="${esc(site.author || '')}">
        <h1 class="hero-title">${esc(site.title)}</h1>
        <p class="hero-subtitle">${esc(site.subtitle || '')}</p>
        <p class="hero-desc">${esc(site.description || '')}</p>
      </section>

      <section class="section">
        <div class="section-head">
          <h2>日志目录</h2>
          <span class="more">共 ${sections.length} 个板块</span>
        </div>
        <div class="section-grid">
${cards}
        </div>
      </section>
    </div>`;

  return layout({
    site,
    title: `${site.title} - ${site.subtitle || ''}`.trim(),
    description: site.description,
    body,
    sections,
  });
}

/* 单个板块页 */
function renderSection(site, sec, sections) {
  const idx = sections.findIndex((s) => s.id === sec.id);
  const prev = sections[idx - 1];
  const next = sections[idx + 1];

  const navLink = (s, label) =>
    s
      ? `<a class="post-nav-link" href="${esc(s.id)}.html"><span class="pn-label">${label}</span><span class="pn-title">${esc(s.title)}</span></a>`
      : '<span></span>';

  const body = `    <div class="container container-narrow">
      <article class="post">
        <header class="post-header">
          <div class="section-badge">第 ${esc(sec.icon || '')} 板块</div>
          <h1 class="post-title">${esc(sec.title)}</h1>
        </header>
        <div class="post-content">
${sec.html}
        </div>
      </article>

      <nav class="post-nav">
        ${navLink(prev, '← 上一板块')}
        ${navLink(next, '下一板块 →')}
      </nav>

      <p class="back-home"><a href="index.html">← 返回日志目录</a></p>
    </div>`;

  return layout({
    site,
    title: `${sec.title} - ${site.title}`,
    description: `${site.title} · ${sec.title}`,
    body,
    activeId: sec.id,
    sections,
  });
}

/* ---------- 主流程 ---------- */

function build() {
  const t0 = Date.now();
  const site = loadSite();
  const sections = loadSections();

  // 把 site.json 里的 icon 补到 sections 上（用顺序对应）
  sections.forEach((s, i) => {
    if (!s.icon) s.icon = (site.sections?.[i]?.icon) || String(i + 1);
  });

  ensureDir(HTML_OUT);

  // 生成入口页：/html/index.html
  write(path.join(HTML_OUT, 'index.html'), renderIndex(site, sections));

  // 生成各板块页：/html/<id>.html
  sections.forEach((s) => {
    write(path.join(HTML_OUT, `${s.id}.html`), renderSection(site, s, sections));
  });

  // 复制后台编辑器到 public/admin
  if (fs.existsSync(ADMIN_SRC)) copyDir(ADMIN_SRC, path.join(PUBLIC, 'admin'));

  const ms = Date.now() - t0;
  console.log(`\n✅ 网站生成成功！`);
  console.log(`   入口文件：public/html/index.html`);
  console.log(`   输出目录：public/html/`);
  console.log(`   板块数量：${sections.length} 个`);
  console.log(`   耗时：${ms}ms\n`);
  console.log('   板块列表：');
  sections.forEach((s, i) => console.log(`     ${i + 1}. ${s.title}  →  html/${s.id}.html`));
  console.log('');
}

function copyDir(from, to) {
  ensureDir(to);
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const src = path.join(from, entry.name);
    const dest = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(src, dest);
    else fs.copyFileSync(src, dest);
  }
}

build();
