function validateReception( playerDetails, receptionDetails, isCurrentPlayer, displayToaster = true ) {
    let isValid = true;

    const advancementMax = hasTechnology( GLOBAL_NETWORKING, playerDetails ) ? GLOBAL_NETWORKING_ADVANCEMENT_MAX : MAX_ADVANCEMENTS;
    const cardMax = hasTechnology( GLOBAL_NETWORKING, playerDetails ) ? GLOBAL_NETWORKING_CARD_MAX : MAX_CARDS;
    UNIT_TYPES.forEach( ut => !receptionDetails.units.some( u => u.id === ut.id ) ? receptionDetails.units.push( {id: ut.id, count: 0} ) : null );

    if ( ( receptionDetails.advancements.technologies.length +
                receptionDetails.advancements.doctrines.length +
                receptionDetails.advancements.gardens.length +
                receptionDetails.advancements.auctions.length +
                playerDetails.turn.purchasedAdvancementCount )
            > advancementMax ) {
        displayToasterCheck( displayToaster, isCurrentPlayer ? `You cannot have over ${advancementMax} advancements` : `Player cannot have over ${advancementMax} advancements` );
        isValid = false;
    }
    else if ( ( receptionDetails.chaos.length + playerDetails.turn.purchasedCardCount ) > cardMax ) {
        displayToasterCheck( displayToaster, isCurrentPlayer ? `You cannot gain over ${cardMax} cards this turn` : `Player cannot gain over ${cardMax} cards` );
        isValid = false;
    }
    else if ( UNIT_TYPES.some( ut => ut.max && (playerDetails.units.filter( u => u.unitTypeId === ut.id ).length + receptionDetails.units.find( u => u.id === ut.id ).count) > ut.max ) ) {
        displayToasterCheck( displayToaster, isCurrentPlayer ? `You cannot that amount of each unit type` : `Player cannot have that amount of each unit type` );
        isValid = false;
    }

    return isValid;
}

function displayToasterCheck( displayToaster, message ) {
    if ( displayToaster ) {
        showToaster( message );
    }
}