<?php

function getGame( $gameId )
{
//    $query = "SELECT
//                  m.id, m.state, m.title, m.image, m.help, m.type, m.mode,
//                  t.frequency, t.frequency_point, t.scheduled_close, t.active_id,
//                  r.winners
//              FROM meta m
//                  JOIN timing t ON m.id = t.meta_id
//                  LEFT OUTER JOIN results r ON m.id = r.meta_id
//              WHERE m.id = :surveyId ";
//    $connection = getConnection();
//    $statement = $connection->prepare( $query );
//    $statement->bindParam(':surveyId', $surveyId);
//    $statement->execute();
//
//    $result = $statement->fetch();
//    $choices = getChoices( $surveyId );
//    $currentVotes = getCurrentVotes( $surveyId );
//
//    $surveyInfo = [
//        'state'   => $result['state'],
//        'title'   => $result['title'],
//        'image'   => $result['image'],
//        'help'    => $result['help'],
//        'type'    => $result['type'],
//        'mode'    => $result['mode'],
//        'winners' => $result['winners'],
//        'timing'  => [
//            'frequency'      => $result['frequency'],
//            'frequencyPoint' => $result['frequency_point'],
//            'scheduledClose' => $result['scheduled_close'],
//            'activeId'       => $result['active_id']
//        ],
//        'currentVotes' => $currentVotes,
//        'choices'      => $choices
//    ];
//
//    $connection = null;
//    return $surveyInfo;
}

//user
    //id
    //creation
    //email
    //active
//meta [game]
    //id
    //playerCount
    //ambassador
    //round
    //phase
    //subPhase
    //turn
    //event
    //office
    //disaster
//map
    //gameId
    //tileId
    //tileType
    //value
    //resources
//player
    //id
    //userId
    //gameId
    //factionId
    //warBucks
    //resource1
    //resource2
    //resource3
    //politicalTokens
    //culturalTokens
    //purchasedAdvancement
    //purchasedCard
    //auctionBid
    //hasReaped
    //highPriestVictim
//playerEnums [bits]
    //playerId
    //technologies
    //doctrines
    //gardens
    //auctions
    //auctionWins
    //chaos
    //offices
    //dimensions
    //wonders
//playerMap
    //playerId
    //tileId
    //district
    //politicalActive [list of other tiles; no need to store count ("stored" by subtracting from tokens on player table)]
    //culturalActive [reaper count]
    //religion
    //apostle
    //reaper
    //boomer
    //speedster
    //juggernaut
    //robot
    //godhand
    //hero

function createGame( $game )
{
//    $surveyId = getGUID();
//    $survey = json_decode( $survey );
//    $choices = $survey->choices;
//    $state = "ready";
//    $activeId = null;
//    $closeTime = getNullValue($survey->timing->scheduledClose);
//
//    $choiceValues = "";
//    for ( $i = 0; $i < sizeof( $choices ); $i++ )
//    {
//        $choiceValues .= ( $i != 0 ) ? ", " : "";
//        $choiceValues .= "(:surveyId, :choiceId$i, :choiceName$i, :choiceImage$i, :choiceLink$i)";
//    }
//    $insertMeta = "INSERT INTO meta (id, state, title, image, help, type, mode) VALUES (:surveyId, :state, :title, :image, :help, :type, :mode)";
//    $insertTiming = "INSERT INTO timing (meta_id, frequency, frequency_point, scheduled_close, active_id) VALUES (:surveyId, :frequency, :frequencyPoint, :scheduledClose, :activeId)";
//    $insertChoices = "INSERT INTO choices (meta_id, id, name, image, link) VALUES $choiceValues";
//
//    $query =
//        "$insertMeta;\n
//         $insertTiming;\n
//         $insertChoices";
//
//    $connection = getConnection();
//    $statement = $connection->prepare( $query );
//    $statement->bindParam(':surveyId',       $surveyId);
//    $statement->bindParam(':state',          $state);
//    $statement->bindParam(':title',          $survey->title);
//    $statement->bindParam(':image',          $survey->image);
//    $statement->bindParam(':help',           $survey->help);
//    $statement->bindParam(':type',           $survey->type);
//    $statement->bindParam(':mode',           $survey->mode);
//    $statement->bindParam(':frequency',      $survey->timing->frequency);
//    $statement->bindParam(':frequencyPoint', $survey->timing->frequencyPoint);
//    $statement->bindParam(':scheduledClose', $closeTime);
//    $statement->bindParam(':activeId',       $activeId);
//    for ( $i = 0; $i < sizeof( $choices ); $i++ )
//    {
//        $choice = $choices[$i];
//        $statement->bindParam(":choiceId$i",    $choice->id);
//        $statement->bindParam(":choiceName$i",  $choice->name);
//        $statement->bindParam(":choiceImage$i", $choice->image);
//        $statement->bindParam(":choiceLink$i",  $choice->link);
//    }
//    $statement->execute();
//
//    $connection = null;
//    return $surveyId;
}

function getUser( $email )
{
    $query = "SELECT id FROM user WHERE email = :email ";
    $connection = getConnection();
    $statement = $connection->prepare( $query );
    $statement->bindParam(':email', $email);
    $statement->execute();

    $result = $statement->fetch();

    $connection = null;
    return $result;
}

function saveUser( $userId, $email )
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