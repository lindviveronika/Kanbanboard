<?php
    require "connect.php";

	$i = 0;

	foreach ($_POST['item'] as $value) {
	    $query = "UPDATE workItems SET sortOrder = " . $i . " WHERE Id = " . $value;
    	$result = mysqli_query($connect, $query);
	    $i++;

    	if($result === false) {
			$response = array(
	    		'status' => 'error',
	    		'msg' => 'query failed'
			);
			break;
		}
	}
	if($result !== false) {
	    $response = array(
	    	'status' => 'success',
	    	'msg' => 'successfully updated sortOrder'  
		);
	}

	echo json_encode($response); 

	mysqli_close($connect);

?>