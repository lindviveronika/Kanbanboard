<?php
    require "connect.php";

    $id = (int)$_POST['id'];
    $description = $_POST['description'];
    $query = "UPDATE workItems SET description = '" . $description . "' WHERE Id = " . $id;
    $result = mysqli_query($connect, $query);

	if($result !== false) {
	    $response = array(
	    	'status' => 'success',
	    	'msg' => 'successfully updated description'
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
