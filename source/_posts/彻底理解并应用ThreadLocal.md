---
title: 彻底理解并应用ThreadLocal
date: 2017.03.25 21:13
tags: 
  - 源码分析
  - ThreadLocal
  - 线程安全
categories:
  - Android
---

> ThreadLocal是Java并发编程中非常重要的一个类,不仅面试经常考到，实际应用更是多如牛毛，JavaEE 流行框架和Android中都有大量的经典案例，此类也是Java开发必须掌握的一个类

 本文参考源码为jdk1.8.其中Android API25源码等同jdk1.8.
不同版本代码实现略有差异,原理相同

## 先学习下如何使用
线程基础案例

```
package com.syntc.oa;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;

public class Demo {

	private static Map<Thread, Integer> threadData = new HashMap<>();

	/**
	 * @param args
	 */
	public static void main(String[] args) {

		WordThread thread1 = new WordThread(threadData);
		WordThread thread2 = new WordThread(threadData);

		thread1.start();
		thread2.start();
			
		
		System.out.println(Thread.currentThread().getName()+" 执行完毕");

	}

}

class WordThread extends Thread {
	private Map<Thread, Integer> mThreadData;

	public WordThread(Map<Thread, Integer> threadData) {
		this.mThreadData = threadData;
	}

	/* (non-Javadoc)
	 * @see java.lang.Thread#run()
	 */
	@Override
	public void run() {
		super.run();
		System.out.println("WordThread:" + Thread.currentThread().getName());

		int dataIn = new Random().nextInt(10);

		// 存放数据, 这里之所以加个锁，是因为个别情况下因为并发原因导致mThreadData.put()的 key突然变为其他线程，则会导致get错误，Map线程不安全，注意
		synchronized (mThreadData) {
			mThreadData.put(Thread.currentThread(), dataIn);
		}

		
		// 获取数据
		int dataOut = mThreadData.get(Thread.currentThread());
		System.out.println(dataOut);

	}
}
```

修改为ThreadLocal版
```
package com.syntc.oa;

import java.util.Random;

public class Demo {

	private static ThreadLocal<Integer> threadData = new ThreadLocal<>();

	/**
	 * @param args
	 */
	public static void main(String[] args) {

		WordThread thread1 = new WordThread(threadData);
		WordThread thread2 = new WordThread(threadData);

		thread1.start();
		thread2.start();
			
		
		System.out.println(Thread.currentThread().getName()+" 执行完毕");

	}

}

class WordThread extends Thread {
	private ThreadLocal<Integer> mThreadData;

	public WordThread(ThreadLocal<Integer> threadData) {
		this.mThreadData = threadData;
	}

	/* (non-Javadoc)
	 * @see java.lang.Thread#run()
	 */
	@Override
	public void run() {
		super.run();
		System.out.println("WordThread:" + Thread.currentThread().getName());

		int dataIn = new Random().nextInt(10);

		mThreadData.set(dataIn);
		
		// 获取数据
		int dataOut = mThreadData.get();
		System.out.println(dataOut);

	}
}
```

对象类型参数使用

```
package com.syntc.oa;

import java.util.Random;

public class Demo {

	private static ThreadLocal<Integer> threadLocalInteger = new ThreadLocal<>();
	private static ThreadLocal<ScopeData> threadLocalData = new ThreadLocal<>();

	/**
	 * @param args
	 */
	public static void main(String[] args) {

		WordThread thread1 = new WordThread(threadLocalInteger,threadLocalData);
		WordThread thread2 = new WordThread(threadLocalInteger,threadLocalData);

		thread1.start();
		thread2.start();
		
	}

}

class WordThread extends Thread {
	private ThreadLocal<Integer> mThreadLocalInteger;
	private ThreadLocal<ScopeData> mThreadLocalData;

	public WordThread(ThreadLocal<Integer> threadLocalInteger, ThreadLocal<ScopeData> threadLocalData) {
		this.mThreadLocalInteger = threadLocalInteger;
		this.mThreadLocalData = threadLocalData;
	}

	/* (non-Javadoc)
	 * @see java.lang.Thread#run()
	 */
	@Override
	public void run() {
		super.run();
		System.out.println("WordThread:" + Thread.currentThread().getName());

		//设置数据
		int dataIn = new Random().nextInt(10);
		mThreadLocalInteger.set(dataIn);
		
		ScopeData scopeData = new ScopeData();
		scopeData.setName("xiaoming"+dataIn);
		scopeData.setAge(dataIn);
		
		mThreadLocalData.set(scopeData);
		
		// 获取数据
		int dataOut = mThreadLocalInteger.get();
		ScopeData scopeDataOut = mThreadLocalData.get();
		
		System.out.println(dataOut);
		System.out.println(scopeData);
		
		

	}
}


class ScopeData{
	
	private String name;
	private int age;
	
	
	
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public int getAge() {
		return age;
	}
	public void setAge(int age) {
		this.age = age;
	}
	@Override
	public String toString() {
		return "ScopeData [name=" + name + ", age=" + age + "]";
	}	
}

结果是:
WordThread:Thread-0
WordThread:Thread-1
3
1
ScopeData [name=xiaoming1, age=1]
ScopeData [name=xiaoming3, age=3]


```

把ScopeData改写为线程安全的类，隐藏掉ThreadLocal实现细节.

```
package com.syntc.oa;

import java.util.Random;

public class Demo {
	public static void main(String[] args) {

		WordThread thread1 = new WordThread();
		WordThread thread2 = new WordThread();

		thread1.start();
		thread2.start();
		
	}

}

class WordThread extends Thread {

	@Override
	public void run() {
		super.run();
		System.out.println("WordThread:" + Thread.currentThread().getName());

		//设置数据
		int age = new Random().nextInt(10);
		ScopeData scopeData = ScopeData.getThreadInstance();
		scopeData.setName("xiaoming"+age);
		scopeData.setAge(age);
		
		
		// 获取数据,真实项目中，下面的代码来自于同一线程中的 其他代码块中。。
		ScopeData scopeDataOut = ScopeData.getThreadInstance();
		
		System.out.println(scopeDataOut.getName()+" "+scopeData.getAge());
		
		

	}
}


class ScopeData{
	private static ThreadLocal<ScopeData> mThreadLocalData = new ThreadLocal<>();
	
	public static /*synchronized*/ ScopeData getThreadInstance(){
		ScopeData instance = mThreadLocalData.get();// 每个新线程第一次获取必定为null，后续则保证单例，每个线程一个实例，互不影响，故不需要synchronized
		if(instance == null){
			instance = new ScopeData();
			mThreadLocalData.set(instance);
		}
		return instance;
	}
	
	private String name;
	private int age;
	
	
	
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public int getAge() {
		return age;
	}
	public void setAge(int age) {
		this.age = age;
	}
	@Override
	public String toString() {
		return "ScopeData [name=" + name + ", age=" + age + "]";
	}
	
	
}

```

当然ThreadLocal<T>中 T(如上面的Scope)的初始化操作还可以这么做。
重写 ThreadLocal的initialValue方法，则每个线程中都有一份Queue变量的实例，具体使用请见我改写的EventBus库
[EventBus.java](https://github.com/wangli0/EventBus/blob/master/simple/src/main/java/com/ruoxu/eventbus/EventBus.java)

```

    ThreadLocal<Queue<EventType>> mLocalEvents = new ThreadLocal<Queue<EventType>>() {
        protected Queue<EventType> initialValue() {
            return new ConcurrentLinkedQueue<EventType>();
        };
    };

```









## ThreadLocal应用场景
>	  ThreadLocal应用场景:
	  1.订单处理包含一系列操作:减少库存量，增加一条流水台账，修改总账，这几个操作要在同一个事务中完成，通常也即同一个线程中进行处理，如果某家公司应收款的操作失败了，则应该
	  把前面的操作回滚，否则提交所有操作，这要求这些操作使用相同的数据库连接对象。
	  2.银行转账包含一系列的操作:把转出账户的余额减少，把转入账户的余额增加，这两个操作要在同一个事务中完成，它们必须使用相同的数据库连接对象
	  3.例如Struts2的ActionContext，同一段代码被不同的线程调用运行时，该代码操作的数据是每个线程各自的状态和数据，对于不同的线程来说，
	   getContext方法拿到的对象都不相同。对于同一个线程来说，不管调用getContext方法多少次和在哪个模块中getContext方法，拿到的都是同一个



## ThreadLocal原理
ThreadLocal的源码不是很多，为了理解的简单，这里只列举最实用的代码

```
package com.syntc.oa;

public class ThreadLocal<T> {
    protected T initialValue() {
        return null;
    }

    public void set(T value) {
        Thread t = Thread.currentThread();
        ThreadLocalMap map = getMap(t);

        if (map != null) {
            map.set(this, value);
        } else {
            createMap(t, value);
        }
    }

    private T setInitialValue() {
        T value = initialValue();
        Thread t = Thread.currentThread();
        ThreadLocalMap map = getMap(t);

        if (map != null) {
            map.set(this, value);
        } else {
            createMap(t, value);
        }

        return value;
    }

    void createMap(Thread t, T firstValue) {
        t.threadLocals = new ThreadLocalMap(this, firstValue);
    }

    ThreadLocalMap getMap(Thread t) {
        return t.threadLocals;
    }

    public T get() {
        Thread t = Thread.currentThread();
        ThreadLocalMap map = getMap(t);

        if (map != null) {
            ThreadLocalMap.Entry e = map.getEntry(this);

            if (e != null) {
                @SuppressWarnings("unchecked")
                T result = (T) e.value;

                return result;
            }
        }

        return setInitialValue();
    }
}


```

Thread类
```
class Thread implements Runnable {
        ThreadLocal.ThreadLocalMap threadLocals = null;
}
```

主要就是这些代码了，我们看到ThreadLocal中一个经常出现的变量map. 而这个map的获取则是Thread类维护的一个成员变量而已。
Thread t = Thread.currentThread();
t.threadLocals = new ThreadLocalMap(this, firstValue);

说白了在我看来 ThreadLocal仅仅是一个工具类而已，我们在任何线程中得到这样一个工具类对象，然后set,get 当前的线程对象---->间接操作的线程对象中的一个map，仅仅如此，当真正看到它的源码，远远没有想象中的复杂，就像EventBus能够维持组件间的通信，只是因为EventBus中的单例对象在调用这个方法，调用那个方法，就像一个管理者一样！

其他具体的细节就自己看吧，浪费空间，不过ThreadLocal和Android中Handler，Asynctask,EventBus,Okhttp等等的源码是非常值得细读的，设计非常精妙，我也从中受益匪浅....
