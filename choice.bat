@echo off

choice /C CDSF /N /M "you have 4 choice : hexo clean(C), hexo deploy(D), hexo server(S), exit(F)"
rem errorlevel值需要从高到底排列（CDSF分别表示errorlevel对应的快捷键）
if errorlevel 4 goto finish
if errorlevel 3 goto server
if errorlevel 2 goto deploy
if errorlevel 1 goto clean

rem 注意bat一次只能运行一个程序命令，且执行后即退出cmd，如果希望顺序执行多个则使用 &&等符号 
:clean
hexo clean
goto finish

:server
hexo s
goto finish
 
:deploy
hexo d
goto finish
 
:finish 
echo bye bye!
pause