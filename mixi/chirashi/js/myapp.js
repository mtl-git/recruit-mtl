Deferred.define();
var myApp = {
    currentView: "",
    isOwner: false,
    insertion: {},
    storesOfTrades: {},
    clips: {},
    storeId: "",
    settings: {
        pref: "13",
        city: "13101",
        bizType: []
    },
    apiUrl: "http://webservice.recruit.co.jp/townmarket/",
    init: function() {
        myApp.currentView = (gadgets.views.getCurrentView()).getName();
        _IG_Analytics("UA-9037287-1", "/chirashi/mixi/view/" + myApp.currentView);
        myApp._addEventListener();
        myApp.action();
    },
    action: function(){
        var self = this;
        parallel({
            viewer: $.opensocial.person('VIEWER'),
            appdata: $.opensocial.data.get("chirashi","owner")
        }).next(function(d){
            var prefName="東京都";
            if(d.viewer && d.viewer.getField(opensocial.Person.Field.ADDRESSES) && !self.settings.pref ){
                prefName =  d.viewer.getField(opensocial.Person.Field.ADDRESSES);
            }

            if(d.appdata){
                if(d.appdata.settings) self.settings = d.appdata.settings;
                if(d.appdata.clips) self.clips = d.appdata.clips;
            }

            var arr = $.makeArray($("#pref option"));
            $.each(arr,function(i,v){
                if( self.settings.pref && $(v).val() == self.settings.pref ){
                    $(v).attr('selected','selected');
                }else if( !self.settings.pref && $(v).text() == prefName ){
                    self.settings.pref = $(v).val();
                    $(v).attr('selected','selected');
                }
            });
            self.isOwner = d.viewer.isOwner() || false;

            if( self.currentView == 'canvas' ){
                self.show();
            }else{
                self.showHome();
            }
            return true;
        });
    },
    _addEventListener: function(){
        var self = this;
        $("form").submit(function(){ return false;});
        $("#requestShareApp").bind("click", function() {
            $("#flash").css('display','none');
            setTimeout( function(){
                gadgets.window.adjustHeight();
            }, 1 );
            opensocial.requestShareApp("VIEWER_FRIENDS", null, function(res){
                $("#flash").css('display','block');
                setTimeout( function(){
                    gadgets.window.adjustHeight();
                }, 1 );
            });
        });
        $(".thumbnail").live("click",function(){
            var tid = $(this).attr('id');
            //self.insertion[v.store.code] = v;
            
            if( self.storesOfTrades[tid].length > 1 ){
                $("#stores_wrapper").css("display","block");
                $("#stores tbody").empty();
                var tr = $("<tr/>");
                $.each( self.storesOfTrades[tid], function(i,v){
                    if( i != 0 && (i % 6) == 0 ){
                        tr = $("<tr/>");
                    }
                    var p = $("<p/>").text(v['name']);
                    if( self.clips[tid] && $.inArray(v.code,self.clips[tid]) != -1 ){
                        var bm = $("<img/>").addClass("clip_icon").attr("src","http://mtl.recruit.co.jp/sandbox/mixi/chirashi/image/bookmark.gif");
                        p.append(bm);
                    }
                    $("<td/>").addClass('store').attr('id',v.code).append(p).appendTo(tr);
                    if( (i % 6) == 5 ){
                        $("#stores tbody").append(tr);
                    }
                });
                $("#stores tbody").append(tr);
            }else{
                $("#stores_wrapper").css("display","none");
            }
            self.storeId = self.storesOfTrades[tid][0].code;
            self._showFlash();
            self._setUrl();
            self._setClipBtn();
        });
        $(".store").live("click",function(){
            self.storeId = $(this).attr('id');
            self._showFlash();
            self._setUrl();
            self._setClipBtn();
        });
        $("#openDialog").bind("click",function(){
            var cityUrl = self.apiUrl + 'city/v1/?key=0988394527a1f585&format=json&count=100&pref=' + self.settings.pref;
            setTimeout( function(){
                $("#flash").css("display","none");
                gadgets.window.adjustHeight(700);
                $.blockUI({
                    css: {
                        height: 'auto',
                        width: '300px'
                    },
                    message: $("#settings_dialog")
                });
            },1);
            //$("#openDialog").attr("disabled","disabled");
            //get city
            Deferred.next(function(){
                return $.gadgets.getJSON( cityUrl );
            }).next( function(d){
                $("#city").empty();
                $.each(d.results.city, function(i,v){
                    var opt = $("<option/>").val(v.code).text(v['name']);
                    if(self.settings.city == v.code){ opt.attr('selected','selected') }
                    opt.appendTo("#city");
                });
                //$("#openDialog").removeAttr("disabled");
                
            });
        });
        $("#pref").bind("change",function(){
            var pref = $(this).val();
            var cityUrl = self.apiUrl + 'city/v1/?key=0988394527a1f585&format=json&count=100&pref=' + pref;
            //loading
            var emp = $("<option/>").val("13101").text("Loading...");
            $("#city").empty().append(emp);
            $.gadgets.getJSON(cityUrl)
            .next(function(d){
                $("#city").empty();
                $.each(d.results.city, function(i,v){
                    $("<option/>").val(v.code).text(v['name']).appendTo("#city");
                });
            });
        });
        $("#cancel").bind("click",function(){
            $("#flash").css("display","block");
            setTimeout( function(){
                gadgets.window.adjustHeight();
            },1);
            $.unblockUI();
        });
        $("#set_settings").bind("click",function(){
            $("#flash").css("display","block");
            self.settings.pref = $("#pref").val();
            self.settings.city = $("#city").val();

            self.show();
            self._update();
            
        });
        $("#set_clip").live("click",function(){
            var item = self.insertion[self.storeId];
            if( !self.clips[item.store.trade.code] ){
                self.clips[item.store.trade.code] = [];
            }
            self.clips[item.store.trade.code].push(item.store.code);
            _IG_Analytics("UA-9037287-1", "/chirashi/mixi/clip/" + item.store.code);
            self._setClipBtn();
            self._update();
            var msg = item.store.trade['name'] + "のチラシをゲット！";
            var img = item.preview_url;
            self._sendActivity(msg,img);
        });
        $("#del_clip").live("click",function(){
            var item = self.insertion[self.storeId];
            if( self.clips[item.store.trade.code].length == 1 ){
                delete self.clips[item.store.trade.code];
            } else{
                var arr = [];
                $.each(self.clips[item.store.trade.code], function(i,v){
                    if( v == item.store.code ){ return true; }
                    arr.push(v);
                });
                self.clips[item.store.trade.code] = arr;
            }

            self._setClipBtn();
            self._update();
        });
        $("#slide").bind("click",function(){
            var views = gadgets.views.getSupportedViews();
            gadgets.views.requestNavigateTo( views["canvas"] );
        });
    },
    showHome: function(){
        var self = this;
        $("#slide").empty();

        var err = function(msg){
            var p = $("<p/>").html(msg);
            $("<div/>").addClass("no_clip").append(p).appendTo("#slide");
            $("#loading").css("display","none");
            $("#main").css("display","block");
            setTimeout( function(){
                gadgets.window.adjustHeight();
            }, 1 );
        };
        var flag = true;
        $.each( self.clips, function(i,v){ flag = false; return false; });
        if( ! self.clips || flag ){
            err("チラシをお気に入りに登録するとここに表示するよ！");
            return false;
        }

        var q = [];
        $.each(self.clips,function(key,v){ q.push( v.join(",") ); });
        var url = self.apiUrl + 'store/v1/?key=0988394527a1f585&format=json&count=100&has_insertion=1&code=' + q.join(",");
        var gallery = [];
        $.gadgets.getJSON( url )
        .next( function(d){
            if( !d || !d.results.store || d.results.store.length == 0 ){
                err("今日はお気に入りのお店のチラシはないみたい。<br/>他のお店を探してみよう！");
                return false;
            }
            $.each( d.results.store, function(i,v){
                if( $.inArray(v.code, self.clips[v.trade.code]) == -1 ) return true;
                var h1 = {
                    name: v.trade['name'],
                    //catchcopy: v.insertion[0].catch_copy,
                    //img: v.insertion[0].preview_url.replace(/thumb/,'crs').replace(/t_top/,'1/2/pict_0_1')
                    catchcopy: v.insertion[ v.insertion.length-1 ].catch_copy,
                    img: v.insertion[v.insertion.length-1].preview_url.replace(/thumb/,'crs').replace(/t_top/,'1/2/pict_0_1')
                };
                var h2 = {
                    name: v.trade['name'],
                    //catchcopy: v.insertion[0].catch_copy,
                    //img: v.insertion[0].preview_url.replace(/thumb/,'crs').replace(/t_top/,'1/2/pict_1_2')
                    catchcopy: v.insertion[v.insertion.length-1].catch_copy,
                    img: v.insertion[v.insertion.length-1].preview_url.replace(/thumb/,'crs').replace(/t_top/,'1/2/pict_1_2')
                };
                var h3 = {
                    name: v.trade['name'],
                    //catchcopy: v.insertion[0].catch_copy,
                    //img: v.insertion[0].preview_url.replace(/thumb/,'crs').replace(/t_top/,'1/2/pict_2_3')
                    catchcopy: v.insertion[v.insertion.length-1].catch_copy,
                    img: v.insertion[v.insertion.length-1].preview_url.replace(/thumb/,'crs').replace(/t_top/,'1/2/pict_2_3')
                };
                gallery.push(h1);
                gallery.push(h2);
                gallery.push(h3);
            });

            var index = 0;
            var slideshow = function(){
                var item = gallery[index];
                $("#slide").fadeOut("fast");
                $("#slide").empty().css({
                            "background-image": "url('" + item.img + "')",
                            "background-repeat": "no-repeat",
                            "background-attachment": "scroll",
                            "background-position": "left top",
                            "height": "211px",
                            "width": "211px",
                            "display": "none"
                        });
                var div = $("<div/>");
                $("<p/>").addClass("storename").text(item['name']).appendTo(div);
                var p = $("<p/>").addClass("catchcopy").text(item.catchcopy);
                if(item.catchcopy.length > 30){
                    p.css({"font-size":"10px","line-height":"13px"}).appendTo(div);
                }else{
                    p.appendTo(div);
                }
                div.appendTo("#slide");
                $("#slide").fadeIn("slow");
                if( gallery[index+1]){
                    index++;
                }else{
                    index = 0;
                }
                
                setTimeout(slideshow, 5000);
            };

            $("#loading").css("display","none");
            $("#main").css("display","block");
            setTimeout( function(){
                gadgets.window.adjustHeight();
            }, 1 );
            slideshow();
        });

    },
    show: function(){
        var self = this;
        var url = self.apiUrl + 'insertion/v1/?key=0988394527a1f585&format=json&count=300&count_expand=300&city=' + self.settings.city;
        //var url = self.apiUrl + 'store/v1/?key=0988394527a1f585&format=json&count=100&has_insertion=1&city=' + self.settings.city;

        $.gadgets.getJSON( url )
        .next( function(d){
            self.insertion =  {};
            self.storesOfTrades =  {};
            $("#thumbs_wrapper").empty().append("<ul id='thumbs' class='jcarousel-skin-tango'></ul>");
            $("#stores_wrapper").css("display","none");
            var forUnique = [];
            var forStoreUnique = [];
            var lis = [];
            $.each(d.results.insertion, function(j,v){
                //同じ店舗で複数毎チラシを出してるので店舗単位で重複はスキップする
                if( $.inArray(v.store.code, forStoreUnique) != -1) return true;
                forStoreUnique.push(v.store.code);

                self.insertion[v.store.code] = v;
                  
                if( !self.storesOfTrades[v.store.trade.code] ){
                    self.storesOfTrades[v.store.trade.code] = [];
                }
                var tmp = v.store.trade['name'].replace(/\(/g,"\\(").replace(/\)/,'\\)');
                v.store['name'] = v.store['name'].replace(RegExp(tmp,''),'');
                self.storesOfTrades[v.store.trade.code].push({
                    name: v.store['name'],
                    code: v.store.code
                });
                //同じチラシが店舗ごとに何枚もでるので屋号単位で重複はスキップする
                if( $.inArray(v.store.trade.code, forUnique) != -1) return true;
                forUnique.push(v.store.trade.code);

                var li = $("<li/>").addClass('thumbnail').attr('id',v.store.trade.code);
                var div = $("<div/>");
                $("<img/>").attr('src',v.preview_url).appendTo(div);
                if( self.clips[v.store.trade.code] ){
                    var bm = $("<img/>").addClass("clip_icon").attr("src","http://mtl.recruit.co.jp/sandbox/mixi/chirashi/image/bookmark.gif");
                    $("<p/>").text(v.store.trade['name']).append(bm).appendTo(div);
                    div.appendTo(li);
                }else{
                    $("<p/>").text(v.store.trade['name']).appendTo(div);
                    div.appendTo(li);
                }
                lis.push(li);
                li.appendTo("#thumbs");
                var limit = 4;
                if($.browser.safari){
                    //limit = 4;
                    if(lis.length == limit){ return false; }
                }

            });
            //$.each(lis,function(i,li){
            //    li.appendTo("#thumbs");
            //});
            //jcarouselがsafariだと動かない対応
            if($.browser.safari){
                $("#thumbs").css("width","900px");
                $("#thumbs").css("padding","5px 10px");
                $("#thumbs li").css("float","left");
            }else{
                setTimeout( function(){
                    $('#thumbs').jcarousel({
                            easing: 'linear',
                            visible: 4,
                            scroll: 1,
                            wrap: 'both'
                    });
                }, 1 );
            }

            if(self.isOwner){
                $("#button_wrapper").css("display","block");
            }
            self.storeId = d.results.insertion[0].store.code;
            self._showFlash();
            self._setUrl();
            self._setClipBtn();
            $.unblockUI();
        });
        
    },
    _setUrl: function(){
        var self = this;
        var item = self.insertion[self.storeId];
        
        var img = "";
        if(item.coupon_flag == "1"){
            img = "http://mtl.recruit.co.jp/sandbox/mixi/chirashi/image/totownmarket_coupon.gif";
        }else{
            img = "http://mtl.recruit.co.jp/sandbox/mixi/chirashi/image/totownmarket.gif";
        }
        $("#urls_wrapper").empty();
        $("<input/>").attr({
            'src':img,
            'type':'image'
        }).bind("click",function(){
            mixi.util.requestExternalNavigateTo(item.urls.pc);
        }).appendTo("#urls_wrapper");
        setTimeout( function(){
            gadgets.window.adjustHeight();
        }, 1 );
    },
    _showFlash: function(){
        var self = this;
        var item = self.insertion[self.storeId];
        $("#flash").empty();
        var element = document.getElementById("flash");
        //var uri = "http://townmarket.jp/CSP/swf/view_kakudai20.swf";
        var uri = "http://townmarket.jp/CSP/swf/view23.swf";
        var dt = (item.start_date && item.end_date) ?
                "&dispDays=有効期間：" + item.start_date +" 〜 " + item.end_date :
                "";
                    
        var fvars = "debugmode=0&amp;settingPath=http://townmarket.jp/CSP/swf/setting_mixi.html&manuscriptNo=" + ("000000000" + item['code'] ).slice(-9) + "&clickmapIdCnt=0&zoominIdCnt=0&tradeName=" + item.store.trade['name'] + "&storeName=" + item.store['name'] + "&pageCnt=2&storeCode=" + item.store['code'] + dt + "&url1=&url2=&newlyMailButton=0&couponClass=0&url3=";
        gadgets.flash.embedFlash(uri, element, 9,
            { width: 912, height: 674,
                allowScriptAccess: "always",
                allowNetworking: "all",
                wmode: "window",
                menu: "true",
                flashvars:fvars,
                name:"movie",
                devicefont:"false",
                scale:"showall",
                loop:"true",
                play:"true",
                swliveconnect:"true",
                bgcolor:"#fff7e4",
                quality:"high",
                allowscriptaccess:"all",
                salign:"t"
            }); 
    
        $("#loading").css("display","none");
        $("#main").css("display","block");
        setTimeout( function(){
            gadgets.window.adjustHeight();
        }, 1 );
    },
    _setClipBtn: function(){
        var self = this;
        var item = self.insertion[self.storeId];
        //Clip button
        var img = "";
        var id = "";
        if(self.clips[item.store.trade.code] && 
            $.inArray(item.store.code, self.clips[item.store.trade.code]) != -1 ){
            img = "http://mtl.recruit.co.jp/sandbox/mixi/chirashi/image/del_clip.gif";
            aid = "del_clip";
        }else{
            img = "http://mtl.recruit.co.jp/sandbox/mixi/chirashi/image/set_clip.gif";
            aid = "set_clip";
        }
        $("#clip_btn_wrapper").empty();
        $("<input/>").attr({type:"image",src:img,id:aid}).appendTo("#clip_btn_wrapper");
        var bc = $("#bc");
        var bcUrl = "http://townmarket.jp/CSP/CSP01/mixiapilog.jsp?insertionno=" + item.code + "&storecd=" + item.store.code;
        
        if(bc){
            bc.attr('src',bcUrl);
        }else{
            $("<img/>").attr({
                "id": "bc",
                "width": "1",
                "height": "1",
                "src": bcUrl
            }).appendTo("#tm");
        }
        setTimeout( function(){
            gadgets.window.adjustHeight();
        }, 1 );
    },
    _update: function(h){
        var self = this;
        var h = {
            settings: self.settings,
            clips: self.clips
        }
        $.opensocial.data.set("chirashi",h);
    },
    _sendActivity: function(msg,img){
        //Activity
        var params = {};
        //Media Item
        var mediaItem = opensocial.newMediaItem(
                opensocial.MediaItem.Type.IMAGE,
                img, null);
        params[opensocial.Activity.Field.MEDIA_ITEMS] = [mediaItem];

        $.opensocial.activity.send(
                msg,
                null, true, params);
        return true;
    }
    
};

$.blockUI.defaults.css.top = '50px';
$.blockUI.defaults.css.left = '318px';
$.blockUI.defaults.css.cursor = 'default';
$.blockUI.defaults.css.textAlign = 'left';
$.blockUI.defaults.overlayCSS.cursor = 'default';
