<?php
    require "connect.php";
    mysqli_set_charset($connect,"utf8");
    $result = mysqli_query($connect, "SELECT * FROM workItems ORDER BY sortOrder");
    if($result !== false) {

        $results_array = array();
        while ($row = $result->fetch_assoc()) {
            $results_array[] = $row;
        }

    	$response = array(
    		'status' => 'success',
    		'msg' => 'fetched items successfully',
    		'data' => $results_array
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