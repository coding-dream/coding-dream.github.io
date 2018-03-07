---
title: butterKnife源码解析
date: 2016.10.13 17:03
tags: 
  - 源码分析
  - butterKnife
  - 开源项目
categories:
  - Android
---

butterKnife源码解析 (butterknife-7.0.1.jar)


## 简单使用

下面就是针对这段代码进行解析 

```
package com.syntc.deletedemo;

import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.Toast;

import butterknife.BindString;
import butterknife.BindView;
import butterknife.ButterKnife;
import butterknife.OnClick;
import butterknife.Unbinder;


public class MainActivity extends AppCompatActivity {
    @BindView(R.id.image)
    ImageView username;

    @BindView((R.id.button))
    Button button;

    @BindString(R.string.app_name)
    String message;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        Unbinder unbinder = ButterKnife.bind(this);
        unbinder.unbind();


    }

    @OnClick(R.id.button)
    public void doWork(){
        Toast.makeText(this, "do work", Toast.LENGTH_SHORT).show();
    }



}



```



从  Unbinder unbinder = ButterKnife.bind(this); 开始 



```
@NonNull @UiThread
  public static Unbinder bind(@NonNull Activity target) {
    View sourceView = target.getWindow().getDecorView();
    return createBinding(target, sourceView); //这里注意两个重要的对象  当前的activity和 当前的DecorView 
  }
```


然后(重点方法)

```
private static Unbinder createBinding(@NonNull Object target, @NonNull View source) {
    Class<?> targetClass = target.getClass(); //获取当前Activity的 Class类型
    
    Constructor<? extends Unbinder> constructor = findBindingConstructorForClass(targetClass); 
    // 重点，根据当前Activity的Class类型获取 javapoet-1.7.0.jar生成的代码即为和当前Activity配对的MainActivity_ViewBinding类 (后面讲到)

    if (constructor == null) {
      return Unbinder.EMPTY;
    }
    return constructor.newInstance(target, source); // 把Activity(this)和当前的DecorView对象传入


  }

```


查找 MainActivity_ViewBinding(代码生成的类)的构造器，如果第一次查找，放入缓存中，如果已经查找过，从缓存中取出(这是因为用户可能多次调用bind()方法，而且bind有很多构造方法，不需要每次都去查找一遍)

```
  static final Map<Class<?>, Constructor<? extends Unbinder>> BINDINGS = new LinkedHashMap<>();//缓存

  private static Constructor<? extends Unbinder> findBindingConstructorForClass(Class<?> cls) {
    Constructor<? extends Unbinder> bindingCtor = BINDINGS.get(cls);
    if (bindingCtor != null) {
      return bindingCtor;  //
    }
    String clsName = cls.getName();
    if (clsName.startsWith("android.") || clsName.startsWith("java.")) {
      if (debug) Log.d(TAG, "MISS: Reached framework class. Abandoning search.");
      return null;
    }
    try {
      Class<?> bindingClass = Class.forName(clsName + "_ViewBinding");
      //noinspection unchecked
      bindingCtor = (Constructor<? extends Unbinder>) bindingClass.getConstructor(cls, View.class);
      if (debug) Log.d(TAG, "HIT: Loaded binding class and constructor.");
    } catch (ClassNotFoundException e) {
      if (debug) Log.d(TAG, "Not found. Trying superclass " + cls.getSuperclass().getName());
      bindingCtor = findBindingConstructorForClass(cls.getSuperclass());
    } catch (NoSuchMethodException e) {
      throw new RuntimeException("Unable to find binding constructor for " + clsName, e);
    }
    BINDINGS.put(cls, bindingCtor);
    return bindingCtor;
  }
```



生成的代码如下

```
// Generated code from Butter Knife. Do not modify!
package com.syntc.deletedemo;

import android.content.res.Resources;
import android.support.annotation.CallSuper;
import android.support.annotation.UiThread;
import android.view.View;
import android.widget.Button;
import android.widget.ImageView;
import butterknife.Unbinder;
import butterknife.internal.DebouncingOnClickListener;
import butterknife.internal.Utils;
import java.lang.IllegalStateException;
import java.lang.Override;


//需要注意一点就是 我们发现下面泛型T target 也能调用 target.username等属性是因为 <T extends MainActivity>
public class MainActivity_ViewBinding<T extends MainActivity> implements Unbinder {
  protected T target;

  private View view2131427412;

  @UiThread
  public MainActivity_ViewBinding(final T target, View source) {
    this.target = target;

    View view;

    // 就是  View view = source.findViewById(R.id.image);和 return (T)view; 其中T 由 target.username指定了这里必须填ImageView.class
    target.username = Utils.findRequiredViewAsType(source, R.id.image, "field 'username'", ImageView.class);
	
	// 就是   仅仅View view = source.findViewById(R.id.R.id.button); 不带类型转换    
    view = Utils.findRequiredView(source, R.id.button, "field 'button' and method 'doWork'");
    
    // 就是  仅仅 转换类型
    target.button = Utils.castView(view, R.id.button, "field 'button'", Button.class);
    
    view2131427412 = view;
    
    view.setOnClickListener(new DebouncingOnClickListener() {
      @Override
      public void doClick(View p0) {
        target.doWork();
      }
    });

    Resources res = source.getResources();
    target.message = res.getString(R.string.app_name);
  }

  @Override
  @CallSuper
  public void unbind() {
    T target = this.target;
    if (target == null) throw new IllegalStateException("Bindings already cleared.");

    target.username = null;
    target.button = null;

    view2131427412.setOnClickListener(null);
    view2131427412 = null;

    this.target = null;
  }
}


```




最后 关于代码的生成和apt请单独查阅理解 
相关知识点  
```
自定义注解 
Apt 
autoService
javapoet-1.7.0.jar
```

> 注
关于这些源码还是自己直接跟踪查看，测试最好理解
别人的文章如上面的几大知识点杂烩在一起则很难搞清楚
相关知识点后期抽空放在git上面，一看就明白了
