jsTmpl - 原生 Javascript 模板与组件引擎
==
引擎介绍
--
jsTmpl 是一套用法极为简单，体积极为轻巧，功能极为明确的 JavaScript 模板与组件引擎。它可以对页面中出现的“同结构同布局”的部分进行模板绑定或组件绑定，之后只需要传入数据即可生成指定的内容，无需书写大量的重复 HTML 代码。非常适合用于简化页面中包含大量重复结构的情况。在进行模板或组件绑定后，相应结构只需要设置一次就可以任意调用，之后只需要关注实际数据即可，极大地简化了 HTML 结构的复杂度。
* 兼容情况：IE9+, Firefox3.6+, Safari6.0+, Chrome8.0+
* 更新日期：2017-06-12
* 当前版本：2.0.1
* 查看源码：[jsTmpl 源码](http://jstmpl.applinzi.com/code/version/2.0.1/jstmpl-2.0.1.js) 
* 官方网址：[jsTmpl 官网](http://jstmpl.applinzi.com/) <br>

功能模块
--
* 模板功能：jsTmpl.`template`(elem, data);
* 组件功能：jsTmpl.`component`(name, param);
* 替换功能：jsTmpl.`replace`(name, param); <br>

使用方法
--
jsTmpl.`template`(elem, data);
* elem : 目标元素。模板所进行的所有数据操作都将发生在此目标元素的后代元素中 ( string 类型，且必须传入合法的 css 选择器 )；
* data : 数据内容。用来存储所有数据，可为同一模板设置多组不同的数据 ( object 类型 )。
