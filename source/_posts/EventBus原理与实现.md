---
title: EventBus原理与实现
date: 2017.02.23 12:13
tags: 
  - 源码分析
  - Eventbus
categories:
  - Android
---

分析一个开源项目的源码，首先先从使用的入口开始，然后Debug或者点点点即可。很多时候源码并不难, 只是被很多人分析难了，就像我有时候写东西仅仅令自己看一样，有时候只是写代码片段，所以最好的学习方式还是直接看源码。

EventBus的源码很简单，总结一下，能够在不同组件Activity等等通信的原理即 一个static的单例对象，成员变量是一个List等容器==>
注册时 用来存放观察者(List.add)
发送时 用来通知观察者
```
List list = EventBus静态对象.getList();
for(Object o:list){
      EventBus静态对象.notify(o);

}
```
总之，能够通信就是因为这个static的对象在自己调用自己的方法或成员等等.....

**下面是EventBus的用法和原理详解 **

对于代码能力理解比较好的可以直接看源码，当然这里也要一个我改写过的EventBus版本，针对原有版本做了简化，去除了注解方式，因为我感觉注解完全是多余的一项，仅仅使用方便了一些而已，却带来了理解上的难度和效率的低下
项目地址 https://github.com/wangli0/EventBus
其中tag v0.1是最原始的观察者模式，此库完全可以替代原有的EventBus


## EventBus用法

```
import org.greenrobot.eventbus.EventBus;
import org.greenrobot.eventbus.Subscribe;
import org.greenrobot.eventbus.ThreadMode;

public class MainActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_test);


    }


    public void onclick(View view) {
        Intent intent = new Intent();
        intent.setClass(this, TwoActivity.class);
        startActivity(intent);

        new Handler().postDelayed(new Runnable() {
            @Override
            public void run() {
                EventBus.getDefault().post(111);
            }
        },3000);

    }
}
```


```
public class TwoActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_two);

        EventBus.getDefault().register(this);

    }

    @Subscribe(threadMode = ThreadMode.MAIN)
    public void helloEventBus(Integer message) { //方法名任意，这里的参数和  EventBus.getDefault().post(111);对应即可
        System.out.println("------>"+message);
    }


    @Override
    protected void onDestroy() {
        super.onDestroy();
        EventBus.getDefault().unregister(this);
    }


}


```

总结: EventBus既可以在一个Activity里面使用，又可以在两个Activity中使用，不管当前显示的是哪个，只要Activity存在，消息就会发送成功。好比 EventBus.getDefault().register(this);就是一个BroadCastReceiver





## 原理分析
```
public final class EventType {
    /**
     * 默认的tag
     */
    public static final String DEFAULT_TAG = "default_tag";

    /**
     * 参数类型  即用 @Subscriber标注的方法中的方法参数
     */
    Class<?> paramClass;
    /**
     * 函数的tag
     */
    public String tag = DEFAULT_TAG;

    public Object event ;
}

```



-----------------------------------------

##### EventBus.getDefault().register(this);执行流程

EventBus中维护一个 mMethodHunter对象，该对象用来查找this即Subscriber的所有标有注解的所有方法

SubsciberMethodHunter和EventBus中 的 mSubcriberMap是同一个对象 。键值对是 key: EventType  value:CopyOnWriteArrayList(Subscription)用于保存一个EventType类型对应多个Subscription，方便EventBus post()时候能根据一个 EventType类型，查找该类型对应的所有Subscription，然后全部执行。

注意: Subscription是不区分观察者是谁(这句话得意思是,一个Activity对象中可能有多个Subscription,另一个Activity也有多个,但是他们不区分)，即它只根据EventType去查找所有Subscription


当mMethodHunter查找到register(this) 中this类标注@Subscriber 的所有方法后，每一个符合要求的方法都 构造一个EventType类，如下

```
EventType eventType = new EventType(paramType, annotation.tag());
//paramType是订阅方法的唯一的参数
```
然后，根据subscriber对象即this和Method 构造一个Subscription对象
```
 Subscription newSubscription = new Subscription(subscriber, method);
```
然后从根据EventType从 mSubcriberMap中 获取CopyOnWriteArrayList ，然后放进去(把同类型的事件对应->多个Subscription，如果list还不存在，new一个)

>注意: 从这里可以看出，this中可能有多个@Subscriber注解，那么就会构造多个Subscription对象。且每个Subscription里面都有一个真正的subscriper即this

真正执行方法的时候  => 调用的是Subscription中method成员变量，反射实现 
```
subscription.targetMethod.invoke(subscription.subscriber.get(), event);
```

## EventBus.getDefault().post事件

EventBus中另一个比较有意思的成员变量对象就是 Queue了

```
ThreadLocal<Queue<EventType>> mLocalEvents = new ThreadLocal<Queue<EventType>>() {
        protected Queue<EventType> initialValue() {
            return new ConcurrentLinkedQueue<EventType>();
        };
    };

```

查看 post方法

```
public void post(Object event, String tag) {    
        mLocalEvents.get().offer(new EventType(event.getClass(), tag));
        mDispatcher.dispatchEvents(event);
    }

```

看到这里，发现EventBus这个地方的思路和AsynTask有点相似呢！
获取Queue然后把当前的要发送的new EventType(event.getClass(), tag)类型放入队列中。
然后获取事件分发器分发事件:
mDispatcher.dispatchEvents(event);

```
void dispatchEvents(Object aEvent) {
            Queue<EventType> eventsQueue = mLocalEvents.get();
            while (eventsQueue.size() > 0) {  //把Queue中的事件全部发出去
                deliveryEvent(eventsQueue.poll(), aEvent);
            }
        }
```


```
void deliveryEvent(EventType type, Object aEvent) {
            // 如果有缓存则直接从缓存中取
            List<EventType> eventTypes = getMatchedEventTypes(type, aEvent);
            // 迭代所有匹配的事件并且分发给订阅者
            for (EventType eventType : eventTypes) {
                handleEvent(eventType, aEvent);
            }
        }
```

根据EventType获取list即 List<Subscription> subscriptions = mSubcriberMap.get(eventType);
然后for循环执行所有 Subscription


```
  /**
         * 处理单个事件
         * 
         * @param eventType
         * @param aEvent
         */
        private void handleEvent(EventType eventType, Object aEvent) {
            List<Subscription> subscriptions = mSubcriberMap.get(eventType);
            if (subscriptions == null) {
                return;
            }

            for (Subscription subscription : subscriptions) {
                final ThreadMode mode = subscription.threadMode;
                EventHandler eventHandler = getEventHandler(mode);
                // 处理事件
                eventHandler.handleEvent(subscription, aEvent);
            }
        }

```



执行方法，实质即为调用反射Method.invoke();

subscription.targetMethod.invoke(subscription.subscriber.get(), event);
