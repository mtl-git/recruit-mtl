var out = document.getElementById( 'output' );
var gadgetTitle = document.getElementById('displayname');

function myInit(){
    getResult();
};

//結果表示
function getResult(){
	var req  = opensocial.newDataRequest();
    var p = {};
    p[ opensocial.IdSpec.Field.USER_ID ] = opensocial.IdSpec.PersonId.OWNER;
    var ispc = opensocial.newIdSpec( p );
    req.add( req.newFetchPersonRequest( opensocial.IdSpec.PersonId.OWNER ), "owner" );
    req.add( req.newFetchPersonAppDataRequest( ispc ), "owner_data" );
    req.send( fetch_callback );
};

function fetch_callback( res ) {
    var vwd = res.get( "owner_data" );
    var vw  = res.get( "owner" );
    me = vw.getData();
    if( res.hadError() ){
        out.innerHTML = res.getErrorMessage();
        return;
    }
    gadgetTitle.innerHTML = me.getDisplayName();
    
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
    gadgets.io.makeRequest( url, callback, params );
};

function callback ( obj ){  
    if( obj.errors.length > 0 ){
        out.innerHTML = obj.errors.join( '<br>まだありません。' );
        return;
    }
    var images = obj.data.data;
    var t = images[0];
    var html = '<p><img alt="' + t.itemCode + '" src="' + t.mediumImageUrl + '"/></p>';
    out.innerHTML = html;
    gadgets.window.adjustHeight();
};
