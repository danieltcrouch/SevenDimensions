<?php
require_once( "common-includes.php" );
require_once( "trade-database.php" );

if ( isset($_POST['action']) && function_exists( $_POST['action'] ) ) {
    $action = $_POST['action'];
    $result = null;

    try {
        //createTrade
        if ( isset($_POST['gameId']) && isset($_POST['details1']) && isset($_POST['details2']) ) {
            $result = $action( $_POST['gameId'], $_POST['details1'], $_POST['details2'] );
        }
        //getCurrentTrades
        elseif ( isset($_POST['gameId']) && isset($_POST['userId']) ) {
            $result = $action( $_POST['gameId'], $_POST['userId'] );
        }
        //saveTrade
        elseif ( isset($_POST['tradeId']) && isset($_POST['details1']) && isset($_POST['details2']) && isset($_POST['status1']) && isset($_POST['status2']) && isset($_POST['tradeStatus']) ) {
            $result = $action( $_POST['tradeId'], $_POST['details1'], $_POST['details2'], $_POST['status1'], $_POST['status2'], $_POST['tradeStatus'] );
        }
        //saveStatus
        elseif ( isset($_POST['tradeId']) && isset($_POST['status1']) && isset($_POST['status2']) && isset($_POST['tradeStatus']) ) {
            $result = $action( $_POST['tradeId'], $_POST['status1'], $_POST['status2'], $_POST['tradeStatus'] );
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