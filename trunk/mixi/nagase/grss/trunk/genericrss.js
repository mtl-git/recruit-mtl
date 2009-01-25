/**
 * Generic RSS Reader
 * @author Atushi Nagase
 */

$.gadgets.ready(function(){
  var PrefKey = {
    "FEEDS":"feeds",
    "MAX_ENTRIES":"maxentries"
  };
  var MAX_FEED_SIZE = 10;
  var MAX_ENTRY_SIZE = 10;
  var wrapper = $("#wrapper");
  var feeds = [];
  var feeds_ul = $("#pref ul.feeds");
  var cue, entries;
  var entries_ul = $("#list ul.entries");
  $("p.go-pref span.link").bind("click",prefView);
  $("p.add-feed span.link").bind("click",appendInput);
  $("#submit-feeds-button").bind("click",acceptPref);
  $("#cancel-feeds-button").bind("click",listView);
  wrapper.addClass("loading");
  $.opensocial.data.get(PrefKey.FEEDS,"owner",function(d){
    if(!d||!d.length) return prefView();
    feeds = d;
    listView();
  });

  function prefView() {
    wrapper.removeClass("loading");
    wrapper.addClass("pref");
    wrapper.removeClass("list");
    feeds = feeds || [];
    $("#pref ul.feeds").empty();
    $.each(feeds,function(){
      appendInput(this.URL.toString());
    });
  }

  function listView() {
    wrapper.addClass("loading");
    wrapper.removeClass("pref");
    cue = 0;
    entries = [];
    getFeed();
  }

  function appendInput(url) {
    url = typeof(url)=="string"?url:"";
    var li = $("li",feeds_ul), i = li.size();
    if(i==MAX_FEED_SIZE) return error("フィードは"+MAX_FEED_SIZE+"件までしか登録できません。");
    feeds_ul.append([
      "<li class=\"item ",i%2?"odd":"even","\" id=\"feed",i,"\">",
        "<input type=\"text\" value=\"",url,"\" id=\"feedurl",i,"\" \/>",
        "<span class=\"link remove\">X<\/span>",
      "<\/li>"
    ].join(""));
    $("li#feed"+i+" span.link").bind("click",removeInput);
    $.gadgets.height("auto");
  }

  function removeInput(i) {
    $(this).parent().remove();
  }

  function acceptPref() {
    feeds = [];
    $("li.item input",feeds_ul).each(function(){
      var val = $(this).val();
      if(isValidURL(val)) feeds.push({ URL:val });
    });
    if(feeds.length) {
      $.opensocial.data.set(PrefKey.FEEDS,feeds,function(success){
        if(!success) error("フィードの保存に失敗しました。");
        listView();
      });
    } else listView();
  }

  function isValidURL(url) {
    return url&&!!url.match(/^(https?)(:\/\/[-_.!~*\'()a-zA-Z0-9;¥/?:\@&=+¥$,%#]+)$/);
  }

  function getFeed() {
    if(!feeds[cue]) return onCompleteFeed();
    $.gadgets.getFeed(feeds[cue].URL,{},function(d){
      feeds[cue] = $.extend(feeds[cue],d[0]);
      if(d&&d[0]&&d[0].Entry) {
        $.each(d[0].Entry,function(){
          entries.push($.extend({ Feed:cue },this));
        });
      }
      cue++; 
      getFeed();
    },MAX_ENTRY_SIZE,$.gadgets.view().getName()=="canvas");
  }

  function onCompleteFeed() {
    entries = sortEntries(entries);
    if(!entries||!entries.length) return error("エントリーが1件もありません。");
    var ht = [];
    $.each(entries,function(i){
      if(i>=MAX_ENTRY_SIZE) return false;
      var f = feeds[this.Feed];
      ht.push([
        "<li class=\"entry ",i%2?"odd":"even","\">",
          "<p class=\"head\">",
          "<span class=\"date\">",getDateString(this.Date),"<\/span>",
          "<strong class=\"title\"><a href=\"",this.Link,"\" target=\"_blank\">",this.Title,"<\/a><\/strong>",
          "<span class=\"site\"><a href=\"",f.Link,"\" target=\"_blank\">",f.Title,"<\/a><\/span>",
          "<\/p>",
          this.Summary?("<blockquote>"+this.Summary+"<\/blockquote>"):"",
        "<\/li>"
      ].join(""));
    });
    entries_ul.html(ht.join(""));
    wrapper.removeClass("loading");
    wrapper.addClass("list");
    $.gadgets.height("auto");
  }

  function getDateString(t) {
    var date = new Date(t*1000);
    var today = new Date();
    if(date.getDate()==today.getDate())
      return [format2Digs(date.getHours()),":",format2Digs(date.getMinutes())].join("");
    return [format2Digs(date.getMonth()+1),"\/",format2Digs(date.getDate())].join("");
  }

  function format2Digs(n) {
    return n<10?"0"+n.toString():n.toString();
  }

  function sortEntries(ar) {
    return ar.sort(function(a,b){
      return b.Date-a.Date;
    });
  }

  function error(msg) {
    alert(msg);
    return false;
  }


});
