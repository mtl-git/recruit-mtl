var VIEWS = gadgets.views.getSupportedViews();

$('#navi').html('<ul></ul>');

$.each(VIEWS, function(name,view) {
    $('<li />').appendTo('#navi > ul');

    if(gadgets.views.getCurrentView() == view) {
	$('#navi > ul > li:last').text(view.getName()+'('+name+') View');
    } else {
	$('<a />')
	.attr({
	    href: 'javascript:void(0);',
	    title: 'go to '+view.getName().toUpperCase()+' view'
	})
	.text(view.getName()+'('+name+') View へ移動する')
	.click(function() {
	    try {
		gadgets.views.requestNavigateTo(view);
	    } catch(e) {
		console.log(e);
	    };
	})
	.appendTo('#navi > ul > li:last');
    }
});
