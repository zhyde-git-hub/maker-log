# Vercel 部署操作手册

> 为什么用 Vercel：**免备案、永久免费、能自动部署**。
> 每次写完内容，只要推送代码，网站自动更新，不用手动拖文件。

---

## 部署前：先把代码推送上去

在项目文件夹打开命令行，运行：

```
git push
```

> 如果提示输入密码，粘贴你的 Gitee 私人令牌。

---

## 第 1 步：注册 Vercel

1. 打开 **https://vercel.com**
2. 点 **Sign Up**（注册）
3. 选 **Continue with Email**（用邮箱注册）
   - ⚠️ **不要用 GitHub 登录**（你还没 GitHub 账号）
4. 填邮箱、设密码，去邮箱点验证链接

> 免费计划完全够用，**不需要绑信用卡**。

---

## 第 2 步：新建项目

1. 登录后进控制台，点 **Add New...** → **Project**
2. 页面会让你选导入方式，找到并点：
   **Import Third-Party Git Repository**
   （因为 Vercel 默认只列 GitHub，Gitee 要走这个入口）
3. 在输入框里粘贴你的仓库地址：

```
https://gitee.com/zhanghongyudegit/zhys-warehouse-1
```

4. 点 **Continue**

---

## 第 3 步：配置构建（关键）

Vercel 会自动读取项目里的 `vercel.json`，**大部分配置已经帮你写好了**。但请核对这几项：

| 配置项 | 应该填 |
|--------|--------|
| **Framework Preset** | `Other` |
| **Build Command** | `npm run build` |
| **Output Directory** | `public` |
| **Install Command** | `npm install` |

> 💡 如果页面上这些字段是空的，就手动填上。如果是灰的（表示已从 vercel.json 读取），就不用管。

---

## 第 4 步：点 Deploy

点 **Deploy** 按钮，等 1-2 分钟。

**成功后会给你一个网址**，形如：

```
https://zhys-warehouse-1.vercel.app
```

---

## 第 5 步：访问网站

打开网址后，**加 `/html/index.html`**：

```
https://zhys-warehouse-1.vercel.app/html/index.html
```

> 💡 我已经在 `vercel.json` 里配了重定向，直接访问根网址 `https://zhys-warehouse-1.vercel.app`
> 应该也会自动跳到入口页。两个都试试。

**应该看到：**
- 标题「创客课程日志」
- 十个板块的目录
- 点进去能看到各板块内容

---

## 以后怎么更新（超简单）

配好自动部署后，更新只要两步：

```
1. 改内容（用后台 /admin/，或直接改 content/sections/ 里的文件）
2. 运行 npm run build，然后 git push
```

**推送完等 1 分钟，网站自动更新。** 不用再拖文件了。

> ⚠️ 注意：Vercel 会自动跑 `npm run build`，所以理论上你**只需要推送源码**，
> 不必手动 build。但本地 build 一次能提前验证有没有错。

---

## 常见问题

### Q：找不到「Import Third-Party Git Repository」？

有些版本叫 **"Import Git Repository"** 或直接有 **"Git URL"** 输入框。
仔细找找有没有粘贴 URL 的地方，都能用。

### Q：部署失败，报 build 错误？

点开失败的部署，看 **Build Logs** 里的红色报错，截图发我。

### Q：打开网址是 404？

试试加上 `/html/index.html`。如果加了能打开，说明重定向没生效，
告诉我，我改 `vercel.json`。

### Q：国内访问慢怎么办？

Vercel 节点在境外，国内访问速度中等。
如果以后要求更快，可以考虑绑定自己的域名 + 国内 CDN（需要备案）。

### Q：EdgeOne 那边怎么办？

不用管它。Vercel 和 EdgeOne 互不影响。
（EdgeOne 的默认域名只有 3 小时预览有效期，不适合长期使用。）

---

## 附：项目关键信息

| 项目 | 值 |
|------|-----|
| Gitee 仓库 | `https://gitee.com/zhanghongyudegit/zhys-warehouse-1` |
| 入口文件 | `html/index.html` |
| 构建命令 | `npm run build` |
| 输出目录 | `public` |
| 内容源文件 | `content/sections/*.md` |
| 网站信息 | `content/site.json` |
