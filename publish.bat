@echo off

echo start handle website
rem ע�ͣ����ô�����ɫ0-F��0 = ��ɫ,1 = ��ɫ,2 = ��ɫ,3 = ǳ��ɫ,4 = ��ɫ,5 = ��ɫ,6 = ��ɫ,7 = ��ɫ,8 = ��ɫ,9 = ����ɫ,A = ����ɫ,B = ��ǳ��ɫ,C = ����ɫ,D = ����ɫ,E = ����ɫ,F = ����ɫ��
color 8
if exist "README.md" echo README is exist

hexo clean && hexo g && hexo d

pause
rem �˳�������
exit