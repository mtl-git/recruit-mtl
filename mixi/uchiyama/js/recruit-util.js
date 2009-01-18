;
/*
 * @author: noriaki
 * @update: 2009/01/12 22:00
 */

if(typeof RECRUIT == "undefined") var RECRUIT = {};
if(typeof RECRUIT.Util == "undefined") RECRUIT.Util = {};

/*
 * Usage:
 *   RECRUIT.Util.importStyle('http://example.com/style.css')
 *   RECRUIT.Util.importStyle('http://example.com/no-cache.css', true)
 */
RECRUIT.Util.importStyle = function(uri, force) {
    if(force) uri += '?' + (new Date()).getTime();
    var style_elm = document.createElement('link');
    style_elm.setAttribute('rel', 'stylesheet');
    style_elm.setAttribute('type', 'text/css');
    style_elm.setAttribute('href', uri);
    window.document.getElementsByTagName('head')[0].appendChild(style_elm);
};

/*
 * Usage:
 *   RECRUIT.Util.importScript('http://example.com/script.js')
 *   RECRUIT.Util.importScript('http://example.com/no-cache.js', true)
 */
RECRUIT.Util.importScript = function(uri, force) {
    if(force) uri += '?' + (new Date()).getTime();
    var script_elm = document.createElement('script');
    script_elm.setAttribute('type', 'text/javascript');
    script_elm.setAttribute('src', uri);
    window.document.getElementsByTagName('head')[0].appendChild(script_elm);
};
