<?php
    require "connect.php";

    $id = (int)$_POST['id'];
    $query = "DELETE FROM workItems WHERE Id = " . $id;
    $result = mysqli_query($connect, $query);

	if($result !== false) {
	    $response = array(
	    	'status' => 'success',
	    	'msg' => 'successfully deleted item'
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
