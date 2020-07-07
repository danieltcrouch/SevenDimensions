/*** MARKET ***/


function performPurchasedAdvancements( player, newTechnologyIds, newDoctrineIds, newGardenIds, newAuctionIds ) {
    const hasSecularism = hasDoctrine( SECULARISM, player ) && !newDoctrineIds.includes( DOCTRINES[SECULARISM].id );

    const totalAdvancementCount = newTechnologyIds.concat( newDoctrineIds ).concat( newGardenIds ).concat( newAuctionIds ).length;
    if ( hasSecularism && totalAdvancementCount ) {
        receiveFreeAdvancements( totalAdvancementCount, player );
    }

    if ( newAuctionIds.includes( AUCTIONS[SUPER_DELEGATES].id ) ) {
        player.special.free.initiativeTokens += SUPER_DELEGATES_VALUE;
        showToaster( "Free advancements available" );
    }

    if ( newAuctionIds.includes( AUCTIONS[THINK_TANK].id ) ) {
        receiveFreeAdvancements( THINK_TANK_VALUE, player );
        const newCardIds = Deck.getCurrentDeck( CHAOS, game.players.map( p => p.cards.chaos ) ).getRandomCards( THINK_TANK_VALUE ).map( c => c.id );
        player.cards.chaos = player.cards.chaos.concat( newCardIds );
    }
}

function hasAdvancementChoices( player ) {
    return player.advancements.technologies.length !== TECHNOLOGIES.length && player.advancements.technologies.length !== DOCTRINES.length;
}

function receiveFreeAdvancements( advancementCount, player = currentPlayer ) {
    if ( hasAdvancementChoices( player ) ) {
        player.special.free.technologiesOrDoctrines += advancementCount;
        showToaster( "Free advancements available" );
    }
    else {
        if ( player.advancements.technologies.length !== TECHNOLOGIES.length ) {
            const remainingTechCount = TECHNOLOGIES.length - player.advancements.technologies.length;
            player.advancements.technologies.push( TECHNOLOGIES.filter( t => !player.advancements.technologies.includes( t.id ) ).slice( 0, Math.min( remainingTechCount, advancementCount ) ).map( t => t.id ) );
        }
        else {
            const remainingDoctrineCount = DOCTRINES.length - player.advancements.doctrines.length;
            player.advancements.doctrines.push( DOCTRINES.filter( d => !player.advancements.doctrines.includes( d.id ) ).slice( 0, Math.min( remainingDoctrineCount, advancementCount ) ).map( d => d.id ) );
        }
        showToaster( "Free advancements received." );
    }
}

function chooseFreeAdvancements( player = currentPlayer ) {
    //todo 7 - most of this function needs to be redone with better modal interface
    const advancementCount = player.special.free.technologiesOrDoctrines;
    if ( hasAdvancementChoices( player ) ) {
        if ( advancementCount === 1 ) {
            const nextTechnology = TECHNOLOGIES.filter( t => !player.advancements.technologies.includes( t.id ) ).get( 0 );
            const nextDoctrine = DOCTRINES.filter( t => !player.advancements.doctrines.includes( t.id ) ).get( 0 );
            showPicks(
                "Free Advancement",
                "Choose a Technology or Doctrine:"
                [`Technology (${nextTechnology.name})`, `Doctrine (${nextDoctrine.name})`],
                false,
                false,
                function( result ) {
                    if ( Number.isInteger( result ) ) {
                        if ( result === 0 ) {
                            player.advancements.technologies.push( nextTechnology.id );
                        }
                        else {
                            player.advancements.doctrines.push( nextDoctrine.id );
                        }
                        player.special.free.technologiesOrDoctrines = 0;
                    }
                }
            );
        }
        else if ( advancementCount > 1 ) {
            const choices = TECHNOLOGIES.filter( t => !player.advancements.technologies.includes( t.id ) ).slice( 0, advancementCount );
            showPicks(
                "Free Advancements",
                `You have ${advancementCount} free advancements. Choose the furthest Technology you would like to research. All other advancements will be applied toward Doctrines or more Technologies if no Doctrines remain.`,
                choices.map( t => t.name ),
                false,
                false,
                function( result ) {
                    if ( Number.isInteger( result ) ) {
                        const chosenTechnologies = choices.slice( 0, result );
                        player.advancements.technologies.push( chosenTechnologies.map( t => t.id ) );
                        let remainingCount = advancementCount - chosenTechnologies.length
                        if ( remainingCount ) {
                            const remainingDoctrineCount = DOCTRINES.length - player.advancements.doctrines.length;
                            const doctrineToReceiveCount = Math.min( remainingDoctrineCount, advancementCount );
                            player.advancements.doctrines.push( DOCTRINES.filter( d => !player.advancements.doctrines.includes( d.id ) ).slice( 0, doctrineToReceiveCount ).map( d => d.id ) );
                            remainingCount -= doctrineToReceiveCount;
                        }
                        if ( remainingCount ) {
                            const remainingTechCount = TECHNOLOGIES.length - player.advancements.technologies.length;
                            player.advancements.technologies.push( TECHNOLOGIES.filter( t => !player.advancements.technologies.includes( t.id ) ).slice( 0, Math.min( remainingTechCount, remainingCount ) ).map( t => t.id ) );
                        }
                        player.special.free.technologiesOrDoctrines = 0;
                    }
                }
            );
        }
    }
}

function chooseFreeInitiatives( player = currentPlayer ) {
    const tokenCount = player.special.free.initiativeTokens;
    showBinaryChoice(
        "Free Initiative Tokens",
        `You have ${tokenCount} free initiative token(s). Choose the type you would like:`,
        "Culture",
        "Politics",
        function( response ) {
            if ( Number.isInteger(response) ) {
                if ( response === 0 ) {
                    currentPlayer.initiatives.culturalTokens += tokenCount;
                }
                else {
                    currentPlayer.initiatives.politicalTokens += tokenCount;
                }
                player.special.free.initiativeTokens = 0;
            }
        }
    );
}


/*** ABILITIES ***/


function performInquisition() {
    pickPlayers(
        false,
        false,
        function( response ) {
            if ( response ) {
                //todo 2 - Liquify
            }
        },
        game.players.filter( p => !hasTechnology( CENTRALIZED_CURRICULUM, p ) )
    );
}

function getEdenCount( player = currentPlayer ) {
    return hasGarden( GARDEN_OF_EDEN, player ) ? player.districts.tileIds.length : 0;
}