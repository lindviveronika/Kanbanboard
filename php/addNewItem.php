<?php
    require "connect.php";

    $description = $_POST['description'];
    $sortOrder = $_POST['sortOrder'];
    $stage = $_POST['stage'];

    $result = mysqli_query($connect,"INSERT INTO workItems VALUES('','$description','$sortOrder','$stage')");
    if($result !== false) {
	    $response = array(
	    	'status' => 'success',
	    	'msg' => 'successfully inserted',
	    	'id' => mysqli_insert_id($connect)
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
