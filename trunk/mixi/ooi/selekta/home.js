var view = document.getElementById( 'imagearea' );
var out = document.getElementById( 'output' );

function vote(var1){
	//data get
	var req  = opensocial.newDataRequest();
    var p = {};
    p[ opensocial.IdSpec.Field.USER_ID ] = opensocial.IdSpec.PersonId.VIEWER;
    var ispc = opensocial.newIdSpec( p );
    req.add( req.newFetchPersonRequest( opensocial.IdSpec.PersonId.VIEWER ), "viewer" );
    req.add( req.newFetchPersonAppDataRequest( ispc ), "viewer_data" );
    req.send( function(res){
    	var vwd = res.get( "viewer_data" );
	    var vw  = res.get( "viewer" );
	    me = vw.getData();
	    if( res.hadError() ){
	        out.innerHTML = res.getErrorMessage();
	        return;
	    }
	    var data = ( vwd.getData() )[ me.getId() ];
	    if( !data ){
	        var data_obj = [];
	    }else{
		    var data_obj = gadgets.json.parse(gadgets.util.unescapeString( data.var2 ) || '{}');
	    }
        data_obj.push(var1);
        var jsondata = gadgets.json.stringify(data_obj);
        var req = opensocial.newDataRequest();
        req.add( req.newUpdatePersonAppDataRequest( opensocial.IdSpec.PersonId.VIEWER, "var2" , jsondata ));
        req.send(function(data){});
    	} );
	request();
};

function myInit(){
    request();
};

function request (){    
    var params = {};
    params[ gadgets.io.RequestParameters.CONTENT_TYPE ] = gadgets.io.ContentType.JSON;
    params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.GET;
    params[gadgets.io.RequestParameters.REFRESH_INTERVAL] = 0;
    var url = "http://selekta.jp/json.php?num=2";  
    gadgets.io.makeRequest( url, callback, params );
};

function callback ( obj ){  
    if( obj.errors.length > 0 ){
        view.innerHTML = obj.errors.join( '<br>' );
        return;
    }
    var tours = obj.data.data;
    var html = '';
    for( var i=0; i<tours.length; i++ ){
        var t = tours[ i ];
        html += '<a href="#" onclick="vote(\'' + t.itemCode + '\');"><img alt="' + t.itemCode + '" src="' + t.mediumImageUrl + '"/></a>';
    }
    view.innerHTML = html;
};
