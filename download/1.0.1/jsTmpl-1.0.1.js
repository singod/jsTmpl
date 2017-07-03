/*
 *  jsTmpl v1.0.1
 *
 *  Copyright 2017, Frank Chao
 *  Released under the MIT license
 *
 *  Released on: May 10, 2017
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

    var doc = document;

    if ( doc.getElementsByTagName("head")[0].classList ) {

        var Fn = {
            isArray: function ( arr ) {
                return !!(Array.isArray(arr));
            },
            optc: function ( obj ) {
                return Object.prototype.toString.call(obj).replace(/(\[object |\])/g, "");
            },
            isString: function ( str ) {
                return !!(typeof str === "string" && Fn.optc(str) === "String");
            },
            isPlainObj: function ( obj ) {
                return !!(typeof obj === "object" && Fn.optc(obj) === "Object" && JSON.stringify(obj) !== "{}");
            },
            format: function ( content ) {
                content = content.replace(/(\{\{)\s+/g, "{{");
                content = content.replace(/\s+(\}\})/g, "}}");
                return content;
            },
            reg: function ( variable ) {
                return (new RegExp("\\{\\{" + variable + "\\}\\}", "g"));
            },
            ready: function ( callback ) {
                if ( doc.readyState === "complete" ) {
                    callback();
                } else {
                    var docReady = (function () {
                        doc.addEventListener("DOMContentLoaded", function () {
                            doc.removeEventListener("DOMContentLoaded", docReady);
                            callback();
                        });
                    })();
                }
            }
        };

        function $ ( elem, context ) { return context ? context.querySelector(elem) : doc.querySelector(elem); }
        function $$ ( elem, context ) { return context ? context.querySelectorAll(elem) : doc.querySelectorAll(elem); }
        function $id ( id ) { return doc.getElementById(id); }

        var jsTmpl = window.jsTmpl = {

            tag: "js-tmpl",

            template: function ( elem, data ) {
                var size = arguments.length;
                Fn.ready(createTemplate);
                function createTemplate () {
                    if ( size == 2 && Fn.isString(elem) && Fn.isPlainObj(data) ) {
                        var dom = $(elem),
                            dateMark = Date.now(),
                            findAll = $$("*", dom),
                            classMark = "";
                        if ( dom ) {
                            for ( var i = 0, j = findAll.length; i < j; i++ ) {
                                var every = findAll[i];
                                if ( every.getAttribute("js-one") == "true" ) {
                                    classMark = "jsTmpl-" + dateMark + parseInt(Math.random() * 100000000000000000);
                                    every.classList.add(classMark);
                                    every.classList.add("jsTmpl-" + dateMark);
                                }
                            }
                            var content = dom.innerHTML; 
                            dom.innerHTML = "<!--  -->";
                            var _code = new RegExp("\{\{", "g"),
                                code_ = new RegExp("\}\}", "g"),
                                start = content.match(_code),
                                end = content.match(code_);
                            start = start ? start.length : 0;
                            end = end ? end.length : 0;
                            if ( start != 0 && end != 0 && start == end ) {
                                content = Fn.format(content);
                                var getContent = content,
                                    emptyHTML = "",
                                    dataSize,
                                    one,
                                    set; 
                                one = (data.one && Fn.isPlainObj(data.one)) ? data.one : undefined;
                                set = (data.set && Fn.isArray(data.set)) ? data.set : undefined;

                                dataSize = set ? set.length : 0;
                                if ( dataSize > 0 ) {
                                    var index = 0;
                                    for ( var i = 0; i < dataSize; i++ ) {
                                        (function ( i ) {
                                            var eachSet = set[i];
                                            if ( Fn.isPlainObj(eachSet) ) {
                                                for ( var x in eachSet ) {
                                                    content = content.replace(Fn.reg(x), eachSet[x]);
                                                }
                                            }
                                            if ( content.indexOf("$index") > -1 ) {
                                                index++;
                                                var start;
                                                if ( content.indexOf("$index(") > -1 ) {
                                                    start = parseInt(content.match(/\$index\((\S*)\)/)[1]);
                                                    if ( start >= 0 ) {
                                                        switch ( start ) {
                                                            case 0:
                                                                content = content.replace("{{$index(0)}}", index - 1);
                                                                break;
                                                            case 1:
                                                                content = content.replace("{{$index(1)}}", index);
                                                                break;
                                                            default: 
                                                                var reg = new RegExp("\\{\\{\\$index\\(" + start + "\\)\\}\\}", "g"); 
                                                                content = content.replace(reg, index + start - 1);
                                                        }
                                                    }
                                                } else {
                                                    content = content.replace("{{$index}}", index);
                                                }
                                            }
                                            content = content.indexOf("$total") > -1 ? content.replace("{{$total}}", set.length) : content;
                                        })( i );
                                        emptyHTML += content;
                                        content = getContent;
                                    }
                                }
                                if ( one ) {
                                    for ( var x in one ) {
                                        var reg = Fn.reg(x);
                                        emptyHTML = (emptyHTML != "" ? emptyHTML.replace(reg, one[x]) : content.replace(reg, one[x]));
                                    }
                                }
                                var createDOM = '<section id="jsTmpl-' + dateMark + '" style="display:none;">' + emptyHTML + '</section>';
                                $("body").insertAdjacentHTML("beforeend", createDOM);
                                var section = $id("jsTmpl-" + dateMark),
                                    noFor = $$(".jsTmpl-" + dateMark, section),
                                    arr = [];
                                for ( var i = 0, j = noFor.length; i < j; i++ ) {
                                    var eachFor = noFor[i],
                                        classArray = eachFor.className.replace(/\s+/g, " ").split(" ");
                                    eachFor.removeAttribute("js-one");
                                    classArray.forEach(function ( item ) {
                                        (item.match("jsTmpl-") && item.length > 24 && arr.indexOf(item) == -1) && arr.push(item);
                                    })
                                }
                                arr.forEach(function ( item ) {
                                    var first = $("." + item);
                                    first.classList.remove(item);
                                    first.classList.remove("jsTmpl-" + dateMark);
                                    first.className == "" && first.removeAttribute("class");
                                    var others = $$("." + item);
                                    for ( var i = others.length - 1; i >= 0; i-- ) {
                                        others[i].parentNode.removeChild(others[i]);
                                    }
                                })
                                emptyHTML = section.innerHTML;
                                section.parentNode.removeChild(section);
                                dom.innerHTML = emptyHTML;
                            }
                        }
                    }
                }
            },

            component: function ( param ) {
                if ( arguments.length == 1 && Fn.isPlainObj(param) ) {
                    var name = param.name,
                        template = param.template,
                        data = param.data,
                        ev = param.events,
                        ck = param.check;
                    var keys = Object.keys(param); 
                    if ( keys.length <= 5 && name && template && data && Fn.isString(name) && Fn.isString(template) && Fn.isPlainObj(data) ) { 
                        var tagName = jsTmpl.tag;

                        Fn.ready(createComponent);
                        function createComponent () {

                            var Body = $("body"),
                                jsTag = $$(tagName);
                            
                            function analysisData ( tag, dataSource ) {
                                
                                var virtual = '<section id="jstmpl-virtual-section" style="display:none;"></section>';
                                Body.insertAdjacentHTML("beforeend", virtual);
                                var getVirtual = $id("jstmpl-virtual-section");
                                getVirtual.innerHTML = template;

                                var domInner = $$("*", getVirtual);
                                for ( var i = 0, j = domInner.length; i < j; i++ ) {
                                    var dom = domInner[i];
                                    dom.getAttribute("js-data") && dom.classList.add("jstmpl-doing-for");
                                    dom.getAttribute("js-event") && dom.classList.add("jstmpl-add-event");
                                    dom.getAttribute("js-if") && dom.classList.add("jstmpl-check-if");
                                }

                                var content = getVirtual.innerHTML;
                                content = Fn.format(content);
                                getVirtual.innerHTML = content;
                                var doingFor = $$(".jstmpl-doing-for", getVirtual);
                                var total = 0;

                                if ( doingFor.length > 0 ) {
                                    for ( var i = doingFor.length - 1; i >= 0; i-- ) {
                                        (function ( i ) {
                                            var every = doingFor[i],
                                                everyHTML = every.outerHTML,
                                                _for = every.getAttribute("js-data"),
                                                source = data[dataSource][_for], 
                                                getHTML = everyHTML,
                                                html = "";
                                            if ( Fn.isArray(source) ) {
                                                total = source.length;
                                                var index = 0;
                                                for ( var x = 0, y = source.length; x < y; x++ ) {
                                                    var getObj = source[x]; 
                                                    everyHTML = getHTML;
                                                    for ( var k in getObj ) {
                                                        everyHTML = everyHTML.replace(Fn.reg(k), getObj[k]);
                                                    }

                                                    if ( everyHTML.indexOf("$index") > -1 ) {
                                                        index++;
                                                        var start;
                                                        if ( everyHTML.indexOf("$index(") > -1 ) {
                                                            start = parseInt(everyHTML.match(/\$index\((\S*)\)/)[1]);
                                                            if ( start >= 0 ) {
                                                                switch ( start ) {
                                                                    case 0:
                                                                        var reg = new RegExp("\\{\\{\\$index\\(0\\)\\}\\}", "g");
                                                                        everyHTML = everyHTML.replace(reg, index - 1);
                                                                        break;
                                                                    case 1:
                                                                        var reg = new RegExp("\\{\\{\\$index\\(1\\)\\}\\}", "g");
                                                                        everyHTML = everyHTML.replace(reg, index);
                                                                        break;
                                                                    default: 
                                                                        var reg = new RegExp("\\{\\{\\$index\\(" + start + "\\)\\}\\}", "g"); 
                                                                        everyHTML = everyHTML.replace(reg, index + start - 1);
                                                                }
                                                            }
                                                        } else {
                                                            var reg = new RegExp("\\{\\{\\$index\\}\\}", "g");
                                                            everyHTML = everyHTML.replace(reg, index);
                                                        }
                                                    }

                                                    html += everyHTML;
                                                }

                                                every.insertAdjacentHTML("afterend", html);
                                                every.parentNode.removeChild(every);

                                            }
                                        })( i );
                                     }
                                }

                                var resultHTML = getVirtual.innerHTML.replace("{{$total}}", total);   
                                for ( var x in data[dataSource] ) {
                                    resultHTML = resultHTML.replace(Fn.reg(x), data[dataSource][x]);
                                }
                                tag.outerHTML = resultHTML;
                                getVirtual.parentNode && getVirtual.parentNode.removeChild(getVirtual);

                                var doing = $$(".jstmpl-doing-for", Body);
                                for ( var a = 0, b = doing.length; a < b; a++ ) {
                                    var d = doing[a];
                                    d.classList.remove("jstmpl-doing-for");
                                    d.className == "" && d.removeAttribute("class");
                                }
                            };

                            for ( var m = jsTag.length - 1; m >= 0; m-- ) {
                                (function ( m ) {
                                    var eachTag = jsTag[m],
                                        eachName = eachTag.getAttribute("name"),
                                        eachTarget = eachTag.getAttribute("target"); 
                                    eachTag.innerHTML = "";
                                    eachName == name && analysisData(eachTag, eachTarget);
                                })( m );
                            }

                            var hasEvent = $$(".jstmpl-add-event", Body);
                            var eventSize = hasEvent.length;
                            if ( eventSize > 0 ) {
                                for ( var a = 0; a < eventSize; a++ ) {
                                    (function ( a ) {
                                        var elem = hasEvent[a],
                                            eventInfo = elem.getAttribute("js-event"),
                                            eventType = eventInfo.substring(0, eventInfo.indexOf(":")),
                                            eventName = eventInfo.substring(eventInfo.indexOf(":") + 1); 
                                        elem.classList.remove("jstmpl-add-event");
                                        elem.className == "" && elem.removeAttribute("class");
                                        elem.addEventListener(eventType, function () {
                                            ev[eventName].apply(elem);
                                        });
                                    })( a );
                                }
                            }

                            var hasIf = $$(".jstmpl-check-if", Body);
                            var ifSize = hasIf.length;
                            if ( ifSize > 0 ) {
                                for ( var a = 0, b = hasIf.length; a < b; a++ ) {
                                    (function ( a ) {
                                        var elem = hasIf[a],
                                            checkInfo = elem.getAttribute("js-if"),
                                            checkType = checkInfo.substring(0, checkInfo.indexOf(":")),
                                            checkParam = checkInfo.substring(checkInfo.indexOf(":") + 1); 
                                        elem.classList.remove("jstmpl-check-if");
                                        elem.className == "" && elem.removeAttribute("class");
                                        ck[checkType].apply(elem, [checkParam]);
                                    })( a );
                                }
                            }

                        }
                    }
                }
            },

            replace: function ( param ) {
                if ( arguments.length == 1 && Fn.isPlainObj(param) ) {
                    Fn.ready(replaceFn);
                    function replaceFn () {
                        var name = param.name,
                            template = Fn.format(param.template); 
                        var tag = $$(jsTmpl.tag);
                        for ( var i = 0, j = tag.length; i < j; i++ ) {
                            var eachTag = tag[i];
                            if ( !eachTag.getAttribute("target") ) {
                                var htmlArray = eachTag.outerHTML.split(/(=|\s+)/); 
                                var filterArray = htmlArray.filter(function ( item ) {
                                    return item && !item.match(/(\<|\>|\=|\s+|\"|\'|name|target)/);
                                });
                                var clone = template,
                                    cloneTmpl = "";
                                while ( clone.indexOf("{{") > -1 ) {
                                    filterArray.forEach(function ( item ) {
                                        cloneTmpl = clone.replace(Fn.reg(item), eachTag.getAttribute(item));
                                        clone = cloneTmpl;
                                    });
                                }
                                eachTag.outerHTML = cloneTmpl;
                            }
                        }
                    }
                }
            }

        };

        Object.freeze(jsTmpl);

    } else {
        throw new Error("jsTmpl\'s Javascript does not support of ie9- !!!");
    }

    return jsTmpl;

});
