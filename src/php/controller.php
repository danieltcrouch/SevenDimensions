<?php
require_once( "service.php" );
require_once( "database.php" );

if ( isset($_POST['action']) && function_exists( $_POST['action'] ) ) {
    $action = $_POST['action'];
    $result = null;

    try {
        if ( isset($_POST['appName']) && isset($_POST['authToken']) && isset($_POST['createNew']) ) {
            $result = $action( $_POST['appName'], $_POST['authToken'], $_POST['createNew'] );
        }
        //getGame
        else if ( isset($_POST['id']) ) {
            $result = $action( $_POST['id'] );
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