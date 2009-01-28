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
	
	if(@$_GET["itemCode"]){
		$wherestr = "WHERE itemCode in ('" . $_GET["itemCode"] . "') ";
	}else{
		$wherestr = "";
	}
	$sql = "SELECT itemCode, mediumImageUrl FROM rakuten_item " . $wherestr . " LIMIT 1";
	
	$result = mysql_query($sql);
	$num=mysql_affected_rows();
	
	header ("Content-Type: text/javascript; charset=UTF-8");
	$obj_json = new mysql2json();
	
	print(trim($obj_json->getJSON($result,$num)));	
?>