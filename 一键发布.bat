@echo off
chcp 65001 >nul
title 一键发布网站
cd /d "%~dp0"

echo.
echo ========================================
echo         一键发布网站到 Gitee
echo ========================================
echo.

echo [1/4] 正在生成网站...
call npm run build
if errorlevel 1 (
  echo.
  echo 生成失败，请检查是否已运行过 npm install
  pause
  exit /b 1
)

echo.
echo [2/4] 正在记录改动...
git add .

echo.
echo [3/4] 正在提交...
set /p msg=请输入这次更新说明（直接回车用默认）: 
if "%msg%"=="" set msg=更新网站内容
git commit -m "%msg%"

echo.
echo [4/4] 正在上传到 Gitee...
git push

echo.
echo ========================================
echo   完成！
echo.
echo   请到 Gitee 仓库页面点一下：
echo     服务 -^> Gitee Pages -^> 更新
echo   等 1-2 分钟后刷新网站即可看到最新内容
echo ========================================
echo.
pause
