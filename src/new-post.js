/**
 * 快速新建一篇文章
 * 运行： npm run new
 * 会在 content/posts/ 里创建好一个带格式的空文章，你只要填内容
 */
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const POSTS_DIR = path.join(__dirname, '..', 'content', 'posts');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

function today() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function slugify(text) {
  return String(text).trim().toLowerCase()
    .replace(/[\s]+/g, '-')
    .replace(/[^\w\u4e00-\u9fa5-]/g, '')
    .replace(/-+/g, '-').replace(/^-|-$/g, '') || 'post';
}

async function main() {
  console.log('\n📝 新建文章\n');
  const title = (await ask('文章标题：')).trim();
  if (!title) { console.log('标题不能为空，已取消。'); rl.close(); return; }

  const dateInput = (await ask(`发布日期（直接回车用今天 ${today()}）：`)).trim() || today();
  const tagsInput = (await ask('标签（多个用逗号分隔，可留空）：')).trim();

  const tags = tagsInput ? tagsInput.split(/[,，]/).map((s) => s.trim()).filter(Boolean) : [];
  const filename = `${dateInput}-${slugify(title)}.md`;
  const filePath = path.join(POSTS_DIR, filename);

  if (fs.existsSync(filePath)) {
    console.log(`\n⚠️  文件已存在：${filename}`);
    rl.close();
    return;
  }

  const tagLine = tags.length ? `tags: [${tags.join(', ')}]\n` : '';
  const content = `---
title: ${title}
date: ${dateInput}
${tagLine}---

在这里写正文。

## 小标题示例

正文段落。

- 列表项
- 列表项

> 引用内容

**加粗**、*斜体* 都可以用。
`;

  fs.mkdirSync(POSTS_DIR, { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');

  console.log(`\n✅ 已创建：content/posts/${filename}`);
  console.log(`\n下一步：`);
  console.log(`   1. 用记事本或编辑器打开上面这个文件，把内容改成你想写的`);
  console.log(`   2. 运行  npm run build    生成网页`);
  console.log(`   3. 运行  npm run preview  本地看看效果\n`);

  rl.close();
}

main();
