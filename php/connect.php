<?php

    $ini_array = parse_ini_file("config/login.ini");

    $connect = mysqli_connect($ini_array["servername"], $ini_array["username"], $ini_array["password"], $ini_array["db"]);
    if (!$connect) {
    	$result = array(
	  	'response' => array(
	    	'status' => 'error',
	    	'msg' => 'could not connect to DB'
	  		)
		);
	echo json_encode($result);
    }
?>