/**
 * 网站生成器 —— 把 content/ 里的内容转换成 public/html/ 里的网页
 *
 * 这个脚本做的事：
 *   1. 读取 content/site.json       → 网站标题、简介、板块列表
 *   2. 读取 content/sections/*.md   → 10 个课程板块的内容
 *   3. 生成 <输出目录>/html/ 目录：
 *        - html/index.html          入口页（作业要求的入口）
 *        - html/<板块>.html          每个板块一个页面
 *   4. 复制静态资源到 <输出目录>/assets/
 *   5. 生成 <输出目录>/admin/       在线编辑器后台
 *
 * 运行方式：
 *   npm run build                          本地/根路径部署（Vercel、Netlify、EdgeOne）
 *   npm run build:gh                       GitHub Pages 子路径部署（自动加 /maker-log/）
 *   node src/build.js --base=/xx/ --out=dist   自定义基路径与输出目录
 *
 * 关于 GitHub Pages：
 *   Pages 的网址是 https://<用户名>.github.io/<仓库名>/，
 *   站点根是 /<仓库名>/ 这个子路径。所以所有资源引用都必须带上前缀，
 *   否则样式和图片会 404。这里用 BASE + asset() 统一处理。
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
const ADMIN_SRC = path.join(ROOT, 'admin');

/* ---------- 命令行参数 ---------- */

/**
 * 解析命令行参数：
 *   --base=/maker-log/   部署基路径（GitHub Pages 子路径）
 *   --out=dist           输出目录（默认 public）
 */
function readArg(name) {
  const prefix = `--${name}=`;
  const hit = process.argv.find((a) => a.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

const OUT_DIR = readArg('out') || 'public';
const PUBLIC = path.resolve(ROOT, OUT_DIR);
const HTML_OUT = path.join(PUBLIC, 'html');   // ← 入口目录：/html/
const ASSETS_SRC = path.join(ROOT, 'assets'); // ← 静态资源源目录（样式、头像、图标）

/**
 * 部署基路径（base path）
 *
 * GitHub Pages 的网址形如 https://<用户名>.github.io/<仓库名>/
 * 所以站点的根是 "/<仓库名>/"，而不是 "/"。
 *
 * 优先级：--base= 参数 > BASE_PATH 环境变量 > 默认 "/"
 *   /maker-log/  → GitHub Pages（子路径部署）
 *   /            → Vercel / Netlify / EdgeOne（根路径部署）
 *
 * 注意：Git Bash（MSYS）会把 /maker-log/ 这类参数自动转换成
 *       Windows 绝对路径（如 /C:/xxx/PortableGit/maker-log/）。
 *       这里做一次还原：若检测到盘符或已转换的痕迹，只取目录名。
 */
function normalizeBase(raw) {
  let b = String(raw ?? '/').trim();
  if (!b) return '/';

  // 还原 Git Bash 的路径转换：
  //   /maker-log/  →  C:/Users/xxx/PortableGit/versions/x/maker-log/
  // 判断依据：路径中出现盘符（X:）说明被 MSYS 转换过，取最后一段目录名
  if (/^[A-Za-z]:\//.test(b) || /^\/[A-Za-z]:\//.test(b)) {
    const parts = b.split('/').filter(Boolean);      // ['C:', 'Users', ..., 'maker-log']
    b = '/' + parts[parts.length - 1] + '/';
  }

  if (!b.startsWith('/')) b = '/' + b;
  if (!b.endsWith('/')) b = b + '/';
  return b.replace(/\/{2,}/g, '/');
}

const BASE = normalizeBase(readArg('base') ?? process.env.BASE_PATH);

/** 生成绝对路径：asset('style.css') → /maker-log/assets/style.css */
function asset(p) {
  return BASE + String(p).replace(/^\/+/, '');
}

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
      return `<a${active} href="${asset('html/' + s.id + '.html')}"><span class="nav-num">${esc(s.icon || '')}</span>${esc(s.title)}</a>`;
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
  <link rel="icon" href="${asset('assets/favicon.svg')}" type="image/svg+xml">
  <link rel="stylesheet" href="${asset('assets/style.css')}">
</head>
<body>
  <header class="site-header">
    <div class="container header-inner">
      <a class="brand" href="${asset('html/index.html')}">
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
      (s) => `        <a class="section-card" href="${asset('html/' + s.id + '.html')}">
          <span class="section-num">${esc(s.icon || '')}</span>
          <span class="section-title">${esc(s.title)}</span>
          <span class="section-arrow">→</span>
        </a>`
    )
    .join('\n');

  const body = `    <div class="container">
      <section class="hero">
        <img class="avatar" src="${asset('assets/avatar.svg')}" alt="${esc(site.author || '')}">
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
      ? `<a class="post-nav-link" href="${asset('html/' + s.id + '.html')}"><span class="pn-label">${label}</span><span class="pn-title">${esc(s.title)}</span></a>`
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

      <p class="back-home"><a href="${asset('html/index.html')}">← 返回日志目录</a></p>
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

  // 每次构建前清空输出目录，避免上次的残留文件混进来
  if (fs.existsSync(PUBLIC)) fs.rmSync(PUBLIC, { recursive: true, force: true });

  ensureDir(HTML_OUT);

  // 复制静态资源：assets/ → <输出目录>/assets/
  // 样式表、头像、网站图标都在这里，缺了页面就会没样式
  if (fs.existsSync(ASSETS_SRC)) {
    copyDir(ASSETS_SRC, path.join(PUBLIC, 'assets'));
  } else {
    console.warn('⚠️  找不到 assets/ 源目录，页面将缺少样式');
  }

  // 生成入口页：/html/index.html
  write(path.join(HTML_OUT, 'index.html'), renderIndex(site, sections));

  // 生成各板块页：/html/<id>.html
  sections.forEach((s) => {
    write(path.join(HTML_OUT, `${s.id}.html`), renderSection(site, s, sections));
  });

  // 生成根目录跳转页：/index.html
  // 作用：访问站点根（如 GitHub Pages 的 /maker-log/）时自动进入 /html/index.html
  // 说明：GitHub Pages 不支持 rewrites 规则，只能用一个真实的跳转页实现
  if (BASE !== '/') {
    write(path.join(PUBLIC, 'index.html'), renderRootRedirect(site));
  }

  // 复制后台编辑器到 public/admin
  if (fs.existsSync(ADMIN_SRC)) copyDir(ADMIN_SRC, path.join(PUBLIC, 'admin'));

  // GitHub Pages 需要 .nojekyll，否则会忽略以 _ 开头的文件/目录
  write(path.join(PUBLIC, '.nojekyll'), '');

  const ms = Date.now() - t0;
  console.log(`\n✅ 网站生成成功！`);
  console.log(`   入口文件：${OUT_DIR}/html/index.html`);
  console.log(`   输出目录：${OUT_DIR}/`);
  console.log(`   部署基路径：${BASE}`);
  console.log(`   站点首页：${asset('html/index.html')}`);
  console.log(`   板块数量：${sections.length} 个`);
  console.log(`   耗时：${ms}ms\n`);
  console.log('   板块列表：');
  sections.forEach((s, i) => console.log(`     ${i + 1}. ${s.title}  →  html/${s.id}.html`));
  console.log('');
}

/**
 * 根目录跳转页
 * GitHub Pages 访问 /<仓库名>/ 时，会找根目录的 index.html
 * 而我们真正的首页在 /html/index.html，所以放一个跳转页做中转
 * （GitHub Pages 不支持 rewrites 规则，只能用真实文件实现跳转）
 */
function renderRootRedirect(site) {
  const target = asset('html/index.html');
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(site.title)}</title>
  <meta http-equiv="refresh" content="0; url=${target}">
  <link rel="canonical" href="${target}">
  <script>location.replace(${JSON.stringify(target)});</script>
  <style>
    body {
      margin: 0; min-height: 100vh;
      display: flex; align-items: center; justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
      background: #fafaf8; color: #333;
    }
    .box { text-align: center; }
    .box p { color: #888; font-size: 15px; }
    .box a { color: #4a6fa5; }
  </style>
</head>
<body>
  <div class="box">
    <p>正在进入「${esc(site.title)}」……</p>
    <p><a href="${target}">如果没有自动跳转，请点击这里</a></p>
  </div>
</body>
</html>
`;
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
