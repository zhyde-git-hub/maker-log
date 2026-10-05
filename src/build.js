/**
 * 网站生成器 —— 把 content/ 里的文章转换成 public/ 里的网页
 *
 * 你不需要看懂这个文件的代码，只要知道它干了什么：
 *   1. 读取 content/site.json  → 网站的标题、简介、头像等
 *   2. 读取 content/posts/*.md → 每一篇文章
 *   3. 生成 public/index.html（首页）、posts.html（列表）、每篇文章的详情页
 *   4. 生成 public/admin/（在线编辑器后台）
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
const POSTS_DIR = path.join(CONTENT, 'posts');
const PUBLIC = path.join(ROOT, 'public');
const ADMIN_SRC = path.join(ROOT, 'admin');

/* ---------- 工具函数 ---------- */

/** 递归创建目录 */
function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

/** 写文件，自动建父目录 */
function write(file, content) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, content, 'utf8');
}

/** HTML 转义，防止文章标题里的特殊字符破坏页面 */
function esc(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** 把日期格式化成 2026年10月5日 */
function formatDate(d) {
  const date = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(date.getTime())) return esc(String(d));
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

/** 生成 URL 友好的短名（中文会被保留，空格转横线） */
function slugify(text) {
  return String(text)
    .trim()
    .toLowerCase()
    .replace(/[\s]+/g, '-')
    .replace(/[^\w\u4e00-\u9fa5-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'post';
}

/** 从正文里取一段纯文本做摘要 */
function excerpt(md, len = 80) {
  const plain = String(md)
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*`_~-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return plain.length > len ? plain.slice(0, len) + '…' : plain;
}

/* ---------- 读取数据 ---------- */

function loadSite() {
  const file = path.join(CONTENT, 'site.json');
  if (!fs.existsSync(file)) throw new Error('找不到 content/site.json，网站信息配置文件丢失了');
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function loadPosts() {
  if (!fs.existsSync(POSTS_DIR)) return [];
  const files = fs.readdirSync(POSTS_DIR).filter((f) => /\.md$/i.test(f));

  return files
    .map((file) => {
      const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf8');
      const { data, content } = matter(raw);
      const title = data.title || file.replace(/\.md$/i, '');
      const date = data.date ? new Date(data.date) : new Date(fs.statSync(path.join(POSTS_DIR, file)).mtime);
      return {
        file,
        slug: data.slug || slugify(file.replace(/\.md$/i, '')),
        title,
        date: Number.isNaN(date.getTime()) ? new Date() : date,
        tags: Array.isArray(data.tags) ? data.tags : (data.tags ? [data.tags] : []),
        draft: data.draft === true,
        cover: data.cover || '',
        excerpt: data.excerpt || excerpt(content),
        html: marked.parse(content, { mangle: false, headerIds: true }),
      };
    })
    .filter((p) => !p.draft)
    .sort((a, b) => b.date - a.date); // 按发布时间倒序
}

/* ---------- 页面模板 ---------- */

function layout({ site, title, description, body, activeNav = '', root = '' }) {
  const navHtml = (site.nav || [])
    .map((item) => {
      const isActive = item.name === activeNav ? ' class="active"' : '';
      return `<a href="${root}${esc(item.url)}"${isActive}>${esc(item.name)}</a>`;
    })
    .join('\n        ');

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
  <link rel="icon" href="${root}assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="${root}assets/style.css">
</head>
<body>
  <header class="site-header">
    <div class="container header-inner">
      <a class="brand" href="${root}index.html">
        <span class="brand-dot"></span>
        <span class="brand-name">${esc(site.title)}</span>
      </a>
      <nav class="site-nav">
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
</body>
</html>
`;
}

/* 首页 */
function renderHome(site, posts) {
  const latest = posts.slice(0, 6);
  const cardHtml = latest.length
    ? latest.map((p) => postCard(p)).join('\n')
    : '<p class="empty">还没有文章。去 admin 后台写第一篇吧。</p>';

  const body = `    <div class="container">
      <section class="hero">
        <img class="avatar" src="${esc(site.avatar)}" alt="${esc(site.author || '')}">
        <h1 class="hero-title">${esc(site.title)}</h1>
        <p class="hero-subtitle">${esc(site.subtitle || '')}</p>
        <p class="hero-desc">${esc(site.description || '')}</p>
      </section>

      <section class="section">
        <div class="section-head">
          <h2>最新文章</h2>
          <a class="more" href="posts.html">全部文章 →</a>
        </div>
        <div class="post-list">
${cardHtml}
        </div>
      </section>
    </div>`;

  return layout({
    site,
    title: `${site.title} - ${site.subtitle || ''}`.trim(),
    description: site.description,
    body,
    activeNav: '首页',
  });
}

/* 文章列表页 */
function renderPosts(site, posts) {
  const cardHtml = posts.length
    ? posts.map((p) => postCard(p)).join('\n')
    : '<p class="empty">还没有文章。</p>';

  const body = `    <div class="container">
      <section class="page-head">
        <h1>全部文章</h1>
        <p class="page-sub">共 ${posts.length} 篇</p>
      </section>
      <div class="post-list">
${cardHtml}
      </div>
    </div>`;

  return layout({
    site,
    title: `全部文章 - ${site.title}`,
    description: `浏览 ${site.title} 的全部文章`,
    body,
    activeNav: '全部文章',
  });
}

/* 文章卡片（首页和列表页共用） */
function postCard(p) {
  const tags = p.tags.length
    ? `<span class="tags">${p.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</span>`
    : '';
  return `          <article class="post-card">
            <a class="post-card-link" href="posts/${esc(p.slug)}.html">
              <time class="post-date">${formatDate(p.date)}</time>
              <h3 class="post-card-title">${esc(p.title)}</h3>
              <p class="post-card-excerpt">${esc(p.excerpt)}</p>
              ${tags}
            </a>
          </article>`;
}

/* 文章详情页 */
function renderPost(site, post, allPosts) {
  const idx = allPosts.findIndex((p) => p.slug === post.slug);
  const prev = allPosts[idx + 1]; // 更早的文章
  const next = allPosts[idx - 1]; // 更新的文章

  const navLink = (p, label) =>
    p ? `<a class="post-nav-link" href="${esc(p.slug)}.html"><span class="pn-label">${label}</span><span class="pn-title">${esc(p.title)}</span></a>` : '<span></span>';

  const tags = post.tags.length
    ? `<div class="post-tags">${post.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div>`
    : '';

  const body = `    <div class="container container-narrow">
      <article class="post">
        <header class="post-header">
          <h1 class="post-title">${esc(post.title)}</h1>
          <div class="post-meta">
            <time>${formatDate(post.date)}</time>
          </div>
          ${tags}
        </header>
        <div class="post-content">
${post.html}
        </div>
      </article>

      <nav class="post-nav">
        ${navLink(prev, '← 上一篇')}
        ${navLink(next, '下一篇 →')}
      </nav>

      <p class="back-home"><a href="../posts.html">← 返回文章列表</a></p>
    </div>`;

  return layout({
    site,
    title: `${post.title} - ${site.title}`,
    description: post.excerpt,
    body,
    activeNav: '全部文章',
    root: '../',
  });
}

/* 关于我 */
function renderAbout(site) {
  const paragraphs = String(site.about || '')
    .split(/\n\s*\n/)
    .map((p) => `<p>${esc(p).replace(/\n/g, '<br>')}</p>`)
    .join('\n        ');

  const linksHtml = (site.links || [])
    .map((l) => `<a class="about-link" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.name)}</a>`)
    .join('\n        ');

  const body = `    <div class="container container-narrow">
      <section class="about">
        <img class="avatar avatar-lg" src="${esc(site.avatar)}" alt="${esc(site.author || '')}">
        <h1>${esc(site.author || site.title)}</h1>
        <p class="about-sub">${esc(site.subtitle || '')}</p>
        <div class="about-body">
        ${paragraphs}
        </div>
        <div class="about-links">
        ${linksHtml}
        </div>
      </section>
    </div>`;

  return layout({
    site,
    title: `关于我 - ${site.title}`,
    description: `关于 ${site.author || site.title}`,
    body,
    activeNav: '关于我',
  });
}

/* ---------- 主流程 ---------- */

function build() {
  const t0 = Date.now();
  const site = loadSite();
  const posts = loadPosts();

  // 清空旧产出（保留 assets 之外的都重建）
  ensureDir(PUBLIC);

  write(path.join(PUBLIC, 'index.html'), renderHome(site, posts));
  write(path.join(PUBLIC, 'posts.html'), renderPosts(site, posts));
  write(path.join(PUBLIC, 'about.html'), renderAbout(site));
  posts.forEach((p) => {
    write(path.join(PUBLIC, 'posts', `${p.slug}.html`), renderPost(site, p, posts));
  });

  // 复制后台编辑器到 public/admin
  if (fs.existsSync(ADMIN_SRC)) {
    copyDir(ADMIN_SRC, path.join(PUBLIC, 'admin'));
  }

  const ms = Date.now() - t0;
  console.log(`\n✅ 网站生成成功！`);
  console.log(`   输出目录：public/`);
  console.log(`   文章数量：${posts.length} 篇`);
  console.log(`   耗时：${ms}ms\n`);
  if (posts.length) {
    console.log('   文章列表（按时间倒序）：');
    posts.forEach((p, i) => console.log(`     ${i + 1}. ${p.title}  (${formatDate(p.date)})`));
    console.log('');
  }
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
