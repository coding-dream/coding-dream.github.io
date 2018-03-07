---
title: FragmentPagerAdapter和FragmentStatePagerAdapter源码中的三宝
date: 2017.12.12 22:56
tags: 
  - 源码分析
  - FragmentPagerAdapter
  - FragmentStatePagerAdapter
  - 设计模式
  - 观察者模式
  - 适配器模式
  - ViewPager刷新
categories:
  - Android
---

>简书 [编程之乐](http://www.jianshu.com/u/79a88a044955)
转载请注明原创出处，谢谢！

## 前言
>FragmentPagerAdapter和FragmentStatePagerAdapter是我们开发中经常遇到的两个类，尤其是和ViewPager的配合。几乎我们每个Android开发者都被Fragment和ViewPager，PopupWindow，适配等等一堆神坑折磨着，尤其是Fragment神坑无数，这些都是天天在用的组件，Google为什么留给我们这么多坑。也正因如此，为了不掉进坑里，就需要我们不断去填坑。

下面是通过阅读FragmentPagerAdapter和FragmentStatePagerAdapter能够学到的知识点：
1. ViewPager刷新问题
2. 适配器模式
3. 观察者模式

## 区别一: 状态保存
我们在使用ViewPager的时候，经常使用下面几种方式：
```
ViewPager viewPager = findViewById(R.id.viewPager);
// 方式一
viewPager.setAdapter(new PagerAdapter() {
        private String mTitles[] ;
        private List<View> mViewList;

        @Override
        public int getCount() {
            return mViewList.size();
        }

        @Override
        public boolean isViewFromObject(View view, Object object) {
            return view == object;
        }

        @Override
        public Object instantiateItem(ViewGroup container, int position) {
            View view = mViewList.get(position);
            container.addView(view);
            return view;
        }

        @Override
        public void destroyItem(ViewGroup container, int position, Object object) {
            container.removeView((View) object);
        }

        @Override
        public CharSequence getPageTitle(int position) {
            return mTitles[position];
        }
});

// 方式二
viewPager.setAdapter(new FragmentPagerAdapter(getSupportFragmentManager()) {
    @Override
    public Fragment getItem(int position) {
        return fragments.get(position);
    }

    @Override
    public int getCount() {
        return fragments.size();
    }
});

// 方式三
viewPager.setAdapter(new FragmentStatePagerAdapter(getSupportFragmentManager()) {
    @Override
    public Fragment getItem(int position) {
        return fragments.get(position);
    }

    @Override
    public int getCount() {
        return fragments.size();
    }
});

```

用法大家都比较熟悉了，其中FragmentPagerAdapter 和 FragmentStatePagerAdapter有什么区别呢？

根据两个类的名称就可以知道FragmentStatePagerAdapter似乎是保存状态的，我们分别去这两个类找下它们的区别，发现它们都重写了父类PageAdapter的方法:
```
public abstract class PagerAdapter {
    // 省略 
    public static final int POSITION_UNCHANGED = -1;
    public static final int POSITION_NONE = -2;

    public Parcelable saveState() {
        return null;
    }

    public void restoreState(Parcelable state, ClassLoader loader) {
        
    }
}
```
分别查看它们的实现：

FragmentPagerAdapter的实现
```
@Override
    public Parcelable saveState() {
        return null;
    }

    @Override
    public void restoreState(Parcelable state, ClassLoader loader) {
    }
```
FragmentStatePagerAdapter的实现
```
 public Parcelable saveState() {
        Bundle state = null;
        if (mSavedState.size() > 0) {
            state = new Bundle();
            Fragment.SavedState[] fss = new Fragment.SavedState[mSavedState.size()];
            mSavedState.toArray(fss);
            state.putParcelableArray("states", fss);
        }
        for (int i=0; i<mFragments.size(); i++) {
            Fragment f = mFragments.get(i);
            if (f != null && f.isAdded()) {
                if (state == null) {
                    state = new Bundle();
                }
                String key = "f" + i;
                mFragmentManager.putFragment(state, key, f);
            }
        }
        return state;
    }

    @Override
    public void restoreState(Parcelable state, ClassLoader loader) {
        if (state != null) {
            Bundle bundle = (Bundle)state;
            bundle.setClassLoader(loader);
            Parcelable[] fss = bundle.getParcelableArray("states");
            mSavedState.clear();
            mFragments.clear();
            if (fss != null) {
                for (int i=0; i<fss.length; i++) {
                    mSavedState.add((Fragment.SavedState)fss[i]);
                }
            }
            Iterable<String> keys = bundle.keySet();
            for (String key: keys) {
                if (key.startsWith("f")) {
                    int index = Integer.parseInt(key.substring(1));
                    Fragment f = mFragmentManager.getFragment(bundle, key);
                    if (f != null) {
                        while (mFragments.size() <= index) {
                            mFragments.add(null);
                        }
                        f.setMenuVisibility(false);
                        mFragments.set(index, f);
                    } else {
                        Log.w(TAG, "Bad fragment at key " + key);
                    }
                }
            }
        }
    }
```

可以很容易看出只有FragmentStatePagerAdapter对Fragment的状态进行了保存，而FragmentPagerAdapter则是空实现。

虽然两个Adapter均有保存状态的代码，但是它们具体是在哪里被调用的呢？根据我们学过的Activity和Fragment的保存状态的方式，我们知道状态的恢复和保存一般在这些组件或者View里，的确，它们是在ViewPager中。
```
public class ViewPager extends ViewGroup {
  @Override
    public Parcelable onSaveInstanceState() {
        Parcelable superState = super.onSaveInstanceState();
        SavedState ss = new SavedState(superState);
        ss.position = mCurItem;
        if (mAdapter != null) {
            ss.adapterState = mAdapter.saveState();
        }
        return ss;
    }

    @Override
    public void onRestoreInstanceState(Parcelable state) {
        if (!(state instanceof SavedState)) {
            super.onRestoreInstanceState(state);
            return;
        }

        SavedState ss = (SavedState) state;
        super.onRestoreInstanceState(ss.getSuperState());

        if (mAdapter != null) {
            mAdapter.restoreState(ss.adapterState, ss.loader);
            setCurrentItemInternal(ss.position, false, true);
        } else {
            mRestoredCurItem = ss.position;
            mRestoredAdapterState = ss.adapterState;
            mRestoredClassLoader = ss.loader;
        }
    }
}
```
因为ViewPager持有Adapter实例，所以ViewPager的onSaveInstanceState和onRestoreInstanceState方法都是间接调用Adapter来执行状态的恢复和保存的，我们看到ViewPager中间接调用了`mAdapter.saveState()`和`mAdapter.restoreState`。

---------------------------------------------------- 

## 区别二: 实例销毁 vs 视图销毁
除了上面的区别外，FragmentStatePagerAdapter和FragmentPagerAdapter唯一的区别就是对Fragment对象的处理了。

我们平常使用ViewPager + PageAdater时候需要重写很多方法，如开头的那几个案例，而ViewPager + FragmentPagerAdapter(FragmentStatePagerAdapter) 仅仅实现getItem和getCount两个方法就够了，核心方法instantiateItem和destroyItem内部已经做好了实现。

先看FragmentStatePagerAdapter类
```
 private ArrayList<Fragment> mFragments = new ArrayList<Fragment>();

 public Object instantiateItem(ViewGroup container, int position) {
        if (mFragments.size() > position) {
            Fragment f = mFragments.get(position);
            if (f != null) {
                return f;
            }
        }

        if (mCurTransaction == null) {
            mCurTransaction = mFragmentManager.beginTransaction();
        }

        // 实例化fragment(交给我们实现的getItem方法)
        Fragment fragment = getItem(position);

        if (mSavedState.size() > position) {
            Fragment.SavedState fss = mSavedState.get(position);
            if (fss != null) {
                fragment.setInitialSavedState(fss);
            }
        }
        // 如果缓存 <= ViewPager传入的position,说明当前位置还未存入缓存.
        while (mFragments.size() <= position) {
            // 先占个坑
            mFragments.add(null);
        }
        fragment.setUserVisibleHint(false);
        // 填坑
        mFragments.set(position, fragment);
        // 填充视图
        mCurTransaction.add(container.getId(), fragment);
        return fragment;
    }

    @Override
    public void destroyItem(ViewGroup container, int position, Object object) {
        Fragment fragment = (Fragment) object;

        if (mCurTransaction == null) {
            mCurTransaction = mFragmentManager.beginTransaction();
        }
        // 从缓存中移除
        mFragments.set(position, null);
        // 从FragmentManager中移除
        mCurTransaction.remove(fragment);
    }
```
再来看下FragmentPagerAdapter的两个实现方法：
```
@Override
public Object instantiateItem(ViewGroup container, int position) {
    if (mCurTransaction == null) {
        mCurTransaction = mFragmentManager.beginTransaction();
    }

    final long itemId = getItemId(position);

    // Do we already have this fragment?
    String name = makeFragmentName(container.getId(), itemId);
    Fragment fragment = mFragmentManager.findFragmentByTag(name);
    if (fragment != null) {
        mCurTransaction.attach(fragment);
    } else {
        fragment = getItem(position);
        mCurTransaction.add(container.getId(), fragment,
                makeFragmentName(container.getId(), itemId));
    }
    if (fragment != mCurrentPrimaryItem) {
        fragment.setMenuVisibility(false);
        fragment.setUserVisibleHint(false);
    }

    return fragment;
}

@Override
public void destroyItem(ViewGroup container, int position, Object object) {
    if (mCurTransaction == null) {
        mCurTransaction = mFragmentManager.beginTransaction();
    }
    mCurTransaction.detach((Fragment)object);
}
```

FragmentStatePagerAdapter 内部还做了个小缓存，这个不是重点，我们主要关注

FragmentStatePagerAdapter 
```
mCurTransaction.add(container.getId(), fragment);
mCurTransaction.remove(fragment);
```
和FragmentPagerAdapter 
```
mCurTransaction.attach(fragment);
mCurTransaction.add(container.getId(), fragment,makeFragmentName(container.getId(), itemId));
mCurTransaction.detach((Fragment)object);
```
很明显，FragmentStatePagerAdapter 对fragment进行完全的添加和删除操作，而FragmentPagerAdapter 则是对视图进行attach和detach。

> 总结：
FragmentStatePagerAdapter 适合大量页面，不断重建和销毁
FragmentPagerAdapter 适合少量页面，常驻内存。


## 适配器模式
因为Android这个知识点有两个设计模式的案例实在太经典了，所以想顺便拿来讲一下，理解了这些，开发过程中常见两个坑的问题：
1. 懒加载
2. 数据不更新
经过查看源码就非常容易解决了！

```
public class ViewPager {
    
    private PagerAdapter mAdapter;
    public void setAdapter(PagerAdapter adapter) {
        adapter.xx();
        adapter.xxx();
        this.mAdapte = adapter;
        
        // ....
        requestLayout();
    }

    public void dataSetChanged() {
         final int adapterCount = mAdapter.getCount();
         // ....
         mAdapter.destroyItem(this, ii.position, ii.object);
         // ....
         // ....
    }
}
```
可以看到ViewPager持有的是PagerAdapter，ViewPager中**间接调用**了很多PagerAdapter的方法，使用**组合方式**来代替**继承方式**解耦。
怎么看着那么像**模板方法模式**呢，设计模式中很多模式确实太像了，比如**代理模式** 和 **装饰器模式**。

组合优于继承，总之，能用组合实现的不要用继承。
前不久我看一个开源项目的代码，大量的继承和模板方法模式，看的我真的快怀疑自己智商了。

## 伪观察者模式

再来看下ViewPager的代码：
```
public class ViewPager {
    // 观察者
    private PagerObserver mObserver;
    private PagerAdapter mAdapter;
    public void setAdapter(PagerAdapter adapter) {
        adapter.xx();
        adapter.xxx();
        this.mAdapte = adapter;
        if (mAdapter != null) {
            if (mObserver == null) {
                // 实例化观察者对象
                mObserver = new PagerObserver();
            }
            // 传递一个观察者mObserver对象供adapter调用
            mAdapter.setViewPagerObserver(mObserver);
        }
        // ....
        requestLayout();
    }

    public void dataSetChanged() {
         final int adapterCount = mAdapter.getCount();
         // ....
         mAdapter.destroyItem(this, ii.position, ii.object);
         // ....
         // ....
    }

    /**
     * 观察者对象 
     */
    private class PagerObserver extends DataSetObserver {
        PagerObserver() {
        }

        @Override
        public void onChanged() {
            dataSetChanged();
        }
        @Override
        public void onInvalidated() {
            dataSetChanged();
        }
    }
}
```

在setAdapter中` mAdapter.setViewPagerObserver(mObserver);`
这里传递了一个内部类对象名称叫 **PagerObserver**，大家要注意了，这个地方虽然起名叫做观察者，我认为是不合理的，确实Android提供给我们一个注册观察者的接口来监听（后面详细讲），不过我们常常用**notifyDataChange()** 来通知ViewPager数据更新这里的默认实现 **并没有真正用** 观察者模式，可能是Google偷懒了吧。
mAdapter.setViewPagerObserver(mObserver)传递的这个对象 更像**回调**。回调接口的本质不就是传递一个对象吗？？ C语言的实现则是传递指针。JavaScript传递function。

看下我们经常调用的notifyDataSetChanged方法：
```
public abstract class PagerAdapter {
    // 被观察者,暂时不用管
    private final DataSetObservable mObservable = new DataSetObservable();
    // 冒充者,虽然也叫观察者对象,但实际算是个回调对象
    private DataSetObserver mViewPagerObserver;

    void setViewPagerObserver(DataSetObserver observer) {
        synchronized (this) {
            mViewPagerObserver = observer;
        }
    }

    public void notifyDataSetChanged() {
        synchronized (this) {
            if (mViewPagerObserver != null) {
                mViewPagerObserver.onChanged();
            }
        }
        mObservable.notifyChanged();
    }
}
```
注释写的很明白，PagerAdapter里面怎么可能同时充当观察者和被观察者嘛，notifyDataSetChanged没有用观察者模式实现。

但是我们注意到了，notifyDataSetChanged方法的最后调用了
` mObservable.notifyChanged();`
这里才是真正的观察者模式，**被观察者**准备调用自己的方法**通知所有的观察者** 数据改变了。可惜的是当前 目前还木有人注册，孤芳自赏！

这里暂时做个标记，我们最后在看Android的观察者模式设计。

继续跟踪代码，notifyDataSetChanged调用了`mViewPagerObserver`这个伪娘的onChanged方法（ViewPager中）,
onChanged()调用了ViewPager的dataSetChanged方法：

```
  void dataSetChanged() {
        // This method only gets called if our observer is attached, so mAdapter is non-null.

        final int adapterCount = mAdapter.getCount();
        mExpectedAdapterCount = adapterCount;
        boolean needPopulate = mItems.size() < mOffscreenPageLimit * 2 + 1
                && mItems.size() < adapterCount;

        // newCurrItem 用于跟踪标记当前ViewPager的所在页
        int newCurrItem = mCurItem;

        boolean isUpdating = false;
        // 遍历ViewPager中所有的items(每个ItemInfo中包含着fragment实例,position等信息)
        for (int i = 0; i < mItems.size(); i++) {
            final ItemInfo ii = mItems.get(i);
            // getItemPosition方法是我们根据需要重写的方法,有三种值: POSITION_UNCHANGED和POSITION_NONE和pos(int类型)
            final int newPos = mAdapter.getItemPosition(ii.object);

            // (1). 如果getItemPosition()返回值是POSITION_UNCHANGED(默认实现),不做处理
            if (newPos == PagerAdapter.POSITION_UNCHANGED) {
                continue;
            }

            // (2). 如果getItemPosition()返回值是POSITION_NONE,移除ViewPager的mItems中当前正在遍历着的ItemInfo
            if (newPos == PagerAdapter.POSITION_NONE) {
                mItems.remove(i);
                i--;

                if (!isUpdating) {
                    // 方法内没什么实际意义
                    mAdapter.startUpdate(this);
                    isUpdating = true;
                }
                // 同时调用adapter的销毁方法销毁当前遍历着的ItemInfo
                mAdapter.destroyItem(this, ii.position, ii.object);
                needPopulate = true;

                continue;
            }
            // (3). 如果getItemPosition()返回值是其他的值(如newPos = 3),则相当于把[首次初始化的ViewPager中ItemInfo的position]重新赋值为指定的值.换个位置,这个特性一般我们很少用到.
            if (ii.position != newPos) {
                if (ii.position == mCurItem) {
                    // 如果当前for循环中遍历的ItemInfo.position正好等于ViewPager中的当前页下标,跟踪标记
                    newCurrItem = newPos;
                }

                ii.position = newPos;
                needPopulate = true;
            }
        }

        if (isUpdating) {
            mAdapter.finishUpdate(this);
        }

        Collections.sort(mItems, COMPARATOR);

        // 根据前面的分析, (2) 和 (3)都会导致重新请求布局
        if (needPopulate) {
            // Reset our known page widths; populate will recompute them.
            final int childCount = getChildCount();
            for (int i = 0; i < childCount; i++) {
                final View child = getChildAt(i);
                final LayoutParams lp = (LayoutParams) child.getLayoutParams();
                if (!lp.isDecor) {
                    lp.widthFactor = 0.f;
                }
            }
            // 设置当前页,并重新布局或者是滚动到此页
            setCurrentItemInternal(newCurrItem, false, true);
            requestLayout();
        }
    }
```
这个方法逻辑稍有点多，分析都写在注释里了。

根据下面这段代码
```
boolean needPopulate = mItems.size() < mOffscreenPageLimit * 2 + 1
                && mItems.size() < adapterCount;
```
我们知道给ViewPager新添加View或Fragment没有任何问题.它会自动处理，但是**更新** 就有问题了，我们可能希望把某个页面替换掉，比如A->B.

但是根据这段代码的逻辑，不重写getItemPosition方法**（默认POSITION_UNCHANGED）**的话是不会有任何变化的。

通过重写getItemPosition()方法
```
final int newPos = mAdapter.getItemPosition(ii.object);
// ... 
mAdapter.destroyItem(this, ii.position, ii.object);
```
我们可以看到ViewPager中只要有返回POSITION_NONE的项，那么就会销毁该项并刷新。

但是不建议大家直接在adapter中这么干（虽然我是这么干的，懒人）：
反例如下：
```
@Override
public int getCount() {
    return this.mFragmentList.size();
}

public int getItemPosition(Object object) {
    return POSITION_NONE;
}

@Override
public Fragment getItem(int position) {
    return mFragmentList.get(position);
}
```

这样会导致调用notifyDataChange时候ViewPager中每个Fragment都会被 mAdapter.destroyItem。我们只是想更新某个Item就够了，这一下子全部都
destroyItem一遍，性能肯定造成浪费。

大家可以根据自己的逻辑修改进行实现，其中object就是Fragment对象或view对象，比如设置tag之类的，只令某一项返回POSITION_NONE。
```
public int getItemPosition(Object object) {
    return POSITION_NONE;
}
```

## 观察者模式
>首先声明：虽然在ViewPager（充当观察者）和PagerAdapter（充当被观察者）中出现了观察者模式的代码，但是ViewPager中并未注册观察者。不过这里的案例非常经典，不由得分析下作为记录。同样的，ListView（充当观察者）和BaseAdapter（充当被观察者）则使用了这个模式并在ListView中注册了观察者，有兴趣的可以查看相关源码。


前面讲了一个**伪观察者模式**，继续....

仍然是上次的代码，notifyDataSetChanged最后一行调用了
**mObservable.notifyChanged()** 这才是正宗的观察者模式。

```
public abstract class PagerAdapter {
    // 被观察者
    private final DataSetObservable mObservable = new DataSetObservable();

    public void notifyDataSetChanged() {
        synchronized (this) {
            // 冒充者
            if (mViewPagerObserver != null) {
                mViewPagerObserver.onChanged();
            }
        }
        // 正宗
        mObservable.notifyChanged();
    }

    public void registerDataSetObserver(DataSetObserver observer) {
        mObservable.registerObserver(observer);
    }

    public void unregisterDataSetObserver(DataSetObserver observer) {
        mObservable.unregisterObserver(observer);
    }
}
```

如何在PagerAdapter 中给 被观察者DataSetObservable 注册一个观察者?
>注意：这段代码仅做参考，Android并未真正注册。
```
PagerAdapter pagerAdapter = new .. ;
pagerAdapter.registerDataSetObserver(new DataSetObserver() {
    @Override
    public void onChanged() {
        super.onChanged();
        // .... 实现，这里copy伪娘那里的onChange()方法.
    }

    @Override
    public void onInvalidated() {
        super.onInvalidated();
        // .... 实现
    }
});
```

下面我们就来一起看看Android的被观察者和观察者是怎么写的，可以借鉴参考下：

**被观察者**
DataSetObservable 
```
public class DataSetObservable extends Observable<DataSetObserver> {
    public void notifyChanged() {
        synchronized(mObservers) {
            for (int i = mObservers.size() - 1; i >= 0; i--) {
                mObservers.get(i).onChanged();
            }
        }
    }

    public void notifyInvalidated() {
        synchronized (mObservers) {
            for (int i = mObservers.size() - 1; i >= 0; i--) {
                mObservers.get(i).onInvalidated();
            }
        }
    }
}
```

Observable
```
package android.database;

import java.util.ArrayList;

public abstract class Observable<T> {

    protected final ArrayList<T> mObservers = new ArrayList<T>();

    public void registerObserver(T observer) {
        if (observer == null) {
            throw new IllegalArgumentException("The observer is null.");
        }
        synchronized(mObservers) {
            if (mObservers.contains(observer)) {
                throw new IllegalStateException("Observer " + observer + " is already registered.");
            }
            mObservers.add(observer);
        }
    }

    public void unregisterObserver(T observer) {
        if (observer == null) {
            throw new IllegalArgumentException("The observer is null.");
        }
        synchronized(mObservers) {
            int index = mObservers.indexOf(observer);
            if (index == -1) {
                throw new IllegalStateException("Observer " + observer + " was not registered.");
            }
            mObservers.remove(index);
        }
    }

    public void unregisterAll() {
        synchronized(mObservers) {
            mObservers.clear();
        }
    }
}
```

**观察者**
```
package android.database;

public abstract class DataSetObserver {

    public void onChanged() {
        // Do nothing
    }

    public void onInvalidated() {
        // Do nothing
    }
}
```

这就是Android经典的观察者模式.

## 源码扩展
ListView和ViewPager在适配器模式和观察者模式存在诸多相似，举一反三让我们的理解更加透彻。

ListView在setAdapter() 中注册的观察者.
```
public void setAdapter(ListAdapter adapter) {
    if (mAdapter != null && mDataSetObserver != null) {
        mAdapter.unregisterDataSetObserver(mDataSetObserver);
    }

    resetList();
    mRecycler.clear();

    if (mHeaderViewInfos.size() > 0|| mFooterViewInfos.size() > 0) {
        mAdapter = wrapHeaderListAdapterInternal(mHeaderViewInfos, mFooterViewInfos, adapter);
    } else {
        mAdapter = adapter;
    }

    mOldSelectedPosition = INVALID_POSITION;
    mOldSelectedRowId = INVALID_ROW_ID;

    super.setAdapter(adapter);

    if (mAdapter != null) {
        // 注册观察者
        mDataSetObserver = new AdapterDataSetObserver();
        mAdapter.registerDataSetObserver(mDataSetObserver);
    }

    requestLayout();
}
```



