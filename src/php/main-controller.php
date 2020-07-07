<?php
session_start();

require_once( "common-includes.php" );
require_once( "main-service.php" );
require_once( "main-database.php" );

if ( isset($_POST['action']) && function_exists( $_POST['action'] ) ) {
    $action = $_POST['action'];
    $result = null;

    try {
        if ( !isset($_POST['userId']) || $_POST['userId'] === $_SESSION['userId'] ) {
            //updateGame
            if ( isset($_POST['userId']) && isset($_POST['gameId']) && isset($_POST['game']) ) {
                $result = $action( $_POST['gameId'], $_POST['game'] );
            }
            //updatePlayer
            elseif ( isset($_POST['userId']) && isset($_POST['gameId']) && isset($_POST['player']) ) {
                $result = $action( $_POST['gameId'], $_POST['player'] );
            }
            //getPlayer
            elseif ( isset($_POST['gameId']) && isset($_POST['userId']) ) {
                $result = $action( $_POST['gameId'], $_POST['userId'] );
            }
            //endGame
            elseif ( isset($_POST['id']) && isset($_POST['state']) ) {
                $result = $action( $_POST['id'], $_POST['state'] );
            }
            //createGame
            elseif ( isset($_POST['game']) ) {
                $result = $action( $_POST['game'] );
            }
            //loadGame
            elseif ( isset($_POST['id']) ) {
                $result = $action( $_POST['id'] );
            }
            //getOrCreateUser
            elseif ( isset($_POST['email']) ) {
                $result = $action( $_POST['email'] );
            }
            else {
                $result = $action();
            }
        }
        else {
            $result = "User not signed-in";
        }

        echo json_encode($result);
    }
    catch ( PDOException $e ) {
        echo "Error: " . $e->getMessage();
    }
}

?>