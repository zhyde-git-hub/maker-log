# GitHub Pages 部署操作手册

> 目标：把「创客课程日志」部署到 GitHub Pages，得到一个国内可访问的网址
> 最终网址：`https://zhyde-git-hub.github.io/maker-log/`

---

## 一、GitHub Pages 的原理（先看懂这个，后面就不迷糊）

GitHub Pages 是 GitHub 提供的免费静态网站托管。它的网址**固定是这个格式**：

```
https://<你的用户名>.github.io/<仓库名>/
```

你的情况就是：

```
https://zhyde-git-hub.github.io/maker-log/
```

⚠️ **关键点**：注意网址末尾的 **`/maker-log/`** —— 这叫「子路径」。

这就是为什么做了这些改造：

| 问题 | 原来的写法 | 改造后的写法 |
|---|---|---|
| 样式表引用 | `../assets/style.css` | `/maker-log/assets/style.css` |
| 板块链接 | `profile.html` | `/maker-log/html/profile.html` |
| 打开站点根 | 会 404（根目录没 index） | 自动跳到 `/maker-log/html/index.html` |

**改造的核心**：所有资源路径都加上 `/maker-log/` 前缀，这样无论页面在哪个子目录，引用都不会错位。

---

## 二、关于「刷新 404」问题的说明

**你的项目不需要处理这个问题**，原因：

- 这个网站是**纯静态多页面网站**，不是单页应用（SPA）
- 每个板块都有真实的 `.html` 文件：`profile.html`、`git.html`、`3d-design.html`……
- 点进去就是打开一个真实存在的文件，**不存在「路由刷新 404」**

> 「SPA 刷新 404」是 React/Vue 这类单页应用才有的问题（它们只有一个 `index.html`，
> 靠 JS 动态换内容，刷新后服务器找不到对应路径就 404）。
> 你的项目每个页面都是真文件，天然免疫。

**唯一一个「跳转」设计**：访问站点根 `/maker-log/` 时，通过 `index.html` 跳转页
自动进入 `/html/index.html`。这一步是为了符合作业要求的入口文件路径。

---

## 三、需要修改或新增的文件（已完成，仅供了解）

### 1. `src/build.js` —— 构建脚本（已改造）

新增了三个能力：

```js
// ① 支持 --base 参数指定部署基路径
//    node src/build.js --base=/maker-log/
// ② 支持 --out 参数指定输出目录
//    node src/build.js --out=docs
// ③ 所有资源引用统一走 asset() 函数，自动加前缀
function asset(p) {
  return BASE + String(p).replace(/^\/+/, '');
}
// asset('assets/style.css') → /maker-log/assets/style.css
```

还新增了两个产物：

- **根目录跳转页** `index.html` —— 访问站点根时自动进首页
- **`.nojekyll` 空文件** —— 告诉 GitHub 不要用 Jekyll 处理，否则会忽略某些文件

### 2. `package.json` —— 新增构建命令

```json
"scripts": {
  "build": "node src/build.js",
  "build:gh": "node src/build.js --base=/maker-log/ --out=docs",
  "preview": "node src/serve.js"
}
```

- `npm run build` → 输出到 `public/`，根路径模式（Vercel / Netlify / EdgeOne 用）
- `npm run build:gh` → 输出到 `docs/`，GitHub Pages 子路径模式

### 3. `assets/` 目录 —— 移到项目根（重要修复）

**发现并修复了一个 bug**：原来静态资源（style.css、头像、图标）直接放在
`public/assets/`，但构建脚本根本不会复制它们。结果是：

- Vercel 上能用 → 因为 `public/` 被手工提交进了 Git
- 一旦输出到别的目录（如 `docs/`）→ **样式全丢**

**修复后**：资源源文件移到项目根的 `assets/`，构建时统一复制到输出目录。

### 4. `.github/workflows/deploy-pages.yml` —— 自动化部署（可选）

这个文件让 GitHub 在你 push 代码后**自动构建并部署**，不用手动跑命令。

用的命令是：
```bash
node src/build.js --base=/${{ github.event.repository.name }}/ --out=dist
```
注意 `${{ github.event.repository.name }}` 会自动填入 `maker-log`，
所以如果以后改仓库名，这里不用改。

### 5. `.gitignore` —— 更新忽略规则

```
public/     ← 构建产物，不进仓库
dist/       ← Actions 的构建产物，不进仓库
# 注意：docs/ 不忽略！因为 GitHub Pages 要读它
```

---

## 四、部署时分支与目录的选择（重点）

GitHub Pages 有两种部署方式，**二选一**：

### 方式 A：部署 `docs/` 目录（推荐，最简单）

| 配置项 | 选什么 |
|---|---|
| **Source**（来源） | `Deploy from a branch`（从分支部署） |
| **Branch**（分支） | `main` |
| **Folder**（文件夹） | **`/docs`** ← 选这个 |

**为什么推荐**：
- 不用管 Actions，设置完就生效
- 构建结果已在本地生成好并提交，GitHub 只负责托管
- 出问题好排查

### 方式 B：GitHub Actions 自动构建

| 配置项 | 选什么 |
|---|---|
| **Source** | `GitHub Actions` |

- 优点：push 后自动构建，永远是最新的
- 缺点：Actions 在国内时快时慢；对新手来说报错不好排查

> 💡 **建议先用方式 A 把网站跑起来**，确认能访问了，再考虑要不要切到方式 B。

---

## 五、具体操作步骤

### 第 1 步：确认代码已推送

在项目文件夹打开 cmd，执行：

```
git push github master:main
```

看到 `main -> main` 或 `* [new branch]` 就是成功。

> 如果卡住不弹窗，先执行这个（清掉旧凭据，重新弹窗）：
> ```
> git credential-manager erase
> ```
> 然后再 `git push github master:master`，会弹出浏览器登录窗，点同意即可。

### 第 2 步：打开仓库的 Pages 设置

浏览器打开：

```
https://github.com/zhyde-git-hub/maker-log/settings/pages
```

### 第 3 步：配置 Pages

在 **Build and deployment** 区域：

1. **Source** 下拉框 → 选 **`Deploy from a branch`**
2. **Branch** 下拉框 → 选 **`main`**
3. 右边的文件夹下拉框 → 选 **`/docs`**
4. 点 **Save** 按钮

### 第 4 步：等 1~2 分钟

保存后页面顶部会出现提示：

> Your site is live at https://zhyde-git-hub.github.io/maker-log/

**等 1~2 分钟**（首次部署需要时间），然后点这个网址访问。

### 第 5 步：验证

打开网址后检查：

- [ ] 自动跳转后看到「创客课程日志」标题
- [ ] 页面**有样式**（白底、卡片网格、蓝色主题），不是光秃秃的黑字
- [ ] 看到 10 个板块卡片
- [ ] 点任意卡片能打开板块页
- [ ] 用手机打开同一个网址，布局正常

**如果样式丢了**（页面是纯黑字、没有排版）：
说明 `/maker-log/assets/style.css` 没加载到，检查：
1. 仓库里 `docs/assets/style.css` 存在吗？
2. 是不是 push 时漏了文件？

---

## 六、以后更新内容的流程

改完内容后，**两条命令**：

```bash
npm run build:gh
git add -A
git commit -m "更新内容"
git push github master:main
```

推上去后 GitHub Pages **会自动更新**（等 1~2 分钟）。

> 如果你用的是本地 WorkBuddy，也可以直接说「帮我重新构建并推送」，我来跑。

---

## 七、常见问题

### Q1：网址打开是 404

**原因**：Pages 还没构建完，或者分支/目录选错了。

**解决**：
1. 等 2~3 分钟再刷新
2. 回 `settings/pages` 检查：分支选了 `main`、文件夹选了 `/docs`
3. 看仓库里 `docs/index.html` 和 `docs/html/index.html` 是否都存在

### Q2：页面打开了，但没有样式（白底黑字）

**原因**：`assets/style.css` 没加载到。

**排查**：
1. 浏览器按 F12 打开控制台，看 Console 里有没有红色的 404
2. 检查仓库里 `docs/assets/style.css` 是否存在
3. 确认路径是 `/maker-log/assets/style.css` 而不是 `/assets/style.css`

### Q3：点板块卡片跳转后 404

**原因**：链接路径不对。

**排查**：在浏览器 F12 的 Network 面板看跳转到了什么地址，
应该是 `https://zhyde-git-hub.github.io/maker-log/html/xxx.html`。

### Q4：国内访问速度慢 / 偶尔打不开

GitHub Pages 在国内访问**本来就不稳定**，这是网络环境问题。

**缓解办法**：
- 多刷新几次（Pages 走 CDN，有时第一次慢第二次快）
- 用手机流量试试（不同运营商结果可能不同）
- 如果长期打不开，可以考虑**同时保留另一个平台的部署**作为备用：
  - Vercel：`https://maker-log-omega.vercel.app`（已配好，但国内也被拦）
  - Netlify Drop：拖 `上传包` 文件夹（临时可用）

### Q5：改了内容，网站没更新

1. 确认执行了 `npm run build:gh`（重新生成了 docs/）
2. 确认 `git add -A` 把 `docs/` 的改动加进去了
3. 确认 push 成功
4. 等 1~2 分钟
5. 强制刷新页面：**Ctrl + F5**

### Q6：为什么作业要求的 `/html/index.html` 在？

因为构建脚本就是按这个结构输出的：

```
docs/
├── index.html          ← 根跳转页（自动跳到 /html/index.html）
├── .nojekyll
├── assets/             ← 样式、头像、图标
│   ├── style.css
│   ├── avatar.svg
│   └── favicon.svg
├── html/               ← ★ 作业要求的入口目录
│   ├── index.html      ← ★ 入口文件（课程作业要求）
│   ├── profile.html
│   ├── maker.html
│   ├── git.html
│   ├── 3d-design.html
│   ├── soldering.html
│   ├── embedded.html
│   ├── midterm.html
│   ├── pcb.html
│   ├── design-thinking.html
│   └── final.html
└── admin/index.html    ← 在线编辑器（可选，不上传也行）
```

所以作业要求的入口文件位置是：

```
https://zhyde-git-hub.github.io/maker-log/html/index.html
```

---

## 八、一句话总结

> 运行 `npm run build:gh` → `git push` → 在仓库设置里选
> **分支 `main` + 目录 `/docs`** → 等 2 分钟 → 访问
> `https://zhyde-git-hub.github.io/maker-log/`
