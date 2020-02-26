<?php

//todo - &useSSL=false (in DB properties)

function loadGame( $gameId )
{
    $query =
   "SELECT m.id, s.stateJson, mp.mapJson, p.playerJson
    FROM meta m
    	JOIN state s  ON s.gameId = m.id
        JOIN map mp   ON mp.gameId = m.id
        JOIN player p ON p.gameId = m.id AND p.active = 1
    WHERE m.id = :gameId ";

    $connection = getConnection();
    $statement = $connection->prepare( $query );
    $statement->bindParam(':gameId', $gameId);
    $statement->execute();

    $results = $statement->fetchAll();

    $result = $results[0];
    $game = [
        'id'      => $result['id'],
        'state'   => json_decode( $result['stateJson'] ),
        'map'     => json_decode( $result['mapJson'] ),
        'players' => []
    ];
    for ( $i = 0; $i < count( $results ); $i++ )
    {
        array_push( $game['players'], json_decode( $results[$i]['playerJson'] ) );
    }

    $connection = null;
    return $game;
}

function createGame( $game )
{
    $gameId = getGUID();
    $game = json_decode( $game );
    $stateJson = json_encode( $game->state );
    $mapJson   = json_encode( $game->map );
    $players  = $game->players; //should work as empty if no players are sent in

    $playerValues = "";
    for ( $i = 0; $i < count( $players ); $i++ )
    {
        $playerValues .= ( $i != 0 ) ? ", " : "";
        $playerValues .= "(:playerId$i, :userId$i, :gameId, 1, :factionId$i, :playerJson$i)";
    }
    $insertMeta    = "INSERT INTO meta   (id, playerCount, round, phase, subPhase, turn) VALUES (:gameId, :playerCount, :round, :phase, :subPhase, :turn)";
    $insertState   = "INSERT INTO state  (gameId, stateJson) VALUES (:gameId, :stateJson)";
    $insertMap     = "INSERT INTO map    (gameId, mapJson)   VALUES (:gameId, :mapJson)";
    $insertPlayers = "INSERT INTO player (id, userId, gameId, active, factionId, playerJson) VALUES $playerValues";

    $query =
        "$insertMeta;\n
         $insertState;\n
         $insertMap;\n
         $insertPlayers";

    $connection = getConnection();
    $statement = $connection->prepare( $query );
    $statement->bindParam(':gameId',      $gameId);
    $statement->bindParam(':playerCount', count($game->players));
    $statement->bindParam(':round',       $game->state->round);
    $statement->bindParam(':phase',       $game->state->phase);
    $statement->bindParam(':subPhase',    $game->state->subPhase);
    $statement->bindParam(':turn',        $game->state->turn);
    $statement->bindParam(':stateJson',   $stateJson);
    $statement->bindParam(':mapJson',     $mapJson);
    for ( $i = 0; $i < count( $players ); $i++ )
    {
        $player = $players[$i];
        $statement->bindParam(":playerId$i",   $player->id);
        $statement->bindParam(":userId$i",     $player->userId);
        $statement->bindParam(":factionId$i",  $player->factionId);
        $statement->bindParam(":playerJson$i", json_encode($player));
    }
    $statement->execute();

    $connection = null;
    return $gameId;
}

function updateGame( $gameId, $game )
{
    $game = json_decode( $game );
    $stateJson = json_encode( $game->state );
    $mapJson   = json_encode( $game->map );
    $players  = $game->players; //should work as empty if no players are sent in

    $updateMeta     = "UPDATE meta   SET round = :round, phase = :phase, subPhase = :subPhase, turn = :turn WHERE id = :gameId";
    $updateState    = "UPDATE state  SET stateJson = :stateJson WHERE gameId = :gameId";
    $updateMap      = "UPDATE map    SET mapJson = :mapJson     WHERE gameId = :gameId";

    $query =
        "$updateMeta;\n
         $updateState;\n
         $updateMap";

    $connection = getConnection();
    $statement = $connection->prepare( $query );
    $statement->bindParam(':gameId',      $gameId);
    $statement->bindParam(':round',       $game->state->round);
    $statement->bindParam(':phase',       $game->state->phase);
    $statement->bindParam(':subPhase',    $game->state->subPhase);
    $statement->bindParam(':turn',        $game->state->turn);
    $statement->bindParam(':stateJson',   $stateJson);
    $statement->bindParam(':mapJson',     $mapJson);
    $statement->execute();

    updatePlayers( $gameId, $players );

    $connection = null;
    return $gameId;
}

function updatePlayers( $gameId, $players )
{
    $playerActiveCase = "CASE WHEN id IN (";
    $playerJsonCase = "CASE ";
    for ( $i = 0; $i < count( $players ); $i++ )
    {
        $playerActiveCase .= ( $i != 0 ) ? "," : "";
        $playerActiveCase .= ":playerId$i";
        $playerJsonCase .= "WHEN id = :playerId$i THEN :playerJson$i ";
    }
    $playerJsonCase .= "END";
    $playerActiveCase .= ") THEN 1 ELSE 0 END";

    $query  = "UPDATE player SET active = ($playerActiveCase), playerJson = ($playerJsonCase) WHERE gameId = :gameId";

    $connection = getConnection();
    $statement = $connection->prepare( $query );
    $statement->bindParam(':gameId', $gameId);
    for ( $i = 0; $i < count( $players ); $i++ )
    {
        $player = $players[$i];
        $statement->bindParam(":playerId$i",   $player->id);
        $statement->bindParam(":playerJson$i", json_encode($player));
    }
    $statement->execute();

    $connection = null;
    return true;
}

function createUser( $userId, $email )
{
    $query = "INSERT INTO user ( id, email, active )
              VALUES ( :userId, :email, 1 ) ";
    $connection = getConnection();
    $statement = $connection->prepare( $query );
    $statement->bindParam(':userId', $userId);
    $statement->bindParam(':email',  $email);
    $statement->execute();

    $connection = null;
    return true;
}

function getUser( $email )
{
    $query = "SELECT id FROM user WHERE email = :email";
    $connection = getConnection();
    $statement = $connection->prepare( $query );
    $statement->bindParam(':email', $email);
    $statement->execute();

    $result = $statement->fetchColumn();

    $connection = null;
    return $result;
}

function getPlayer( $gameId, $userId )
{
    $query = "SELECT id FROM player WHERE gameId = :gameId AND userId = :userId";
    $connection = getConnection();
    $statement = $connection->prepare( $query );
    $statement->bindParam(':gameId', $gameId);
    $statement->bindParam(':userId', $userId);
    $statement->execute();

    $result = $statement->fetch();

    $connection = null;
    return $result;
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