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
  var wrapper = $("#wrapper");
  var feeds = [];
  var feeds_ul = $("#pref ul.feeds");
  var cue, entries;
  $("p.go-pref span.link").bind("click",prefView);
  $("p.add-feed span.link").bind("click",appendInput);
  $("#submit-feeds-button").bind("click",acceptPref);
  $("#cancel-feeds-button").bind("click",listView);
  $.opensocial.data.get(PrefKey.FEEDS,"owner",function(d){
    if(!d||!d.length) return prefView();
    feeds = d;
    listView();
  });

  function prefView() {
    wrapper.addClass("pref");
    wrapper.removeClass("list");
    feeds = feeds || [];
    $("#pref ul.feeds").empty();
    $.each(feeds,function(){
      appendInput(this.toString());
    });
  }

  function listView() {
    wrapper.addClass("list");
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
      "<li class=\"item\" id=\"feed",i,"\">",
        "<input type=\"text\" value=\"",url,"\" id=\"feedurl",i,"\" \/>",
        "<span class=\"link remove\">X<\/span>",
      "<\/li>"
    ].join(""));
    $("li#feed"+i+" span.link").bind("click",removeInput);
  }

  function removeInput(i) {
    $(this).parent().remove();
  }

  function acceptPref() {
    feeds = [];
    $("li.item input",feeds_ul).each(function(){
      var val = $(this).val();
      if(isValidURL(val)) feeds.push(val);
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
    $.gadgets.getFeed(feeds[cue],function(d){
      if(d) {
        $.each(d,function(){
          entries.push({ entry:this,title:d.Title,link:d.Link,URL:d.URL });
        });
      }
      getFeed();
    },MAX_FEED_SIZE);
    cue++; 
  }

  function onCompleteFeed() {
    console.log(entries);
  }

  function sortEntries(ar) {
    return ar.sort(function(a,b){
      
    });
  }

  function error(msg) {
    alert(msg);
    return false;
  }


});
