@echo off

echo start handle website
rem 注释：设置窗体颜色0-F（0 = 黑色,1 = 蓝色,2 = 绿色,3 = 浅绿色,4 = 红色,5 = 紫色,6 = 黄色,7 = 白色,8 = 灰色,9 = 淡蓝色,A = 淡绿色,B = 淡浅绿色,C = 淡红色,D = 淡紫色,E = 淡黄色,F = 亮白色）
color 8
if exist "README.md" echo README is exist

hexo clean && hexo g && hexo d

pause
rem 退出命令行
exit