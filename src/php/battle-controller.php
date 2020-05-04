<?php
require_once( "service.php" );
require_once( "battle-database.php" );

if ( isset($_POST['action']) && function_exists( $_POST['action'] ) ) {
    $action = $_POST['action'];
    $result = null;

    try {
        //createBattle
        if ( isset($_POST['gameId']) && isset($_POST['attackPlayerDetails']) && isset($_POST['defendPlayerDetails']) ) {
            $result = $action( $_POST['gameId'], $_POST['attackPlayerDetails'], $_POST['defendPlayerDetails'] );
        }
        //getCurrentBattle
        elseif ( isset($_POST['gameId']) && isset($_POST['userId']) ) {
            $result = $action( $_POST['gameId'], $_POST['userId'] );
        }
        //saveHits, saveDisbands
        else if ( isset($_POST['battleId']) && isset($_POST['isAttack']) && isset($_POST['playerDetails']) ) {
            $result = $action( $_POST['battleId'], $_POST['isAttack'], $_POST['playerDetails'] );
        }
        //getHits, getDisbands
        elseif ( isset($_POST['battleId']) && isset($_POST['isAttack']) ) {
            $result = $action( $_POST['battleId'], $_POST['isAttack'] );
        }
        //updateStatus
        elseif ( isset($_POST['battleId']) && isset($_POST['statusCode']) ) {
            $result = $action( $_POST['battleId'], $_POST['statusCode'] );
        }
        //endBattle
        elseif ( isset($_POST['battleId']) && isset($_POST['battleInfo']) ) {
            $result = $action( $_POST['battleId'], $_POST['battleInfo'] );
        }
        else {
            $result = $action();
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