    var TabControl = function(obj, callback) {
        "use strict";

        var me = this;
        console.info(me);

        var w = screen.width,
            h = screen.height;
        /**
         *外部传进的参数
         *param{idName}, tab外围包裹div的id 
         *param{tabCount}, 创建tab页的个数    
         */
        var idName = obj.id,
            tabCount = obj.tabItemName.length;

        //TAB控件容器,头,列表  
        var cbody, tabHead, tabCotent, ul;

        //最后选中的TAB页  
        var lastSelectedPage = 0;
        var currentIndex = 0;

        //TAB页管理容器  
        var pages = [];

        //判断是首次渲染还是下拉刷新
        var isRender = true;

        /**  
         * 初始化函数  
         * param{tabCount}, 创建tab页的个数  
         */
        me.init = function(tabCount) {
            //创建TAB容器  
            cbody = document.getElementById(idName); //querySelector  
            cbody.className = "TabControl";

            //创建TAB控件头  
            tabHead = document.createElement("div");
            tabHead.className = "tab-head";
            cbody.appendChild(tabHead);

            //创建tabCotent
            tabCotent = document.createElement("div");
            tabCotent.className = "tab-content";
            cbody.appendChild(tabCotent);

            //创建TAB头UL  
            ul = document.createElement("ul");
            if (obj.is_scrollTabHead) {
                var headScroll = document.createElement("div");
                headScroll.className = "tab-scroll";
                tabHead.appendChild(headScroll);
                headScroll.appendChild(ul);
            } else {
                tabHead.appendChild(ul);
            }


            //根据参数初始化TAB页,缺省创建2个TAB页  
            var tc = tabCount || 2;

            //创建TAB头UL里的li   
            for (var i = 0; i < tc; i++) {
                me.insertPage(i, '<a href="javascript:void(0)">' + obj.tabItemName[i] + '</a>');
            }
            tabCotent.setAttribute("style", "width:" + w * tabCount + "px;");
            //缺省选中第一页  
            me.slideTo(0);
            //初始化tab 表头的宽度
            var w_tabhead = 0;
            for (var i = 0; i < tabCount; i++) {
                w_tabhead = w_tabhead + parseInt(document.querySelectorAll(".tab-head .tab-scroll .tab-head-item")[i].clientWidth);
            }
            headScroll.setAttribute("style", "width:" + w_tabhead + "px;");

        };

        /**  
         * 插入TAB页  
         * param{idx},插入位置  
         * param{title},TAB页标题  
         *  
         */
        me.insertPage = function(idx, title) {
            //创建page 
            if (parseInt(idx) >= 0) {
                //创建TAB头li
                var li = document.createElement("li");
                li.className = "tab-head-item";
                li.innerHTML = title;
                var chd = ul.childNodes[idx];
                ul.insertBefore(li, chd);

                //创建tabCotent
                var page = document.createElement("div");
                page.className = "tab-content-item";
                //page.setAttribute("style",'width:'+w +'px; left:'+w*idx+'px');
                page.setAttribute("style", 'width:' + w + 'px;');
                //page.innerHTML = " 我是第" + idx + "个tab";
                pages.push(page);
                var chd_page = tabCotent.childNodes[idx];
                tabCotent.insertBefore(page, chd_page);
                li.onclick=function (argument) {
                    me.slideTo(getSelectedIndex(li));
                }
                    
            }
        };
         /*  
         * 内部函数  
         * 根据选中的对象,获取对应的TAB页索引  
         */
        function getSelectedIndex(li) {
            var chd = ul.childNodes;
            for (var i = 0; i < chd.length; i++) {
                if (chd[i] == li) {
                    return i;
                }
            }
        }

        /**  
         * 选中某页  
         * param{idx},选中页的索引  
         */
        me.slideTo = function(idx) {
            idx = parseInt(idx);
            if (idx >= 0) {
                var lis = ul.childNodes;

                console.info(lastSelectedPage + ',' + idx);
                lis[lastSelectedPage].className = "tab-head-item";
                lis[idx].className = "tab-head-item active";


                //隐藏无需显示的TAB页,显示选中的TAB页  
                pages[lastSelectedPage].className = "tab-content-item";
                pages[idx].className = "tab-content-item active";
                pages[idx].setAttribute("data-idx",idx);

                var _left = w * idx;
                console.log(_left);
                //tabCotent.setAttribute("style", 'width:' + w * tabCount + 'px;transition:all .3s ease 0s;-webkit-transition:all .3s ease 0s;transform:translate3d(' + (-_left) + 'px,0px,0px);-webkit-transform:translate3d(' + (-_left) + 'px,0px,0px)');
                tabCotent.setAttribute("style", 'width:' + w * tabCount + 'px;transition:all .3s cubic-bezier(0.075, 0.82, 0.165, 1) 0s;-webkit-transition:all .3s cubic-bezier(0.075, 0.82, 0.165, 1) 0s;transform:translate3d(' + (-_left) + 'px,0px,0px);-webkit-transform:translate3d(' + (-_left) + 'px,0px,0px)');
                lastSelectedPage = idx;

                if (typeof callback === "function") {
                    // Execute the callback function and pass the parameters to it
                    callback(pages, idx, isRender);
                }
            }

        };

        me.swipe =  (function() {
            var touch = {
                distance: 30, //滑动距离，超过该距离触发swipe事件，单位像素。
                duration: 1000 //滑动时长，超过该时间不触发swipe，单位毫秒。
            };
            /**
             * @param  el        {HTMLElement}  HTML元素
             * @param  callback  {Function}     事件回调函数
             * @param  options   {Object}       可选参数
             * @param  isStopPropagation  {Boolean}  是否停止冒泡，true为停止冒泡
             * @param  isPreventDefault   {Boolean}  是否阻止默认事件，true为阻止默认事件
             * @param  triggerOnMove      {Boolean}
             *                                      swipe事件有两种触发方式，一种是在touchmove过程中，只要满足滑动距离条件即触发。
             *                                       一种是在touchend中，进入滑动距离判断，如果满足滑动距离触发。
             *                                       默认值为false，在touchend中触发。
             */
            function bindSwipe(el, swipe, callback, triggerOnMove, isStopPropagation, isPreventDefault,isScrolling) {
                var startPoint, endPoint, timer;
                var el_isTouchMove = false;


                /**
                 * 计算滑动方向
                 * 首先根据x方向和y方向滑动的长度决定触发x方向还是y方向的事件。
                 * 然后再判断具体的滑动方向。
                 * 如果滑动距离不够长，不判断方向。
                 */
                function swipeDirection(x1, y1, x2, y2) {
                    var diffX = x1 - x2,
                        diffY = y1 - y2,
                        absX = Math.abs(diffX),
                        absY = Math.abs(diffY),
                        swipe;
                        if (absX >= absY) {
                            if (absX >= touch.distance) {
                                swipe = diffX > 0 ? 'swipeLeft' : 'swipeRight';
                            }
                        } else {
                            if (absY >= touch.distance) {
                                swipe = diffY > 0 ? 'swipeUp' : 'swipeDown';
                            }
                        }
                        return swipe;

                }
                // 清除本次滑动数据
                function clearSwipe() {
                    startPoint = undefined;
                    endPoint = undefined;

                    if (timer !== undefined) {
                        clearTimeout(timer);
                        timer = undefined;
                    }
                }

                function execSwipe(el, event) {
                    if (startPoint && endPoint && swipeDirection(startPoint.x, startPoint.y, endPoint.x, endPoint.y) === swipe ) {
                        callback.call(el, event);
                        return true;
                    }
                }
                el.addEventListener("touchstart", function(event) {
                    var self = this,
                        touchPoint = event.touches[0];

                    if (isStopPropagation) {
                        event.stopPropagation();
                    }

                    if (isPreventDefault) {
                        event.preventDefault();
                    }
                    startPoint = {
                        x: Math.floor(touchPoint.clientX),
                        y: Math.floor(touchPoint.clientY)
                    };

                    timer = setTimeout(function() {
                        //如果超时，清空本次touch数据
                        clearSwipe();
                    }, touch.duration);

                    el_isTouchMove = false; //是否移动
                })

                el.addEventListener("touchmove", function(event) {
                    var self = this,
                        touchPoint = event.touches[0];

                    if (isStopPropagation) {
                        event.stopPropagation();
                    }

                    if (isPreventDefault) {
                        event.preventDefault();
                    }

                    if (startPoint) {
                        endPoint = {
                            x: Math.floor(touchPoint.clientX),
                            y: Math.floor(touchPoint.clientY)
                        };

                        //执行swipe事件判断，是否符合触发事件
                        if (triggerOnMove) {
                            if (execSwipe(self, event)) {
                                clearSwipe();
                            }
                        }
                    }
                    el_isTouchMove = true;

                })

                el.addEventListener("touchend", function() {
                    var self = this;

                    if (isStopPropagation) {
                        event.stopPropagation();
                    }

                    if (isPreventDefault) {
                        event.preventDefault();
                    }

                    execSwipe(self, event);
                    //清除本次touch数据
                    clearSwipe();
                    if (!el_isTouchMove) return;
                })

            }
            touch.swipeLeft = function(el, callback, options) {
                if (options) {
                    bindSwipe(el, 'swipeLeft', callback, options.triggerOnMove, options.isStopPropagation, options.isPreventDefault);
                } else {
                    bindSwipe(el, 'swipeLeft', callback);
                }
            };
            touch.swipeRight = function(el, callback, options) {
                if (options) {
                    bindSwipe(el, 'swipeRight', callback, options.triggerOnMove, options.isStopPropagation, options.isPreventDefault);
                } else {
                    bindSwipe(el, 'swipeRight', callback);
                }
            };

            touch.swipeUp = function(el, callback, options) {
                if (options) {
                    bindSwipe(el, 'swipeUp', callback, options.triggerOnMove, options.isStopPropagation, options.isPreventDefault);
                } else {
                    bindSwipe(el, 'swipeUp', callback);
                }
            };

            touch.swipeDown = function(el, callback, options) {
                if (options) {
                    bindSwipe(el, 'swipeDown', callback, options.triggerOnMove, options.isStopPropagation, options.isPreventDefault);
                } else {
                    bindSwipe(el, 'swipeDown', callback);
                }
            }; 
            return touch;
        })();

        //在函数尾部调用初始化函数执行初始化  
        me.init(tabCount);


        if(obj.is_swipeTab){
            me.swipe.swipeLeft(tabCotent, function(e) {
                var page_index=parseInt(document.querySelector(".tab-content-item.active").getAttribute("data-idx"));
                console.info("swipeLeft****"+page_index);
                page_index =page_index + 1;
                console.info(page_index);
                if(page_index<pages.length){
                    me.slideTo(page_index);
                }else{
                    return;
                }
            })

            me.swipe.swipeRight(tabCotent, function(e) {
                var page_index=parseInt(document.querySelector(".tab-content-item.active").getAttribute("data-idx"));
                console.info("swipeRight****"+page_index);
                page_index = page_index -1;
                if(page_index >= 0){
                   me.slideTo(page_index); 
                } else{
                    return;
                }
                
            })   
        }
        me.scroll=function(el){
            var startPoint={};
            var endPoint={};
            var distance=10;
            var isTouchMove = false;
            var direction ="";//Horizontal and Vertical
            var endTime =0;
            var startleft=0;

            el.addEventListener("touchstart", function(event) {
                var startTime=Date.now();
                var self = this,
                touchPoint = event.touches[0];
                //event.stopPropagation();
                //event.preventDefault();
                startPoint = {
                        x: Math.floor(touchPoint.clientX),
                        y: Math.floor(touchPoint.clientY),
                        t: startTime 
                    };
                isTouchMove = false; 
                
            });

            el.addEventListener("touchmove", function(event) {
                var moveTime=Date.now();
                var self = this,
                touchPoint = event.touches[0];
                //event.stopPropagation();
                //event.preventDefault();
                endPoint = {
                        x: Math.floor(touchPoint.clientX),
                        y: Math.floor(touchPoint.clientY),
                        t: moveTime
                    }; 
                isTouchMove = true; 
                var X = endPoint.x -startPoint.x,Y = endPoint.y -startPoint.y,absX=Math.abs(X),absY=Math.abs(Y);
                    if ( absX > absY && absX >= distance) {
                        direction="Horizontal";
                    } else if(absX < absY && absY >= distance){
                        direction ="Vertical";
                    }
                    if(direction ==="Vertical" && el.childNodes[0].className === "tab-scroll" ){
                        
                    } else if ( direction ==="Horizontal" && el.childNodes[0].className === "tab-scroll"){
                        var translate_x = startleft+X, _width=90 * tabCount; 
                        console.info(translate_x);
                        translate_x = translate_x > w/4 ? w/4 : (translate_x <3 * w / 4-_width?3 * w / 4-_width:translate_x);
                        startleft=translate_x;
                        console.info(translate_x);
                        el.querySelector(".tab-scroll").setAttribute("style", 'width:' +_width + 'px;transition:all .3s cubic-bezier(0.075, 0.82, 0.165, 1) 0s;-webkit-transition:all .3s cubic-bezier(0.075, 0.82, 0.165, 1) 0s;transform:translate3d(' + (translate_x) + 'px,0px,0px);-webkit-transform:translate3d(' + (translate_x) + 'px,0px,0px)');
                        if(translate_x >=0){
                            el.querySelector(".tab-scroll").setAttribute("style", 'width:' +_width + 'px;transition:all .3s cubic-bezier(0.075, 0.82, 0.165, 1) 1s;-webkit-transition:all .3s cubic-bezier(0.075, 0.82, 0.165, 1) 1s;transform:translate3d(0px,0px,0px);-webkit-transform:translate3d(0px,0px,0px)');
                                startleft=0;
                                return;
                        } else if(translate_x <= w-_width){
                            el.querySelector(".tab-scroll").setAttribute("style", 'width:' +_width + 'px;transition:all .3s cubic-bezier(0.075, 0.82, 0.165, 1) 1s;-webkit-transition:all .3s cubic-bezier(0.075, 0.82, 0.165, 1) 1s;transform:translate3d(' + (w-_width) + 'px,0px,0px);-webkit-transform:translate3d(' + (w-_width) + 'px,0px,0px)');
                            startleft=w-_width;
                            return;
                        }
                    }              
            });

            el.addEventListener("touchend", function(event) {
               var endTime=Date.now();
                var self = this,
                touchPoint = event.touches[0];
                //event.stopPropagation();
                //event.preventDefault();
                if(!isTouchMove) return;
                var X = endPoint.x -startPoint.x,Y = endPoint.y -startPoint.y,absX=Math.abs(X),absY=Math.abs(Y);
                if ( absX > absY && absX >= distance) {
                    direction="Horizontal";
                } else if(absX < absY && absY >= distance){
                    direction ="Vertical";
                }
                if(direction ==="Vertical" && el.childNodes[0].className === "tab-scroll" ){
                    
                } else if ( direction ==="Horizontal" && el.childNodes[0].className === "tab-scroll"){
                    var translate_x = startleft+X, _width=90 * tabCount; 
                    console.info(translate_x);
                    translate_x = translate_x > w/4 ? w/4 : (translate_x <3 * w / 4-_width?3 * w / 4-_width:translate_x);
                    startleft=translate_x;
                    console.info(translate_x);
                    el.querySelector(".tab-scroll").setAttribute("style", 'width:' +_width + 'px;transition:all .3s cubic-bezier(0.075, 0.82, 0.165, 1) 0s;-webkit-transition:all .3s cubic-bezier(0.075, 0.82, 0.165, 1) 0s;transform:translate3d(' + (translate_x) + 'px,0px,0px);-webkit-transform:translate3d(' + (translate_x) + 'px,0px,0px)');
                    if(translate_x >=0){
                        el.querySelector(".tab-scroll").setAttribute("style", 'width:' +_width + 'px;transition:all .3s cubic-bezier(0.075, 0.82, 0.165, 1) 1s;-webkit-transition:all .3s cubic-bezier(0.075, 0.82, 0.165, 1) 1s;transform:translate3d(0px,0px,0px);-webkit-transform:translate3d(0px,0px,0px)');
                            startleft=0;
                            return;
                    } else if(translate_x <= w-_width){
                        el.querySelector(".tab-scroll").setAttribute("style", 'width:' +_width + 'px;transition:all .3s cubic-bezier(0.075, 0.82, 0.165, 1) 1s;-webkit-transition:all .3s cubic-bezier(0.075, 0.82, 0.165, 1) 1s;transform:translate3d(' + (w-_width) + 'px,0px,0px);-webkit-transform:translate3d(' + (w-_width) + 'px,0px,0px)');
                        startleft=w-_width;
                        return;
                    }
                }

            });
            
        }

/*        if(obj.is_scrollTabHead){
            me.scroll(tabHead);
        }*/

        //最后返回DOM对象  
        return cbody;
    };


