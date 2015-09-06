/*
 * object.watch
 * 2014-09-25
 * 参考avalon https://gist.github.com/eligrey/384583
 */
define(function(require, exports, module) {
    var defineProperty = Object.defineProperty,
        expose = _.now();
    //如果浏览器不支持ecma262v5的Object.defineProperties或者存在BUG，比如IE8只允许DOM对象，safari不允许DOM对象
    //标准浏览器使用__defineGetter__, __defineSetter__实现
    try {
        defineProperty({}, "_", {
            value: "x"
        })
        var defineProperties = Object.defineProperties;
    } catch (e) {
        if ("__defineGetter__" in _) {
            defineProperty = function(obj, prop, desc) {
                if ('value' in desc) {
                    obj[prop] = desc.value
                }
                if ("get" in desc) {
                    obj.__defineGetter__(prop, desc.get)
                }
                if ('set' in desc) {
                    obj.__defineSetter__(prop, desc.set)
                }
                return obj
            }
            defineProperties = function(obj, descs) {
                for (var prop in descs) {
                    if (descs.hasOwnProperty(prop)) {
                        defineProperty(obj, prop, descs[prop])
                    }
                }
                return obj
            }
        }
    }
    //IE6-8使用VBScript类的set get语句实现
    var ie678;
    if (!defineProperties && window.VBArray) {
        ie678 = 1;
        window.execScript([
                "Function parseVB(code)",
                "\tExecuteGlobal(code)",
                "End Function"
            ].join("\n"), "VBScript")
            /**
             * 传入VB类的回掉函数
             * @param {[type]} obj                 原型对象
             * @param {[type]} accessingProperties 监控对象（get时为监控属性）
             * @param {[type]} name                监控属性
             * @param {[type]} value               设置的值
             */
        var VBMediator = function(obj, accessingProperties, name, value) {
                if (name) {
                    //setter
                    var accessor = accessingProperties[name];
                    if (typeof accessor === "function") {
                        //如果是定义的
                        accessor(value);
                    } else {
                        obj[name] = value;
                    }
                } else {
                    //getter
                    return obj[accessingProperties];
                }
            },
            propertyBuffer = function(arr, name) {
                arr.push(
                    //由于不知对方会传入什么,因此set, let都用上
                    "\tPublic Property Let [" + name + "](val"+expose+")", //setter
                    "\t\tCall [__proxy__]([__obj__],[__data__], \"" + name + "\", val"+expose+")",
                    "\tEnd Property",
                    "\tPublic Property Set [" + name + "](val"+expose+")", //setter
                    "\t\tCall [__proxy__]([__obj__],[__data__], \"" + name + "\", val"+expose+")",
                    "\tEnd Property",
                    "\tPublic Property Get [" + name + "]", //getter
                    "\tOn Error Resume Next", //必须优先使用set语句,否则它会误将数组当字符串返回
                    "\t\tSet[" + name + "] = [__proxy__]([__obj__],\"" + name + "\")",
                    "\tIf Err.Number <> 0 Then",
                    "\t\t[" + name + "] = [__proxy__]([__obj__],\"" + name + "\")",
                    "\tEnd If",
                    "\tOn Error Goto 0",
                    "\tEnd Property");
            };
        /**
         * vb class
         * @param  {[type]} obj 原对象
         * @param  {[type]} accessors  需要监控的属性
         * @return {[type]}            [description]
         */
        defineProperties = function(obj, accessors) {
            var className = "VBWatchClass" + _.uniqueId(),
                buffer = [
                    "Function " + className + "Factory(a, b, c)",
                    "\tDim o",
                    "\tSet o = (New " + className + ")(a, b, c)",
                    "\tSet " + className + "Factory = o",
                    "End Function"
                ];
            //d:accessors  p:VBMediator
            buffer.push(
                    "Class " + className,
                    "\tPrivate [__data__], [__proxy__], [__obj__]",
                    "\tPublic Default Function [__const__](d, p, obj)",
                    "\t\tSet [__data__] = d: set [__proxy__] = p",
                    "\t\tSet [__obj__] = obj",
                    "\t\tSet [__const__] = Me", //链式调用
                    "\tEnd Function")
                //添加普通属性,因为VBScript对象不能像JS那样随意增删属性，必须在这里预先定义好
            for (name in obj) {
                if (!accessors.hasOwnProperty(name)) {
                    // buffer.push("\tPublic [" + name + "]");
                    propertyBuffer(buffer, name);
                }
            }
            buffer.push("\tPublic [" + 'hasOwnProperty' + "]")
                //添加访问器属性
            for (name in accessors) {
                propertyBuffer(buffer, name);
            }
            buffer.push("End Class");
            //生成一个类和一个Factory
            window.parseVB(buffer.join("\r\n"));
            return window[className + "Factory"](accessors, VBMediator, obj) //得到VBS实例
        }
    }
    //IE6-8使用VB class监控
    var watch = function(obj, properties) {
        var valueCache = ie678 ? obj : {},
            setter = function(prop, newval) {
                var oldval = valueCache[prop];
                if (properties[prop].call(obj, newval, oldval) !== false) {
                    valueCache[prop] = newval;
                }
            },
            descriptors = {};
        if (ie678) {
            //如果是IE678
            for (var prop in properties) {
                descriptors[prop] = function(newval) {
                    if (arguments.length) {
                        setter(prop, newval);
                    } else {
                        return valueCache[prop];
                    }
                }
            }
        } else {
            for (var prop in properties) {
                descriptors[prop] = {
                    get: function() {
                        return valueCache[prop]
                    },
                    set: function(newval) {
                        setter(prop, newval);
                    },
                    enumerable: true,
                    configurable: true
                }
            }
        }
        return defineProperties(obj, descriptors);
    };
    return watch;
});
