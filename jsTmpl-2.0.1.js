/*
 *  jsTmpl v2.0.1
 *
 *  Copyright 2017, Frank Chao
 *  Released under the MIT license
 *
 *  Released on: June 12, 2017
 */

!(function ( window, factory ) {

    if ( typeof define === "function" && define.amd ) {
        define(factory);
    } else if ( typeof module === "object" && typeof module.exports === "object" ) {
        module.exports = factory();
    } else {
        window.jsTmpl = factory();
    }

})( this, function () {

	// 不支持 IE8-，给出警告
	if ( !Array.isArray ) {
		throw new Error("jsTmpl\'s Javascript does not support of ie8- !!!");
	}

	// 缓存 document 对象
	var doc = document;

	// 内部方法
	var In = {
		isStr: function ( str ) {
			return !!(typeof str === "string");
		},
		isPlainObj: function ( obj ) {
			return !!(Object.prototype.toString.call(obj) === "[object Object]");
		},
		isArray: function ( arr ) {
			return !!(Array.isArray(arr));
		},
		toArray: function ( arrLike ) {
			return Array.prototype.slice.call(arrLike);
		},
		format: function ( content ) {
            content = content.replace(/(\{\{)\s+/g, "{{").replace(/\s+(\}\})/g, "}}");
            return content;
        },
        reg: function ( variable ) {
            return (new RegExp("\\{\\{" + variable + "\\}\\}", "g"));
        }
	};

	// DOM 查询
	function query ( elem, context ) {
		return !context ? doc.querySelector(elem) : context.querySelector(elem); 
	}
	function queryAll ( elem, context ) { 
		return In.toArray(!context ? doc.querySelectorAll(elem) : context.querySelectorAll(elem)); 
	}
	function queryTag ( elem, context ) {
		return In.toArray(!context ? doc.getElementsByTagName(elem) : context.getElementsByTagName(elem));
	}
	function queryID ( id ) {
		return doc.getElementById(id);
	}

	// 创建全局变量 jsTmpl 并添加方法
	var jsTmpl = window.jsTmpl = {

		// 模板功能
		template: function ( selector, data ) {

			// 确保传入参数的正确性
			if ( selector && data && In.isStr(selector) && In.isPlainObj(data) ) {
				selector = queryAll(selector);
				selector.forEach(function ( item ) {

					// 获取 js-data 属性值
					// 缓存数据源
					var jsData = item.getAttribute("js-data");
					var getData = data[jsData];

					// 必须设置了 js-data 属性才能进行下面的方法
					if ( jsData != "" ) {

						// 格式化所有 {{ 和 }} 分隔符
						item.innerHTML = In.format(item.innerHTML);

						// 遍历其下的全部元素寻找 js-each
						// 为含有 js-each 属性的元素添加特定标识类 `jstmpl-template-each`
						// 先将其内部的 {{ 和 }} 分隔符进行 `破坏型` 改变
						var thisAll = queryTag("*", item);
						thisAll.forEach(function ( i ) {
							var jsEach = i.getAttribute("js-each");
							if ( jsEach ) {
								i.className = i.className + "jstmpl-template-each";
								i.innerHTML = i.innerHTML.replace(/\{\{/g, "{|{|").replace(/\}\}/g, "|}|}");
							}
						});

						// 进行第一轮内容生成操作
						// 本次操作不包括含有 js-each 属性的元素及其所有后代元素
						// 将第一轮操作结果写入元素作为最新内容
						var A_html = item.innerHTML;
						for ( var every in getData ) {
							if ( In.isStr(getData[every]) ) {
								var setReg = In.reg(every);
								A_html = A_html.replace(setReg, getData[every]);
							}
						}
						item.innerHTML = A_html;

						// 进行第二轮内容生成操作
						// 本次操作针对含有 js-each 属性的元素 ( 即：需要循环生成的元素 )
						// 此元素下的所有元素都将进行循环生成

						// 恢复之前被 `破坏` 的分割符
						item.innerHTML = item.innerHTML.replace(/\{\|\{\|/g, "{{").replace(/\|\}\|\}/g, "}}");
						var $each = queryAll(".jstmpl-template-each", item);
						$each.forEach(function ( index ) {

							// 先缓存循环元素的模板内容
							// 并将其内容全部清空 ( 防止意外错误使得内容生成失败进而直接将分隔符和变量显示出来导致的显示异常的问题 )
							var cacheHTML = index.innerHTML;
							index.innerHTML = "<!--  -->";

							// 定义变量又用进行内容的替换和保存
							var replaceHTML = cacheHTML,
								saveHTML = "";

							// 寻找数据源并进行生成操作
							var source = index.getAttribute("js-each");
							for ( var every in getData ) {
								if ( every == source && In.isArray(getData[every]) ) {
									getData[every].forEach(function ( i ) {
										for ( var value in i ) {
											var setReg = In.reg(value);
											replaceHTML = replaceHTML.replace(setReg, i[value]);
										}
										saveHTML += replaceHTML;
										replaceHTML = cacheHTML;
									});
								}
							}
							index.innerHTML = saveHTML;

							// 去除掉之前添加的特定标识类，尽量保持原始结构
							index.className = index.className.replace("jstmpl-template-each", "");

						});

					}

				});
			} 
		},

		// 组件功能
		component: function ( name, param ) { 
			
			// 确保传入参数的正确性
			if ( name && param && In.isStr(name) && In.isPlainObj(param) ) {   

				// 获取特殊标签 js-tmpl
				var jstmpl = queryTag("js-tmpl"); 
				jstmpl.forEach(function ( item ) {

					// 清空其内部所有内容
					// 强制隐藏，避免未知的样式设置冲突导致的布局错误
					item.innerHTML = "";
					item.style.cssText = "display:none !important";

					// 获取相关属性
					var template = param.template,
						data = param.data,
						event = param.event;
					var getType = item.getAttribute("type"),
						getName = item.getAttribute("name"),
						getData = item.getAttribute("data"); 

					// 只有 type 属性值为 component 且 name 值相对应才执行下面的方法
					if ( getType == "component" && getName == name ) {

						// 内部创建一个随机 id
						// 通过 ( 特定前缀 + 时间毫秒数 + 17位随机数 ) 来创建随机 id，尽可能降低重复概率
						var randomID = "jstmpl-component-" + Date.now() + "-" + parseInt(Math.random() * 100000000000000000);

						// 将其转换成可以使用 jstmpl.template() 方法的形式
						var cut = template.substring(0, template.indexOf(">")).toLowerCase().replace(/\s+(\=)/g, "=").replace(/\s+(\')/g, "'").replace(/\s+(\")/g, '"'); 
						var currentID = "",
							resultID = "";
						if ( cut.indexOf("id") > 0 ) {
							currentID = cut.substring(cut.indexOf("id") + 4).replace(/(\'|\")(.*)/, ""); 
							if ( currentID == "" ) {
								template = template.replace(/id\=(\'\'|\"\")/, ' id="' + randomID + '"'); 
							}
						} else {
							template = template.replace(cut, cut + ' id="' + randomID + '"');
						}
						resultID = (currentID != "" ? currentID : randomID);
						template = template.replace(">", ' js-data="' + getData + '">');
						item.insertAdjacentHTML("afterend", template);

						// 设置参数 
						var realData = {};
						for ( var every in data ) {
							realData[every] = data[every];
						}

						// 调用 jstmpl.template() 方法执行操作
						jsTmpl.template("#" + resultID, realData);

						// 操作完成后，清除创建的随机 id 和内部添加的 js-data 属性，尽量保持模板原始结构
						queryID(randomID) && queryID(randomID).removeAttribute("id");
						var $next = item.nextElementSibling;
						$next.removeAttribute("js-data");

						// 添加事件
						var hasEventDom = [$next];
						Array.prototype.push.apply(hasEventDom, queryAll("[js-event]", $next));
						hasEventDom.forEach(function ( i ) {
							var eventName = i.getAttribute("js-event");
							if ( event ) {
								event[eventName] && event[eventName].apply(i);
							}
						});
					}
				});  
			}
		},

		// 基本组件功能
		replace: function ( name, param ) {

			// 确保传入参数的正确性
			if ( name && param && In.isStr(name) && In.isPlainObj(param) ) {   

				// 获取特殊标签 js-tmpl
				var jstmpl = queryTag("js-tmpl");
				jstmpl.forEach(function ( item ) {

					// 清空其内部所有内容
					// 强制隐藏，避免未知的样式设置冲突导致的布局错误
					item.innerHTML = "";
					item.style.cssText = "display:none !important";

					// 检测 type 和 name 属性
					// 符合条件进入下面的方法
					if ( item.getAttribute("type") == "replace" && name == item.getAttribute("name") ) {
						var htmlArray = item.outerHTML.split(/(=|\s+)/); 
	                    var filterArray = htmlArray.filter(function ( i ) {
	                        return i && !i.match(/(\<|\>|\=|\s+|\"|\')/);
	                    });

	                    var clone = In.format(param.template),
                        	cloneTmpl = "";
                        filterArray.forEach(function ( index ) {
                        	if ( !index.match(/(name|type|style|none)/) ) {
                        		cloneTmpl = clone.replace(In.reg(index), item.getAttribute(index));
                        		clone = cloneTmpl; 
                        	}
                        });
                        item.outerHTML = cloneTmpl;
                    }

				});
			}
		}

	};
    
    return jsTmpl;

});
