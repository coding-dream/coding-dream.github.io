---
title: 动态加载so注意事项&案例
date: 2017.11.11 16:18
tags: 
  - NDK
  - 动态加载
categories:
  - Android
---

常用架构
`armeabi，armeabi-v7a，x86，mips，arm64-v8a，mips64，x86_64。`

## 加载so的两种方式
1. 打包在apk中的情况，不需要开发者自己去判断ABI，Android系统在安装APK的时候，不会安装APK里面全部的SO库文件，而是会根据当前CPU类型支持的ABI，从APK里面拷贝最合适的SO库，并保存在APP的内部存储路径的 libs 下面。
2. 动态加载外部so的情况下，需要我们判断ABI类型来加载相应的so，Android系统不会帮我们处理。

------------------------------------------------------------


## 需要注意的事项
1. `一种CPU架构　=　一种对应的ABI参数　=　 一种对应类型的SO库`
比如大多的X86设备除了支持X86类型的SO库，还兼容ARM类型的SO库，所以应用市场上大部分的APP只适配了ARM类型的SO库，但是注意**兼容模式** 运行so库的性能并不是很好，最好推荐还是一种abi对应一种so库。
2. 通过 PackageManager 安装后，在小于 Android 5.0 的系统中，SO库位于 APP 的 nativeLibraryPath 目录中；在大于等于 Android 5.0 的系统中，SO库位于 APP 的 nativeLibraryRootDir/CPU_ARCH 目录中；我们动态加载so一般不需要关心这个问题。

3. 我们总是希望Android Studio 使用最新版本的build-tools来编译，因为Android SDK最新版本会帮我们做出最优的向下兼容工作。
但是编译SO库 确实正好相反的，因为NDK平台不是向下兼容的，而是向上兼容的。应该使用app的minSdkVersion对应的版本的NDK来编译SO库文件，如果使用了太高版本的NDK编译，可能会导致APP性能低下，或者引发一些SO库相关的运行时异常，比如`UnsatisfiedLinkError`，`dlopen: failed`以及其他类型的Crash。现在Android已经是7.0了，目前不知道NDK是否对此有改进。
4.  如果我们的App写的so库只适配了armeabi-v7a和x86架构，但是用第三方库时，第三方库包含（armeabi-v7a，x86，ARM64），这时候某些ARM64的设备安装该APK的时候，只要发现apk带有ARM64的库，只会选择安装APK里面ARM64类型的SO库，这样会导致我们的so库无法拷贝到nativeLibraryPath 目录（这种情况下不会以**兼容模式**找armeabi-v7a或x86下的so），所以必须保证 **我们的so**和第三方的so 支持的架构类型个数匹配。 利用Android Studio很方便解决这个问题：

**一种推荐的做法**
library中适配所有类型的so库支持，app则适配少于或等于library中的so库。利用build.gradle实现。

app下的build.gradle
```
productFlavors {
    flavor {
        ndk {
            abiFilters "armeabi-v7a"
            abiFilters "x86"
            abiFilters "armeabi"
        }
    }
}
```
library下的build.gradle
```
productFlavors {
    flavor {
        ndk {
            abiFilters "armeabi-v7a"
            abiFilters "x86"
            abiFilters "armeabi"
            abiFilters "arm64-v8a"
            abiFilters "x86_64"
        }
    }
}
```
打包的时候以app下build.gradle支持的为准。
总之一定要保持 各个库之间对应的架构都是一一对应的。

## 不同Android设备架构的兼容情况
1. armeabi-v7a 设备能够加载 armeabi 指令的 so 文件
2. arm64-v8a 能兼容 armeabi-v7a 和 armeabi 指令集
3. x86_64 兼容 x86
4. mips64 兼容 mips
mips 系 的手机设备数量太少，在项目里基本上不考虑。

## Google提供给用户的API
```
android.os.Build.SUPPORTED_ABIS
android.os.Build.CPU_ABI 
android.os.Build. CPU_ABI2 
```
这些变量用于查询设备支持的架构，其中 SUPPORTED_ABIS 是` API Level 21 `引入来代替` CPU_ABI, CPU_ABI2`的。
1. 如果目标平台的 API Level 小于 21，只能使用 CPU_ABI 要 CPU_ABI2 来选择了，而 CPU_ABI 要优于 CPU_ABI2。
2. API Level >=21的推荐使用android.os.Build.SUPPORTED_ABIS，但是21以下只能使用CPU_ABI 和CPU_ABI2

**测试下这几个变量的值**
针对某一个固定的设备，如Nexus 9设备（arm64-v8a CPU架构）

根据前面说描述 **设备的兼容情况** 
SUPPORTED_ABIS 比较容易理解，返回` arm64-v8a,armeabi-v7a,armeabi`

而CPU_ABI 和CPU-ABI2的值不是固定不变的，它会根据 APK 打包的jniLibs ，并根据设备支持的abi选择性安装，返回不同的值

|abiFilters(当前apk包含的so库类型)|CPU_ABI    |	CPU_ABI2|
|-------------------------------|-----------|-----------|
|armeabi-v7a, arm64-v8a, armeabi|arm64-v8a  |			|
|arm64-v8a, armeabi-v7a			|arm64-v8a  |			|
|arm64-v8a,armeabi				|arm64-v8a  |			|
|								|arm64-v8a  |			| 	 
|armeabi						|armeabi-v7a|armeabi 	|
|armeabi-v7a					|armeabi-v7a|armeabi    |

所以5.0(21)以上，推荐使用android.os.Build.SUPPORTED_ABIS判断获取设备支持的架构类型，而5.0以下则使用android.os.Build.CPU_ABI 即可，android.os.Build.CPU_ABI2的价值也不是很大。


**activity.getApplicationInfo().nativeLibraryDir** 暂时未用到
```
4.4-> /data/app-lib/com.less.tplayer.baidu-1
5.0-> /mnt/asec/com.less.tplayer.baidu-2/lib/arm64
```
## 动态加载网络或文件夹下的so库

**加载某文件夹 -> 相应架构的so文件**

Apk文件本身就是一个压缩文件，解压后目录结构大致如下：

![某apk文件的解压目录](http://upload-images.jianshu.io/upload_images/1281543-273eb9b94b90b195.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 动态加载so案例
我先把完整的代码贴出来，然后讲解可能遇到的两个错误。

动态加载的核心类（根据abi从本地选择合适的so库加载）
```
public class DynamicSO {
    private static final String TAG = DynamicSO.class.getSimpleName();

    public static void loadExSo(Context context,String soName, String soFilesDir){
        File soFile = choose(soFilesDir,soName);

        String destFileName = context.getDir("myso", Context.MODE_PRIVATE).getAbsolutePath()  + File.separator + soName;
        File destFile = new File(destFileName);
        if (soFile != null) {
            Log.e(TAG, "最终选择加载的so路径: " + soFile.getAbsolutePath());
            Log.e(TAG, "写入so的路径: " + destFileName);
            boolean flag = FileUtil.copyFile(soFile, destFile);
            if (flag) {
                System.load(destFileName);
            }
        }

    }

    /**
     * 在网络或者本地下载过的so文件夹: 选择适合当前设备的so文件
     *
     * @param soFilesDir so文件的目录, 如apk文件解压后的 Amusic/libs/ 目录 : 包含[arm64-v8a,arm64-v7a等]
     * @param soName so库的文件名, 如 libmusic.so
     * @return 最终匹配合适的so文件
     */
    private static File choose(String soFilesDir,String soName) {
        if (Build.VERSION.SDK_INT >= 21) {
            String [] abis = Build.SUPPORTED_ABIS;
            for (String abi : abis) {
                Log.e(TAG, "SUPPORTED_ABIS =============> " + abi);
            }
            for (String abi : abis) {
                File file = new File(soFilesDir,abi + File.separator + soName);
                if (file.exists()) {
                    return file;
                }
            }
        } else {
            File file = new File(soFilesDir, Build.CPU_ABI + File.separator + soName);
            if (file.exists()) {
                return file;
            } else {
                // 没有找到和Build.CPU_ABI 匹配的值,那么就委屈设备使用armeabi算了.
                File finnalFile = new File(soFilesDir, "armeabi" + File.separator + soName);
                if (finnalFile.exists()) {
                    return finnalFile;
                }
            }
        }
        return null;
    }
}
```
动态调用so的函数，不需要System.loadLibrary.
```
public class Security {

    public native String stringFromJNI();
}
```

测试类，我的需要加载的so文件都是放在sdcard/mylibs目录下的。

```
public class TestActivity extends AppCompatActivity {

	public void handle(View view) {
		DynamicSO.loadExSo(this,"libnative-lib.so", Environment.getExternalStorageDirectory() + "/mylibs");
		// JNI 调用
		Security security = new Security();
		String message = security.stringFromJNI();
		Toast.makeText(this, message, Toast.LENGTH_LONG).show();
	}
}
```


## 常见错误
```
1. Exception: dlopen failed: "/data/data/com.less.tplayer.baidu/app_myso/libnative-lib.so" has bad ELF magic
2. E/art: dlopen("/data/data/com.less.tplayer.baidu/app_myso/libnative-lib.so", RTLD_LAZY) failed: dlopen failed: "/data/data/com.less.tplayer.baidu/app_myso/libnative-lib.so" is 32-bit instead of 64-bit
3. E/art: dlopen("/data/data/com.less.tplayer.baidu/app_myso/libnative-lib.so", RTLD_LAZY) failed: dlopen failed: "/data/data/com.less.tplayer.baidu/app_myso/libnative-lib.so" is 64-bit instead of 32-bit
```

**【错误1】**非常简单，但却耗费我一晚上都没找到错误，Google搜到的也是不相干的，错误提示太坑了，**什么是精灵魔法？？**我还以为是5.0版本问题，然后测试4.0，然后以为so的写入目录有问题，然后。。。

```
byte[] bytes = new byte[1024];
int len = -1;
while ( (len = bufferedInputStream.read(bytes)) != -1) {
	bufferedOutputStream.write(bytes, 0, len);
}
```
拐了一大圈，最后是
```
bufferedInputStream.read(bytes)
bufferedInputStream.read()
```
TNN的，啥时候bytes丢了！！！
这个不起眼的小错误差点搞得我放弃这个知识点。
上面的粗心大意的错误终于解决了，却又出现了下面的错误，真坑！

**【错误2】**
```
E/art: dlopen("/data/data/com.less.tplayer.baidu/app_myso/libnative-lib.so", RTLD_LAZY) failed: dlopen failed: "/data/data/com.less.tplayer.baidu/app_myso/libnative-lib.so" is 32-bit instead of 64-bit
```
这个问题在Google某位大神[尼古拉斯*赵四](http://www.wjdiankong.cn/android%E4%B8%ADso%E4%BD%BF%E7%94%A8%E7%9F%A5%E8%AF%86%E5%92%8C%E9%97%AE%E9%A2%98%E6%80%BB%E7%BB%93%E4%BB%A5%E5%8F%8A%E6%8F%92%E4%BB%B6%E5%BC%80%E5%8F%91%E8%BF%87%E7%A8%8B%E4%B8%AD%E5%8A%A0%E8%BD%BDso/
) 的帮助下找到了答案：

我特意用 **[vivoX9照亮你的美 arm64-v8a架构]** 测试了下：
```
String [] abis = Build.SUPPORTED_ABIS;
    for (String abi : abis) {
      Log.e(TAG, "SUPPORTED_ABIS =============> " + abi);
  }
}
```
打印结果是：
```
E/DynamicSO: SUPPORTED_ABIS =============> arm64-v8a
E/DynamicSO: SUPPORTED_ABIS =============> armeabi-v7a
E/DynamicSO: SUPPORTED_ABIS =============> armeabi
```
这些顺序是按照优先级排列的，最适合的在最上面，兼容的在下面。

前面注意事项中也提到过：说各个module之间so的架构一定要对应，如果我们的App里面包含了64位的架构arm64-v8a文件夹，那么这时候应用的ApplicationInfo的abi就是arm64-v8a了，就会发送消息给Zygote64的进程，创建的也是64位的虚拟机了，如果我们的App应用里面只包含的是armeabi-v7a和armeabi的文件夹，那么创建的会是32位的虚拟机以兼容模式运行。

我测试的时候，app里面并没有任何so文件，但是动态加载本地armeabi-v7a架构so的时候却出现这种错误，后来推断：
>如果App里面没有任何so文件，那么默认就以该手机最适合的模式即arm64-v8a运行。但是注意了，64位的虚拟机不能运行32位的so。

**【错误3】**
64位的so文件也不能运行在32位的虚拟机中。
```
E/art: dlopen("/data/data/com.less.tplayer.baidu/app_myso/libnative-lib.so", RTLD_LAZY) failed: dlopen failed: "/data/data/com.less.tplayer.baidu/app_myso/libnative-lib.so" is 64-bit instead of 32-bit
```

虽然动态加载so的时候，我本地放入arm64-v8a就不会报错

![加载64位的so](http://upload-images.jianshu.io/upload_images/1281543-0daf2d061deb6f5b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

但是，如果后期想动态加载第三方的库（如极光推送），这些库里面没有arm64-v8a，或者有的手机不支持arm64-v8a，那么一加载程序就崩了。

**根据上面的推论：**
我想到的一种方式是：本地保留的 >= 宿主App（但至少有一个）用于欺骗Android设备。

![本地保留的 >= 宿主App（但至少有一个）](http://upload-images.jianshu.io/upload_images/1281543-f53bd180bb6ff066.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![宿主建立一个空的32位版的空so](http://upload-images.jianshu.io/upload_images/1281543-b8c0f9daa48a1742.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

这样系统发现该App含有armeabi-v7a的文件夹（里面需要有空so文件），那么就会以兼容模式启动32位虚拟机，然后根据**本地目录文件夹**，结合**上面给出代码** 选择so的顺序逻辑加载 需要的so文件。
>注意：此时是按32位虚拟机启动的，本地so的文件夹里面你可千万别没事找事添加arm64-v8a文件夹了，否则就会发生【错误3】了。

------------------------------------------------------

**总结**
1. 32位的so文件不能运行在64位的虚拟机中。
2. 同理：64位的so文件也不能运行在32位的虚拟机中。


参考：
[Android动态加载补充 加载SD卡中的SO库](https://segmentfault.com/a/1190000004062899)
[ANDROID动态加载 使用SO库时要注意的一些问题](https://segmentfault.com/a/1190000005646078)
[动态链接库加载原理及HotFix方案介绍](http://dev.qq.com/topic/57bec216d81f2415515d3e9c)
[android loadlibrary 更改libPath 路径，指定路径加载.so](http://www.jianshu.com/p/f751be55d1fb)
[Android中so使用知识和问题总结](http://www.wjdiankong.cn/android%E4%B8%ADso%E4%BD%BF%E7%94%A8%E7%9F%A5%E8%AF%86%E5%92%8C%E9%97%AE%E9%A2%98%E6%80%BB%E7%BB%93%E4%BB%A5%E5%8F%8A%E6%8F%92%E4%BB%B6%E5%BC%80%E5%8F%91%E8%BF%87%E7%A8%8B%E4%B8%AD%E5%8A%A0%E8%BD%BDso/)
