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