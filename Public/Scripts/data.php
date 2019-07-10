<?php







		session_start();
                try {
                        $dbh = new PDO('pgsql:dbname=valley');
                } catch (PDOException $e) {
                        print "Error with Database: ".$e->getMessage()."<br/>";
                        die();
                }//WILL HAVE TO EDIT THE QUERY







?>
