;(function(){
try {
  var $ = jQuery; $();
  var opensocial = $.opensocial;
  var deferred = $.deferred
} catch(e) { return; }

// _____________private_____________

function deferredize(obj, func, callback_index) {
  var org_func = obj[func];
  obj[func] = function() {
    var d = $.deferred();
    var deferred_callback = function(data) { setTimeout(function(){d.call(data);}, 0); };
    var args = Array.prototype.slice.call(arguments);
    if(typeof args[callback_index] != "function") args = args.slice(0, callback_index).concat(null).concat(args.slice(callback_index));
    if(args[callback_index]) {
      var callback = args[callback_index];
      d.next(callback);
    }
    args[callback_index] = deferred_callback;
    org_func.apply(org_func, args);
    return d;
  }
}

// _____________public_____________

var deferred_list = [
  [$.gadgets, "ajax", 2],
  [$.gadgets, "getJSON", 2],
  [$.gadgets, "getFeed", 2],
  [$.gadgets, "post", 2],
  [$.opensocial, "getPeople", 2],
  [$.opensocial, "person", 1],
  [$.opensocial.data, "get", 2],
  [$.opensocial.data, "remove", 1],
  [$.opensocial.data, "set", 2]
];

$.each(deferred_list, function(k,v) {
  deferredize.apply(self, v);
});

})();
