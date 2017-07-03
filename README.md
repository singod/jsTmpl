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
（一）模板功能：jsTmpl.`template`(elem, data);
* elem : 目标元素。模板所进行的所有数据操作都将发生在此目标元素的后代元素中 ( string 类型，且必须传入合法的 css 选择器 )；
* data : 数据内容。用来存储所有数据，可为同一模板设置多组不同的数据 ( object 类型 )。

####  方法说明
1. 目标元素必须包含 js-data 属性并赋值，用来标明此模板所引用的整体数据源（object 类型）；
2. 需要遍历循环的元素，必须在其父元素上添加 js-each 属性并赋值，用来标明此循环操作所引用的内部数据源（array 类型）；
3. 所有数据变量必须用 {{ }} 分隔符包裹。

```html
<section class="box" js-data="XXX">
    <h1>{{ mainTitle }}</h1>
    <h3>{{ subTitle }}</h3>
    <ul js-each="set">
        <li><b>{{ index }}</b><i></i><a href="{{ href }}">{{ link }}</a></li>
    </ul>
</section>
<section class="box" js-data="YYY">
    <h1>{{ mainTitle }}</h1>
    <h3>{{ subTitle }}</h3>
    <ul js-each="set">
        <li><b>{{ index }}</b><i></i><a href="{{ href }}">{{ link }}</a></li>
    </ul>
</section>

<script>
    jsTmpl.template(".box", {
        XXX: {
            mainTitle: "主标题（一）",
            subTitle: "副标题（一）",
            set: [
                { index: 1, href: "#1", link: "链接 (1)" },
                { index: 2, href: "#2", link: "链接 (2)" },
                { index: 3, href: "#3", link: "链接 (3)" },
                { index: 4, href: "#4", link: "链接 (4)" }
            ]
        },
        YYY: {
            mainTitle: "主标题（二）",
            subTitle: "副标题（二）",
            set: [
                { index: 5, href: "#5", link: "链接 (5)" },
                { index: 6, href: "#6", link: "链接 (6)" },
                { index: 7, href: "#7", link: "链接 (7)" },
                { index: 8, href: "#8", link: "链接 (8)" }
            ]
        }
    });
</script>
```


（二）组件功能：jsTmpl.`component`(name, param);
* name : 组件名称。设置当前所定义的组件的名称 ( string 类型 )；
* param : 参数集合。用来存储模板，数据和事件 ( object 类型 )。

####  方法说明
1. name 用来定义组件名称；
2. param 中只能包含 template / data / event 这三个属性；
3. template 定义模板内容（任何情况下，模板内的结构必须有一个最外层的包裹层，相当于有一个“外壳”包裹着组件结构，并且不能将 
     js-each 和 js-event 绑定到这个“外壳”上，它仅仅只起到一个包裹的作用，不参与任何函数方法。）；
4. data 定义数据源；
5. event 绑定的事件集合；
6. template 定义的模板中，需要遍历循环的元素，在其父元素上添加 js-each 属性并加上对应的数据源作为属性值；
7. template 定义的模板中，需要添加事件的元素，在其标签内部添加 js-event 属性，属性值与 event 参数中的属性相对应；
8. 所有数据变量必须用 {{ }} 分隔符包裹；
9. 组件通过特殊标签 js-tmpl 引入，标签内部需要设置 type="component" name="组件名称" data="数据源"。

```html
<js-tmpl type="component" name="artical" data="XXX"></js-tmpl>
<js-tmpl type="component" name="artical" data="YYY"></js-tmpl>

<script>
    // 注意下面的 template 参数中模板结构的最外层是一个 <section> 标签
    // 这就是上面说明中着重强调的 "外壳"
    // 它可以没有任何实际意义，也可以是任何合法的 HTML 标签
    // 但是它必须存在，用来包裹组件的全部结构，相当于组件全部结构的顶级祖先元素
    
    jsTmpl.component("artical", {
        template: "<section><h1>{{ title }}</h1><h5 js-event='getHTML'>{{ time }}</h5><div>{{ content }}</div></section>",
        data: {
            XXX: {
                title: "文章（一）",
                time: "2017-01-01",
                content: "这是第一篇文章"
            },
            YYY: {
                title: "文章（二）",
                time: "2017-02-02",
                content: "这是第二篇文章"
            }
        },
        event: {
            getHTML: function () {
                this.onclick = function () {
                    console.log(this.innerHTML);
                }
            }
        }
    });
</script>
```


（三）替换功能：jsTmpl.`replace`(name, param);
jsTmpl 还提供了一个超简单的基础型的组件功能，其用法和功能极为简单，就是“同名变量绑定同名属性的值”，其实就是做内容替换。
* name : 组件名称。设置当前所定义的组件的名称 ( string 类型 )；
* param : 参数集合。用来存储模板和数据 ( object 类型 )。

####  方法说明
1. name 用来定义组件名称；
2. param 中只有 template 属性；
3. template 定义模板内容；
4. template 定义的模板中，所绑定的变量就是 js-tmpl 标签中的相对应的属性；
5. 所有数据变量必须用 {{ }} 分隔符包裹；
6. 组件通过特殊标签 js-tmpl 引入，标签内部需要设置 type="replace" name="组件名称"。

```html
<js-tmpl type="replace" name="p" data-a="Tom" data-b="20"></js-tmpl>
<js-tmpl type="replace" name="p" data-a="Peter" data-b="30"></js-tmpl>
<js-tmpl type="replace" name="p" data-a="Frank" data-b="40"></js-tmpl>

<script>
    jsTmpl.replace("p", {
        template: '<p><span>姓名：{{ data-a }}</span><b>年龄：{{ data-b }}</b></p>'
    });
</script>
```
