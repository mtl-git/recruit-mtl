var ad_params = {}
ad_params.fillzero = function(s,n) {
    return ('_' + Math.pow(10,n) + s).slice(-n);
};
ad_params.today = function() {
    var today = new Date();
    return '' + today.getFullYear() +
	ad_params.fillzero((today.getMonth()+1),2) +
	ad_params.fillzero(today.getDate(),2);
};
ad_params.baseurl = 'http://match.doko.jp/haishin/a';
ad_params.qs = 'i=uchiyama&ip=&u=&m=p&k=&g=j&x=503129148&y=128505270&c=3&r=2&rc=3&pg=mixi_canvas&fq=d';
ad_params.qs += '&a=' + hex_md5(ad_params.today() + 'uchi&183');
// turn off cache
ad_params.qs += '&time='+(new Date()).getTime();

var params = {};

// CONTENT_TYPE text/xml
params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.DOM;
params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.GET;

// TODO:
// not working?
//params[gadgets.io.RequestParameters.REFRESH_INTERVAL] = 0;

gadgets.io.makeRequest(ad_params.baseurl + '?' + ad_params.qs, function(res) {
    jQuery(res.data).find('dokoad ad').each(function(i,node) {
	node = $(node);

	var ad_link = $('<a />').attr({ 'href': node.attr('adUrl'), 'title': node.attr('adTitle') });

	$('<div />').addClass('ads')
	.append(
	    $('<h3 />')
	    .append(ad_link.clone().text(node.attr('adTitle')))
	)
	.append(
	    ad_link.clone().append($('<img />').attr('src', node.attr('picUrl')))
	)
	.append(
	    $('<p />')
	    .append(ad_link.clone().text(node.attr('adText1') + node.attr('adText2')))
	)
	.append(
	    $('<h4 />')
	    .append(ad_link.clone().text(node.attr('adFqdn')))
	)
	.appendTo($('#ad'));
    });
}, params);
