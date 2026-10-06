# 创客课程日志

「创客」课程的日志网站，共 **10 个板块**，每个板块一个独立网页。
**入口文件：`/html/index.html`**

在线预览：https://zhyde-git-hub.github.io/maker-log/

---

## 板块一览

| 序 | 板块 | 页面文件 |
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

---

## 目录结构

```
html/                 10 个板块页 + 入口页 index.html
assets/               样式表、头像、图标、图片
index.html            根目录跳转页（打开站点会自动进入 html/index.html）
如何修改网站内容.md    ★ 日常更新内容看这份
文档/                  部署过程记录（历史资料）
```

---

## 怎么更新内容

**直接在 Gitee 网页上改，不需要任何工具或命令。**

具体步骤见 **《如何修改网站内容.md》**，一句话版本：

> 打开 `html/` 里对应板块的文件 → 点「编辑」→ 在标注的「可编辑区域」里改中文文字 → 点「提交」。

---

## 早期文件说明（现在用不到，可以忽略）

以下目录是网站最初的「Markdown 生成网页」方案留下的，现在内容已直接固化在 `html/` 里，
**不要修改它们，也不要再运行里面的脚本**（会覆盖手改的网页内容）：

```
content/       Markdown 内容源 + site.json
src/           构建脚本（build.js / serve.js）
admin/         网页版写作后台
package.json   依赖与脚本
```
