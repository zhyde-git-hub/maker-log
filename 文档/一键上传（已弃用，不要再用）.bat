@echo off
chcp 65001 >nul
title 一键上传课程日志
cd /d "%~dp0"

echo.
echo ========================================
echo      一键上传课程日志网站
echo ========================================
echo.
echo  说明：
echo    这个脚本负责把改动上传到 Gitee 和 GitHub。
echo    如果改了文字/图片内容，请先在对话框里
echo    跟助手说"帮我重新构建"，再运行本脚本。
echo.

echo [1/3] 正在记录改动...
git add -A

echo.
echo [2/3] 正在提交...
set /p msg=请输入这次更新说明（直接回车用默认）:
if "%msg%"=="" set msg=更新网站内容
git commit -m "%msg%"
if errorlevel 1 (
  echo.
  echo  没有需要提交的改动，继续上传步骤。
)

echo.
echo [3/3] 正在上传...
echo   -^> 上传到 Gitee...
git push origin master
echo.
echo   -^> 上传到 GitHub...
git push github master:main

echo.
echo ========================================
echo   完成！
echo.
echo   稍等 1-2 分钟，刷新下面地址即可看到：
echo.
echo   在线预览（GitHub Pages）：
echo     https://zhyde-git-hub.github.io/maker-log/
echo.
echo   作业提交用（Gitee 仓库）：
echo     https://gitee.com/zhanghongyudegit/zhys-warehouse-1
echo ========================================
echo.
pause
