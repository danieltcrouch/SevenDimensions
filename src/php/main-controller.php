<?php
require_once( "service.php" );
require_once( "main-database.php" );

if ( isset($_POST['action']) && function_exists( $_POST['action'] ) ) {
    $action = $_POST['action'];
    $result = null;

    try {
        //todo 4 - Google Sign-In - move to Common
        if ( isset($_POST['appName']) && isset($_POST['authToken']) && isset($_POST['createNew']) ) {
            $result = $action( $_POST['appName'], $_POST['authToken'], $_POST['createNew'] );
        }
        elseif ( isset($_POST['fileName']) ) {
            $result = $action( $_POST['fileName'] );
        }
        else {
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
            //createGame
            elseif ( isset($_POST['game']) ) {
                $result = $action( $_POST['game'] );
            }
            //loadGame
            elseif ( isset($_POST['id']) ) {
                $result = $action( $_POST['id'] );
            }
            else {
                $result = $action();
            }
        }

        if ( isset($_POST['userId']) && $_POST['userId'] === getCurrentUser() ) {
            //todo 4 - apply this check where necessary
        }

        echo json_encode($result);
    }
    catch ( PDOException $e ) {
        echo "Error: " . $e->getMessage();
    }
}

?>