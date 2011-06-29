<!--
//
//Change trace_cid -> client code    trace_ce -> cookie expiration  
//
var trace_cid = '810';
var trace_ce = '365';

var trace_svr = 'vos.tracer.jp/VL/Trace';
var trace_l = '';
var trace_r = '';
var trace_a = '';
var trace_t = '';
var trace_k = '';
var trace_f = '';
var trace_j = '';
var trace_w = '';
var trace_h = '';
var trace_d = '';
var trace_o = '';
var trace_v = true;
var trace_b = true;
var trace_plugin = '';
var trace_cookval = '';
var trace_tp = '';
var trace_u = '';
// var trace_ce = '';
if (typeof(trace_ad) == "undefined"){
  var trace_ad = '';
}
if (typeof(trace_p) == "undefined"){
  var trace_p = '';
}
var trace_isnewses = '';

var trace_protocol = location.protocol;

trace_ad = 'vos';

function fError(){
  if (trace_l.length > 512) { trace_l = trace_l.substring(0, 512); }
  if (trace_r.length > 768) { trace_r = trace_r.substring(0, 768); }
  if (trace_a.length > 512) { trace_a = trace_a.substring(0, 512); }
  if (trace_t.length > 128) { trace_t = trace_t.substring(0, 128); }
  
  if (trace_v == true) {
    document.write('<img src="'+trace_protocol+'//vos.tracer.jp/VL/Trace?'+'c='+trace_cid+'&p='+trace_p+'&g=/1'+'&r='+trace_r+'&l='+trace_l+'&a='+trace_a+'&t='+trace_t+'&k='+trace_k+'&sf='+trace_f+'&j='+trace_j+'&w='+trace_w+'&h='+trace_h+'&d='+trace_d+'&o='+trace_o+'&cval='+trace_cookval+'&tp='+trace_tp+'&ce='+trace_ce+'&adf='+trace_ad+'&cvalconbid='+trace_cookconbid+'&cvalconurl='+trace_cookconurl+'&cvalconref='+trace_cookconref+'&cvalcontime='+trace_cookcontime+'&cvalcontpv='+trace_cookcontpv+'&cvalconrpt='+trace_cookconrpt+'&cvalconfre='+trace_cookconfre+'&cvalconrec='+trace_cookconrec+'&cvalconsta='+trace_cookconsta+'&cvalconmon='+trace_cookconmon+'&uuc='+trace_u+'" width="1" height="1"><br>');

  }
  window.onerror=null;
  return true;
}
window.onerror=fError;

trace_tp=1;
trace_l = escape(document.location);
trace_r = escape(document.referrer);
trace_t = escape(document.title);
trace_k = escape(navigator.cookieEnabled);
trace_plugin = (navigator.mimeTypes && navigator.mimeTypes["application/x-shockwave-flash"]) ? navigator.mimeTypes["application/x-shockwave-flash"].enabledPlugin : 0;
if (trace_plugin) {
  var trace_f = navigator.plugins["Shockwave Flash"].description.split(" ");
} else if (navigator.userAgent && navigator.userAgent.indexOf("MSIE")>=0 
           && (navigator.appVersion.indexOf("Win") != -1)) {
  document.write('<SCR' + 'IPT LANGUAGE=VBScript> \n');
  document.write('on error resume next \n');
  document.write('trace_f = ( IsObject(CreateObject("ShockwaveFlash.ShockwaveFlash.3")))\n');
  document.write('</SCR' + 'IPT> \n');
}
if (trace_f) {
  trace_f = "true";
} else {
  trace_f = "false";
}
trace_j = escape(navigator.javaEnabled());
trace_w = escape(screen.width);
trace_h = escape(screen.height);
trace_d = escape(screen.colorDepth);
trace_o = escape(location.protocol);
if (trace_b == true) {
  trace_a = escape(parent.frames.location);
  if (trace_l != trace_a && trace_r == trace_a) {
    trace_r = escape(parent.document.referrer);
  }
}
var trace_cookconrpt='';
var trace_cookcontpv='';
var trace_cookconfre='';
var trace_cookconrec='';
var trace_cookconsta='';
var trace_cookconmon='';
var trace_cookconbid='';
var trace_cookconurl='';
var trace_cookconref='';
var trace_cookcontime='';
if (trace_l.length > 512) { trace_l = trace_l.substring(0, 512); }
if (trace_r.length > 768) { trace_r = trace_r.substring(0, 768); }
if (trace_a.length > 512) { trace_a = trace_a.substring(0, 512); }
if (trace_t.length > 128) { trace_t = trace_t.substring(0, 128); }
if (trace_v == true) {
  document.write('<img src="'+trace_protocol+'//vos.tracer.jp/VL/Trace?'+'c='+trace_cid+'&p='+trace_p+'&g=/1'+'&r='+trace_r+'&l='+trace_l+'&a='+trace_a+'&t='+trace_t+'&k='+trace_k+'&sf='+trace_f+'&j='+trace_j+'&w='+trace_w+'&h='+trace_h+'&d='+trace_d+'&o='+trace_o+'&cval='+trace_cookval+'&tp='+trace_tp+'&ce='+trace_ce+'&adf='+trace_ad+'&cvalconbid='+trace_cookconbid+'&cvalconurl='+trace_cookconurl+'&cvalconref='+trace_cookconref+'&cvalcontime='+trace_cookcontime+'&cvalcontpv='+trace_cookcontpv+'&cvalconrpt='+trace_cookconrpt+'&cvalconfre='+trace_cookconfre+'&cvalconrec='+trace_cookconrec+'&cvalconsta='+trace_cookconsta+'&cvalconmon='+trace_cookconmon+'&uuc='+trace_u+'" width="1" height="1"><br>');

}
window.onerror=null;

function sError(){
	if (trace_l.length > 512) { trace_l = trace_l.substring(0, 512); }
	if (trace_r.length > 512) { trace_r = trace_r.substring(0, 512); }
	if (trace_a.length > 51 ) { trace_a = trace_a.substring(0, 51 ); }
	if (trace_t.length > 128) { trace_t = trace_t.substring(0, 128); }
	if (trace_v == true) {

	vlimg = new Image(1,1);
	var date = new Date();
	vlimg.src = trace_protocol+'//'+trace_svr+'?'+'c='+trace_cid+'&p='+ SPID + '&str=' + SSTR + '&stid=' + SSTID + '&g=/1'+'&r='+trace_r+'&l='+trace_l+'&a='+trace_a+'&t='+trace_t+'&k='+trace_k+'&sf='+trace_f+'&j='+trace_j+'&w='+trace_w+'&h='+trace_h+'&d='+trace_d+'&o='+trace_o+'&cval='+trace_cookval+'&tp='+trace_tp+'&ce='+trace_ce+'&adf='+trace_ad + '&' + date.getTime();
  }
  window.onerror=null;
  return true;
}

function VL_Send(sPid, sStr, sStid){
  window.onerror=sError;
  if (typeof sPid != 'undefined') {
    SPID  = sPid;
  }
  if (typeof sStr != 'undefined') {
    SSTR  = sStr;
  }
  if (typeof sStid != 'undefined') {
    SSTID = sStid;
  }
  if (typeof sPid == 'undefined') {
	   sError();
	   return;
  }
  if (typeof sStr == 'undefined') {
	   sError();
	   return;
  }
  if (typeof sStid == 'undefined') {
	   sError();
	   return;
  }
trace_tp=1;

	trace_l = escape(document.location);
	trace_r = escape(document.referrer);
	trace_t = escape(document.title);
	trace_k = escape(navigator.cookieEnabled);
	trace_f = "true";
	trace_j = escape(navigator.javaEnabled());
	trace_w = escape(screen.width);
	trace_h = escape(screen.height);
	trace_d = escape(screen.colorDepth);
	trace_o = escape(location.protocol);
	if (trace_b == true) {
	  trace_a = escape(parent.location);
	  if (trace_l != trace_a && typeof trace_a != 'undefined') {
	    trace_r = escape(parent.document.referrer);
	  }
	  if (typeof trace_a != 'undefined') {
	      var trace_tmp1;
	      var trace_tmp2;
	      trace_a = unescape(trace_a);
	      trace_tmp1 = trace_a.indexOf('banner_id=',0);
	      if (trace_tmp1 >= 0) {
	          trace_tmp2 = trace_a.indexOf('&',trace_tmp1);
	          if (trace_tmp2 < 0) {
	              trace_tmp2 = trace_a.length;
	          }
	          trace_a = trace_a.substring(trace_tmp1,trace_tmp2);
	      } else {
	          trace_a = '';
	          trace_a = escape(trace_a);
	      }
	  } else {
	      trace_a = '';
	  }
}
	if (trace_l.length > 512) { trace_l = trace_l.substring(0, 512); }
	if (trace_r.length > 512) { trace_r = trace_r.substring(0, 512); }
	if (trace_a.length > 51 ) { trace_a = trace_a.substring(0, 51 ); }
	if (trace_t.length > 128) { trace_t = trace_t.substring(0, 128); }
	if (trace_v == true) {

	vlimg = new Image(1,1);
	var date = new Date();
	vlimg.src = trace_protocol+'//'+trace_svr+'?'+'c='+trace_cid+'&p='+ SPID + '&str=' + SSTR + '&stid=' + SSTID + '&g=/1'+'&r='+trace_r+'&l='+trace_l+'&a='+trace_a+'&t='+trace_t+'&k='+trace_k+'&sf='+trace_f+'&j='+trace_j+'&w='+trace_w+'&h='+trace_h+'&d='+trace_d+'&o='+trace_o+'&cval='+trace_cookval+'&tp='+trace_tp+'&ce='+trace_ce+'&adf='+trace_ad + '&' + date.getTime();
	}

}
window.onerror=null;

//-->
