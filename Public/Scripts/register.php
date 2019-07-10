<?php
	if(isset($_POST['user']) and !preg_match('/[\'^£$%&*()}{@#~?><>,|=_+¬-]/', $_POST['user'])){
		$username = $_POST['user'];
		$flag1 = true;

	} else {
		echo "username not set or has invalid characters! <br>";
		$flag1 = false;
	}
	//Check User ID
	if(isset($_POST['confirmpass']) and !preg_match('/[\'^£$%&*()}{@#~?><>,|=_+¬-]/', $_POST['confirmpass'])){

		$password = hash('sha256', $_POST['confirmpass']);
		$flag2 = true;

	} else {
		echo "password not set or has invalid characters! <br>";
		$flag2 = false;
	}
	if($flag1 && $flag2)
	{
		if(strlen($username)<=100 && strlen($password)>=8 && strlen($password)<=100)
		{
			//Connect to DB
			session_start();
			try {
				//MIGHT HAVE TO CAPITALIZE 'VALLEY'
				$dbh = new PDO('pgsql:dbname=valley');				
				} catch (PDOException $e) {
				echo "Error: ".$e->getMessage()."<br/>";
				die();
			}


			$st = $dbh->prepare("INSERT INTO
			userpass (id,username,password) VALUES(DEFAULT,?,?)");
			$st->bindParam(1, $username);
			$st->bindParam(2, $password);
			$succ = $st->execute();
			$result = $st->fetch();



			if($succ){
				//Get me Id
                        	$st = $dbh->prepare("SELECT id FROM
                        	userpass WHERE username =? ");
                	        $st->bindParam(1, $username);
        	                $succtt = $st->execute();
	                        $result = $st->fetch();

	                        $userid = $result[0];


				$test1="";
				$test2="";
                        	$st = $dbh->prepare("INSERT INTO
                        	friendlist (id, username, list, pendingrequest) VALUES(?,?,?,?)");
				$st->bindParam(1, $userid);
                        	$st->bindParam(2, $username);
				$st->bindParam(3, $test1);
				$st->bindParam(4, $test2);
                        	$succ = $st->execute();
                        	$result = $st->fetch();
		                echo "Account Registered!";
				header('Location: ../../../index.html');
			}
			 else
			 {
				echo "Account already exists please try again! Please go back to the register page.";
			 }
		} 
		else 
		{
			echo "INVALID LENGTH";
		}
	}
?>
