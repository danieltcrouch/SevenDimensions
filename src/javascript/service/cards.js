/*** MARKET ***/


function performPurchasedCards( player, newCardIds ) {
    //
}


/*** ABILITIES ***/


function performAmnesia() {
    pickPlayers(
        false,
        false,
        function( response ) {
            if ( response ) {
                const player = getPlayer( response );
                const advancements = player.advancements.technologies.map( t => ({ id: t, type: "T" }) ).concat( player.advancements.doctrines.map( d => ({ id: d, type: "D" }) ) );
                showPicks(
                    "Amnesia",
                    `Choose an advancement to remove from ${player.username}`,
                    advancements.map( a => getAdvancement( a.id, (a.type==="T"?TECHNOLOGIES:DOCTRINES) ) ),
                    false,
                    false,
                    function( response ) {
                        if ( Number.isInteger( response ) ) {
                            const advancement = advancements[response];
                            remove( (advancement.type==="T"?player.advancements.technologies:player.advancements.doctrines), advancement.id );
                            remove( currentPlayer.cards.chaos, CHAOS[0].id );
                        }
                    }
                );
            }
        },
        getChaosPlayerVictims()
    );
}

function performAssimilation() {
    currentPlayer.special.assimilation = true;
    remove( currentPlayer.cards.chaos, CHAOS[1].id );
}

function performEpiphany() {
    receiveFreeAdvancements( 1 );
    displayUnassignedAdvancements();
    remove( currentPlayer.cards.chaos, CHAOS[29].id );
}

function performScourge() {
    currentPlayer.special.scourge = true;
    remove( currentPlayer.cards.chaos, CHAOS[78].id );
}

function performShutUp() {
    showBinaryChoice(
        "Shut Up",
        "You can block another player from playing Chaos cards this round or protect yourself from any players’s cards:",
        "Block",
        "Protect",
        function( response ) {
            if ( Number.isInteger(response) ) {
                if ( response === 0 ) {
                    pickPlayers(
                        false,
                        false,
                        function( response ) {
                            if ( response ) {
                                getPlayer( response ).special.shutUp = true;
                                remove( currentPlayer.cards.chaos, currentPlayer.cards.chaos.find( c => isShutUp( c ) ) );
                            }
                        },
                        getChaosPlayerVictims()
                    );
                }
                else {
                    currentPlayer.special.shutUpProtect = true;
                    remove( currentPlayer.cards.chaos, currentPlayer.cards.chaos.find( c => isShutUp( c ) ) );
                }
            }
        }
    );
}

function getChaosPlayerVictims() {
    return game.players.filter( p => !p.special.shutUpProtect );
}


/*** GENERAL ***/


function getChaosCardsAsync( playerIndex, count ) {
    let result = [];

    const playerCount = game.players.length;
    const theoryDeck = new Deck( CHAOS );
    const realDeck = Deck.getCurrentDeck( CHAOS, game.players.map( p => p.cards.chaos.map( c => c.id ) ) );

    //Cannot use getRandomCard() since phase is Async
    for ( let i = playerIndex; i < theoryDeck.getCount(); i + playerCount ) {
        const card = theoryDeck.getCardByIndex( i );
        if ( realDeck.hasCard( card ) ) {
            result.push( card.id );
        }
        if ( result.length === count ) {
            break;
        }
    }

    if ( result.length < count ) {
        result.push( realDeck.getRandomCards( count - result.length ).map( c => c.id ) );
    }

    return result;
}