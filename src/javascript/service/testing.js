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
    //todo 5 - move this functionality (js and php) to Common
    //todo X - divide testing and "setup" code
    postCallEncoded(
        "php/main-controller.php",
        {
            action:   "readLocalFile",
            fileName: "../resources/test-game.txt"
        },
        function ( response ) {
            response = jsonParse( response );
            let game = ( !response || response.length === 0 ) ? getNewGame() : getScenarioGame( response );
            initializeTestGame( game, callbackFunction );
        }
    );
}

function getScenarioGame( fileScenario ) {
    const scenarioString = fileScenario.join('');
    return jsonParse( scenarioString );
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
                disaster: null,
                marsStrength: null,
                shortage: false,
                inflation: false
            },
            chaosDiscard: [],
            winners: []
        },
        board: newMap,
        players: newPlayers
    };
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

    const chaosDeck = new Deck( CHAOS );

    return testPlayers.map(
        p => {
            const faction = getFaction( p.factionId );
            const chaosCards = chaosDeck.getRandomCards( faction.startingSupplies.cards ).map( c => c.id );
            const religion = faction.startingSupplies.religion ? { id: faction.startingSupplies.religion.id, tileIds: [p.tileId] } : null;
            let units = [ new Unit( getRandomUnitId(), UNIT_TYPES[HERO].id, p.tileId ) ];
            for ( let i = 0; i < faction.startingSupplies.units.length; i++ ) {
                const unitStack = faction.startingSupplies.units[i];
                for ( let j = 0; j < unitStack.count; j++ ) {
                    units.push( new Unit( getRandomUnitId(), unitStack.unitTypeId, p.tileId ) );
                }
            }

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
                    politicalActive: [], //{from: tileId, to: tileId}
                    culturalActive: [], //{tileId: tileId, reaperCount: 0}
                },
                cards: {
                    chaos: chaosCards,
                    chaosPlayed: [],
                    offices: [], //["1"]
                },
                units: units,
                districts: {
                    capital: p.tileId,
                    tileIds: [p.tileId]
                },
                dimensions: [], //{id: null, wonderTileId: null}
                religion: religion,
                turn: {
                    hasSubmitted: false,
                    purchasedAdvancementCount: 0,
                    purchasedCardCount: 0,
                    auctionBid: null, //WB value (0 if passed)
                    hasReaped: false,
                    hasConvened: false
                },
                special: {
                    shutUp: false,
                    shutUpProtect: false,
                    votePlayerId: null,
                    highPriestReward: false,
                    highPriestVictim: false,
                    gambitBet: 0,
                    insurrection: false,
                    disbandedUnits: [],
                    assimilation: false,
                    scourge: false,
                    free: {
                        technologiesOrDoctrines: 0,
                        initiativeTokens: 0
                    }
                }
            };
        }
    );
}

function initializeTestGame( gameData, callbackFunction ) {
    gameData = JSON.stringify( gameData );
    postCallEncoded(
        "php/main-controller.php",
        {
            action:    "updateGame",
            userId:    userId,
            gameId:    TEST_GAME_ID,
            game:      gameData
        },
        function( response ) {
            callbackFunction( gameData );
        },
        function( error ) {} );
}