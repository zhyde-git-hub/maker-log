# 怎么用 Git 更新网站内容

> 面向零基础用户。三种方式，选一个就行。

---

## 先理解一件事

你的网站更新要分**两步**：

```
第 1 步：改内容  →  重新生成网页（构建）
第 2 步：上传到网站（Git 推送）
```

**为什么要「构建」**？

因为你写的是 Markdown（`.md`）文件，浏览器不认识。
构建就是把 `.md` 翻译成 `.html`，这样浏览器才能显示。

---

## ⚠️ 重要：你的电脑没装 Node.js

所以**「构建」这一步你跑不了**，需要我帮你做。

**分工**：

| 步骤 | 谁做 |
|---|---|
| 改内容（写 Markdown） | 你 |
| 重新构建（生成 HTML） | **我** —— 你说一句「帮我重新构建」就行 |
| 上传（Git 推送） | 你（双击脚本或敲命令） |

---

## 方式一：双击脚本（最省事，推荐）

### 完整流程

**① 改内容**

用记事本打开 `content\sections\` 里的 `.md` 文件，改完保存。

**② 跟我说一句**

```
帮我重新构建
```

我会跑构建命令，把 `.md` 变成 `.html`。

**③ 双击 `一键上传.bat`**

在项目文件夹里找到 `一键上传.bat`，双击。
会弹出一个黑窗口，问你要「更新说明」：
- 直接回车 → 用默认的「更新网站内容」
- 或者输入，比如 `完成第3章 Git 笔记`

然后它会自动上传到 Gitee 和 GitHub。

**④ 等 1~2 分钟**

刷新这两个网址就能看到更新：
- 在线预览：https://zhyde-git-hub.github.io/maker-log/
- Gitee 仓库：https://gitee.com/zhanghongyudegit/zhys-warehouse-1

---

## 方式二：手动敲命令（想搞清楚原理就用这个）

### 完整 4 条命令

打开项目文件夹的 cmd（地址栏输 `cmd` 回车），依次执行：

```bash
git add -A
git commit -m "这里写更新说明"
git push origin master
git push github master:main
```

### 每条命令在干什么

| 命令 | 作用 | 打比方 |
|---|---|---|
| `git add -A` | 把所有改动**装进箱子** | 把东西打包 |
| `git commit -m "说明"` | 给这次改动**贴个标签** | 在箱子上写「第3章」 |
| `git push origin master` | 上传到 **Gitee** | 寄给 Gitee |
| `git push github master:main` | 上传到 **GitHub** | 寄给 GitHub |

### 常用补充命令

```bash
git status        # 看有哪些改动还没提交
git log --oneline # 看历史提交记录
git diff          # 看具体改了什么
```

---

## 方式三：交给助手（完全不动手）

直接跟我说：

```
帮我重新构建并推送
```

我会：
1. 跑构建
2. 提交改动
3. 推送到 Gitee 和 GitHub

**唯一的问题**：推送时可能需要你输入邮箱/密码授权（Git 会弹窗），
因为沙箱环境没法替你输入凭据。

---

## 常见问题

### Q1：双击 bat 后提示没有 git？

说明 Git 没装好，或者没加入系统 PATH。
在 cmd 里执行 `git --version` 看看有没有版本号。

### Q2：提示 `not a git repository`

**原因**：cmd 打开的目录不对。

**解决**：不要直接在 `C:\Users\Zhang>` 下敲命令，
要先进入项目文件夹：

```bash
cd /d "C:\Users\Zhang\WorkBuddy\2026-10-05-14-45-54"
```

或者更简单：**在项目文件夹的地址栏输入 `cmd` 回车**，
这样打开的 cmd 直接就在项目里。

### Q3：提交时提示 `nothing to commit`

说明没有改动，或者 `git add` 忘了执行。
先跑 `git status` 看看。

### Q4：推送时卡住不动

大概率是要输入账号密码，但窗口没提示。
按 `Ctrl + C` 中断，然后重新执行推送命令。

### Q5：GitHub 推送失败，提示 `rejected` / `non-fast-forward`

说明远程有你本地没有的提交（比如你在网页上改过文件）。
**解决**：先拉取再推送

```bash
git pull github main --allow-unrelated-histories -X ours
git push github master:main
```

### Q6：更新后网站没变化

1. 确认构建执行了（html/ 里的文件时间戳是新的）
2. 确认推送成功（看到 `master -> main` 字样）
3. 等 1~2 分钟（Pages 有缓存）
4. **Ctrl + F5** 强制刷新浏览器

### Q7：多久要更新一次？

作业要求「日常使用 Git 来更新」，所以**每次写完一个板块就推一次**比较合适，
这样提交记录也能体现你的学习过程。

---

## 内容改在哪里？（速查表）

| 想改什么 | 改哪个文件 |
|---|---|
| 网站标题、副标题、作者名 | `content\site.json` |
| 10 个板块的文字内容 | `content\sections\01-profile.md` ~ `10-final.md` |
| 页面配色、字体、间距 | `assets\style.css` |
| 头像、网站图标 | `assets\avatar.svg`、`assets\favicon.svg` |
| 网站页脚文字 | `content\site.json` 里的 `footer` |

### Markdown 常用写法

```markdown
# 一级标题
## 二级标题

普通段落文字。

**加粗**、*斜体*、`代码`

- 项目一
- 项目二

1. 第一步
2. 第二步

![图片说明](assets/图片名.jpg)

[链接文字](https://example.com)
```

---

## 一句话总结

> 改完 `.md` → 跟我说「重新构建」→ 双击 `一键上传.bat` → 等 2 分钟刷新
