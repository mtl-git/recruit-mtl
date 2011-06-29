/**
 * @fileoverview A jQuery plugin for OpenSocial Compatibiblity
 * @author Atushi Nagase
 * @copyright Copyright (C) Atsushi Nagase
 * @license The Apache License, version 2
 * @see <a href="http://code.google.com/p/jopensocial/">Google Code</a>
 */
 
/** @class
 * @name jQuery */
/** @namespace
 * @name jQuery.opensocial */
/** @namespace
 * @name jQuery.opensocial.data */
/** @namespace
 * @name jQuery.opensocial.activity */
/** @namespace
 * @name jQuery.gadgets */

;(function(){
if(!window.opensocial) throw new Error("opensocial-v0.* feature is required.");
if(!window.gadgets.views) throw new Error("views feature is required.");
try {
	var $ = jQuery; $();
	var domain = opensocial.getEnvironment().getDomain();
} catch(e) { return; }

// _____________private_____________

/**
 * @private
 */
function _request( map, callback, ns ) {
	var req = (ns||opensocial).newDataRequest();
	$.each(map,function( i ){
		if(typeof(this)=="function")
			req.add( this.call(req), i );
	});
	req.send(function( res ) {
		var obj = {};
		$.each(map,function(i){
			var item = res.get(i);
			obj[i] = item.hadError() ? { error:1 } : item.getData();
		});
		if(typeof(callback)=="function") callback(obj);
	});
}

var
	_cachedPeople = {}, 
	_cachedData = {},
	_ownerId, 
	_viewerId;

// _____________public_____________


/**
 * Contianer information
 * @name jQuery.opensocial.container
 * @field
 */
var container = {
	myspace	: /myspace\.com/.test(domain),
	google	: /google\.com/.test(domain),
	orkut	: /orkut\.com/.test(domain),
	mixi	: /mixi/.test(domain),
	partuza	: /partuza\.nl/.test(domain),
	goo		: /^goo\.ne\.jp$/.test(domain)
}

/**
 * Alias for gadgets.util.registerOnLoadHandler
 * @name jQuery.gadgets.ready
 * @function
 * @see <a href="http://code.google.com/apis/opensocial/docs/0.8/reference/gadgets/#gadgets.util.registerOnLoadHandler">gadgets.util.registerOnLoadHandler</a>
 */
function ready(callback) {
	if(!callback) return;
	var fnc = function() {
		var params = gadgets.views.getParams();
		callback($,params);
	}
	try {
		gadgets.util.registerOnLoadHandler(fnc);
	} catch(e) {
		$(fnc);
	}
}

/**
 * Navigate to view by view name as string.<br />
 * Returns next view.<br />
 * If view is not set, returns current view.
 * @name jQuery.gadgets.view
 * @function
 * @param view
 * @param opt_params
 * @param no_navigate Boolean
 * @returns gadgets.views.View
 */

function view(view,opt_params,no_navigate) {
	if(!view) return gadgets.views.getCurrentView();
	var obj = _getViewObject(view);
	if(!obj) return;
	if(!no_navigate) gadgets.views.requestNavigateTo(obj,opt_params);
	return obj;
}

/**
 * @private */

function _getViewObject(view) {
	if(!gadgets||!gadgets.views||!gadgets.views.getSupportedViews||!view) return;
	var rtn;
	if(view.match(/^canvas$|^home$|^profile$/i)) view = container.myspace ? view.toUpperCase() : view.toLowerCase();
	$.each(gadgets.views.getSupportedViews(), function(i){
		if(this.getName()==view||i==view) {
			rtn = this;
			return false;
		}
	});
	if(rtn) return rtn;
}

/**
 * Alias for gadgets.views.getParams()
 * @name jQuery.gadgets.viewParams
 * @function
 * @see <a href="http://code.google.com/apis/opensocial/docs/0.8/reference/gadgets/#gadgets.views.getParams">gadgets.views.getParams</a>
 */

/**
 * Get and set gadget height
 * @name jQuery.gadgets.height
 * @function
 * @param opt_height auto:String/height:uint
 * @returns gadget height
 */

function gadgetHeight(opt_height) {
	if(!window.gadgets.window||!window.gadgets.window.adjustHeight) throw new Error("dynamic-height feature is required.");
	if(opt_height) gadgets.window.adjustHeight(opt_height=="auto"?null:opt_height);
	return gadgets.window.getViewportDimensions().height;
}

/**
 * Get gadget width
 * @name jQuery.gadgets.width
 * @function
 * @returns gadget width
 */

function gadgetWidth() {
	return gadgets.window.getViewportDimensions().width;
}

/**
 * @private */
function _makeRequest(url,data,callback,type,is_post,num_entries,get_summaries) {
	if(!url) return;
	if(typeof(data)=="function"&&!callback) {
		get_summaries = num_entries;
		num_entries = is_post;
		is_post = type;
		type = callback;
		callback = data;
		data = {};
	}
	num_entries = isNaN(num_entries)?3:num_entries
	data = data || "";
	if(typeof(data)!="string") data = $.param(data);
	var param = {};
	if(is_post) {
		param[gadgets.io.RequestParameters.POST_DATA] = data;
	} else {
		if(url.search(/\?/)==-1) url += "?";
		else if(!url.match(/.*&$/)) url+="&";
		url += data;
	}
	param[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType[type];
	param[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType[is_post?"POST":"GET"];
	param[gadgets.io.RequestParameters.AUTHORIZATION] = gadgets.io.AuthorizationType.NONE;
	if(type=="FEED") {
		param[gadgets.io.RequestParameters.NUM_ENTRIES] = num_entries;
		param[gadgets.io.RequestParameters.GET_SUMMARIES] = !!get_summaries; 
	}
	//Authorization not supported.
	gadgets.io.makeRequest(url,function(res){
		if(!res||!res.data) return callback(null);
		if(type=="JSON") return callback(res.data);
		callback($(res.data)); 
	}, param);
	
}
/**
 * Get JSON content
 * @name jQuery.gadgets.getJSON
 * @function
 * @param url
 * @param data
 * @param callback
 * @example $.gadgets.getJSON(
 *   "http://domain.tld/path/to/json",
 *   { entry_id:"123" }, // GET parameters
 *   function(d) { console.log(d); });
 */
function getJSON(url,data,callback) {
	_makeRequest(url,data,callback,"JSON",false);
}


/**
 * Get XML content as jQuery object
 * @name jQuery.gadgets.ajax
 * @function
 * @param url
 * @param data
 * @param callback
 * @example $.gadgets.ajax(
 *   "http://jopensocial.googlecode.com/svn/trunk/tests/test.xml",
 *   { entry_id:"123" }, // GET parameters
 *   function(d) { alert($("Require",d).attr("feature")); });
 */
function getXML(url,data,callback) { 
	_makeRequest(url,data,callback,"DOM",false);
}

/**
 * Get Feed content as JSON Object
 * @name jQuery.gadgets.getFeed
 * @function
 * @param url
 * @param data
 * @param callback
 * @param num_entries
 * @param get_summaries
 * @example $.gadgets.getFeed(
 *   "http://code.google.com/feeds/p/jopensocial/svnchanges/basic",
 *   { entry_id:"123" }, // GET parameters
 *   function(d) { console.log(d); },
 *   10, // 10 entries; default is 3
 *   false, // will not get summaries; default is false
 * );
 */
function getFeed(url,data,callback,num_entries,get_summaries) { 
	_makeRequest(url,data,callback,"FEED",false,num_entries,get_summaries);
}

/**
 * Post content and get content with callback 
 * @name jQuery.gadgets.post
 * @function
 * @param url
 * @param data
 * @param callback
 * @param type gadgets.io.ContentType
 * @example $.gadgets.post(
 *   "http://domain.tld/path/to/json",
 *   { entry_id:"123" }, // POST data
 *   function(d) { console.log(d); },
 *   "JSON");
 */
function postData(url,data,callback,type) { 
	_makeRequest(url,data,callback,(type||"").toUpperCase(),true);
}

/**
 * Fetch UserAppData
 * @name jQuery.opensocial.data.get
 * @function
 * @param key
 * @param userId
 * @param callback
 * @param useCache
 * @returns cachedData
 * @example $.opensocial.data.get(
 *   "sampledata",
 *   "viewer",
 *   function(d) { console.log(d); },
 *   false);
 */
function fetchAppData( key, userId, callback, useCache ) {
	callback = callback || function() { return false; }
	userId = userId || opensocial.IdSpec.PersonId.VIEWER;
	if( !key ) {
		callback(null);
		return;
	}
	var multi_key = (key=="*" || key instanceof Array);
	
	function _decode(v) {
		var r;
		try {
			r = gadgets.json.parse(decodeURIComponent(gadgets.util.unescapeString(v)));
		} catch(e) {
			r= v;
		}
		return r;
	}
	
	function _setval(k, v, vals) {
		if(k == "id") { vals[k] = this; return; };
		_cachedData[k] = _cachedData[k] || {};
		var val = multi_key?{}:v[key]; //container.mixi?res.userData[key]:res.userData[id][key];
		if(multi_key) {
			$.each(v,function(kk, vv){
				val[kk] = _decode(vv);
				_cachedData[k][kk] = val[kk];
			});
		} else {
			val = _decode(val);
			_cachedData[k][key] = val;
		}
		if(vals) vals[k] = val;
		return val;
	}
	
	var ids = userId.match(/^(viewer|owner)_friends$/i);
	var ov = userId.match(/^viewer$|^owner$/i);
	if(ids) {
		var idSpec = opensocial.newIdSpec({userId:ids[1].toUpperCase(), groupId:"FRIENDS"})
		var obj = {
			peopleData : function() { return this.newFetchPersonAppDataRequest(idSpec, (key instanceof Array)?key:[key]); }
		}
		_request(obj, function(res) {
			if(!res.peopleData||!res.peopleData[id]) {
				callback(null);
				return;
			}
			var data = res.peopleData||{};
			var vals = {}; 
			$.each(data, function(k, v) { _setval(k, v, vals) } );
			callback(vals);
		});
	} else {
		if(ov) userId = ov[0].toUpperCase();
		var psn = person(userId,function(psn){
			if(!psn) {
				callback(null); return;
			}
			var id = psn.getId();
			if(useCache && _cachedData[id] && _cachedData[id][key]!=undefined) {
				callback( _cachedData[id][key] );
				return;
			}
			var obj = {
				userData : function() { return this.newFetchPersonAppDataRequest(opensocial.newIdSpec({userId:userId}), (key instanceof Array)?key:[key]); }
			}
			_request(obj, function(res) {
  			if(!res.userData||!res.userData[id]) {
					callback(null);
					return;
				}
				var data = res.userData[id]||{};
				var val = _setval(id, data);
				callback(val);
			});
		});
		var id = psn?psn.getId():null;
		var cache = _cachedData[id];
		if(!cache) return null;
		if(multi_key) return cache;
		return cache[key] || null;
	}
}

/**
 * Update UserAppData; VIEWER Only.
 * @name jQuery.opensocial.data.set
 * @function
 * @param key
 * @param value
 * @param callback
 */
function updateAppData( key, value, callback ) { // VIEWER only
	callback = callback || function() { return false; }
	if(!key) callback( {  } );
	person("viewer",function(psn){
		var id = psn?psn.getId():null;
		if(id&&_cachedData[id]&&_cachedData[id][key]) _cachedData[id][key] = value;
		var obj = {
			userData : function() {
				return this.newUpdatePersonAppDataRequest(opensocial.IdSpec.PersonId.VIEWER, key, encodeURIComponent(gadgets.json.stringify(value)));
			}
		};
		_request(obj, function(res) {
			callback(true);
		});	
	})
	
}
/**
 * Remove UserAppData; VIEWER Only.
 * @name jQuery.opensocial.data.remove
 * @function
 * @param key
 * @param callback
 */
function removeAppData( key, callback ) { 
	callback = callback || function() { return false; }
	if(!key) callback( {  } );
	var obj = {
		userData : function() {
			return this.newRemovePersonAppDataRequest(opensocial.IdSpec.PersonId.VIEWER, [key] );
		}
	}
	_request(obj, function(res) {
		callback(true);
	});
}

/**
 * Returns cached person; Get person with callback
 * @name jQuery.opensocial.person
 * @function
 * @param id
 * @param callback
 * @returns Cached person or null
 * @see <a href="http://code.google.com/apis/opensocial/docs/0.8/reference/#opensocial.Person_method_summary">Class opensocial.Person</a>
 */
function person(id,callback) {
	if(!id) {
		callback(null);
		return null;
	}
	if(typeof(callback)!="function") callback = function(){};
	var um = id.match(/^OWNER$|^VIEWER$/i);
	if(um) {
		id = um[0].toUpperCase();
		switch(id) {
			case "VIEWER": id = _viewerId||id; break;
			case "OWNER" : id = _ownerId||id; break;
		}
	}
	if(_cachedPeople[id]) {
		callback(_cachedPeople[id]);
		return _cachedPeople[id];
	}
	var obj = {
		userId : function() {
			return this.newFetchPersonRequest(id);
		}
	}
	_request(obj,function(res) {
		if(!res) return callback(null);
		var user = res["userId"];
		if(!user) return callback(null);
		var id = user.getId();
		if(!id) return callback(null);
		if(res&&res["userId"]) {
			if(user.isViewer()) _viewerId = id;
			if(user.isOwner()) _ownerId = id;
			_cachedPeople[id] = user;
			callback(user);
		} else callback(null);
	});
	return null;
}

/**
 * Get cached people
 * @name jQuery.opensocial.people
 * @function
 * @returns Map.&lt;id,person&gt;
 */
function getCachedPeople() {
	return _cachedPeople;
}

/**
 * Get friends as array with callback<br />
 * The people will be cached.
 * @name jQuery.opensocial.getPeople
 * @function
 * @param userId default VIEWER
 * @param opt_params
 * @param callback
 * @param return_object
 */
function getPeople(userId,opt_params,callback, return_object) {
	userId = userId || "VIEWER";
	var um = userId.match(/^OWNER$|^VIEWER$/i);
	if(um) userId = um[0].toUpperCase();
	callback = callback || function(){ return false; }
	opt_params = opt_params || {};
	var idspec = opensocial.newIdSpec({ userId:userId, groupId:"FRIENDS" });
	var f;
	f = opensocial.DataRequest.PeopleRequestFields.FILTER;
	opt_params[f] = opt_params[f] || opensocial.DataRequest.FilterType.ALL;
	f = opensocial.DataRequest.PeopleRequestFields.MAX;
	opt_params[f] = opt_params[f] || 1000;
	_request({
		people : function() {
			return this.newFetchPeopleRequest(idspec,opt_params)
		}
	},function(res){
		if(!res||!res.people||res.people.error) {
			callback(null);
			return false;
		}
		var ar = [];
		res.people.each(function(p){
			if(!return_object) ar.push(p);
			_cachedPeople[p.getId()] = p;
		});
		callback(return_object?res.people:ar);
	});
}


/**
 * Send Activity
 * @name jQuery.opensocial.activity.send
 * @function
 * @param title String
 * @param body String
 * @param hi_priority Boolean
 * @param opt_params Map&gt;opensocial.Activity.Field,value&lt;
 * @param callback Function
 */ 
function sendActivity(title,body,hi_priority,opt_params,callback) {
	opt_params = opt_params || {};
	var prm = {};
	prm[opensocial.Activity.Field.TITLE] = title || "";
	prm[opensocial.Activity.Field.BODY] = body || "";
	var ns = opensocial; //container.mixi?mixi:opensocial;
	var a = ns.newActivity($.extend(opt_params,prm));
	var pri = ns.CreateActivityPriority[hi_priority?"HI":"LOW"];
	ns.requestCreateActivity(a,pri,function(e){
		if(typeof(callback)=="function") callback(e&&!e.hadError());
		return false;
	});
}

$.extend({
	opensocial : {
		container : container,
		data : {
			get : fetchAppData,
			set : updateAppData,
			remove : removeAppData
		},
		activity : {
			send : sendActivity
		},
		person : person,
		people : getCachedPeople,
		getPeople : getPeople
	},
	gadgets : {
		ready : ready,
		view : view,
		viewParams : gadgets.views.getParams,
		height : gadgetHeight,
		width : gadgetWidth,
		getJSON : getJSON,
		getFeed : getFeed,
		ajax : getXML,
		post : postData
	}
});

})();
