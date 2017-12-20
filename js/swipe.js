//sliderAdvertisement(el);
    var Swipe = (function() {
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
            function bindSwipe(el, swipe, callback, triggerOnMove, isStopPropagation, isPreventDefault) {
                var startPoint, endPoint, timer;
                var el_isTouchMove = false;

                /**
                 * [swipeDirection 计算滑动方向]
                 * @Author   Linada
                 * @DateTime 2017-12-19T16:38:38+0800
                 * @param    {float}                 x1 [touchstart 横坐标]
                 * @param    {float}                 y1 [touchstart 纵坐标]
                 * @param    {float}                 x2 [touchmove 横坐标]
                 * @param    {float}                 y2 [touchmove 纵坐标]
                 * [首先根据x方向和y方向滑动的长度决定触发x方向还是y方向的事件。然后再判断具体的滑动方向。]
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
                /**
                 * [execSwipe 滑动回调函数]
                 * @param  {[type]} el    [滑动对象]
                 * @param  {[type]} event [滑动事件 左右上下]
                 */
                function execSwipe(el, event) {
                    if (startPoint && endPoint && swipeDirection(startPoint.x, startPoint.y, endPoint.x, endPoint.y) === swipe) {
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
                    }, touch.duration)

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

                });

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
            /**
             * [swipeLeft description]
             * @Author   Linada
             * @DateTime 2017-12-19T16:13:00+0800
             * @param    {obj}                 el       [description]
             * @param    {Function}               callback [description]
             * @param    {obj}                 options  [description]
             */
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