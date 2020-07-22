<?php
require_once( "common-includes.php" );
require_once( "conflict-database.php" );

if ( isset($_POST['action']) && function_exists( $_POST['action'] ) ) {
    $action = $_POST['action'];
    $result = null;

    try {
        //createConflict
        if ( isset($_POST['gameId']) && isset($_POST['attackPlayerDetails']) && isset($_POST['defendPlayerDetails']) && isset($_POST['conflictStatus']) ) {
            $result = $action( $_POST['gameId'], $_POST['attackPlayerDetails'], $_POST['defendPlayerDetails'], $_POST['conflictStatus'] );
        }
        //getCurrentConflict
        elseif ( isset($_POST['gameId']) && isset($_POST['userId']) ) {
            $result = $action( $_POST['gameId'], $_POST['userId'] );
        }
        //saveAttack, saveDisbands, saveInitiative
        else if ( isset($_POST['conflictId']) && isset($_POST['isAttack']) && isset($_POST['playerDetails']) ) {
            $result = $action( $_POST['conflictId'], $_POST['isAttack'], $_POST['playerDetails'] );
        }
        //updatePlayerStatus
        else if ( isset($_POST['conflictId']) && isset($_POST['isAttack']) && isset($_POST['statusCode']) ) {
            $result = $action( $_POST['conflictId'], $_POST['isAttack'], $_POST['statusCode'] );
        }
        //getAttacks, getDisbands, getInitiative
        elseif ( isset($_POST['conflictId']) && isset($_POST['isAttack']) ) {
            $result = $action( $_POST['conflictId'], $_POST['isAttack'] );
        }
        //updateConflictStatus
        elseif ( isset($_POST['conflictId']) && isset($_POST['statusCode']) ) {
            $result = $action( $_POST['conflictId'], $_POST['statusCode'] );
        }
        //endConflict
        elseif ( isset($_POST['conflictId']) && isset($_POST['conflictInfo']) ) {
            $result = $action( $_POST['conflictId'], $_POST['conflictInfo'] );
        }
        //getPlayerStatus, getConflictStatus
        elseif ( isset($_POST['conflictId']) ) {
            $result = $action( $_POST['conflictId'] );
        }
        else {
            $result = $action();
        }

        echo json_encode($result);
    }
    catch ( PDOException $e ) {
        echo "Error: " . $e->getMessage();
    }
}

?>