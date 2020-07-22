<?php

function createConflict( $gameId, $attackPlayerDetails, $defendPlayerDetails, $conflictStatus )
{
    $conflictId = getGUID();
    $attackPlayerDetails = json_decode( $attackPlayerDetails );
    $defendPlayerDetails = json_decode( $defendPlayerDetails );
    $attackPlayerId = $attackPlayerDetails->id;
    $defendPlayerId = $defendPlayerDetails->id;
    $attackJson = json_encode( $attackPlayerDetails );
    $defendJson = json_encode( $defendPlayerDetails );

    $query = "INSERT INTO conflict (id, gameId, attackUserId, defendUserId, conflictStatus, conflictStatusDate, attackDetails, defendDetails) 
              VALUES (:conflictId, :gameId, (SELECT userId FROM player WHERE id = :attackPlayerId AND gameId = :gameId), (SELECT userId FROM player WHERE id = :defendPlayerId AND gameId = :gameId), :conflictStatus, CURRENT_TIMESTAMP(), :attackJson, :defendJson)";

    $connection = getConnection();
    $statement = $connection->prepare( $query );
    $statement->bindParam(':conflictId',       $conflictId);
    $statement->bindParam(':gameId',         $gameId);
    $statement->bindParam(':attackPlayerId', $attackPlayerId);
    $statement->bindParam(':defendPlayerId', $defendPlayerId);
    $statement->bindParam(':conflictStatus',   $conflictStatus);
    $statement->bindParam(':attackJson',     $attackJson);
    $statement->bindParam(':defendJson',     $defendJson);
    $statement->execute();

    $connection = null;
    return $conflictId;
}

function getCurrentConflict( $gameId, $userId )
{
    $query =
        "SELECT
            id,
            attackDetails,
            defendDetails,
            attackStatus,
            defendStatus,
            conflictStatus
        FROM conflict
        WHERE gameId = :gameId AND (attackUserId = :userId OR defendUserId = :userId) AND conflictStatus IS NOT NULL";

    $connection = getConnection();
    $statement = $connection->prepare( $query );
    $statement->bindParam(':gameId', $gameId);
    $statement->bindParam(':userId', $userId);
    $statement->execute();

    $result = $statement->fetch();

    $connection = null;
    return $result;
}

function saveAttack( $conflictId, $isAttack, $playerDetails )
{
    return saveAction( $conflictId, $isAttack, $playerDetails, 'A' );
}

function saveDisbands( $conflictId, $isAttack, $playerDetails )
{
    return saveAction( $conflictId, $isAttack, $playerDetails, 'D' );
}

function saveInitiative( $conflictId, $isAttack, $playerDetails )
{
    return saveAction( $conflictId, $isAttack, $playerDetails, 'I' );
}

function saveAction( $conflictId, $isAttack, $playerDetails, $actionType )
{
    $playerJson = $playerDetails;

    $isAttack = strcasecmp( $isAttack, "true" ) === 0;
    $detailsColumn = $isAttack ? "attackDetails" : "defendDetails";
    $statusColumn = $isAttack ? "attackStatus" : "defendStatus";
    $query = "UPDATE conflict 
              SET $detailsColumn = :playerDetails, $statusColumn = 'S'
              WHERE id = :conflictId AND conflictStatus = :actionType";

    echo $query;
    $connection = getConnection();
    $statement = $connection->prepare( $query );
    $statement->bindParam(':conflictId',      $conflictId);
    $statement->bindParam(':playerDetails', $playerJson);
    $statement->bindParam(':actionType',    $actionType);
    $statement->execute();

    $connection = null;
    return $conflictId;
}

function getAttacks( $conflictId, $isAttack )
{
    return getAction( $conflictId, $isAttack, 'A' );
}

function getDisbands( $conflictId, $isAttack )
{
    return getAction( $conflictId, $isAttack, 'D' );
}

function getInitiative( $conflictId, $isAttack )
{
    return getAction( $conflictId, $isAttack, 'I' );
}

function getAction( $conflictId, $isAttack, $actionType )
{
    $isAttack = strcasecmp( $isAttack, "true" ) === 0;
    $detailsColumn = !$isAttack ? "attackDetails" : "defendDetails";
    $statusColumn = !$isAttack ? "attackStatus" : "defendStatus";
    $query = "SELECT $detailsColumn
              FROM conflict
              WHERE id = :conflictId AND conflictStatus = :actionType AND $statusColumn IN ('S', 'R')";
    $connection = getConnection();
    $statement = $connection->prepare( $query );
    $statement->bindParam(':conflictId',   $conflictId);
    $statement->bindParam(':actionType', $actionType);
    $statement->execute();

    $result = $statement->fetch();
    if ( $result ) {
        $result = json_decode( $result[0] );
        updatePlayerStatus( $conflictId, $isAttack, 'R' );
    }
    else {
        $result = getConflictStatus( $conflictId );
    }

    $connection = null;
    return $result;
}

function updatePlayerStatus( $conflictId, $isAttack, $statusCode )
{
    $statusColumn = $isAttack ? "attackStatus" : "defendStatus";
    $query = "UPDATE conflict 
              SET $statusColumn = :statusCode
              WHERE id = :conflictId";

    $connection = getConnection();
    $statement = $connection->prepare( $query );
    $statement->bindParam(':conflictId',   $conflictId);
    $statement->bindParam(':statusCode', $statusCode);
    $statement->execute();

    $connection = null;
    return $conflictId;
}

function getPlayerStatus( $conflictId )
{
    $query = "SELECT attackStatus, defendStatus FROM conflict WHERE id = :conflictId";

    $connection = getConnection();
    $statement = $connection->prepare( $query );
    $statement->bindParam(':conflictId',   $conflictId);
    $statement->execute();

    $result = $statement->fetch();

    $connection = null;
    return $result;
}

function updateConflictStatus( $conflictId, $statusCode )
{
    $query = "UPDATE conflict 
              SET conflictStatus = :statusCode, conflictStatusDate = CURRENT_TIMESTAMP(), attackStatus = NULL, defendStatus = NULL
              WHERE id = :conflictId";

    $connection = getConnection();
    $statement = $connection->prepare( $query );
    $statement->bindParam(':conflictId',   $conflictId);
    $statement->bindParam(':statusCode', $statusCode);
    $statement->execute();

    $connection = null;
    return $conflictId;
}

function getConflictStatus( $conflictId )
{
    $query = "SELECT conflictStatus FROM conflict WHERE id = :conflictId";

    $connection = getConnection();
    $statement = $connection->prepare( $query );
    $statement->bindParam(':conflictId',   $conflictId);
    $statement->execute();

    $result = $statement->fetch()['status'];

    $connection = null;
    return $result;
}

function endConflict( $conflictId, $conflictInfo )
{
    $conflictJson = $conflictInfo;

    $query = "UPDATE conflict 
              SET attackDetails = :conflictInfo, defendDetails = NULL, conflictStatus = NULL, conflictStatusDate = NULL
              WHERE id = :conflictId";

    $connection = getConnection();
    $statement = $connection->prepare( $query );
    $statement->bindParam(':conflictId',   $conflictId);
    $statement->bindParam(':conflictInfo', $conflictJson);
    $statement->execute();

    $connection = null;
    return $conflictId;
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