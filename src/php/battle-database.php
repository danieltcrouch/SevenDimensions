<?php

function createBattle( $gameId, $attackPlayerDetails, $defendPlayerDetails )
{
    $battleId = getGUID();
    $attackPlayerDetails = json_decode( $attackPlayerDetails );
    $defendPlayerDetails = json_decode( $defendPlayerDetails );
    $attackPlayerId = $attackPlayerDetails->id;
    $defendPlayerId = $defendPlayerDetails->id;
    $attackJson = json_encode( $attackPlayerDetails );
    $defendJson = json_encode( $defendPlayerDetails );

    $query = "INSERT INTO battle (id, gameId, attackUserId, defendUserId, battleStatus, battleStatusDate, attackDetails, defendDetails) 
              VALUES (:battleId, :gameId, (SELECT userId FROM player WHERE id = :attackPlayerId AND gameId = :gameId), (SELECT userId FROM player WHERE id = :defendPlayerId AND gameId = :gameId), 'A', CURRENT_TIMESTAMP(), :attackJson, :defendJson)";

    $connection = getConnection();
    $statement = $connection->prepare( $query );
    $statement->bindParam(':battleId',       $battleId);
    $statement->bindParam(':gameId',         $gameId);
    $statement->bindParam(':attackPlayerId', $attackPlayerId);
    $statement->bindParam(':defendPlayerId', $defendPlayerId);
    $statement->bindParam(':attackJson',     $attackJson);
    $statement->bindParam(':defendJson',     $defendJson);
    $statement->execute();

    $connection = null;
    return $battleId;
}

function getCurrentBattle( $gameId, $userId )
{
    $query =
        "SELECT
            id,
            attackDetails,
            defendDetails,
            attackStatus,
            defendStatus,
            battleStatus
        FROM battle
        WHERE gameId = :gameId AND (attackUserId = :userId OR defendUserId = :userId) AND battleStatus IS NOT NULL";

    $connection = getConnection();
    $statement = $connection->prepare( $query );
    $statement->bindParam(':gameId', $gameId);
    $statement->bindParam(':userId', $userId);
    $statement->execute();

    $result = $statement->fetch();

    $connection = null;
    return $result;
}

function saveAttack( $battleId, $isAttack, $playerDetails )
{
    return saveAction( $battleId, $isAttack, $playerDetails, 'A' );
}

function saveDisbands( $battleId, $isAttack, $playerDetails )
{
    return saveAction( $battleId, $isAttack, $playerDetails, 'D' );
}

function saveAction( $battleId, $isAttack, $playerDetails, $actionType )
{
    $playerJson = $playerDetails;

    $isAttack = strcasecmp( $isAttack, "true" ) === 0;
    $detailsColumn = $isAttack ? "attackDetails" : "defendDetails";
    $statusColumn = $isAttack ? "attackStatus" : "defendStatus";
    $query = "UPDATE battle 
              SET $detailsColumn = :playerDetails, $statusColumn = 'S'
              WHERE id = :battleId AND battleStatus = :actionType";

    echo $query;
    $connection = getConnection();
    $statement = $connection->prepare( $query );
    $statement->bindParam(':battleId',      $battleId);
    $statement->bindParam(':playerDetails', $playerJson);
    $statement->bindParam(':actionType',    $actionType);
    $statement->execute();

    $connection = null;
    return $battleId;
}

function getAttacks( $battleId, $isAttack )
{
    return getAction( $battleId, $isAttack, 'A' );
}

function getDisbands( $battleId, $isAttack )
{
    return getAction( $battleId, $isAttack, 'D' );
}

function getAction( $battleId, $isAttack, $actionType )
{
    $isAttack = strcasecmp( $isAttack, "true" ) === 0;
    $detailsColumn = !$isAttack ? "attackDetails" : "defendDetails";
    $statusColumn = !$isAttack ? "attackStatus" : "defendStatus";
    $query = "SELECT $detailsColumn
              FROM battle
              WHERE id = :battleId AND battleStatus = :actionType AND $statusColumn IN ('S', 'R')";
    $connection = getConnection();
    $statement = $connection->prepare( $query );
    $statement->bindParam(':battleId',   $battleId);
    $statement->bindParam(':actionType', $actionType);
    $statement->execute();

    $result = $statement->fetch();
    if ( $result ) {
        $result = json_decode( $result[0] );
        updatePlayerStatus( $battleId, $isAttack, 'R' );
    }
    else {
        $result = getBattleStatus( $battleId );
    }

    $connection = null;
    return $result;
}

function updatePlayerStatus( $battleId, $isAttack, $statusCode )
{
    $statusColumn = $isAttack ? "attackStatus" : "defendStatus";
    $query = "UPDATE battle 
              SET $statusColumn = :statusCode
              WHERE id = :battleId";

    $connection = getConnection();
    $statement = $connection->prepare( $query );
    $statement->bindParam(':battleId',   $battleId);
    $statement->bindParam(':statusCode', $statusCode);
    $statement->execute();

    $connection = null;
    return $battleId;
}

function getPlayerStatus( $battleId )
{
    $query = "SELECT attackStatus, defendStatus FROM battle WHERE id = :battleId";

    $connection = getConnection();
    $statement = $connection->prepare( $query );
    $statement->bindParam(':battleId',   $battleId);
    $statement->execute();

    $result = $statement->fetch();

    $connection = null;
    return $result;
}

function updateBattleStatus( $battleId, $statusCode )
{
    $query = "UPDATE battle 
              SET battleStatus = :statusCode, battleStatusDate = CURRENT_TIMESTAMP(), attackStatus = NULL, defendStatus = NULL
              WHERE id = :battleId";

    $connection = getConnection();
    $statement = $connection->prepare( $query );
    $statement->bindParam(':battleId',   $battleId);
    $statement->bindParam(':statusCode', $statusCode);
    $statement->execute();

    $connection = null;
    return $battleId;
}

function getBattleStatus( $battleId )
{
    $query = "SELECT battleStatus FROM battle WHERE id = :battleId";

    $connection = getConnection();
    $statement = $connection->prepare( $query );
    $statement->bindParam(':battleId',   $battleId);
    $statement->execute();

    $result = $statement->fetch()['status'];

    $connection = null;
    return $result;
}

function endBattle( $battleId, $battleInfo )
{
    $battleJson = $battleInfo;

    $query = "UPDATE battle 
              SET attackDetails = :battleInfo, defendDetails = NULL, battleStatus = NULL, battleStatusDate = NULL
              WHERE id = :battleId";

    $connection = getConnection();
    $statement = $connection->prepare( $query );
    $statement->bindParam(':battleId',   $battleId);
    $statement->bindParam(':battleInfo', $battleJson);
    $statement->execute();

    $connection = null;
    return $battleId;
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