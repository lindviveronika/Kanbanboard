<?php

	require "connect.php";

	//Test if it is a shared client
	if (!empty($_SERVER['HTTP_CLIENT_IP'])){
	  $ip=$_SERVER['HTTP_CLIENT_IP'];
	//Is it a proxy address
	}elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])){
	  $ip=$_SERVER['HTTP_X_FORWARDED_FOR'];
	}else{
	  $ip=$_SERVER['REMOTE_ADDR'];
	}

	echo $ip;

	$dbQuery = mysqli_query($connect,"INSERT INTO visitors(ip) VALUES('$ip')");

	mysqli_close($connect);
?>