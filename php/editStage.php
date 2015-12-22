<?php
    require "connect.php";

    $id = (int)$_POST['id'];
    $stage = $_POST['stage'];
    $query = "UPDATE workItems SET stage = '" . $stage . "' WHERE Id = " . $id;
    $result = mysqli_query($connect, $query);

	if($result !== false) {
	    $response = array(
	    	'status' => 'success',
	    	'msg' => 'successfully updated stage'
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
