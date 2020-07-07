<?php
require_once( "common-includes.php" );
require_once( "battle-database.php" );

if ( isset($_POST['action']) && function_exists( $_POST['action'] ) ) {
    $action = $_POST['action'];
    $result = null;

    try {
        //createBattle
        if ( isset($_POST['gameId']) && isset($_POST['attackPlayerDetails']) && isset($_POST['defendPlayerDetails']) && isset($_POST['battleStatus']) ) {
            $result = $action( $_POST['gameId'], $_POST['attackPlayerDetails'], $_POST['defendPlayerDetails'], $_POST['battleStatus'] );
        }
        //getCurrentBattle
        elseif ( isset($_POST['gameId']) && isset($_POST['userId']) ) {
            $result = $action( $_POST['gameId'], $_POST['userId'] );
        }
        //saveAttack, saveDisbands, saveInitiative
        else if ( isset($_POST['battleId']) && isset($_POST['isAttack']) && isset($_POST['playerDetails']) ) {
            $result = $action( $_POST['battleId'], $_POST['isAttack'], $_POST['playerDetails'] );
        }
        //updatePlayerStatus
        else if ( isset($_POST['battleId']) && isset($_POST['isAttack']) && isset($_POST['statusCode']) ) {
            $result = $action( $_POST['battleId'], $_POST['isAttack'], $_POST['statusCode'] );
        }
        //getAttacks, getDisbands, getInitiative
        elseif ( isset($_POST['battleId']) && isset($_POST['isAttack']) ) {
            $result = $action( $_POST['battleId'], $_POST['isAttack'] );
        }
        //updateBattleStatus
        elseif ( isset($_POST['battleId']) && isset($_POST['statusCode']) ) {
            $result = $action( $_POST['battleId'], $_POST['statusCode'] );
        }
        //endBattle
        elseif ( isset($_POST['battleId']) && isset($_POST['battleInfo']) ) {
            $result = $action( $_POST['battleId'], $_POST['battleInfo'] );
        }
        //getPlayerStatus, getBattleStatus
        elseif ( isset($_POST['battleId']) ) {
            $result = $action( $_POST['battleId'] );
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