function validateDimension( dimensionId, player ) {
    let isValid = false;
    if ( dimensionId === DIMENSIONS[SCIENCE].id ) {
        isValid = player.advancements.technologies.length === TECHNOLOGIES.length;
    }
    else if ( dimensionId === DIMENSIONS[FAITH].id ) {
        isValid = player.advancements.doctrines.length === DOCTRINES.length && player.religion;
    }
    else if ( dimensionId === DIMENSIONS[NATURE].id ) {
        isValid = player.advancements.gardens.length === GARDENS.length;
    }
    else if ( dimensionId === DIMENSIONS[WEALTH].id ) {
        isValid = player.advancements.auctions.length === AUCTIONS.length || player.advancements.auctionWins.length === AUCTION_WINS;
    }
    else if ( dimensionId === DIMENSIONS[CULTURE].id ) {
        isValid = player.initiatives.culturalTokens >= INITIATIVE_TOKENS_COUNT;
    }
    else if ( dimensionId === DIMENSIONS[POLITICS].id ) {
        isValid = player.initiatives.politicalTokens >= INITIATIVE_TOKENS_COUNT;
    }
    else if ( dimensionId === DIMENSIONS[CONQUEST].id ) {
        isValid = player.units.some( u => u.unitTypeId === UNIT_TYPES[GODHAND].id ) &&
            player.units.filter(     u => u.unitTypeId === UNIT_TYPES[ROBOT].id ).length  >= ROBOT_COUNT &&
            player.units.filter(     u => u.unitTypeId === UNIT_TYPES[REAPER].id ).length >= REAPER_COUNT &&
            player.units.some(       u => u.unitTypeId === UNIT_TYPES[HERO].id );
    }
    return isValid;
}