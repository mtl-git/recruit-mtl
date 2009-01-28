<?php
	include("mysql2json.class.php");
	
	//DB connect
	if(!($cn = mysql_connect("localhost","root",""))){
		echo "connect failure";
		die;
	}
	if(!(mysql_select_db("zakka"))){
		echo "selectdb failure";
		die;
	}

	if(!mysql_query("set names 'utf8'")){
		echo "setnames failure";
		die;
	}
	
	if(@$_GET["num"]){
		$num_choose = $_GET["num"];
	}else{
		$num_choose = 16;
	}
	$sql = "SELECT * FROM rakuten_item ORDER BY rand() LIMIT $num_choose";
	$result = mysql_query($sql);
	$num=mysql_affected_rows();
	
	header ("Content-Type: text/javascript; charset=UTF-8");
	$obj_json = new mysql2json();
	print(htmlspecialchars(trim($obj_json->getJSON($result,$num)),ENT_NOQUOTES));	
?>