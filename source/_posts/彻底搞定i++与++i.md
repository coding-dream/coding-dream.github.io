---
title: 彻底搞定i++与++i
date: 2017.03.24 23:30
tags: 
  - 面试
categories:
  - Java
---

> 每次遇到i++与++i的问题，我就想吐槽下心中不爽的情绪，是那个混蛋总爱考这种没有任何意义的玩意，大学期间考试总是这种题目，即使是笔试很多时候也少不了这种题目。
对于多种优先级与i++,++i 结合的考题，有木有想干死它的心。
<c primer plus>中作者也是极力反对此种写法的，一个括号就解决的问题，但是谁有办法呢？


先看下面一段代码

```
public static void main(String[] args) {
    int i = 0;
    i = i++ + ++i;
    System.out.println(i);
}
```

我们首先反汇编这段代码
javac Demo.java
javap -c Demo 
得到汇编代码如下:

```
Compiled from "Demo.java"
public class Demo {
  public Demo();
    Code:
       0: aload_0       
       1: invokespecial #1                  // Method java/lang/Object."<init>":()V
       4: return        

  public static void main(java.lang.String[]);
    Code:
       0: iconst_0      
       1: istore_1      
       2: iload_1       
       3: iinc          1, 1
       6: iinc          1, 1
       9: iload_1       
      10: iadd          
      11: istore_1      
      12: getstatic     #2                  // Field java/lang/System.out:Ljava/io/PrintStream;
      15: iload_1       
      16: invokevirtual #3                  // Method java/io/PrintStream.println:(I)V
      19: return        
}

```




上面的代码执行过程如下:
1. 计算i++
2. 计算++i
3. 将前两个计算的结果加起来赋值给i

```
步骤1
int copy1 = i;
i++

步骤2
i++
int copy2 = i

步骤3
i = copy1 + copy2;
```

i= copy1 + copy2 (也就是0+2)



>总之记住 i++是先赋值->给临时变量temp，然后自身加1；++i先自身加1 后赋值给临时变量temp；


## 面试题一
```
int a = 5,b = 3;
if(!(a==b)&&a==1+b++){
}
    System.out.println(a);
    System.out.println(b);
因为!(a==b) 整体为true，继续执行 a==1+b++;
注意是==，而不是=

```
int copy = b;
b++;
故  b = b+1 = 4;


## 面试题二
陷阱题:
```

public class Demo {
	public static void main(String[] args) {
		int j = 0;
	
		for(int i=0;i<100;i++){
			j = j++;
		}
		System.out.println(j);
		
	}
}

```
结果是 0
分析:
仍然根据jvm原理，java汇编码中用了中间缓存变量的机制

j = j++ 等价于 

int copy = j;  j = j+1;
j = copy; 故 = 0


```
public class Demo {
	public static void main(String[] args) {
		int j = 0;
	
		for(int i=0;i<100;i++){
			j = ++j;
		}
		System.out.println(j);
		
	}
}

结果 为 100
```
分析:
j = j+1; int copy = j;
j = copy;



```
public class Demo {
	public static void main(String[] args) {
		int j = 0;
	
		for(int i=0;i<100;i++){
			j++; //或者 ++j ;等同
		}
		System.out.println(j);
		
	}
}
结果 100
```

## 面试题三
```
int i = 0,j=0, k = 0;
i = ++i + i++ + i++ + i++;

j = j++ + j++ + j++ + ++j;

k = ++k + ++k;

int p1=0,p2 =0; int q1=0,q2 = 0;
q1=++p1;
q2=p2++;


```
结果分别是：
i=7
j=7
k=3
p1=1
p2=1
q1=1
q2=0

再举一例 j的值 来分析
j = (j++) + (j++)+(j++)+(++j)

表达式从左向右计算,把每个括号看作为一个整体.局部变量用jt等表示.

int j = 0;
(1). jt1 = j; j = j+1;  // jt1 = 0;j=1;
(2). jt2 = j ; j = j+1; // jt2 = 1;j=2; 
(3). jt3 = j; j = j+1; // jt3 = 2; j =3;
(4). j = j+1; jt4 = j; // j = 4; jt4 = 4;

故 最终结果为:
j = jt1 + jt2 + jt3 + jt4 = 0+1+2+4 = 7;
