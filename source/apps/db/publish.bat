@echo off

echo ========= update json =========
git status && git add . && git commit -m "update blogs" && hexo clean && hexo g && hexo d
pause
exit