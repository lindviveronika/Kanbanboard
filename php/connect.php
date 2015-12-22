<?php
    $servername = "localhost";
    $username = "root";
    $password = "";
    $db = "kanbanboard";

    $connect = mysqli_connect($servername, $username, $password, $db);
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