---
title: Sublime-Text-超速构建Android开源项目
date: 2017.11.04 00:19
tags: 
  - 源码分析
  - Sublime-Text
  - 开源项目
  - gradle
categories:
  - Android
---

>简书 [编程之乐](http://www.jianshu.com/u/79a88a044955)
转载请注明原创出处！

![Paste_Image.png](http://upload-images.jianshu.io/upload_images/1281543-e7f11ab2d9b704f8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

gradle分为两种，一种是构建工具，一种是Android Studio的插件。
我们经常看到的这种
如：
```java
buildscript {
    repositories {
        jcenter()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:2.3.3'
        classpath 'com.getkeepsafe.dexcount:dexcount-gradle-plugin:0.8.1'
        // NOTE: Do not place your application dependencies here; they belong
        // in the individual module build.gradle files
    }
}
```
这里面的是gradle的插件，是和Android相关平台相关的，不算是gradle的一部分。理解为maven仓库的某个类库。一般是在jcenter更新：https://jcenter.bintray.com/com/android/tools/build/gradle/

>总结：
>所以一般我们用2种方式编译gradle
>1. 使用path配置的（很少用，配置麻烦）
>2. 没有使用path配置的照样可以运行，window下一般使用gradlew.bat运行gradle的，其实我们潜意识下很多项目都是使用此种，也就是bat（wrapper形式）


![Paste_Image.png](http://upload-images.jianshu.io/upload_images/1281543-b5cffca9a5b2348a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

我们发现使用过的gradle版本（wrapper形式的），都默认下载到用户目录了，如果其他项目设置 **下载过的gradle版本**，那就不用再访问网络了。
![Paste_Image.png](http://upload-images.jianshu.io/upload_images/1281543-353a8971fa4e73f4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

总之检查开源项目的 gradle 版本，gradle的插件版本，buildTools 版本以及 compile sdk 版本 就好办了；

## 总结
1. 推荐使用wrapper方式
2. 修改gradle插件版本
3. 修改gradle-wrapper.properties的值
4. cd到gradle.bat所在目录，运行.
linux 
`./gradlew clean`
`./gradlew assembleDebug`
windows 
`gradlew.bat  clean`
`gradlew.bat assembleDebug`

## 最后注意点
个别开源项目没有把local.properties 推送到GitHub上去，所以会报找不到SDK的错误，这时候只需 建一个 local.properties文件，内容为
```
ndk.dir=E\:\\Android\\sdk\\ndk-bundle
sdk.dir=E\:\\Android\\sdk
```
即可。


## 为什么推荐用wrapper而不是 path（path或者AS设置的gradle安装路径）


![Paste_Image.png](http://upload-images.jianshu.io/upload_images/1281543-84d86dad5b305cf8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

早些时候我一般设置的都是第二种方式（等价于path环境变量），而且当时很多博客还错误的认为
这种是最佳，且勾选offline work可以加速AS构建。

但你发现上面第一种方式 AS 默认勾选了 （recommend推荐）

再看两张截图
![Paste_Image.png](http://upload-images.jianshu.io/upload_images/1281543-18a6645b037a0146.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


![Paste_Image.png](http://upload-images.jianshu.io/upload_images/1281543-a0de00987791e920.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

我们发现现在构建gradle只需指定**版本号**即可，**无需**跟以前似得指定gradle的安装位置，这里的设置就是改变 **前面我们提到的几个配置文件的值。** 所以wrapper方式是最值得推荐的，它就像一个打包的exe一样，用户不需要设置任何环境变量，没有环境变量照样运行gradle。

## 完整案例
1. 下载某个开源项目
2. 修改我的gradle-wrapper.properties文件，我本地已存在3.3版本，
在C:\Users\Administrator\.gradle\wrapper\dists\目录中多个gradle可选。
我这里常用3.3，所以修改为
`distributionUrl=https\://services.gradle.org/distributions/gradle-3.3-all.zip`
3. gradle-3.3-all对应的插件版本是2.3.3，所以这里修改为如下：
```
buildscript {
    repositories {
        jcenter()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:2.3.3'
    }
}
```
4. 我的SDK Manager下载支持的是Android6.0，所以这里修改为：
```
compileSdkVersion 26
buildToolsVersion "26.0.0"
```
5. 修改Android6.0即26对应的support包
6. 添加local.properties
```
ndk.dir=E\:\\Android\\sdk\\ndk-bundle
sdk.dir=E\:\\Android\\sdk
```
7. cd到gradle.bat所在目录
**linux**
`./gradlew clean`
`./gradlew assembleDebug`
**windows** 
`gradlew.bat  clean`
`gradlew.bat assembleDebug`

甩 Android Studio十条街的速度构建apk。
