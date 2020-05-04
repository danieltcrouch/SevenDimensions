<?php

function createBattle( $gameId, $attackPlayerDetails, $defendPlayerDetails )
{
    $battleId = getGUID();
    $attackPlayerId = json_decode( $attackPlayerDetails )->id;
    $defendPlayerId = json_decode( $defendPlayerDetails )->id;
    $attackJson = json_encode( $attackPlayerDetails );
    $defendJson = json_encode( $defendPlayerDetails );

    $query = "INSERT INTO battle (id, gameId, attackUserId, defendUserId, status, statusDate, attackDetails, defendDetails) 
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
    return $gameId;
}

function getCurrentBattle( $gameId, $userId )
{
    $query = "SELECT id, attackDetails, defendDetails FROM battle WHERE gameId = :gameId AND (attackUserId = :userId OR defendUserId = :userId) AND status IS NULL";

    $connection = getConnection();
    $statement = $connection->prepare( $query );
    $statement->bindParam(':gameId', $gameId);
    $statement->bindParam(':userId', $userId);
    $statement->execute();

    $result = $statement->fetch();

    $connection = null;
    return $result;
}

function saveHits( $battleId, $isAttack, $playerDetails )
{
    return saveAction( $battleId, $isAttack, $playerDetails, 'A' );
}

function saveDisbands( $battleId, $isAttack, $playerDetails )
{
    return saveAction( $battleId, $isAttack, $playerDetails, 'D' );
}

function saveAction( $battleId, $isAttack, $playerDetails, $actionType )
{
    $playerJson = json_encode( $playerDetails );

    $query = "UPDATE battle 
              SET attackDetails =
                  CASE
                      WHEN :isAttack = TRUE THEN :playerDetails
                      ELSE attackDetails
                  END,
              defendDetails =
                  CASE
                      WHEN :isAttack = TRUE THEN :playerDetails
                      ELSE defendDetails
                  END,
              attackDate =
                  CASE
                      WHEN :isAttack = TRUE THEN CURRENT_TIMESTAMP()
                      ELSE attackDate
                  END,
              defendDate =
                  CASE
                      WHEN :isAttack = TRUE THEN CURRENT_TIMESTAMP()
                      ELSE defendDate
                  END
              WHERE id = :battleId AND status = :actionType";

    $connection = getConnection();
    $statement = $connection->prepare( $query );
    $statement->bindParam(':battleId',      $battleId);
    $statement->bindParam(':isAttack',      $isAttack);
    $statement->bindParam(':playerDetails', $playerJson);
    $statement->bindParam(':actionType',    $actionType);
    $statement->execute();

    $connection = null;
    return $battleId;
}

function getHits( $battleId, $isAttack )
{
    return getAction( $battleId, $isAttack, 'A' );
}

function getDisbands( $battleId, $isAttack )
{
    return getAction( $battleId, $isAttack, 'D' );
}

function getAction( $battleId, $isAttack, $actionType )
{
    $query = "SELECT 
                CASE
                    WHEN :isAttack = TRUE THEN attackDetails ELSE defendDetails
                END
              FROM battle
              WHERE id = :battleId AND attackDate > statusDate AND defendDate > statusDate AND status = :actionType";
    $connection = getConnection();
    $statement = $connection->prepare( $query );
    $statement->bindParam(':battleId',   $battleId);
    $statement->bindParam(':isAttack',   $isAttack);
    $statement->bindParam(':actionType', $actionType);
    $statement->execute();

    $result = $statement->fetch();

    $connection = null;
    return $result;
}

function updateStatus( $battleId, $statusCode )
{
    $query = "UPDATE battle 
              SET status = :statusCode, statusDate = CURRENT_TIMESTAMP()
              WHERE id = :battleId";

    $connection = getConnection();
    $statement = $connection->prepare( $query );
    $statement->bindParam(':battleId',   $battleId);
    $statement->bindParam(':statusCode', $statusCode);
    $statement->execute();

    $connection = null;
    return $battleId;
}

function endBattle( $battleId, $battleInfo )
{
    $battleJson = json_encode( $battleInfo );

    $query = "UPDATE battle 
              SET attackDetails = :battleInfo, defendDetails = NULL, status = NULL, statusDate = NULL
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