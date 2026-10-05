# 个人博客

一个简洁的个人博客，支持在线写作后台。

## 快速开始

```bash
npm install        # 首次使用，安装依赖
npm run build      # 生成网站
npm run preview    # 本地预览
```

## 写文章

- **在线后台**：打开 `/admin/`
- **直接编辑**：在 `content/posts/` 新建 `.md` 文件
- **命令行**：`npm run new`

## 改网站信息

编辑 `content/site.json`，或用后台的「网站信息」区域。

## 详细教程

请阅读 [新手上手手册.md](./新手上手手册.md)

## 目录结构

```
content/     你写的内容（文章 + 网站信息）
public/      生成的网站（自动生成，勿手改）
admin/       在线写作后台
src/         程序代码
```
