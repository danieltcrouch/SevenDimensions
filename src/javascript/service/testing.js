const TEST_PLAYERS = [
    { id: "001", username: "daniel" },
    { id: "002", username: "michael" },
    { id: "003", username: "stephen" }
];

function getNewGame( testPlayers = TEST_PLAYERS ) {
    const newMap = generateNewMap( testPlayers.length );
    const newPlayers = generateNewPlayers( testPlayers,  );
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

function getInProgressGame( testPlayers = TEST_PLAYERS ) {
    let game = getNewGame( testPlayers );

    game.state.phase = 1;
    game.state.turn = 1;

    return game;
}

function generateNewPlayers( testPlayers ) {
    if ( !testPlayers[0].factionId ) {
        const randomFactionIds = Array( testPlayers.length ).fill().map( (n, index) => FACTIONS[index].id ).sort( () => 0.5 - Math.random() ).slice( 0, testPlayers.length );
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
                resources: [],
                advancements: {
                    technologies: faction.startingSupplies.advancements.technologies.slice(),
                    doctrines: faction.startingSupplies.advancements.doctrines.slice(),
                    gardens: faction.startingSupplies.advancements.gardens.slice(),
                    auctions: faction.startingSupplies.advancements.auctions.slice(),
                    auctionWins: [],
                    auctionBid: null,
                    purchasedCount: 0
                },
                initiatives: {
                    politicalTokens: faction.startingSupplies.politicalTokens,
                    culturalTokens: faction.startingSupplies.culturalTokens,
                    politicalActive: [],
                    culturalActive: [],
                },
                cards: {
                    chaos: Deck.getRandomCards( CHAOS, faction.startingSupplies.cards ).map( c => c.id ),
                    offices: [],
                    purchasedCount: 0
                },
                units: faction.startingSupplies.units.slice().map( u => ({ ...u, tileId: p.tileId }) ).concat( [{ id: UNIT_TYPES[HERO].id, count: 1, tileId: p.tileId}] ),
                districts: {
                    capital: p.tileId,
                    tileIds: [p.tileId]
                },
                dimensions: [],
                religion: null,
                turn: {
                    hasReaped: false
                },
                selects: {
                    highPriestVictim: null
                }

            };
        }
    );
}