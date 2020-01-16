## 安装

如果项目中未安装`react-native-gesture-handler`和`react-native-reanimated`需要先安装

```shell
yarn add react-native-float-header
```

参考来源
<a>https://github.com/rgommezz/reanimated-collapsible-navbar</a>

源码`FloatHeaderScrollView.js`中包含了处理ios端自定义刷新头位置的问题
1. 使用`contentInset`设置刷新头位置，如
```js
  contentInset={{ top: 120, bottom: 0, left: 0, right: 0, }}
```
2. 在列表渲染后手动将列表滚动到负的需要下移的位置，如
```js
  this.animatedScrollComponent._component.scrollTo({
    y: -120,
    animated: false,
  });
```
该插件会在手势松开后将浮动头部完全展开或收起，不会出现头部只有部分展示的情况
效果如图<br>
<img src="https://github.com/17554265585/react-native-float-header/blob/master/demo.gif">
