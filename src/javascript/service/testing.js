const TEST_GAME_ID = "00000000000000000000000000000000";

const TEST_USERS = [
    { id: "00000000000000000000000000000001", username: "daniel" },
    { id: "00000000000000000000000000000002", username: "michael" },
    { id: "00000000000000000000000000000003", username: "stephen" },
    { id: "00000000000000000000000000000004", username: "lauren" },
    { id: "00000000000000000000000000000005", username: "tina" },
    { id: "00000000000000000000000000000006", username: "jimmy" }
];

function readTestFile( callbackFunction ) {
    //todo 11 - move this functionality (js and php) to Common
    postCallEncoded(
        "php/controller.php",
        {
            action:   "readLocalFile",
            fileName: "../resources/test-game.txt"
        },
        function ( response ) {
            response = jsonParse( response );
            if ( !response || response.length === 0 ) {
                callbackFunction( JSON.stringify( getNewGame() ) );
            }
            else {
                //if file has contents, then create scenario game
            }
        }
    );
}

function getNewGame( testPlayers = TEST_USERS ) {
    const newMap = generateNewMap( testPlayers.length );
    const newPlayers = generateNewPlayers( testPlayers );
    return {
        state: {
            ambassador: 0,
            round: 0,
            phase: 0,
            subPhase: 0,
            turn: 0,
            event: 0,
            events: {
                office: null,
                disaster: null
            }
        },
        map: newMap,
        players: newPlayers
    };
}

function getScenarioGame( testPlayers = TEST_USERS ) {
    let game = getNewGame( testPlayers );

    game.state.phase = 1;
    game.state.turn = 1;

    const player = game.players[0];
    const capitalTileId = game.players[0].districts.capital;
    const adjacentTileId = getRelevantAdjacentHexes( getHexFromId( capitalTileId ) )[0].id;
    player.dimensions.push( {id: DIMENSIONS[CULTURE].id, wonderTileId: game.players[0].districts.capital} );
    player.initiatives.politicalActive.push( {from: capitalTileId, to: adjacentTileId} );
    player.initiatives.culturalActive.push( {tileId: capitalTileId, reaperCount: 5} ); //todo 5 - default reaper count should be a constant somewhere

    return game;
}

function generateNewPlayers( testPlayers ) {
    if ( !testPlayers[0].factionId ) {
        const randomFactionIds = FACTIONS.map( f => f.id ).sort( () => 0.5 - Math.random() );
        testPlayers.forEach( (p,index) => p.factionId = randomFactionIds[index] );
    }
    if ( !testPlayers[0].tileId ) {
        const tileIds = getCapitalHexes( testPlayers.length );
        testPlayers.forEach( (p,index) => p.tileId = tileIds[index] );
    }

    return testPlayers.map(
        p => {
            const faction = getFaction( p.factionId );
            return {
                id: p.id,
                username: p.username,
                factionId: faction.id,
                warBucks: faction.startingSupplies.warBucks,
                resources: [], //[{id: "1", count: 2}]
                advancements: {
                    technologies: faction.startingSupplies.advancements.technologies.slice(),
                    doctrines: faction.startingSupplies.advancements.doctrines.slice(),
                    gardens: faction.startingSupplies.advancements.gardens.slice(),
                    auctions: faction.startingSupplies.advancements.auctions.slice(),
                    auctionWins: [], //["1","2"]
                },
                initiatives: {
                    politicalTokens: faction.startingSupplies.politicalTokens,
                    culturalTokens: faction.startingSupplies.culturalTokens,
                    politicalActive: [], //see getScenarioGame
                    culturalActive: [], //see getScenarioGame
                },
                cards: {
                    chaos: Deck.getRandomCards( CHAOS, faction.startingSupplies.cards ).map( c => c.id ),
                    offices: [], //["1"
                },
                units: faction.startingSupplies.units.slice().map( u => ({ ...u, tileId: p.tileId }) ).concat( [{ id: UNIT_TYPES[HERO].id, count: 1, tileId: p.tileId}] ),
                districts: {
                    capital: p.tileId,
                    tileIds: [p.tileId]
                },
                dimensions: [], //see getScenarioGame
                religion: null, //{id: RELIGIONS[0].id, tileIds: []}
                turn: {
                    purchasedAdvancementCount: 0,
                    purchasedCardCount: 0,
                    auctionBid: null, //WB value (0 if passed)
                    hasReaped: false
                },
                selects: {
                    highPriestVictim: null //playerId
                }
            };
        }
    );
}

function initializeTestGame( gameData ) {
    postCallEncoded(
        "php/controller.php",
        {
            action:    "updateGame",
            userId:    testUserId,
            gameId:    gameId,
            game:      gameData
        },
        function( response ) {},
        function( error ) {} );
}