<?php
require_once( "service.php" );
require_once( "database.php" );

if ( isset($_POST['action']) && function_exists( $_POST['action'] ) ) {
    $action = $_POST['action'];
    $result = null;

    try {
        //todo 10 - Google Sign-In - move to Common
        if ( isset($_POST['appName']) && isset($_POST['authToken']) && isset($_POST['createNew']) ) {
            $result = $action( $_POST['appName'], $_POST['authToken'], $_POST['createNew'] );
        }
        if ( isset($_POST['fileName']) ) {
            $result = $action( $_POST['fileName'] );
        }

        //getPlayer
        if ( isset($_POST['gameId']) && isset($_POST['userId']) ) {
            $result = $action( $_POST['gameId'], $_POST['userId'] );
        }
        //getGame
        elseif ( isset($_POST['id']) ) {
            $result = $action( $_POST['id'] );
        }

        if ( isset($_POST['userId']) && $_POST['userId'] === getCurrentUser() ) {
        }

        ////getGame
        //if ( isset($_POST['id']) && isset($_POST['state']) && isset($_POST['time']) && isset($_POST['activeId']) && isset($_POST['winners']) ) {
        //    $result = $action( $_POST['id'], $_POST['state'], $_POST['time'], $_POST['activeId'], $_POST['winners'] );
        //}
        ////getGame
        //elseif ( isset($_POST['id']) ) {
        //    $result = $action( $_POST['id'] );
        //}
        ////method (SERVICE)
        //else {
        //    $result = $action();
        //}

        echo json_encode($result);
    }
    catch ( PDOException $e ) {
        echo "Error: " . $e->getMessage();
    }
}

?>