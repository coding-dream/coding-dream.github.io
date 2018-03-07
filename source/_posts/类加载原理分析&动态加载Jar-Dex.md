---
title: 类加载原理分析&动态加载Jar-Dex
date: 2017.10.31 22:47
tags: 
  - 源码分析
  - 动态加载
  - 类加载机制
  - ClassLoader原理
  - 动态加载dex
categories:
  - Android
---

>简书 [编程之乐](http://www.jianshu.com/u/79a88a044955)
转载请注明原创出处！

## JVM类加载机制
JVM类加载机制分为五个部分：加载，验证，准备，解析，初始化，如下图：
![Paste_Image.png](http://upload-images.jianshu.io/upload_images/1281543-45a7963725844bc8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

由于本文主要讲解的是类的 **加载** 部分，所以**加载，验证，准备，解析，初始化**仅仅作下简单的回顾，详细内容参阅《深入理解Java虚拟机》

###加载
类的加载指的是将类的class文件读入内存，并为之创建一个java.lang.Class对象，也就是说，当程序使用任何类时，系统都会为之创建一个java.lang.Class对象。
> 类也是一种对象，就像概念主要用于定义和描述其他的事物(反射中class含有各种信息)，但概念本身也是一种事物。

通常有下面几种来源 加载 类的二进制数据
1. 从本地文件系统加载class文件
2. 从jar包中加载class文件，如从F盘动态加载jdbc的mysql驱动。
3. 通过网络加载（典型应用Applet）
4. 把一个java源文件动态编译并加载
5. 从zip包读取，如jar，war，ear。
6. 运算时计算生成（动态代理技术）
7. 数据库中读取（可以加密处理）
8. 其他文件生成（jsp文件生成对应的class文件）


##验证
这一阶段的主要目的是为了确保Class文件的字节流中包含的信息是否符合当前虚拟机的要求，并且不会危害虚拟机自身的安全。

###准备

准备阶段开始为 **类变量（即static变量）** 分配内存并设置 **类变量的初始值（注意初始值一般为0,null也是零值）**的 阶段，这些变量所使用的内存都将在方法区进行分配。
>注意 
这里进行内存分配的仅包含 《类变量》即static变量，而**不包括实例变量**，**不包括实例变量**，**不包括实例变量**，重要的事说3遍，实例变量将会在 **对象实例化**时随着对象一起分配在Java堆中。且初始值 **通常情况** 下 是数据类型 的零值

![Paste_Image.png](http://upload-images.jianshu.io/upload_images/1281543-7f3f7ef14463ccb6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

```
public class Animal {
	private static int age = 20;
}
```
那变量age在 **准备阶段** 过后的初始值是0而不是20，因为这时候还没有执行任何Java方法。所以把age赋值为20的动作将在 **初始化** 阶段执行。

> 再次注意
存在一种特殊情况，如果上面的类变量声明为final的，则此时（准备阶段）就会被初始化为20。
`public static final int age = 20;`
编译时候，JavaC将会为age生成ConstantValue属性，在**准备阶段** 虚拟机就会根据ConstantValue的设置将age赋值为20。

###解析
解析阶段是指虚拟机将**常量池**中的**符号引用**替换为**直接引用（内存地址）**的过程。

这里简单说下常量池

|常量池|  |  
|----|----|
|1. 字面量|比较接近Java语言层面，如String字符串,声明final的常量等|
|2. 符号引用|属于编译原理方面的概念:1.包括类和接口的全限定名 2.字段的名称和描述符3.方法的名称和描述符

符号引用大概是下面几种  **类型**
```
1. CONSTANT_Class_info
2. CONSTANT_Field_info
3. CONSTANT_Method_info
```
的常量。


###初始化
类加载的最后一个阶段，除了**加载阶段**我们可以通过自定义类加载器参与之外，其余完全又JVM主导。到了初始化阶段，才真正开始执行类中定义的Java程序代码（字节码）

这里需要区分下<init> 和<client>
1. <init>指的是实例构造器，也就是构造函数
2. <client>指的是类构造器，这个构造器是jvm自动合并生成的。
它合并static变量的**赋值操作(1. 注意是赋值操作，仅声明的不会触发<client>，毕竟前面准备阶段已经默认赋过值为0了，2. final static的也是这样哦)**和static{ }语句块生成，且虚拟机保证<client>执行前，父类的<client>已经执行完毕，所以说父类如果定义static块的话，一定比子类先执行，当然了，如果一个类或接口中没有**static变量的赋值操作**和static{ }语句块，那么<client>也不会被JVM生成。最后还要注意一点，static变量的赋值操作和static{}语句块合并的顺序是由语句在源文件中出现的顺序所决定的。

> 静态语句块只能访问定义在静态语句块之前的变量，定义在它之后的变量，前面的静态语句块只能赋值，不能访问。

![Paste_Image.png](http://upload-images.jianshu.io/upload_images/1281543-cab21fa9c736bd32.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

###类初始化的时机

当Java程序 **首次主动**通过下面6种方式使用某个类或接口时候，系统就会初始化该类或接口，假如这个类还没有被 **加载和连接**，则程序先加载并连接该类。类的初始化只会发生一次，再次使用new,callMethod等等都不会重复初始化。

1. 生成类的实例，如（1）new （2）反射newInstance （3）序列化生成obj
2. 调用static的方法，如LogUtil.i(TAG,"fucking");
3. 访问类或接口的 static变量，或者为static变量赋值。注意有特例（一会说明）。
4. Class.forName(name);
5. 初始化某个类的子类，子类的所有父类都被初始化
6. java.exe 运行Main类（public static void main），jvm会**先初始化**该主类。

刚才说 3 有一个特例，需要特别指出，仍然是static的变量，前面说过，如果是 static final类型的则会在**准备阶段** 就给赋值并加入常量池。所以仅仅访问某个类的常量并不会导致该类初始化。
```
class Person{
	public static  int age = 20;

	static {
		System.out.println("静态初始化！");
	}
}

public class Test {

	public static void main(String args[]){
	  System.out.println(Person.age);
  }

}
```
没有final修饰的情况打印 
```
静态初始化！
20
```
加上final修饰后打印
```
20
```

**以下是不会执行类初始化的几种情况**
1. 通过子类引用父类的静态字段，只会触发父类的初始化，而不会触发子类的初始化。
2. 定义对象数组，不会触发该类的初始化。
3. 就是上面说的那种情况，类A引用类B的static final常量不会导致类B初始化。
4. 通过类名获取Class对象，不会触发类的初始化。如
`System.out.println(Person.class);`
5. 通过Class.forName加载指定类时，如果指定参数initialize为false时，也不会触发类初始化，其实这个参数是告诉虚拟机，是否要对类进行初始化。
6. 通过ClassLoader默认的loadClass方法，也不会触发初始化动作。


JVM类加载机制算是结尾了，不过在参考其他文章时候发现一个非常棒的例子，可以很好的验证上面的结论。

出处是 [简书：小腊月](http://www.jianshu.com/p/b6547abd0706)
```
public class Singleton {
  private static Singleton singleton = new Singleton();
  public static int counter1;
  public static int counter2 = 0;
  private Singleton() {
      counter1++;
      counter2++;
  }
  public static Singleton getSingleton() {
      return singleton;
  }
 }

```
```
public class Main{
  public static void main(String args[]){
      Singleton singleton = Singleton.getSingleton();
      System.out.println("counter1="+singleton.counter1);
      System.out.println("counter2="+singleton.counter2);
  }
}
```

根据 **类初始化的时机** 所作的结论
1. 执行Main方法，根据结论6，会首先初始化Main类，Main类从（加载开始 ----> 初始化结束）
2. 执行到Singleton.getSingleton();时候，根据结论2，直接 **【先】** 触发【类的初始化】初始化Singleton类，Singleton类首次初始化，所以从 **加载部分**开始执行，执行到 **准备阶段** 所有static变量都被设置为初始值。此时
```
public static int counter1 = 0;
public static int counter2 = 0;
private static Singleton singleton = null;
```
3. Singleton执行到**初始化阶段**，生成类构造器<client>，类构造器会合并 **static变量的赋值操作**和 static语句块。合并后执行
```
public static int counter1 ; // 由于 counter1没被赋值，所以不会被合并进去

public void client() {// 伪代码：<client>方法体内容
  Test singleton = new Test();//（1）
  int counter2 = 0;// （2）
}
```
4. **初始化阶段** 执行client内代码，执行到（1）处，此时counter1和counter2都变为1。
5. **初始化阶段** 执行client代码，执行到（2）处，counter2又被设置为0。
6. **初始化结束** ，回到Main方法的Singleton.getSingleton();继续执行main方法，最后输出结束。

最后打印结果为: 
```
counter1= 1
counter2= 0
```


## 详解类加载(第一阶段)
类加载部分是我们能够操作的部分，其他部分不需要我们管理。

Jvm启动时候默认至少开启了3个类加载器，分别是Bootstrap ClassLoader，Extension ClassLoader，Application ClassLoader各自加载各自管辖的区域。

![Paste_Image.png](http://upload-images.jianshu.io/upload_images/1281543-3f7c2473524f8307.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


1. 启动类加载器(Bootstrap ClassLoader)：负责加载 JAVA_HOME\lib 目录中的，或通过-Xbootclasspath参数指定路径中的，且被虚拟机认可（按文件名识别，如rt.jar）的类。
2. 扩展类加载器(Extension ClassLoader)：负责加载 JAVA_HOME\lib\ext 目录中的，或通过java.ext.dirs系统变量指定路径中的类库。
3. 应用程序类加载器(Application ClassLoader)或者叫**System ClassLoader**：负责加载用户路径（classpath）上的类库。


![Paste_Image.png](http://upload-images.jianshu.io/upload_images/1281543-c86d07145d0bfadf.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

>此程序说明：Java中getClassLoader用的一般和getSystemClassLoader是一个实例。源码中ClassLoader默认的构造器也说明这点，initSystemClassLoader里面会获取sun.misc.Launcher.getLauncher().getClassLoader()作为默认的parent。
**这里重点强调**：Android的ClassLoader类也有一个getSystemClassLoader()方法，但是又被改写了，后面再说明这个问题。

**再看下Android的类加载器的继承关系图**

![Paste_Image.png](http://upload-images.jianshu.io/upload_images/1281543-0c081a7a812f8119.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

**注意**
1. 双亲委派是组合关系，就像上面图中JVM提供的3种类加载器一样。而这里是继承关系图。

2. 上面这个继承图画的不是很正确，网上找来另一张图，不过凑合着用吧，描述写的不错，稍微说明一下: BootClassLoader是ClassLoader的内部类，而URLClassLoader继承自SecureClassLoader，这两个类都是和Java里面的，一模一样，算是Java提供给我们的一个自定义ClassLoader工具类，专门用于加载本地或网络的jar文件（只能加载jar），但是Android不支持直接加载没有处理过的jar，一般都是dex过的，所以这两个类算是 **废物类**。去除这两个，真正需要研究的就只有BootClassLoader，PathClassLoader，DexClassLoader了。另外注意BootClassLoader和Java中那个Bootstrap ClassLoader没有半毛钱关系。


![Paste_Image.png](http://upload-images.jianshu.io/upload_images/1281543-458da3196f4df7e0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

下面是BootClassLoader 的局部代码，只是证明它是Java写的，不是C++，且它是ClassLoader 的内部类。Java的Bootstrap ClassLoader(C++实现)

```
class BootClassLoader extends ClassLoader {

    private static BootClassLoader instance;

    @FindBugsSuppressWarnings("DP_CREATE_CLASSLOADER_INSIDE_DO_PRIVILEGED")
    public static synchronized BootClassLoader getInstance() {
        if (instance == null) {
            instance = new BootClassLoader();
        }

        return instance;
    }

    public BootClassLoader() {
        super(null);
    }
  // ......................................省略
}
```
>总结：Java和Android基本所有ClassLoader都是间接或直接继承自ClassLoader类，除了Java的Bootstrap ClassLoader。

下面用代码测试下App启动默认到底有几个类加载器，和Java区别是什么？
```
 protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_test);

        ClassLoader classLoader1 = getClassLoader();// classLoader1 和 classLoader2 是同一个实例
        ClassLoader classLoader2 = TestActivity.class.getClassLoader();

        ClassLoader classLoader3 = ClassLoader.getSystemClassLoader();

        if (classLoader2 == classLoader3) {
            Log.i(TAG, "classLoader(1,2) == classLoader3 : true");
        } else {
            Log.i(TAG, "classLoader(1,2) == classLoader3 : false");
        }

        ClassLoader classLoader4 = Context.class.getClassLoader();
        ClassLoader classLoader5 = ListView.class.getClassLoader();
        ClassLoader classLoader6 = ClassLoader.class.getClassLoader();

        Log.i(TAG, classLoader1.toString());
        Log.i(TAG, classLoader2.toString());
        Log.i(TAG, classLoader3.toString());
        Log.i(TAG, classLoader4.toString());
        Log.i(TAG, classLoader5.toString());
        Log.i(TAG, classLoader6.toString());

        ClassLoader _classLoader = ClassLoader.getSystemClassLoader();
        while(_classLoader != null){
            Log.i(TAG, "current classLoader : " + _classLoader);
            _classLoader = _classLoader.getParent();
        }
    }
```
打印结果
```
classLoader(1,2) == classLoader3 : false

dalvik.system.PathClassLoader[DexPathList[[zip file "/data/app/com.less.tplayer.baidu-1.apk"],nativeLibraryDirectories=[/data/app-lib/com.less.tplayer.baidu-1, /system/lib]]]
dalvik.system.PathClassLoader[DexPathList[[zip file "/data/app/com.less.tplayer.baidu-1.apk"],nativeLibraryDirectories=[/data/app-lib/com.less.tplayer.baidu-1, /system/lib]]]

dalvik.system.PathClassLoader[DexPathList[[directory "."],nativeLibraryDirectories=[/system/lib]]]

java.lang.BootClassLoader@4a67f6bc
java.lang.BootClassLoader@4a67f6bc
java.lang.BootClassLoader@4a67f6bc

current classLoader : dalvik.system.PathClassLoader[DexPathList[[directory "."],nativeLibraryDirectories=[/system/lib]]]
current classLoader : java.lang.BootClassLoader@4a67f6bc
```

（1） Android启动时候则至少启动了3个类加载器，和Java有区别的是，Android的类加载器均是继承自ClassLoader，没有一个用C++实现。
（2）分别测试2个App，getClassLoader（PathClassLoader）的hashCode相等，获取的是同一个实例。
（2）其中BootClassLoader用于加载Android SDK级别的类，如Context，ListView等等，PathClassLoader用于加载我们自己APP里面的类，可以在应用中通过getClassLoader()获取到，看起来就像Java中
```
BootClassLoader -> BootStrapClassLoader，ExtClassLoader
PathClassLoader -> AppClassLoader
```
（3）通过打印日志推断Java中getSystemClassLoader和当前classpath下getClassLoader是一个实例，Android中getSystemClassLoader和TestActivity.class.getClassLoader获取到的是两个不同的PathClassLoader 实例。

**对比Java和Android的getSystemClassLoader获取方式**

Java获取getSystemClassLoader
```
private static ClassLoader sClassLoader;
private static boolean sclSet;

public static ClassLoader getSystemClassLoader() {
	initSystemClassLoader();
	// ...
	return sClassLoader;
}


private static synchronized void initSystemClassLoader() {
	if (!sclSet) {
		if (sClassLoader != null){
			throw new IllegalStateException("recursive invocation");
		}
		// ... 
		sun.misc.Launcher launcher = sun.misc.Launcher.getLauncher();
		if (launcher != null){
			sClassLoader = launcher.getClassLoader();
		}
		sclSet = true;
	}
}
```

Android获取getSystemClassLoader
```
public abstract class ClassLoader {

    static private class SystemClassLoader {
        public static ClassLoader loader = ClassLoader.createSystemClassLoader();
    }
	
	public static ClassLoader getSystemClassLoader() {
        return SystemClassLoader.loader;
    }
	
	private static ClassLoader createSystemClassLoader() {
		String classPath = System.getProperty("java.class.path", ".");
		String librarySearchPath = System.getProperty("java.library.path", "");
		return new PathClassLoader(classPath, librarySearchPath, BootClassLoader.getInstance());
	}	
}
```

（4）大家需要重点研究的类就是PathClassLoader和DexClassLoader即可，直接查阅源码来区分和Jvm实现的不同点。

**双亲委派模型**
下面这段代码几乎说明了一切

```
 public abstract class ClassLoader {
	// 组合方式的双亲委派模型
	private final ClassLoader parent;

	protected Class<?> loadClass(String name, boolean resolve) throws ClassNotFoundException {
		synchronized (getClassLoadingLock(name)) {
			// First, check if the class has already been loaded
			Class<?> c = findLoadedClass(name);
			if (c == null) {
				try {
					if (parent != null) {
						// 先让parent找，递归调用，有点像Android事件分发机制，但那个是使用继承方式，这个是使用组合方式 递归。
						c = parent.loadClass(name, false);
					} else {
						// 使用BootstrapClassLoader加载
						c = findBootstrapClassOrNull(name);
					}
				} catch (ClassNotFoundException e) {
					// nothing to do
				}

				if (c == null) {
					// 最后交给自己的时候，自己却无情抛出一个异常，告诉别人 => 太费体力，不想找了，除非你给我造娃！
					c = findClass(name);
				}
			}
			if (resolve) {
				resolveClass(c);
			}
			return c;
	}
	
	protected Class<?> findClass(String name) throws ClassNotFoundException {
        throw new ClassNotFoundException(name);
    }
}
```

>总结: 
>1. DexClassLoader可以加载apk,jar,及dex文件，但PathClassLoader只能加载已安装到系统中（即/data/app目录下）的apk文件。至于为什么，看下构造函数就知道了，DexClassLoader和PathClassLoader都是继承BaseDexClassLoader，两个类的区别仅仅是构造函数 DexClassLoader比PathClassLoader多了一个optimizedDirectory参数，其他完全一样，optimizedDirectory就是我们下面将要讲到动态加载dex时候File dexOutputDir = getDir("dex", 0)，这个参数，懂了吧！
>2. Java和Android的加载器的基类 都是ClassLoader，除了Java中的Bootstrap ClassLoader是C++实现的。
>3. 远端的class只能由自定义ClassLoader加载，JVM三大加载器管辖不了，除非反射修改管辖区域(没这么做过，只是猜想)。
>4. 双亲委派模型是Java设计者推荐给我们的类加载器实现模式，但是不一定非要遵循，我们可以在入口处loadClass()做点手脚，吐槽下这里的命名，个人感觉findClass和loadClass的 **名字和逻辑** 有点起反了的味道，注意下就行了。

**Java和Android中ClassLoader的异同**
Java和Android虽然很多类都是同一个包名+类名，但是很多类都被修改过了，如ClassLoader，在Java中defineClass是一个非常重要的一个方法，用于负责将字节码文件(即class文件来源于文件或网络等) 读入字节数组byte[]b内，并把它转换为Class对象。 但是 Android中 此方法却被舍弃，仅仅抛出一个异常(因为Android不能直接加载class文件,而是加载dex文件)。

Java中的ClassLoader.defineClass

```
 protected final Class<?> defineClass(String name, byte[] b, int off, int len,
                                         ProtectionDomain protectionDomain)
        throws ClassFormatError
    {
        protectionDomain = preDefineClass(name, protectionDomain);
        String source = defineClassSourceLocation(protectionDomain);
        Class<?> c = defineClass1(name, b, off, len, protectionDomain, source);
        postDefineClass(c, protectionDomain);
        return c;
    }
```

Android中的ClassLoader.defineClass
```
@Deprecated
protected final Class<?> defineClass(byte[] b, int off, int len)
	throws ClassFormatError
{
	throw new UnsupportedOperationException("can't load this type of class file");
}
```

**Java的三种类加载器**

```
public class Main {

	public static void main(String[] args) {
		Main main = new Main();
		System.out.println(main.getClass().getClassLoader());
		System.out.println(ClassLoader.getSystemClassLoader());

		System.out.println(main.getClass().getClassLoader().getParent());

		// bootstrap class loader 它用来加载 Java 的核心库，是用原生代码来实现的，并不继承自 java.lang.ClassLoader。
		System.out.println(main.getClass().getClassLoader().getParent().getParent());

	}
}
```
输出结果是:
```
sun.misc.Launcher$AppClassLoader@73d16e93
sun.misc.Launcher$AppClassLoader@73d16e93

sun.misc.Launcher$ExtClassLoader@15db9742
null
```

查看ClassLoader.getParent方法的注释，可以看出，如果classLoader的parent是bootstrap class loader则返回null。
```
/**
 * Returns the parent class loader for delegation. Some implementations may
 * use <tt>null</tt> to represent the bootstrap class loader. This method
 * will return <tt>null</tt> in such implementations if this class loader's
 * parent is the bootstrap class loader.
 */
 
 @CallerSensitive
    public final ClassLoader getParent() {
        if (parent == null)
            return null;
        SecurityManager sm = System.getSecurityManager();
        if (sm != null) {
            checkClassLoaderPermission(this, Reflection.getCallerClass());
        }
        return parent;
    }
```

## 实战
同一个Class =  ClassName + PackageName + ClassLoaderId(instance)

只要是**写在Eclipse中的类**(其实就是指classPath)都是被AppClassLoader加载的，其他以classLoader.load("com.xx.xx") 形式的都是自定义ClassLoader **经过** 处理的。

知道这一点是很重要的，后面我们自定义ClassLoader可以利用该特性。

![Paste_Image.png](http://upload-images.jianshu.io/upload_images/1281543-e0186fc937e3bdcb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

同理，Android中能够写在 **Android Studio中的代码** (classPath)都是被PathClassLoader加载的，其他以classLoader.load("com.xx.xx") 形式的都是自定义ClassLoader **经过** 处理的。

所以一般情况下Java和Android我们经常利用的是
Java -> AppClassLoader
Android -> PathClassLoader

而自定义ClassLoader利用的是
Java -> URLClassLoader(可选) or  ClassLoader的子类
Android -> DexClassLoader(可选) or ClassLoader的子类

**动态加载方案（Java版）**
1. 反射方式
插件类全部写在远端，然后用自定义ClassLoader加载，只留一个Object引用(Object由super.loadClass() 让parent处理)， 然后用反射调用插件类的方法。这种比较简单，案例后面代码会给出。
2. 接口方式
本地项目里面的留一个接口类，远端实现该接口的方法，然后打包远端实现类和接口类，经过测试，Java提供给我们的URLClassLoader不需要去除jar里面的接口类的，原理就是利用双亲委派 优先使用parent加载项目里面的接口类，所以才能够多态引用到该jar中的实现类。

再来试试我们自己的解决方案

待加载的类Dog
```
package com.less.bean;
public interface Animal {
	void say();
}

package com.less.bean;
public class Dog implements Animal {

	@Override
	public void say() {
		System.out.println("I am a Dog");
	}
}
```
文件加载ClassLoader
```
public class FileBadClassLoader extends ClassLoader {

	@Override
	public Class<?> loadClass(String name) throws ClassNotFoundException {
		try {
			String fileName = name.substring(name.lastIndexOf(".") + 1) + ".class";
			File file = new File("F:/" + fileName);
			if(!file.exists()){
				System.out.println("========> 没找到文件,使用默认逻辑加载 " + name);
				return super.loadClass(name);
			}else{
				System.out.println("========> 找到文件 ，开始加载 " + name);
				InputStream inputStream = new FileInputStream(file);
				byte[] data = new byte[inputStream.available()];
				inputStream.read(data);
				inputStream.close();
				// Android和Java的重要实现区别就在于这里，Android不支持直接加载.class或.jar,而是.dex，所以被修改为能够动态加载dex的逻辑。
				return defineClass(name, data, 0, data.length);
			}
		} catch (Exception e) {
			throw new ClassNotFoundException(name);
		}
	}
}
```
这是一个破坏了双亲委派模式的 自定义ClassLoader，加载顺序和双亲委派 正好相反。
检测磁盘是否存在我们先要加载的class文件，如果存在就自己加载，不存在就交给super.loadClass();默认逻辑处理。

```
public static void main(String[] args){
	FileBadClassLoader badClassLoader = new FileBadClassLoader ();
	Class<?> clazz = badClassLoader.loadClass("com.less.bean.Dog");
	Animal animal = (Animal) clazz.newInstance();
	animal.say();
}
```

![Paste_Image.png](http://upload-images.jianshu.io/upload_images/1281543-98f280d4b9ab537b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


![Paste_Image.png](http://upload-images.jianshu.io/upload_images/1281543-bd3acb910f86e584.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

如图所示，F盘存在两个class，Animal（接口）和Dog（实现类）
运行main，结果报了一个ClassCastException。

![Paste_Image.png](http://upload-images.jianshu.io/upload_images/1281543-3625e821dfe8eedf.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

**为什么会出现这种错**
Animal animal = (Animal) clazz.newInstance(); 不是正常引用吗？
根据上面的分析，这个错误很容易判断，因为Animal和Dog都存在F盘，所以都被FileBadClassLoader加载了，而 上面有个结论 提到 写在Eclipse代码中的类（classpath）都是被APPClassLoader加载的，这行代码用了两个不同的ClassLoader实例，所以Animal animal = (Animal) 这里的引用和clazz.newInstance()不是一个类型的，所以不能互相转换。

**如何解决**
删除F盘中的Animal.class即可，删除后FileBadClassLoader找不到Animal.class就交给APPClassLoader加载，加载成功后
Animal animal = (Animal) clazz.newInstance()就可以相互引用了。

![Paste_Image.png](http://upload-images.jianshu.io/upload_images/1281543-238951cd250a1fc7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

备注：贴上测试代码

```
public class Main {

	/**
	 * 个人吐槽下，ClassLoader的加载类的loadClass和findClass方法的名称互换下感觉更贴切些，毕竟名字和代码逻辑反了，搞得有时候犯迷糊。find是先找后加载，注意下这里就行了。
	 * 注: 即使是自己实现的类加载器，如果myClassLoader.loadClass(clazz);加载的clazz被parent加载了,那么clazz.getClassLoader()就是parent而不是myClassLoader.
	 * @throws Exception
	 */
	public static void main(String[] args) throws Exception {
		testIsSameClassLoader();
//		testIsSameClass();
//		testObeyParent1();
//		testObeyParent2();
//		testDisObeyParent();
//		testDynamicByReflect();
//		testDynamicByInterface1();
//		testDynamicByInterface2();
	}

	private static void testIsSameClassLoader() {
		ClassLoader classLoader1 = ClassLoader.getSystemClassLoader();
		ClassLoader classLoader2 = Main.class.getClassLoader();
		ClassLoader classLoader3 = Cat.class.getClassLoader();

		ClassLoader classLoader4 = ClassLoader.class.getClassLoader();
		System.out.println(classLoader1 == classLoader2);
		System.out.println(classLoader2 == classLoader3);

		System.out.println(classLoader4);// BootstrapClassLoader
	}

	private static void testIsSameClass() throws ClassNotFoundException {
		// 测试两个ClassLoader加载一个类的关系。
		ClassLoader badclassLoader1 = new BadClassLoader();
		ClassLoader badclassLoader2 = new BadClassLoader();
		Class<?> badClazz1 = badclassLoader1.loadClass("com.less.bean.Cat");
		Class<?> badClazz2 = badclassLoader2.loadClass("com.less.bean.Cat");
		// 说明判断两个类是否是同一个类型的前提是: 同类 + 同包 + 同类加载器实例，即使两者都是加载远端的同一个类文件，但是却不是一个类型，故无法强制转换或者互相引用等等。
		System.out.println(badClazz1 == badClazz2);

	}

	private static void testObeyParent1() throws Exception {
		// 通常推荐重写的是findClass，而不是loadClass， 因为双亲委派的具体逻辑就写在loadClass中，loadClass的逻辑里如果parent加载失败，则会调用我们重写的findClass
		// 完成加载，这样就可以保证新写出的类加载器是符合双亲委派规则的，保证了各个类加载器基础类的 统一问题(越基础的类越有上层的类加载器加载)。
		// 但是双亲委派也是可以破坏掉的，常见的使用场景就是热修复，OGSi是这方面非常好的应用。

		// 无参的ClassLoader会默认设置  getSystemClassLoader() 即AppClassLoader为parent，见ClassLoader的构造器源码。
		ClassLoader mygoodClassLoader1 = new ClassLoader() {

			@Override
			protected Class<?> findClass(String name) throws ClassNotFoundException {
				return super.findClass(name);
			}
		};
		System.out.println("mygoodClassLoader1 ---> " + mygoodClassLoader1.getParent());
		Class<?> clazz1 = mygoodClassLoader1.loadClass("com.less.bean.Person");
		Object obj1 = clazz1.newInstance();
		message("[real classLoader] clazz1 => " + obj1.getClass().getClassLoader());
	}

	private static void testObeyParent2() {
		// 但是如果我们设置ClassLoader的parent为null,那么就没有parent替我们找了，然后直接交给BootstrapClassLoader找，肯定也找不到了，最后我们自己找好了，
		// 结果发现ClassLoader.findClass默认实现只是抛出一个异常,throw new ClassNotFoundException(name);所以要想要我们自己的ClassLoader能够加载类就必须实现findClass。
		ClassLoader mygoodClassLoader2 = new ClassLoader(null) {
			@Override
			protected Class<?> findClass(String name) throws ClassNotFoundException {
				// 这里默认实现是--> throw new ClassNotFoundException(name);
				return super.findClass(name);
			}
		};
		System.out.println("mygoodClassLoader2 ---> " + mygoodClassLoader2.getParent());

		try {
			Class<?> clazz2 = mygoodClassLoader2.loadClass("com.less.bean.Dog");
			Object obj2 = clazz2.newInstance();
			message("[real classLoader] clazz2 => " + obj2.getClass().getClassLoader());
		} catch (Exception e) {
			message("[real classLoader] clazz2 => " + e.toString());
		}
	}

	private static void testDisObeyParent() throws Exception {
		// 破坏双亲委派，直接自己加载
		ClassLoader mybadClassLoader = new BadClassLoader();
		System.out.println("mybadClassLoader ---> " + mybadClassLoader.getParent());
		Class<?> clazz3 = mybadClassLoader.loadClass("com.less.bean.Cat");
		Object obj3 =  clazz3.newInstance();
		message("[real classLoader] clazz3 => " + obj3.getClass().getClassLoader());

		/********************** 测试classpath(即我们自己的项目package下的类 和 远程加载的类是否相等) **********************
		 * 分析: 从BadClassLoader打印的日志可以看出，动态加载一个类的时候，此类里面关联的类(如成员变量,extend,局部变量等等)都会交给此ClassLoader的loadClass进行处理。
		 * 而且如果没有任何继承的情况下，其[隐式父类Object]都会交给其处理，这时候我们需要把这个Object或它包含的类 都交给 parent处理，否则我们这里的代码都没法有类型去引用这个生成的实例。
		 * 所有 Java 应用都至少需要引用 java.lang.Object类，也就是说在运行的时候，java.lang.Object这个类需要被加载到 Java 虚拟机中。如果这个加载过程由 Java 应用自己的类加载器来完成的话，很可能就存在多个版本的 java.lang.Object类
		 * 而且这些类之间是不兼容的。对于 Java 核心库的类的加载工作由引导类加载器来统一完成，需要保证Java 应用所使用的都是同一个版本的 Java 核心库的类，是互相兼容的。
		 ***********************************************************************************************/
		System.out.println(obj3.getClass().getClassLoader());
		System.out.println(Cat.class.getClassLoader());
		System.out.println(obj3 instanceof Cat);
	}

	private static void testDynamicByReflect() throws Exception {
		// URLClassLoader 只能加载jar文件,可以替代我们自定义的ClassLoader加载远程jar,Android也给我们提供了DexClassLoader来实现动态加载dex.
		File file = new File("F:/Monkey.jar");
		URL url = file.toURL();
		URLClassLoader urlClassLoader = new URLClassLoader(new URL[] { url });
		Class<?> clazz = urlClassLoader.loadClass("com.less.bean.Monkey");
		Object monkey = clazz.newInstance();
		Method method = clazz.getDeclaredMethod("say");
		method.invoke(null);// 使用静态方法
		method.invoke(monkey);// 使用对象调用

	}

	private static void testDynamicByInterface1() throws Exception {
		BadClassLoader badClassLoader = new BadClassLoader();
		Class<?> clazz = badClassLoader.loadClass("com.less.bean.Dog");
		Animal animal = (Animal) clazz.newInstance();
		animal.say();
	}

	private static void testDynamicByInterface2() throws Exception {
		File file = new File("F:/Dog.jar");
		URL url = file.toURL();
		URLClassLoader urlClassLoader = new URLClassLoader(new URL[] { url });
		Class<?> clazz = urlClassLoader.loadClass("com.less.bean.Dog");
		Animal animal = (Animal) clazz.newInstance();
		animal.say();
	}

	private static void message(String string) {
		StringBuilder builder = new StringBuilder();
		builder.append("\r\n");
		builder.append("[********************* ");
		builder.append(string);
		builder.append(" *********************]");
		builder.append("\r\n");
		System.out.println(builder.toString());
	}

	static class BadClassLoader extends ClassLoader {

		@Override
		public Class<?> loadClass(String name) throws ClassNotFoundException {
			try {
				String fileName = name.substring(name.lastIndexOf(".") + 1) + ".class";
				File file = new File("F:/" + fileName);
				if(!file.exists()){
					System.out.println("========> 没找到文件,使用默认逻辑加载 " + name);
					return super.loadClass(name);
				}else{
					System.out.println("========> 找到文件 ，开始加载 " + name);
					InputStream inputStream = new FileInputStream(file);
					byte[] data = new byte[inputStream.available()];
					inputStream.read(data);
					inputStream.close();
					// Android和Java的重要实现区别就在于这里，Android不支持直接加载.class或.jar,而是.dex，所以被修改为能够动态加载dex的逻辑。
					return defineClass(name, data, 0, data.length);
				}
			} catch (Exception e) {
				throw new ClassNotFoundException(name);
			}
		}
	}
}
```

**动态加载（Android版）**
经过Java版的测试，我们基本上使用URLClassLoader即可解决大部分需求。
但是经过Android版的测试，发现直接使用DexClassLoader加载类（接口方式调用）却跟我们上面自定义的FileClassLoader一样的结果。

远端没有去掉接口文件，调用报如下错误：
```
Class resolved by unexpected DEX: Lcom/less/plugin/Dog;(0x94f51010):0x87a01000 ref [Lcom/less/plugin/Animal;] Lcom/less/plugin/Animal;(0x94f08288):0x84988000
W/dalvikvm: (Lcom/less/plugin/Dog; had used a different Lcom/less/plugin/Animal; during pre-verification)
I/dalvikvm: Failed resolving Lcom/less/plugin/Dog; interface 0 'Lcom/less/plugin/Animal;'
W/dalvikvm: Link of class 'Lcom/less/plugin/Dog;' failed
```
这个错误按前面的分析不会产生才会，因为DexClassLoader也是双亲委派。
```
File dexOutputDir = getDir("dex", 0);

DexClassLoader classLoader = new DexClassLoader(outPath, dexOutputDir.getAbsolutePath(), null, getClassLoader());
Class<?> clazz = classLoader.loadClass("com.less.plugin.Dog");
Animal animal = (Animal) clazz.newInstance();
```
>分析：当加载插件Dog时，根据双亲委派模型，首先让parent（getClassLoader即PathClassLoader）加载，PathClassLoader并不能加载Dog，所以给了DexClassLoader加载，Dog被加载后，Dog类里面引用（implement）的Animal开始被加载，Animal存在于本地和远端，优先被PathClassLoader加载，故 Animal是可以成功引用Dog的，思路基本和URLClassLoader一致，且URLClassLoader没有任何问题。

请查看 http://androidxref.com/4.4.4_r1/xref/dalvik/vm/oo/Resolve.cpp

```
#include "Dalvik.h"
#include <stdlib.h>
/*
 * Find the class corresponding to "classIdx", which maps to a class name
 * string.  It might be in the same DEX file as "referrer", in a different
 * DEX file, generated by a class loader, or generated by the VM (e.g.
 * array classes).
 *
 * Because the DexTypeId is associated with the referring class' DEX file,
 * we may have to resolve the same class more than once if it's referred
 * to from classes in multiple DEX files.  This is a necessary property for
 * DEX files associated with different class loaders.
 *
 * We cache a copy of the lookup in the DexFile's "resolved class" table,
 * so future references to "classIdx" are faster.
 *
 * Note that "referrer" may be in the process of being linked.
 *
 * Traditional VMs might do access checks here, but in Dalvik the class
 * "constant pool" is shared between all classes in the DEX file.  We rely
 * on the verifier to do the checks for us.
 *
 * Does not initialize the class.
 *
 * "fromUnverifiedConstant" should only be set if this call is the direct
 * result of executing a "const-class" or "instance-of" instruction, which
 * use class constants not resolved by the bytecode verifier.
 *
 * Returns NULL with an exception raised on failure.
 */
ClassObject* dvmResolveClass(const ClassObject* referrer, u4 classIdx,
    bool fromUnverifiedConstant)
{
	// 略
}
```
上面有一段注释关键注释：Because the DexTypeId  ....
大致翻译为：因为DexTypeId是和DEX文件相关联的，我们必须防止相同的类被多个DEX文件引用，这是不同类加载器关联的DEX文件s的必须的特性。
```
struct DexTypeItem {
	u2  typeIdx;// DexTypeId中的索引下标
};
//rect-mapped "type_list".
struct DexTypeList {
	u4  size;// DexTypeItem的个数
	DexTypeItem list[1];// DexTypeItem变长数组
};
```

**解决方案**
本地只保留接口，远端只保留实现类。

> 总结：
>1. Java的动态加载jar或类非常简单，你可以直接使用URLClassLoader或者灵活自定义ClassLoader。
>2. Android 基本DexClassLoader就足够了，但要注意上面提到的问题，接口和实现 必须只有一份。
>3. 因为使用动态加载，所以项目里面只能有接口，所以每次加载dex都需要下载，如果希望有一份默认的实现，推荐打包后的dex放入assets目录中，需要更新的时候再根据file.lastModified()判断是否从网络下载新的。
>4. 插件类 如果希望用到第三方库，如okhttp，一般建议在项目里面依赖okhttp，而打包**插件**的时候去除okhttp依赖即可。除非你十分确定，主项目不会使用某个库，总之确保主项目dex和插件 永远没有重复的类。


## 动态加载dex案例
AS新建一个plugin library，利用gradle将非常方便生成Jar文件并dx化。

建一个接口文件
```
public interface Animal {
	public interface Callback {
		void done(String message);
	}
	void say(Callback callback);
}
```
创建实现类
```
public class Dog implements Animal {
    OkHttpClient okhttp = new OkHttpClient();

    public void say(final Callback callback) {
        Builder builder = (new Builder()).url("http://www.baidu.com");
        Call call = this.okhttp.newCall(builder.build());
        call.enqueue(new okhttp3.Callback() {
            public void onFailure(Call call, IOException e) {
                callback.done("error");
            }

            public void onResponse(Call call, Response response) throws IOException {
                String content = response.body().string();
                callback.done(content);
            }
        });
    }
}
```
在gradle中生成3个Task，分别用于以下用途：
1. 打Jar包
2. Jar包转为dex格式的Jar
3. 删除Plugin Library的实现类

![Paste_Image.png](http://upload-images.jianshu.io/upload_images/1281543-2f851fe4a47dc34d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![Paste_Image.png](http://upload-images.jianshu.io/upload_images/1281543-de640f6a9c9ce0ff.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

然后写个测试类就可以运行app了，下面测试类是把assets下的**插件dynamic.jar-1.0.jar** 写入SDcard，点击Button时 使用DexClassLoader动态加载即可，代码很简单。

```
public class TestActivity extends AppCompatActivity {
    private static final String TAG = "less";
    private String fileName = "dynamic.jar-1.0.jar";
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_test);
        writeToApp();
    }

    public void handle(View view) {
        try {
            String outPath = Environment.getExternalStorageDirectory() + File.separator + fileName;
            // 注意这个输出dex的路径需要在自己的目录里
            File dexOutputDir = getDir("dex", 0);

            DynamicClassLoader classLoader = new DynamicClassLoader(outPath, dexOutputDir.getAbsolutePath());
            Class<?> clazz = classLoader.loadClass("com.less.plugin.Dog");
            Animal animal = (Animal) clazz.newInstance();

            animal.say(new Animal.Callback() {
                @Override
                public void done(String message) {
                    Log.i(TAG, " ===> " + message);
                }
            });

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void writeToApp() {
        String outPath = Environment.getExternalStorageDirectory() + File.separator + fileName;

        InputStream inputStream = null;
        BufferedInputStream bufferedInputStream = null;
        FileOutputStream fileOutputStream = null;
        BufferedOutputStream bufferedOutputStream = null;

        try {
            inputStream = getResources().getAssets().open(fileName);
            bufferedInputStream = new BufferedInputStream(inputStream);
            fileOutputStream = new FileOutputStream(new File(outPath));
            bufferedOutputStream = new BufferedOutputStream(fileOutputStream);
            byte[] buffer = new byte[1024];
            int hasRead = -1;
            while ((hasRead = bufferedInputStream.read(buffer) ) != -1) {
                bufferedOutputStream.write(buffer,0,hasRead);
                bufferedOutputStream.flush();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }finally {
            try {
                bufferedInputStream.close();
                fileOutputStream.close();
                bufferedInputStream.close();
                inputStream.close();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        if (BuildConfig.DEBUG) {
            Log.d(TAG, "写入成功");
        }
    }
}
```
