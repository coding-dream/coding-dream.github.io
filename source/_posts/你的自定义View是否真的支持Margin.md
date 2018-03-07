---
title: 你的自定义View是否真的支持Margin
date: 2016-09-26 10:22:40
tags: 
  - 源码分析
  - 自定义View
categories:
  - Android
---

>简书 [编程之乐](http://www.jianshu.com/u/79a88a044955)
转载请注明原创出处！

前些日子重温了早已忘却的JavaEE的一些知识点，然后又捣鼓了Python，《Chrome扩展开发》和《JavaFX》相关的东西，花了点时间在上面，下面两个项目是学习过程中做的一些案例。JavaFX感觉不错，对于Android开发者也非常简单，有兴趣的可以参考学习下。
[https://github.com/coding-dream/Notebook](https://github.com/coding-dream/Notebook)
[https://github.com/coding-dream/chrome_ex](https://github.com/coding-dream/chrome_ex)

然而之后发现Android好多东西又淡忘了，看来自己的记性真是越来越差了，总是烫剩饭，某些东西不记录下来很快就忘记了。

不过复习自定义View过程中我发现几乎 **很多人** 都犯了一个细节上的错误，就是**ViewGroup中的子View** 不支持margin。

> 注: 关于自定义View的基础教程 请参阅其他博客

先总结两点
1. 自定义View在onDraw里面需要处理padding的影响，widthMeasureSpec和heightMeasureSpec是包含padding大小的。
2. 子View的margin属性是由ViewGroup处理的，ViewGroup在onMeasure和onLayout时一定要考虑 ViewGroup自己的padding和子View的margin的影响。

你可能遇到过下面这样的错误。
```
java.lang.ClassCastException: android.view.ViewGroup$LayoutParams cannot be cast to android.view.ViewGroup$MarginLayoutParams
```

------------------------------------------------------------ 

下面我们分析为什么会遇到这种错误以及解决方法。

你可能见过很多人在自定义ViewGroup的
`onMeasure() `中使用
`measureChildren(widthMeasureSpec, heightMeasureSpec);` 来测量所有子View的尺寸。

ViewGroup.measureChildren的源码如下：
```
final int size = mChildrenCount;
final View[] children = mChildren;
for (int i = 0; i < size; ++i) {
	final View child = children[i];
	if ((child.mViewFlags & VISIBILITY_MASK) != GONE) {
		// ******************* 注意这里 ********************
		measureChild(child, widthMeasureSpec, heightMeasureSpec);
	}
}
```
measureChild是不是不太合适呢，查阅了FrameLayout和LinearLayout等都没有用过这个measureChildren呢，几乎全部都重写了，我们的自定义ViewGroup的measureChildren是不是应该是改成下面这样才对。

```
final int size = mChildrenCount;
final View[] children = mChildren;
for (int i = 0; i < size; ++i) {
	final View child = children[i];
	if ((child.mViewFlags & VISIBILITY_MASK) != GONE) {
		// ******************* 注意这里 ********************
		measureChildWithMargins(child, widthMeasureSpec, heightMeasureSpec);
	}
}
```
你应该看到了区别，measureChild和measureChildWithMargins区别就是
测量child尺寸时，保证child的 **最大可用尺寸**，感觉这个with前缀起的不太好。
1. measureChild减去了 **ViewGroup的padding** 保证child最大可用空间
2. measureChildWithMargins减去了**ViewGroup的padding**和**子View的margin** 保证child最大可用空间

至于 measureChild和measureChildWithMargins中是如何**生成child的MeasureSpec，并最终调用child.measure() -- > child.onMeasure()的，这里就不贴源码了。

> 总结 : ViewGroup中测量child一定要用measureChildWithMargins而不是measureChild

**使用measureChildWithMargins后却产生异常**
终于改成measureChildWithMargins了，却突然产生了异常，这是为什么？
找到异常产生的位置，追踪到ViewGroup.addView()方法，源码如下：
```
public void addView(View child, int index) {
	if (child == null) {
		throw new IllegalArgumentException("Cannot add a null child view to a ViewGroup");
	}
	LayoutParams params = child.getLayoutParams();
	if (params == null) {
		// **************** 注意这里 ****************
		params = generateDefaultLayoutParams();
		if (params == null) {
			throw new IllegalArgumentException("generateDefaultLayoutParams() cannot return null");
		}
	}
	addView(child, index, params);
}
```

异常信息是 ClassCastException
`cannot be cast to android.view.ViewGroup$MarginLayoutParams`
而addView中,如果child.getLayoutParams();获取不到，则默认生成一个
`generateDefaultLayoutParams();`

```
protected LayoutParams generateDefaultLayoutParams() {
        return new LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT);
    }
```
这个默认生成的肯定不能强制转换为MarginLayoutParams了。

再来看addView中的其他方法
```
private void addViewInner(View child, int index, LayoutParams params,boolean preventRequestLayout) {
        if (!checkLayoutParams(params)) {
	        // **************** 注意这里 ****************
            params = generateLayoutParams(params);
        }

        if (preventRequestLayout) {
            child.mLayoutParams = params;
        } else {
            child.setLayoutParams(params);
        }

        if (index < 0) {
            index = mChildrenCount;
        }

        addInArray(child, index);
		................
		................
}

```
里面还有检测这个child的LayoutParams 是不是为空的，干脆全部重写得了。

在你的自定义ViewGroup中加入如下代码即可令 **子View** 的margin生效。

```
public class MyViewGroup extends ViewGroup {
	// ..................... 其他代码省略 .....................
	
    @Override
    public LayoutParams generateLayoutParams(AttributeSet attrs) {
        return new MyLayoutParams(getContext(), attrs);
    }

    @Override
    protected ViewGroup.LayoutParams generateLayoutParams(ViewGroup.LayoutParams lp) {
        return new MyLayoutParams(lp);
    }

    @Override
    protected LayoutParams generateDefaultLayoutParams() {
        return new MyLayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT);
    }

    public static class MyLayoutParams extends MarginLayoutParams {

        public MyLayoutParams(Context c, AttributeSet attrs) {
            super(c, attrs);
        }

        public MyLayoutParams(int width, int height) {
            super(width, height);
        }

        public MyLayoutParams(LayoutParams lp) {
            super(lp);
        }
    }
}
```

另外在ViewGroup.onLayout()时中千万别忘记根据 **ViewGroup的padding和子View的margin** 灵活给子View布局。

关于自定义View和自定义ViewGroup的其他细节就参阅其他文章吧。最好参考Android系统自带控件的 源码，毕竟这是最准确无误的，阅读他们文章加上自己的见解和怀疑，大牛也会有犯错的时候。
