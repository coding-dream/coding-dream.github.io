> 说明：项目源文件在hexo分支，如果切换电脑，只需clone 项目[git@github.com:coding-dream/coding-dream.github.io.git](git@github.com:coding-dream/coding-dream.github.io.git)
到本地，然后切换到hexo分支工作即可。

## 使用步骤
1. clone 项目
2. 切换hexo分支
3. 解压node_modules.7z
4. hexo clean -> hexo g -> hexo d(hexo s)

由于hexo发布配置默认是master分支：
```
deploy: 
 type: git
 repo: git@github.com:coding-dream/coding-dream.github.io.git
 branch: master
```

所以我们基本上所有工作只须在hexo分支即可完成所有工作，全程无须切换到master。


## Hexo不渲染.md或者.html

#### 方式一
1. skip_render: test/* 单个文件夹下全部文件
2. skip_render: test/*.md 单个文件夹下指定类型文件
3. skip_render: test/** 单个文件夹下全部文件以及子目录

```
skip_render: 
  - unrender/*
  - mtv/*
  - 404.html
```

#### 方式二
不渲染 html 文件

在不想被渲染的 html 文件最上面添加如下代码
```
---
layout: false
---
```