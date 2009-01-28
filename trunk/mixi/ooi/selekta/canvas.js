var view = document.getElementById( 'imagearea' );
var out = document.getElementById( 'output' );
var frview = document.getElementById( 'friendsarea' );
var img = document.getElementById('wishimage');

function myInit(){
    request();
    getWish();
};

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
        //var data_obj = [];
        data_obj.push(var1);
        var jsondata = gadgets.json.stringify(data_obj);
        var req = opensocial.newDataRequest();
        req.add( req.newUpdatePersonAppDataRequest( opensocial.IdSpec.PersonId.VIEWER, "var2" , jsondata ));
        req.add( req.newFetchPersonRequest( opensocial.IdSpec.PersonId.VIEWER ), "viewer" );
        req.add( req.newFetchPersonAppDataRequest( ispc ), "viewer_data" );
        req.send(vote_callback);
    	} );
	
	request();
};

function vote_callback( res ) {
    var vwd = res.get( "viewer_data" );
    var vw  = res.get( "viewer" );
    me = vw.getData();
    if( res.hadError() ){
        out.innerHTML = res.getErrorMessage();
        return;
    }
    
    var data = ( vwd.getData() )[ me.getId() ];
    if( !data ){
        out.innerHTML = 'まだ気になるものを見つけてなさそう。';
        return;
    }
    
    var var1 = gadgets.json.parse(gadgets.util.unescapeString( data.var2 ) || '{}');
    
    //画像取得
    var params = {};
    params[ gadgets.io.RequestParameters.CONTENT_TYPE ] = gadgets.io.ContentType.JSON;
    params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.GET;
    params[gadgets.io.RequestParameters.REFRESH_INTERVAL] = 0;
    var url = "http://selekta/getImage.php?itemCode=" + var1[var1.length - 1];  
    gadgets.io.makeRequest( url, img_callback, params );
};


function request (){    
    //view.innerHTML = '';
    var params = {};
    params[ gadgets.io.RequestParameters.CONTENT_TYPE ] = gadgets.io.ContentType.JSON;
    params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.GET;
    params[gadgets.io.RequestParameters.REFRESH_INTERVAL] = 0;
    var url = "http://selekta/json6.php?num=2";  
    //msg_loading = msg.createStaticMessage( 'Loading...' );
    gadgets.io.makeRequest( url, callback, params );
};
function callback ( obj ){  
    if( obj.errors.length > 0 ){
        view.innerHTML = obj.errors.join( '<br>' );
        return;
    }
    var tours = obj.data.data;
    var html = '';
    //var html = '<ol>';
    for( var i=0; i<tours.length; i++ ){
        var t = tours[ i ];
        //html += '<li><img alt="' + t.itemCode + '" src="' + t.mediumImageUrl + '"/></li>';
        html += '<a href="#" onclick="vote(\'' + t.itemCode + '\');"><img alt="' + t.itemCode + '" src="' + t.mediumImageUrl + '"/></a>';
    }
    //html += '</ol>';
    view.innerHTML = html /*+ user_data*/;
};

//結果表示
function getResult(){
	var req  = opensocial.newDataRequest();
    var p = {};
    p[ opensocial.IdSpec.Field.USER_ID ] = opensocial.IdSpec.PersonId.VIEWER;
    var ispc = opensocial.newIdSpec( p );
    req.add( req.newFetchPersonRequest( opensocial.IdSpec.PersonId.VIEWER ), "viewer" );
    req.add( req.newFetchPersonAppDataRequest( ispc ), "viewer_data" );
    req.send( fetch_callback );
};
function fetch_callback( res ) {
    var vwd = res.get( "viewer_data" );
    var vw  = res.get( "viewer" );
    me = vw.getData();
    if( res.hadError() ){
        out.innerHTML = res.getErrorMessage();
        return;
    }
    var data = ( vwd.getData() )[ me.getId() ];
    if( !data ){
        out.innerHTML = 'データがありません。';
        return;
    }
    
    var var1 = gadgets.json.parse(gadgets.util.unescapeString( data.var2 ) || '{}');
    var html = '<ul>';
    for (var i = 0; i < var1.length; i++){
    	html += '<li>' + var1[i] + '</li>';
    }
    html += '</ul>';
    out.innerHTML = html;
    gadgets.window.adjustHeight();
};

function getWish(){
	var req  = opensocial.newDataRequest();
    var p = {};
    p[ opensocial.IdSpec.Field.USER_ID ] = opensocial.IdSpec.PersonId.OWNER;
    var ispc = opensocial.newIdSpec( p );
    req.add( req.newFetchPersonRequest( opensocial.IdSpec.PersonId.OWNER ), "owner" );
    req.add( req.newFetchPersonAppDataRequest( ispc ), "owner_data" );
    req.send( wish_callback );
}

function wish_callback( res ) {
    var vwd = res.get( "owner_data" );
    var vw  = res.get( "owner" );
    me = vw.getData();
    if( res.hadError() ){
        out.innerHTML = res.getErrorMessage();
        return;
    }
    
    var data = ( vwd.getData() )[ me.getId() ];
    if( !data ){
        img.innerHTML = 'まだ気になるものを見つけてなさそう。';
        return;
    }
    if(img.innerHTML == 'まだ気になるものを見つけてなさそう。'){//bugあり
    	img.innerHTML = ''
    }
    var var1 = gadgets.json.parse(gadgets.util.unescapeString( data.var2 ) || '{}');
    
    //画像取得
    var params = {};
    params[ gadgets.io.RequestParameters.CONTENT_TYPE ] = gadgets.io.ContentType.JSON;
    params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.GET;
    params[gadgets.io.RequestParameters.REFRESH_INTERVAL] = 0;
    for( var i = 0; i < var1.length; i++){
	    var url = "http://selekta/getImage.php?itemCode=" + var1[i];  
	    gadgets.io.makeRequest( url, img_callback, params );
    }
}

function img_callback ( obj ){  
    if( obj.errors.length > 0 ){
        out.innerHTML = obj.errors.join( '<br>まだありません。' );
        return;
    }
    var images = obj.data.data;
    var html = '';
    for( var i=0; i<images.length; i++ ){
        var t = images[ i ];
        html += '<img alt="' + t.itemCode + '" src="' + t.mediumImageUrl + '"/>';
    }
    img.innerHTML += html;
    gadgets.window.adjustHeight();
};

function dataDelete(){
	//data get
	var p = {};
    p[ opensocial.IdSpec.Field.USER_ID ] = opensocial.IdSpec.PersonId.VIEWER;
    var ispc = opensocial.newIdSpec( p );
	var jsondata = "";
	var req = opensocial.newDataRequest();
	req.add( req.newUpdatePersonAppDataRequest( opensocial.IdSpec.PersonId.VIEWER, "var2" , jsondata ));
	req.add( req.newFetchPersonRequest( opensocial.IdSpec.PersonId.VIEWER ), "viewer" );
	req.add( req.newFetchPersonAppDataRequest( ispc ), "viewer_data" );
	req.send(function(res){img.innerHTML = '';});
};