<?php

function createTrade( $gameId, $details1, $details2 )
{
    $tradeId = getGUID();
    $details1 = json_decode( $details1 );
    $details2 = json_decode( $details2 );
    $player1Id = $details1->id;
    $player2Id = $details2->id;
    $player1Json = json_encode( $details1 );
    $player2Json = json_encode( $details2 );

    $query = "INSERT INTO trade (id, gameId, date, userId1, userId2, details1, details2, status1, status2, tradeStatus ) 
              VALUES (:tradeId, :gameId, CURRENT_TIMESTAMP(), (SELECT userId FROM player WHERE id = :player1Id AND gameId = :gameId), (SELECT userId FROM player WHERE id = :player2Id AND gameId = :gameId), :player1Json, :player2Json, 'O', 'W', 'O' )";

    $connection = getConnection();
    $statement = $connection->prepare( $query );
    $statement->bindParam(':tradeId',     $tradeId);
    $statement->bindParam(':gameId',      $gameId);
    $statement->bindParam(':player1Id',   $player1Id);
    $statement->bindParam(':player2Id',   $player2Id);
    $statement->bindParam(':player1Json', $player1Json);
    $statement->bindParam(':player2Json', $player2Json);
    $statement->execute();

    $connection = null;
    return $tradeId;
}

function getCurrentTrades( $gameId, $userId )
{
    $query =
        "SELECT
            id,
            details1,
            details2,
            status1,
            status2,
            tradeStatus
        FROM trade
        WHERE gameId = :gameId AND (userId1 = :userId OR userId2 = :userId) AND tradeStatus IN ('O', 'P')";

    $connection = getConnection();
    $statement = $connection->prepare( $query );
    $statement->bindParam(':gameId', $gameId);
    $statement->bindParam(':userId', $userId);
    $statement->execute();

    $result = $statement->fetch();

    $connection = null;
    return $result;
}

function saveTrade( $tradeId, $details1, $details2, $status1, $status2, $tradeStatus )
{
    $details1 = json_decode( $details1 );
    $details2 = json_decode( $details2 );
    $details1Json = json_encode( $details1 );
    $details2Json = json_encode( $details2 );

    $query = "UPDATE trade 
              SET details1 = :details1Json, details2 = :details2Json, status1 = :status1 , status2 = :status2 , tradeStatus = :tradeStatus 
              WHERE id = :tradeId ";

    $connection = getConnection();
    $statement = $connection->prepare( $query );
    $statement->bindParam(':tradeId',      $tradeId);
    $statement->bindParam(':details1Json', $details1Json);
    $statement->bindParam(':details2Json', $details2Json);
    $statement->bindParam(':status1',      $status1);
    $statement->bindParam(':status2',      $status2);
    $statement->bindParam(':tradeStatus',  $tradeStatus);
    $statement->execute();

    $connection = null;
    return $tradeId;
}

function saveStatus( $tradeId, $status1, $status2, $tradeStatus )
{
    $query = "UPDATE trade 
              SET status1 = :status1 , status2 = :status2 , tradeStatus = :tradeStatus 
              WHERE id = :tradeId ";

    $connection = getConnection();
    $statement = $connection->prepare( $query );
    $statement->bindParam(':tradeId',     $tradeId);
    $statement->bindParam(':status1',     $status1);
    $statement->bindParam(':status2',     $status2);
    $statement->bindParam(':tradeStatus', $tradeStatus);
    $statement->execute();

    $connection = null;
    return $tradeId;
}

function getConnection()
{
    $servername = "localhost";
    $username   = "religiv3_admin";
    $password   = "1corinthians3:9";
    $dbname     = "religiv3_seven";

    $connection = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    $connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    return $connection;
}

?>