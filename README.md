# 创客课程日志 · 使用说明

一个符合课程要求的个人日志网站，入口文件为 `/html/index.html`。

## 快速开始

```bash
npm install        # 首次使用，安装依赖
npm run build      # 生成网站
npm run preview    # 本地预览
```

## 网站结构

**入口文件（作业要求）**：`public/html/index.html`

十个板块，每个对应一个页面：

| 序 | 板块 | 页面 |
|:--:|------|------|
| 1 | 个人简介 | `html/profile.html` |
| 2 | 什么是创客 | `html/maker.html` |
| 3 | Git | `html/git.html` |
| 4 | 3D 设计与 3D 打印 | `html/3d-design.html` |
| 5 | 电子焊接 | `html/soldering.html` |
| 6 | 嵌入式计算 | `html/embedded.html` |
| 7 | 中期创客项目 | `html/midterm.html` |
| 8 | PCB 设计 | `html/pcb.html` |
| 9 | 设计思维 | `html/design-thinking.html` |
| 10 | 期末创新项目 | `html/final.html` |

## 怎么填内容

### 方式一：写作后台（推荐）

打开 `你的网址/admin/`，连接 Gitee 仓库后，点右侧板块直接编辑。

### 方式二：直接改文件

编辑 `content/sections/` 里的 `.md` 文件：

- `01-profile.md` → 个人简介
- `02-maker.md` → 什么是创客
- …依此类推

文件名开头的数字决定顺序。

### 插入图片

1. 把图片放进 `public/assets/` 目录
2. 在 Markdown 里写：`![说明文字](../assets/图片名.jpg)`

## 改网站信息

编辑 `content/site.json`（或用后台的「网站信息」区域）：

- 网站标题、副标题、简介
- 十个板块的名称（`sections` 数组）

## 发布更新

**每次更新三步：**

```bash
npm run build
```

然后把 `public` 文件夹重新上传到 EdgeOne Pages。

## 目录结构

```
content/
  site.json          网站信息 + 十个板块定义
  sections/          十个板块的内容（.md 文件）
public/
  html/              ← 网站成品（入口在这里）
  assets/            样式、头像、图标、图片
  admin/             写作后台
src/
  build.js           构建脚本
  serve.js           本地预览
admin/
  index.html         后台源码
```

## 详细文档

- [新手上手手册.md](./新手上手手册.md)
- [腾讯云部署操作手册.md](./腾讯云部署操作手册.md)
