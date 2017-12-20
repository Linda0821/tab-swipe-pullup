
/**
 * [创建一个可滑动和下拉刷新的tab]
 * @AuthorHTL
 * @DateTime  2017-12-19T16:11:12+0800
 * @param     {obj}                 obj      [description]
 * @param     {Function}               callback [description]
 * @example  var tabControl = new TabControl({
                "id":"Tabs",  //[id string tab的包裹容器（id） 必须]
                "is_swipe":true, //[is_swipe boolean tabcontent是否可以滑动]
                "tabItemName":["新闻","娱乐新闻","社会","视屏","内涵段子","最后一刻","人生杂谈"], //[tabItemName arr  tab标题的文字 必须]
                "classesImgURL":["img/...","img/..."] //[classesImgURL arr  标题处icon链接 存在则有icon图标]
             },getTabContent);
 */
var TabControl = function(obj, callback) {
    "use strict";

    var me = this;
    //console.info(me);
    var w = screen.width || document.body.clientWidth,
        h = screen.height || document.body.clientHeight;

    /**
     *外部传进的参数
     *param(idName), tab外围包裹div的id 
     *param(tabCount), 创建tab页的个数    
     */
    var idName = obj.id,
        tabTitle = obj.tabItemName ? [] : document.querySelectorAll("#"+idName+" .tab-head .tab-scroll .tab-head-item"),
        tabCount = obj.tabItemName ? obj.tabItemName.length : document.querySelectorAll("#"+idName+" .tab-head .tab-scroll .tab-head-item").length;
        

    //TAB外围包裹容器 
    var cbody = document.getElementById(idName); //querySelector 

    //TAB控件容器,头,列表 下划线，滚动部件
    var tabHead, tabCotent, ul, line, headScroll;

    //最后选中的TAB页  
    var lastSelectedPage = 0;

    //TAB页管理容器  
    var pages = [];

    //判断是首次点击/滑动渲染还是下拉刷新
    var isRender = {};

    /**  
     * 初始化函数  
     * param{tabCount}, 创建tab页的个数  
     */
    me.init = function() {
        //创建TAB外围包裹容器     
        cbody.className = "TabControl";

        obj.tabItemName ? me.createTabElement(): me.setHoldTabElement();//判断是自动添加tab还是手动

        me.tabCssInit();//设置初始化是的样式

        //缺省选中第一页,顺序不能变，先创建  
        me.slideTo(0, {
            "isClickLoad": true
        });

        //点击切换选项 
        $("#"+idName+' .tab-head ul li').click(function() {
            //console.info($(this).attr("id").substring(5));
            var id = $(this).attr("id").substring(5);
            me.slideTo(id, {
                "isClickLoad": true
            });
            centerClass(idName,id, w);
        });

        //下拉刷新
        $("#"+idName+" .tab-content .tab-content-item").each(function(i,e){

            pullUpload(e, i,  function(index, fn) {
                if (fn) {
                    fn();
                }
                isRender = {
                    "isSlideLoad": false,
                    "isClickLoad": false,
                    "isPullLoad": true
                };
                callback(pages, index, isRender);
            });

        })
        //tab 表头滚动事件
        //console.info(headScroll.clientWidth);
        if (headScroll.clientWidth > w) {
            classScrolling(idName);
        }

        //tabcontent 滑动事件
        if (obj.is_swipe) {
            sliding(idName,function(index) {
                me.slideTo(index, {
                    "isSlideLoad": true
                });
            });
        }

    };

    me.createTabElement = function() {
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
        headScroll = document.createElement("div");
        headScroll.className = "tab-scroll";
        tabHead.appendChild(headScroll);
        headScroll.appendChild(ul);

        //创建滚动的划线
        line = document.createElement("div");
        line.className = "line";
        ul.appendChild(line);

        //创建TAB头UL里的li  
        //console.info(tabCount);
        for (var i = 0; i < tabCount; i++) {
            var tabHeadHtml = "";
            if (obj.classesImgURL) {
                ul.className = "tab-img-icon";
                tabHeadHtml = '<a href="javascript:void(0)"><span class="tab-icon">' + '<img src="' + obj.classesImgURL[i] + '">' + '</span>' + '<div class="tab-media-body">' + obj.tabItemName[i] + '</div></a>'
            } else {
                tabHeadHtml = '<a href="javascript:void(0)">' + obj.tabItemName[i] + '</a>';
            }

            me.insertPage(i, tabHeadHtml);
        }


    };
    me.setHoldTabElement = function() {
        tabHead = document.querySelectorAll("#"+idName+" .tab-head")[0];
        tabCotent = document.querySelectorAll("#"+idName+" .tab-content")[0];
        ul = document.querySelectorAll("#"+idName+" .tab-head .tab-scroll ul")[0];
        line = ul.querySelectorAll(".line")[0];
        headScroll = document.querySelectorAll("#"+idName+" .tab-head .tab-scroll")[0];
        for (var i = 0; i < tabCount; i++) {
            pages[i] = tabCotent.querySelectorAll(".tab-content-item")[i];
            $(pages[i]).width(w+"px");
        }

    }
    me.tabCssInit = function() {
        var li_0={
            left: 0,
            right: 0
        };
        //初始化tab 表头的宽度
        var w_tabhead = 0;
        for (var i = 0; i < tabCount; i++) {
            var str_right=$(tabTitle[i]).css("margin-right").replace("px",""); 
            var str_left=$(tabTitle[i]).css("margin-left").replace("px",""); 
            if( i == 0 ){
               li_0.right = str_right;
               li_0.left = str_left;
            }
            w_tabhead = w_tabhead + parseInt(tabTitle[i].offsetWidth)+parseInt(str_right)+parseInt(str_left);
            console.info(i + ", " + w_tabhead);
        }
        headScroll.setAttribute("style", "width:" + parseInt(w_tabhead) + "px;");
        if(!obj.tabItemName) headScroll.setAttribute("style", "width:" + 530 + "px;");
        //headScroll.setAttribute("style", "width:" + 520 + "px;");


        //初始化line 宽度
        line.setAttribute("style", "width:" + tabTitle[0].offsetWidth + "px;left:"+li_0.left+"px");

        //初始化tab-content高度 宽度
        tabCotent.setAttribute("style", "width:" + w * tabCount + "px; height:"+(cbody.offsetHeight - tabHead.offsetHeight) + "px");
        //tabCotent.style.height = (document.body.offsetHeight - tabHead.offsetHeight) + "px";
    }

    /**  
     * 插入TAB页  
     * param{idx},插入位置  
     * param{title},TAB页标题   
     */
    me.insertPage = function(idx, title) {
        //创建page       
        if (parseInt(idx) >= 0) {
            //创建TAB头li
            var li = document.createElement("li");
            li.className = "tab-head-item";
            li.id = "class" + idx;
            li.innerHTML = title;
            var chd = ul.childNodes[idx];
            ul.insertBefore(li, chd);

            tabTitle[idx] = li;


            //创建tabCotent
            var page = document.createElement("div");
            page.className = "tab-content-item";
            page.setAttribute("style", 'width:' + w + 'px;');

            //创建tab-content下scroll控件
            var tabContentScroll = document.createElement("div");
            tabContentScroll.className = "tab-content-scroll";
            page.appendChild(tabContentScroll);

            //page.innerHTML = " 我是第" + idx + "个tab";
            pages.push(page);
            var chd_page = tabCotent.childNodes[idx];
            tabCotent.insertBefore(page, chd_page);

            //添加属性data-idx;
            pages[idx].setAttribute("data-idx", idx);

            //封装的tap点击函数
            /*tap(li, function(e) {
                var id = getSelectedIndex(li);
                console.info(id);
                me.slideTo(id, {
                    "isClickLoad": true
                });
                centerClass(id, w);
            });*/

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
    me.slideTo = function(idx, isRender) {
        // console.info("qian=="+$("#Tabs").height()+"--"+pages[idx].clientHeight);      
        if (parseInt(idx) >= 0) {
            //var lis = ul.childNodes;
            var lis = tabHead.getElementsByTagName("ul")[0].children;

            console.info(lastSelectedPage + ',' + idx);
            lis[lastSelectedPage].className = "tab-head-item";
            lis[idx].className = "tab-head-item active";
            //console.info("width"+lis[idx].getAttribute("width"));


            //隐藏无需显示的TAB页,显示选中的TAB页  
            pages[lastSelectedPage].className = "tab-content-item";
            pages[idx].className = "tab-content-item active";          

            var _left = w * idx;

            //console.log(_left);
            //var _w = obj.tabItemName ?  w * tabCount : w * (tabCount+1);
            var _w = w * tabCount ;
            tabCotent.setAttribute("style", 'width:' + _w + 'px;height:'+(cbody.offsetHeight - tabHead.offsetHeight)+'px; transition:all 0.3s cubic-bezier(0.075, 0.82, 0.165, 1) 0s;-webkit-transition:all 0.3s cubic-bezier(0.075, 0.82, 0.165, 1) 0s;transform:translate3d(' + (-_left) + 'px,0px,0px);-webkit-transform:translate3d(' + (-_left) + 'px,0px,0px)');
            if ($("#"+idName+" .tab-head").hasClass('fixed')) {
                $("#"+idName+" .tab-content").css({
                    "marginTop": $(".tab-head").height()
                });
            }
            lastSelectedPage = idx;


            if (typeof callback === "function") {
                // Execute the callback function and pass the parameters to it
                isRender = {
                    "isSlideLoad": isRender.isSlideLoad || false,
                    "isClickLoad": isRender.isClickLoad || false,
                    "isPullLoad": false
                };
                callback(pages, idx, isRender);
            }

        }

    };

    //在函数尾部调用初始化函数执行初始化  
    me.init();

    //最后返回DOM对象  
    return cbody;
};
/*  
 * 内部函数  
 * tap方法 点击函数 
 */
function tap(obj, callBack) {
    if (typeof obj != 'object') return;
    // 变量
    var startTime = 0; // 记录触摸开始时间
    var isMove = false; // 记录是否产生移动
    obj.addEventListener('touchstart', function() {
        startTime = Date.now();
    });
    obj.addEventListener('touchmove', function() {
        console.log("点击封装tap函数中监听到touchmove事件");
        isMove = true;
    });
    obj.addEventListener('touchend', function(e) {
        if (Date.now() - startTime < 300 && !isMove) {
            //触碰时间在300ms以内,不产生移动
            callBack && callBack(e);
        }
        // 清零
        startTime = 0;
        isMove = false;
    });
}

/**
 * @return {[type]}
 * tabHead的标题栏滚动函数
 */
function classScrolling(idName) {
    var startx = 0,
        movex = 0,
        startLeft = 0;
    var lastMoveStart = 0,
        lastMoveTime = 0;
    var _w = window.innerWidth,
        _width = $("#"+idName+" .tab-head .tab-scroll").width();
    $("#"+idName+" .tab-head").on("touchstart", function(e) {
        _width = $("#"+idName+" .tab-head .tab-scroll").width();
        // 记录开始滑动
        startx = e.targetTouches[0].clientX;
        startLeft = $("#"+idName+" .tab-head .tab-scroll").position().left;
        // 惯性滑动
        stopClassInertia = true;
        lastMoveStart = startx;
        lastMoveTime = Date.now();
    });
    $("#"+idName+" .tab-head").on("touchmove", function(e) {
        // 滑动
        var _x = e.targetTouches[0].clientX;
        movex = _x - startx;
        var translate_x = startLeft - 0 + movex;
        if (_width > _w) { // 分类多
            translate_x = translate_x > _w / 4 ? _w / 4 : (translate_x < -(_width - _w + _w / 4) ? -(_width - _w + _w / 4) : translate_x);
        } else { // 分类少 不滚动tab表头
            translate_x = 0;
        }
        setAnimateCss($("#"+idName+" .tab-head .tab-scroll"), translate_x, 0);
        // 惯性
        stopClassInertia = true;
        var _now = Date.now();
        if (_now - lastMoveTime > 300) {
            lastMoveStart = _x;
            lastMoveTime = _now;
        }
    });
    $("#"+idName+" .tab-head").on("touchend", function(e) {
        // 惯性滑动
        var _left = $("#"+idName+" .tab-head .tab-scroll").position().left,
            _now = Date.now(),
            v = (e.changedTouches[0].clientX - lastMoveStart) / (_now - lastMoveTime),
            a = 0.001,
            dir = v > 0 ? -1 : 1;
        a = a * dir;
        stopClassInertia = false;
        if (_width > _w) {
            inertiaMove();
        }

        function inertiaMove() {
            if (stopClassInertia) {
                return;
            }
            var _duration = Date.now() - _now,
                _nowV = v + a * _duration,
                _x = (v + _nowV) / 2 * _duration;
            if (-dir * _nowV < 0) {
                var _l = $("#"+idName+" .tab-head .tab-scroll").position().left,
                    _end = _l > 0 ? 0 : (_l < -(_width - _w) ? -(_width - _w) : _l);

                setAnimateCss($("#"+idName+" .tab-head .tab-scroll"), _end, 0.3);
                return;
            }
            var _translate = _left + _x;
            _translate = _translate > _w / 4 ? _w / 4 : (_translate < -(_width - 3 * _w / 4) ? -(_width - 3 * _w / 4) : _translate);

            setAnimateCss($("#"+idName+" .tab-head .tab-scroll"), _translate, 0);
            if (_translate >= _w / 4) {
                setAnimateCss($("#"+idName+" .tab-head .tab-scroll"), 0, 0.3);
                return;
            } else if (_translate <= -(_width - _w)) {
                setAnimateCss($("#"+idName+" .tab-head .tab-scroll"), (-(_width - _w)), 0.3);
                return;
            }
            setTimeout(inertiaMove, 10);
        }
    });
}

// 分类信息 让某个类居中
function centerClass(idName,id, w) {
    stopClassInertia = true;

    var $a = $("#"+idName+" .tab-head .tab-scroll .tab-head-item").eq(id),
        $c = $("#"+idName+" .tab-content .tab-content-item").eq(id),
        _w = w || $("body")[0].offsetWidth,
        $line = $("#"+idName+" .line"),
        $class = $("#"+idName+" .tab-head .tab-scroll");

    $line.width($a.width());
    if ($class.width() > _w) {
        // 分类栏移动
        var translate_c = -($a[0].offsetLeft + $a[0].offsetWidth / 2 - _w / 2);
        translate_c = translate_c > 0 ? 0 : (translate_c < -($class.width() - _w) ? -($class.width() - _w) : translate_c);
        setAnimateCss($("#"+idName+" .tab-head .tab-scroll"), translate_c, 0.3);

    }
    // 分类下划线移动
    //console.info("$a[0]=="+$a[0].offsetLeft + ',' + $a[0].offsetWidth);
    var translate_l = $a[0].offsetLeft + $a[0].offsetWidth / 2 - $line[0].offsetWidth / 2;
    $line.css({
        "transition": "all 0s 0s",
        "-webkit-transition": "all 0s 0s",
        "left": translate_l + "px",
    });

    // 分类
    $a.addClass("active").siblings("li").removeClass("active");
    $c.addClass("active").siblings("div.tab-content-item").removeClass("active");
}
// 实现slides横向切换
function sliding(idName,fn) {
    var startX, startLeft = 0,
        moveX = 0,
        startY = 0,
        moveY = 0,
        startTime = 0,
        _w = window.innerWidth,
        _len = $(".tab-content .tab-content-item").length,
        _width = _len * _w;
    console.info("_width===" + _width);

    // 判断是否横向滑动
    var setted = false;
    // 惯性滑动参数
    var lastMoveStart = 0,
        lastMoveTime = 0;

    var canslide = true; // 避免连续切换

    var index;

    $("#"+idName+" .tab-content").on("touchstart", function(e) {       
        index = $("#"+idName+" .tab-content  .tab-content-item.active").attr("data-idx");
        //console.info("index===" + index);
        // 初始化
        _w = window.innerWidth;
        setted = false;
        startX = e.targetTouches[0].clientX;
        startY = e.targetTouches[0].clientY;
        startLeft = $("#"+idName+" .tab-content").position().left;
        startTime = Date.now();
        _len = $("#"+idName+" .tab-content .tab-content-item").length;
        _width = $("#"+idName+" .tab-content")[0].offsetWidth;

        // 重置panel-wrapper宽度，横屏
        var panelWrapperWidth = _len * _w;
        $("#"+idName+" .tab-content").css({
            "width": panelWrapperWidth + "px"
        });
        // 惯性滑动
        lastMoveStart = startX;
        lastMoveTime = Date.now();
    });
    $("#"+idName+" .tab-content").on("touchmove", function(e) {
        // 判断是否横向滑动
        moveX = e.targetTouches[0].clientX - startX;
        moveY = e.targetTouches[0].clientY - startY;
        if (!setted) {
            isSlide = Math.abs(moveX) > Math.abs(moveY) ? true : false;
            setted = true;
        }
        if (!isSlide || !canslide) return;
        // 开始横向滑动
        startLeft = -$("#class" + index).index() * _w;

        var translate_x = startLeft - 0 + moveX > _w / 4 ? _w / 4 : (startLeft - 0 + moveX < -(_len - 1) * _w - _w / 4 ? -(_len - 1) * _w - _w / 4 : startLeft - 0 + moveX);
        //console.info("startLeft****"+startLeft+"***translate_x****"+translate_x);
        setAnimateCss($("#"+idName+" .tab-content"), translate_x, 0);

        // 惯性滑动 速度
        var _now = Date.now();
        if (_now - lastMoveTime > 300) {
            lastMoveTime = _now;
            lastMoveStart = e.targetTouches[0].clientX;
        }
    });
    $("#"+idName+" .tab-content").on("touchend", function(e) {
        if (!isSlide || !canslide) return;

        if (index >= _len) return;

        // 滑动
        var _now = Date.now(),
            v = (e.changedTouches[0].clientX - lastMoveStart) / (_now - lastMoveTime);
        var translate_x;
        //console.info(moveX+"&&&&"+v);
        //console.info("startLeft****"+startLeft);
        if ((moveX * v > 0) && ((startLeft <= -_w && startLeft >= -(_width - _w / 2) && (Math.abs(moveX) > _w / 4 || Math.abs(v) > 0.1)) || (startLeft >= 0 && (moveX <= -_w / 4 || v < -0.1)) || (startLeft <= -(_width) && (moveX >= _w / 4 || v > 0.1)))) {
            index = v > 0 ? parseInt($("#class" + index).index() - 1) : parseInt($("#class" + index).index() + 1);
            if (index >= _len) {
                var px = _len - 1;
                setAnimateCss($("#"+idName+" .tab-content"), (-px * _w), 0.3);
                return;
            }
        }
        canslide = false;
        translate_x = -$("#class" + index).index() * _w;
        console.info(translate_x + "  " + index);
        setAnimateCss($("#"+idName+" .tab-content"), translate_x, 0.3);

        setTimeout(function() {
            canslide = true;
        }, 350);
        // 分类栏 滑动
        centerClass(idName,index, _w);
        if (fn) {
            fn(index);
        }

    });

}

function setAnimateCss(obj, wd, s, num) {
    if (num && num == 1) {
        obj.css({
            "transition": "all " + s + "s 0s ease",
            "-webkit-transition": "all " + s + "s 0s ease",
            "transform": "translate3d(0px, " + wd + "px,0px)",
            "-webkit-transform": "translate3d(0px, " + wd + "px,0px)"
        });
    } else {
        obj.css({
            "transition": "all " + s + "s 0s ease",
            "-webkit-transition": "all " + s + "s 0s ease",
            "transform": "translate3d(" + wd + "px,0px,0px)",
            "-webkit-transform": "translate3d(" + wd + "px,0px,0px)"
        });
    }
}
$(window).on("scroll", function() {
    setClassesPosition();
});
//tabhead 滚动到顶部再刷新时触发
window.addEventListener("beforeunload", function(event) {
    window.scrollTo(0, -1);
});
// 设置分类栏位置
function setClassesPosition() {
    var scrollTop = $(window).scrollTop(),
        panelTop = $(".TabControl")[0].offsetTop;
    if (panelTop <= 0) return;
    if (scrollTop >= panelTop) {
        $(".tab-head").css({
            "position": "fixed",
            "top": "0px"
        }).addClass("fixed");
        $(".tab-content").css({
            "marginTop": $(".tab-head").height()
        });
        $("body").css({
            "overflow": "hidden",
            "height": "100%"
        });
    } else {
        $(".tab-head").attr({
            "style": "position:static"
        }).removeClass("fixed");
        $(".tab-content").css({
            "marginTop": "0"
        });
        $("body").css({
            "overflow": "auto",
            "height": "auto"
        });
    }
}

function pullUpload(obj , idx , fn) {
    var index = idx ;
    var $father = $(".tab-content .tab-content-item").eq(index),
        $child = $(".tab-content .tab-content-item").eq(index).find(".tab-content-scroll");

    var startSlide = false,
        startLock = false, // 判断是否横向切换
        isSlide = false;

    // 竖向滑动参数
    var f_hei = 0,
        c_hei = 0,
        c_top = 0;

    var start = 0,
        dist = 0,
        preDist = 100,
        ty = 0,
        translate_y = 0;

    var lastMoveStart = 0,
        lastMoveTime = 0,
        stopInertiaMove = true; // 惯性滑动 参数

    // 横向滑动参数
    var slider = $(".tab-content");
    var startX = 0,
        distX = 0;

    $father.on("touchstart", function(e) {
        if (!($(".tab-head").hasClass('fixed')) && $(".TabControl")[0].offsetTop > 0) {
            return;
        }
        if (e.targetTouches) {
            // 横向滑动
            startX = e.targetTouches[0].clientX;
            // 竖向滑动
            $child.css("transition", "all 0s ease 0s");
            f_hei = $father.height();
            c_hei = $child.height();
            c_top = c_hei - f_hei;
            ty = parseInt($child.position().top);
            start = e.targetTouches[0].clientY;
            // 惯性滑动参数
            lastMoveStart = start;
            lastMoveTime = Date.now();
            stopInertiaMove = true;
        }
    });
    $father.on("touchmove", function(e) {
        if ($(window).scrollTop() < $(".TabControl")[0].offsetTop) {
            console.info("返回不滑动");
            return;
        }
        distX = e.targetTouches[0].clientX - startX;
        dist = e.targetTouches[0].clientY - start;
        if (!startLock) { // 判断是横向划 还是 竖向划
            startSlide = Math.abs(distX) > 2 * Math.abs(dist) ? true : false;
            startLock = true;
        }
        if (!startSlide) { // 竖向滑动
            translate_y = dist + ty;
            if (translate_y > 0) {
                $("body").css({
                    "overflow": "auto",
                    "height": "auto"
                });
            }
            //console.info("translate_y=" + translate_y + "," + ty + "," + dist+",c_top="+c_top);
            if (c_top >= 0) { // 内容加载超过一页
                translate_y = translate_y > 0 ? 0 : (translate_y < -(c_top + preDist) ? -(c_top + preDist) : translate_y);
            } else { // 内容加载不够一页
                translate_y = translate_y > 0 ? 0 : (translate_y < -preDist ? -preDist : translate_y);
            }
            setAnimateCss($child, parseInt(translate_y), 0, 1);
            // 惯性滑动 保持记录最新数据
            var _nowTime = Date.now();
            stopInertiaMove = true;
            if (_nowTime - lastMoveTime > 300) {
                lastMoveTime = _nowTime;
                lastMoveStart = e.targetTouches[0].clientY;
            }
        }
    });
    $father.on("touchend", function(e) {
        if ($(window).scrollTop() < $(".TabControl")[0].offsetTop) {
            console.info("end返回不滑动");
            return;
        }
        if (!startSlide) {
            // 竖向滑动
            console.info("c_top=" + c_top + "," + ty);

            if (c_top >= 0) { // 内容加载超过一页
                // 惯性滑动
                var nowTime = Date.now(),
                    v = (e.changedTouches[0].clientY - lastMoveStart) / (nowTime - lastMoveTime);
                stopInertiaMove = false;
                (function(v, startTime, _top) {

                    var a = 0.002;
                    var dir = v > 0 ? -1 : 1;
                    a = dir * a;

                    function inertiaMove() {
                        if (stopInertiaMove) {
                            return;
                        }
                        var nowTime = Date.now(),
                            t = nowTime - startTime,
                            nowV = v + t * a;
                        if (-dir * nowV < 0) { // 速度为0
                            moveResult($child.position().top);
                            return;
                        }

                        var moveY = _top - 0 + (v + nowV) / 2 * t;
                        moveY = moveY > 0 ? 0 : (moveY < -(c_top + preDist) ? -(c_top + preDist) : moveY);
                        setAnimateCss($child, moveY, 0, 1);
                        if (moveY >= 0 || moveY <= -(c_top + preDist)) {
                            moveResult($child.position().top);
                            return;
                        }
                        setTimeout(inertiaMove, 10);
                    }

                    inertiaMove();
                })(v, nowTime, parseInt($child.position().top));
                // 滑动结果
                function moveResult(translate_y) {
                    if (translate_y < -c_top & translate_y > -(c_top + preDist)) { // 回弹                      
                        setAnimateCss($child, (-c_top), 0, 1);
                    }
                    if (translate_y <= -(c_top + preDist)) { // 回弹刷新
                        //$father.find("pull-bottom-wrapper").show();
                        if (fn) {
                            fn(idx, function() {
                                setAnimateCss($child, (-c_top), 0, 1);
                            });

                        }
                    }
                }
            } else { // 内容加载不够一页
                if (translate_y > 0) {
                    return;
                }
                var td = c_top >= 0 ? -c_top : 0;
                if (translate_y > -preDist) { // 回弹
                    setAnimateCss($child, td, 0, 1);
                } else { // 刷新回弹
                    //$father.find("pull-bottom-wrapper").show();
                    if (fn) {
                        fn(idx, function() {
                            setAnimateCss($child, td, 0, 1);
                        });

                    }
                }
            }
        }
        start = 0;
        dist = 0;
        translate_y = 0;
        ty = 0;
        startX = 0;
        distX = 0;
        tx = 0;
        startSlide = false;
        startLock = false;
    });

}