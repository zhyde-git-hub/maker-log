# Netlify Drop 部署操作手册

> 适合：零基础、不想装软件、不想敲命令行
> 效果：把网站变成永久可访问的网址，用于交作业

---

## 为什么换到 Netlify？

之前尝试的 Vercel 有一个硬限制：**它只认 GitHub / GitLab / Bitbucket 仓库，不认 Gitee**。
你用 Gitee 导入时会报错：

> 无效请求：「gitRepository」缺少所需的属性「type」

而另一条路（Vercel 命令行）需要先安装 Node.js，步骤又多。

所以改用 **Netlify Drop** —— 一个**拖拽上传**就能部署的网站托管服务。

**优势**：
- ✅ 不用装任何软件
- ✅ 不用敲命令行
- ✅ 不用 Git 也不用登录（第一次可以不注册）
- ✅ 永久免费、网址永久有效
- ✅ 支持手机和电脑访问

**代价**：
- ⚠️ 每次更新内容后，要重新拖一次文件夹（对交作业来说完全够用）

---

## 第 1 步：准备好要上传的文件夹

我已经帮你准备好了，位置在：

```
C:\Users\Zhang\WorkBuddy\2026-10-05-14-45-54\上传包
```

这个文件夹里有 15 个文件：

```
上传包/
├── index.html            ← 根路径跳转页（打开网站自动进首页）
├── html/
│   ├── index.html        ← 网站首页（课程作业要求的入口文件）
│   ├── profile.html      ← 个人简介
│   ├── maker.html        ← 什么是创客
│   ├── git.html          ← Git
│   ├── 3d-design.html    ← 3D 设计与 3D 打印
│   ├── soldering.html    ← 电子焊接
│   ├── embedded.html     ← 嵌入式计算
│   ├── midterm.html      ← 中期创客项目
│   ├── pcb.html          ← PCB 设计
│   ├── design-thinking.html  ← 设计思维
│   └── final.html        ← 期末创新项目
└── assets/
    ├── style.css         ← 样式
    ├── avatar.svg        ← 头像
    └── favicon.svg       ← 网站图标
```

**⚠️ 注意：上传的是 `上传包` 这个文件夹的「内容」，不是文件夹本身。**

---

## 第 2 步：打开 Netlify Drop

在浏览器地址栏输入：

```
https://app.netlify.com/drop
```

回车打开。页面上会有一个很大的虚线框，写着类似 **"Drag and drop your site folder here"**。

---

## 第 3 步：拖拽上传

1. 打开文件资源管理器，进到 `C:\Users\Zhang\WorkBuddy\2026-10-05-14-45-54`
2. 找到里面的 **`上传包`** 文件夹
3. **把 `上传包` 文件夹整个拖进浏览器的虚线框里**（直接拖文件夹就行）

> 拖进去后会自动开始上传，页面显示进度。

---

## 第 4 步：拿到网址

等几秒到几十秒，上传完成，页面会变成部署成功界面，顶部会显示一个网址，形如：

```
https://random-name-123456.netlify.app
```

**点一下这个网址**，检查：
- 应该自动跳转到首页，看到「创客课程日志」标题
- 页面底部有 10 个板块的卡片
- 每个卡片点进去都能打开

如果显示正常 ✅ → 这个网址就能交作业了

---

## 第 5 步（建议）：注册账号，固定网址

不注册的话，这个站点虽然能用，但：
- 网址是随机生成的，不好记
- 以后想改内容，不好管理

**注册一下（免费）**：

1. 在 Netlify 页面点 **Sign up** 或 **Claim your site**
2. 用邮箱注册（或用 GitHub / Google 账号登录）
3. 注册后进入站点设置 → **Site configuration** → **Change site name**
4. 把名字改成好记的，比如：
   ```
   zhanghongyu-maker-log
   ```
5. 网址就变成：
   ```
   https://zhanghongyu-maker-log.netlify.app
   ```

**这个网址写入作业提交，永久有效。**

---

## 以后怎么更新内容？

### 方式 A：用在线编辑器改（推荐给日常小改）

1. 本地打开 `admin/index.html`（在项目根目录的 `public/admin/` 里有）
2. 填入 Gitee 令牌，选中板块，改文字，点保存
3. 保存后需要**重新构建 + 重新上传**：
   - 告诉我「重新构建一下」，我帮你生成新的 `上传包`
   - 你再去 Netlify 站点页面 → **Deploys** 标签 → 把新文件夹拖进去

### 方式 B：直接改 Markdown 文件

1. 打开 `content/sections/` 里的对应 `.md` 文件
2. 用记事本改文字，保存
3. 告诉我「重新构建一下」，我帮你生成新的 `上传包`
4. 再去 Netlify 拖一次

> 简单说：**改完内容 → 让我重新构建 → 你重新拖一次**。

---

## 常见问题

### Q1：拖进去没反应 / 一直转圈
- 检查是不是拖的**文件夹**（不是单个文件）
- 换个浏览器试试（推荐 Chrome 或 Edge）
- 文件总大小才几十 KB，不该卡住

### Q2：打开网址显示 404
- 说明没拖对，检查 `上传包` 根目录有没有 `index.html`
- 重新拖一次

### Q3：打开是空白页 / 样式乱了
- 检查 `assets` 文件夹有没有一起拖进去
- CSS 是在 `assets/style.css`，缺了就会样式丢失

### Q4：手机上能看吗？
- 能，Netlify 的网址在手机浏览器直接打开即可
- 页面已经做了响应式适配

### Q5：老师要求必须用 Gitee 怎么办？
- Gitee 仓库你已经推好了（`https://gitee.com/zhanghongyudegit/zhys-warehouse-1`）
- **作业里同时交两个**：Gitee 代码链接 + Netlify 访问网址
- 这样既满足「用 Git 托管」，又有个能直接打开的在线网站

---

## 一句话总结

> 打开 `https://app.netlify.com/drop` → 拖入 `上传包` 文件夹 → 拿到网址 → 完事。
