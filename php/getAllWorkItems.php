<?php
    require "connect.php";
    mysqli_set_charset($connect,"utf8");
    $result = mysqli_query($connect, "SELECT * FROM workItems ORDER BY sortOrder");
    if($result !== false) {
    	$response = array(
    		'status' => 'success',
    		'msg' => 'fetched items successfully',
    		'data' => mysqli_fetch_all($result,MYSQLI_ASSOC)
		);
	}
	else{
		$response = array(
    		'status' => 'error',
    		'msg' => 'query failed'
		);
	}  

    echo json_encode($response);

    mysqli_close($connect);
?>