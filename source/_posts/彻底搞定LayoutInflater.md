---
title: 彻底搞定LayoutInflater
date: 2017.11.08 15:05
tags: 
  - 源码分析
  - 自定义View
  - LayoutInflater原理
categories:
  - Android
---

## 前提回顾
我有篇文章[你的自定义View是否真的支持Margin](http://www.jianshu.com/p/5fbb1ce3c7f0)
讲到 子View的margin属性的支持需要在 **自定义ViewGroup** 通过generateLayoutParams设置，而子View的padding支持则是自己在onDraw中处理。

generateLayoutParams大致如下：
```
public class MyViewGroup extends ViewGroup {
 @Override
    public LayoutParams generateLayoutParams(AttributeSet attrs) {
        // MyLayoutParams 继承自MarginLayoutParams
        return new MyLayoutParams(getContext(), attrs);
    }
}
```
其实MarginLayoutParams 不光设置子View的margin属性，还设置了子View的layout_width和layout_height属性。见下面的代码：

```
public abstract class ViewGroup extends View {
	public static class MarginLayoutParams extends ViewGroup.LayoutParams {
		 public MarginLayoutParams(Context c, AttributeSet attrs) {
            super();

            TypedArray a = c.obtainStyledAttributes(attrs, R.styleable.ViewGroup_MarginLayout);
            //************************** 设置layout_width和layout_height*********************
            setBaseAttributes(a,
                    R.styleable.ViewGroup_MarginLayout_layout_width,
                    R.styleable.ViewGroup_MarginLayout_layout_height);

            int margin = a.getDimensionPixelSize(
                    com.android.internal.R.styleable.ViewGroup_MarginLayout_layout_margin, -1);
          	// ............ 略
            a.recycle();
        }
	}
}
```
这里之所以提一下这个知识点，是为了说明子View的LayoutParams不能脱离parent存在，否则无法获取该参数。

-------------------------------------------------------

## 源码分析
我们经常用到LayoutInflater下面的两个方法

```
public View inflate(int resource, ViewGroup root) 
public View inflate(int resource, ViewGroup root, boolean attachToRoot) 
```
而方式一 只是间接调用了 方式二，所以只需分析和使用方式二即可。
```
 public View inflate(@LayoutRes int resource, @Nullable ViewGroup root) {
        return inflate(resource, root, root != null);
}
```

根据xml的ID获取xml解析器，然后又调用了另外一个**最重要的重载方法**
```
 public View inflate(int resource,ViewGroup root, boolean attachToRoot) {
        final Resources res = getContext().getResources();
        // 获取xml解析器
        final XmlResourceParser parser = res.getLayout(resource);
        try {
            return inflate(parser, root, attachToRoot);
        } finally {
            parser.close();
        }
}
```

为了方便理解，我 **删除** 无关代码，并对某些部分稍有修改，其中createViewFromTag方法比较长，此方法仅仅是根据当前的xml标签通过反射生成View对象，代码并不难，但是注意该方法的一个parent参数，源码并未使用此参数，防止对自己产生误导，这里不再贴出createViewFromTag的代码。

```
 public View inflate(XmlPullParser parser, ViewGroup parent, boolean attachToRoot) {
		    final Context inflaterContext = mContext;
            final AttributeSet attrs = Xml.asAttributeSet(parser);
            View result = parent;

            // Look for the parent node.
            int type;
            type = parser.next();

            if (type != XmlPullParser.START_TAG) {
                throw new InflateException(parser.getPositionDescription()
                        + ": No start tag found!");
            }

            final String name = parser.getName();
	        // 根据当前的标签名（此处是xml的根节点）反射生成一个View对象，查看源码这个parent参数并没什么卵用，没用到。
            final View temp = createViewFromTag(parent, name, inflaterContext, attrs);

            ViewGroup.LayoutParams params = null;

            if (parent != null) {
                // 如果传参parent != null时候，才创建LayoutParams
                //************************* 这个地方是导致我们常常犯错误的关键 *************************
                // generateLayoutParams -> { new LinearLayout.LayoutParams(attrs); } 
                // LinearLayout.LayoutParams <init> ->  { TypedArray a = context.obtainStyledAttributes; }
                params = parent.generateLayoutParams(attrs);
                if (!attachToRoot) {
                    // 1. 如果parent != null && attachToRoot = false,就给xml的顶布局设置LayoutParams参数。
                    temp.setLayoutParams(params);
                }
            }

            // 此方法为递归调用，inflate 所有temp的直接下级children并添加到temp（ViewGroup）中，child如果有children则继续递归知道遍历完整个dom树。
            rInflateChildren(parser, temp, attrs, true);

            // 2. 如果 parent != null && attachToRoot = true,则把temp(即整个xml视图)当作子view 添加到parent中
            if (parent != null && attachToRoot) {
            	// 添加子view(temp) ,并给temp设置LayoutParams
                parent.addView(temp, params);
            }

            // 此处决定 返回的是传入的parent参数还是xml中的顶级布局
            // 情况1: parent == null (attachToRoot无论true或false) 返回temp(temp无LayoutParams)
            // 情况2: parent != null && attachToRoot == false 返回 temp(temp有LayoutParams)
            // 情况3: parent != null && attachToRoot == true 返回 parent(temp有LayoutParams)
            if (parent == null || !attachToRoot) {
                result = temp;
            }
            return result;
    }
```

通过去除大量无关代码，分析起来就方便多了，注释说的非常明白了，这里不再过多讲解。

实际开发Listview（RecycleView） 在Adapter 中使用`inflater.inflate(R.layout.item, null); ` 设置
`layout_width，layout_height`无效的原因就非常简单明了了。

而下面两种方式
```
inflater.inflate(R.layout.item, parent ,false);
inflater.inflate(R.layout.item, parent ,true);
```
都会使设置xml的顶级Dom的layout_width和layout_height，唯一区别就是
1. 一个返回xml视图
2. 一个返回parent.add(xml视图)

##结论
这里temp指的是xml的根节点
```
1. parent == null (attachToRoot无论true或false) 返回temp(temp无LayoutParams)
2. parent != null && attachToRoot == false 返回 temp(temp有LayoutParams)
3. parent != null && attachToRoot == true 返回 parent(temp有LayoutParams)
```
