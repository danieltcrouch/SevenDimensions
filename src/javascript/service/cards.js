/*** MARKET ***/


function performPurchasedCards( player, newCardIds ) {
    if ( newCardIds.includes( CHAOS[28] ) ) {
        const bonusCardIds = Deck.getCurrentDeck( CHAOS, game.players.map( p => p.cards.chaos ) ).getRandomCards( DUALISM_VALUE ).map( c => c.id );
        player.cards.chaos = player.cards.chaos.concat( bonusCardIds );
        remove( player.cards.chaos, CHAOS[28].id );
        showToaster( "Your Dualism card has been replaced with 2 new cards." );
    }
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

function performBenefactor() {
    currentPlayer.special.benefactor = true;
    remove( currentPlayer.cards.chaos, CHAOS[2].id );
}

function performBounty() {
    pickPlayers(
        false,
        false,
        function( response ) {
            if ( response ) {
                game.state.special.bounty = response;
                remove( currentPlayer.cards.chaos, CHAOS[3].id );
            }
        },
        getChaosPlayerVictims()
    );
}

function performBulldozer() {
    currentPlayer.special.bulldozer = true;
    remove( currentPlayer.cards.chaos, CHAOS[4].id );
}

function performCease() {
    currentPlayer.special.cease = true;
    remove( currentPlayer.cards.chaos, CHAOS[7].id );
}

function performChaos() {
    const players = getChaosPlayerVictims();
    for ( let i = 0; i < players.length; i++ ) {
        const nextIndex = (i+1 < players.length) ? i+1 : 0;
        players[nextIndex].cards.chaos = players[i].cards.chaos;
    }
    remove( currentPlayer.cards.chaos, CHAOS[8].id );
}

function performChurch() {
    //todo 3 - should I report when another player does something to you on their turn
    const otherPlayerIds = getChaosPlayerVictims().map( p => p.id ).filter( id => id !== currentPlayer.id );
    if ( currentPlayer.religion ) {
        currentPlayer.religion.tileIds.forEach( t => {
            const player = game.players.find( p => p.districts.tileIds.includes( t ) );
            if ( otherPlayerIds.includes( player.id ) ) {
                const warBucks = Math.min( player.warBucks, CHURCH_AND_STATE_VALUE );
                player.warBucks -= warBucks;
                currentPlayer.warBucks += warBucks;
            }
        });
    }
    remove( currentPlayer.cards.chaos, CHAOS[9].id );
}

function performClone() {
    let clones = [];
    currentPlayer.units.forEach( u => {
        if ( ![UNIT_TYPES[HEROES].id, UNIT_TYPES[GODHAND].id, UNIT_TYPES[ROBOT].id].includes( u.unitTypeId ) ) {
            clones.push( new Unit( getRandomUnitId(), u.unitTypeId, u.tileId ) );
        }
    } );
    currentPlayer.units = currentPlayer.units.concat( clones );
    remove( currentPlayer.cards.chaos, CHAOS[10].id );
}

function performCopy() {
    showPicks(
        CHAOS[11].name,
        CHAOS[11].description,
        FACTIONS.map( f => f.name ),
        false,
        false,
        function( response ) {
            if ( Number.isInteger( response ) ) {
                currentPlayer.special.copy = currentPlayer.factionId;
                currentPlayer.factionId = FACTIONS[response].id;
                remove( currentPlayer.cards.chaos, CHAOS[11].id );
            }
        }
    );
}

function performCoup() {
    pickPlayers(
        false,
        false,
        function( response ) {
            if ( response ) {
                const player = getPlayer( response );
                player.units.filter( u => u.tileId === player.districts.capital ).forEach( u => removeUnit( u, player ) );
                remove( currentPlayer.cards.chaos, CHAOS[12].id );
            }
        },
        getChaosPlayerVictims()
    );
}

function performDDay() {
    setSpecialAction(
        function( tileId ) { return !isImpassibleTile( tileId, false, false ); },
        function( tileId ) {
            game.state.special.dDay = tileId;
            remove( currentPlayer.cards.chaos, CHAOS[15].id );
        }
    );
}

function performDark() {
    pickPlayers(
        false,
        false,
        function( response ) {
            if ( response ) {
                getPlayer( response ).special.dark = true;
                remove( currentPlayer.cards.chaos, CHAOS[16].id );
            }
        },
        getChaosPlayerVictims()
    );
}

function performDefector() {
    getChaosPlayerVictims().forEach( p => {
        const maxUnitTypeId = p.units.reduce( (max, u) => !max ? u.unitTypeId : ( (!isSpecialUnit( u ) && getUnitType( u.unitTypeId ).cost > getUnitType( max ).cost) ? u.unitTypeId : max ) );
        if ( maxUnitTypeId ) {
            const enemyTiles = getTilesByThreat( p.id );
            const maxUnit = p.units.filter( u => u.unitTypeId === maxUnitTypeId ).sort( (u1, u2) => enemyTiles.findIndex( u1.tileId ) - enemyTiles.findIndex( u2.tileId ) ).get( 0 );
            removeUnit( maxUnit, p, true );
            maxUnit.tileId = DEFAULT_TILE;
            addUnit( maxUnit, currentPlayer, false );
        }
    } );
    displayUnassignedUnits();
    remove( currentPlayer.cards.chaos, CHAOS[17].id );
}

function performDeserter() {
    pickPlayers(
        true,
        false,
        function( response ) {
            if ( response.length && response.length <= DESERTER_VALUE && response.length > 0 ) {
                const allEnemyTiles = getTilesByThreat();
                const enemies = response.map( p => ({
                    player: getPlayer( p ),
                    tiles:  getTilesByThreat( p ),
                    count:  null
                }) );
                enemies.forEach( p => { p.count = Math.min( Math.floor(DESERTER_VALUE/enemies.length), p.player.units.length ) } );
                const currentCount = enemies.map( p => p.count ).reduce((a,b) => a + b, 0);
                if ( currentCount !== DESERTER_VALUE ) {
                    const threatsSorted = enemies.filter( p => p.player.units.length >= DESERTER_VALUE ).sort( (p1, p2) => allEnemyTiles.findIndex( p1.tiles.get( 0 ) ) - allEnemyTiles.findIndex( p2.tiles.get( 0 ) ) );
                    if ( threatsSorted.length ) {
                        threatsSorted.get( 0 ).count += ( DESERTER_VALUE - currentCount );
                    }
                }

                enemies.forEach( p => {
                    for ( let i = 0; i < p.count; i++ ) {
                        const nextTileWithUnits = p.tiles.find( t => p.player.units.filter( u => u.tileId === t && !isSpecialUnit( u ) ).length );
                        const maxUnit = p.units.filter( u => u.tileId === nextTileWithUnits && !isSpecialUnit( u ) ).sort( (u1, u2) => getUnitType(u2.unitTypeId).cost - getUnitType(u1.unitTypeId).cost ).get( 0 );
                        removeUnit( maxUnit, p, true );
                    }
                } );
                remove( currentPlayer.cards.chaos, CHAOS[18].id );
            }
            else {
                showToaster( "Must choose up to three players" );
            }
        },
        getChaosPlayerVictims().filter( p => p.player.units.length ),
        "Choose up to three players: "
    );
}

function performDitto() {
    const cards = Deck.getCurrentDeck( CHAOS, game.players.map( p => p.cards.chaos ) ).cards;
    showPicks(
        CHAOS[20].name,
        CHAOS[20].description,
        cards.map( c => c.name ),
        false,
        false,
        function( response ) {
            if ( Number.isInteger( response ) ) {
                currentPlayer.cards.chaos.push( cards[response].id );
                remove( currentPlayer.cards.chaos, currentPlayer.cards.chaos.find( c => isDitto(c) ).id );
            }
        }
    );
}

function performDiversify() {
    if ( currentPlayer.resources.filter( r => r.count ).length === RESOURCES.length ) {
        currentPlayer.resources.forEach( r => r.count-- );
        currentPlayer.warBucks += DIVERSIFY_VALUE;
        remove( currentPlayer.cards.chaos, CHAOS[25].id );
    }
    else {
        showToaster( "Must have one of each resource type" );
    }
}

function performDoubleDown() {
    currentPlayer.special.doubleDown = true;
    remove( currentPlayer.cards.chaos, CHAOS[27].id );
}

function performDoubleDownPostHarvest() {
    currentPlayer.warBucks += calculateWarBuckHarvestReward();
    remove( currentPlayer.cards.chaos, CHAOS[27].id );
}

function performEpiphany() {
    receiveFreeAdvancements( 1 );
    displayUnassignedAdvancements();
    remove( currentPlayer.cards.chaos, CHAOS[29].id );
}

function performEspionage() {
    pickPlayers(
        false,
        false,
        function( response ) {
            if ( response ) {
                const player = getPlayer( response );
                const randomIndex = player.cards.chaos.findIndex( c => !isHeavensGate( c ) );
                const stolenCard = player.cards.chaos.splice(randomIndex, 1)[0];
                currentPlayer.cards.chaos.push( stolenCard );
                remove( currentPlayer.cards.chaos, CHAOS[30].id );
            }
        },
        getChaosPlayerVictims().filter( p => p.cards.chaos.some( c => !isHeavensGate( c ) ) )
    );
}

function performExclusive() {
    game.state.special.exclusiveCardClub = currentPlayer.id;
    remove( currentPlayer.cards.chaos, CHAOS[33].id );
}

function performExhaust() {
    setSpecialAction(
        function( tileId ) { return hasEnemyUnits( tileId, true ); },
        function( tileId ) {
            getPlayer( getEnemyPlayer( tileId, true ).id ).special.exhaust = tileId;
            remove( currentPlayer.cards.chaos, CHAOS[34].id );
        }
    );
}

function performFamine() {
    game.players.forEach( p => {
        p.resources.forEach( r => r.count = 0 );
    } );
    remove( currentPlayer.cards.chaos, CHAOS[35].id );
}

function performFTerms() {
    currentPlayer.special.friendlyTerms = true;
    remove( currentPlayer.cards.chaos, CHAOS[38].id );
}

function performGamebreaker() {
    showPicks(
        CHAOS[40].name,
        CHAOS[40].description,
        EVENTS.map( e => e.name ),
        false,
        false,
        function( response ) {
            if ( Number.isInteger( response ) ) {
                game.state.event = response;
                remove( currentPlayer.cards.chaos, CHAOS[40].id );
            }
        }
    );
}

function performGideon() {
    setSpecialAction(
        function( attackTileId ) { return hasEnemyUnits( attackTileId ); },
        function( attackTileId ) {
            setSpecialAction(
                function( defendTileId ) { return game.players.some( p => p.units.some( u => u.tileId === defendTileId ) ); },
                function( defendTileId ) {
                    remove( currentPlayer.cards.chaos, CHAOS[42].id );
                    launchBattle( defendTileId, attackTileId, getPlayer( getEnemyPlayer( attackTileId ).id ) ); //todo 3 - will this save after the battle?
                }
            );
            showToaster( "Choose a defender." );
        }
    );
    showToaster( "Choose an attacker." );
}

function performGiveTired() {
    pickPlayers(
        false,
        false,
        function( response ) {
            if ( response ) {
                const player = getPlayer( response );
                showBinaryChoice(
                    "Initiative Tokens",
                    "Choose the type you would like:",
                    "Culture",
                    "Politics",
                    function( response ) {
                        if ( Number.isInteger(response) ) {
                            if ( response === 0 ) {
                                const tokenCount = Math.min( player.initiatives.culturalTokens, GIVE_TIRED_VALUE );
                                player.initiatives.culturalTokens -= tokenCount;
                                currentPlayer.initiatives.culturalTokens += tokenCount;
                            }
                            else {
                                const tokenCount = Math.min( player.initiatives.politicalActive, GIVE_TIRED_VALUE );
                                player.initiatives.politicalActive -= tokenCount;
                                currentPlayer.initiatives.politicalTokens += tokenCount;
                            }
                            remove( currentPlayer.cards.chaos, CHAOS[43].id );
                        }
                    }
                );
            }
        },
        getChaosPlayerVictims().filter( p => p.initiatives.culturalTokens || p.initiatives.politicalTokens )
    );
}

function performGJail() {
    pickPlayers(
        false,
        false,
        function( response ) {
            if ( response ) {
                getPlayer( response ).special.jail = true;
                remove( currentPlayer.cards.chaos, CHAOS[44].id );
            }
        },
        getChaosPlayerVictims()
    );
}

function performGAwakening() {
    const activeReligions = game.players.filter( p => p.religion ).map( p => p.religion.id );
    showPicks(
        CHAOS[45].name,
        "Choose a religion to spread:",
        activeReligions.map( r => getReligion( r ).name ),
        false,
        false,
        function( religion ) {
            if ( Number.isInteger( religion ) ) {
                const religionPlayer = game.players.find( p => p.religion && p.religion.id === activeReligions[religion] );
                pickPlayers(
                    true,
                    false,
                    function( response ) {
                        if ( response.length && response.length <= GREAT_AWAKENING_VALUE && response.length > 0 ) {
                            const enemies = response.map( p => ({
                                player: getPlayer( p ),
                                count:  null
                            }) );
                            enemies.forEach( p => {
                                const availableDistricts = p.districts.tileIds.filter( t => !religionPlayer.religion.tileIds.some( t ) ).length;
                                p.count = Math.min( Math.floor(GREAT_AWAKENING_VALUE/enemies.length), availableDistricts );
                            } );
                            const currentCount = enemies.map( p => p.count ).reduce((a,b) => a + b, 0);
                            if ( currentCount !== GREAT_AWAKENING_VALUE ) {
                                enemies.get( 0 ).count += ( DESERTER_VALUE - currentCount );
                            }

                            enemies.forEach( p => {
                                for ( let i = 0; i < p.count; i++ ) {
                                    const availableDistrict = p.districts.tileIds.filter( t => !religionPlayer.religion.tileIds.some( t ) ).get( 0 );
                                    addReligion( religionPlayer, availableDistrict );
                                }
                            } );
                            remove( currentPlayer.cards.chaos, CHAOS[45].id );
                        }
                        else {
                            showToaster( "Must choose up to three players" );
                        }
                    },
                    getChaosPlayerVictims().filter( p => p.player.districts.tileIds.some( t => !religionPlayer.religion.tileIds.some( t ) ) ),
                    "Choose up to three players: "
                );
            }
        }
    );
}

function performHGod() {
    addUnit( new Unit( getRandomUnitId(), UNIT_TYPES[GODHAND].id, DEFAULT_TILE ), currentPlayer );
    remove( currentPlayer.cards.chaos, CHAOS[46].id );
}

function performIdentity() {
    pickPlayers(
        false,
        false,
        function( response ) {
            if ( response ) {
                const player = getPlayer( response );
                player.special.identity = player.factionId;
                player.factionId = null;
                remove( currentPlayer.cards.chaos, CHAOS[55].id );
            }
        },
        getChaosPlayerVictims()
    );
}

function performInspired() {
    showBinaryChoice(
        "Initiative Tokens",
        "Choose the type you would like:",
        "Culture",
        "Politics",
        function( response ) {
            if ( Number.isInteger(response) ) {
                if ( response === 0 ) {
                    currentPlayer.initiatives.culturalTokens += INSPIRED_LEADERSHIP_VALUE;
                }
                else {
                    currentPlayer.initiatives.politicalTokens += INSPIRED_LEADERSHIP_VALUE;
                }
                remove( currentPlayer.cards.chaos, CHAOS[56].id );
            }
        }
    );
}

function performManifest() {
    currentPlayer.special.manifestDestiny = true;
    remove( currentPlayer.cards.chaos, CHAOS[58].id );
}

function performMarchPreExpansion() {
    currentPlayer.special.manifestDestiny = true;
    remove( currentPlayer.cards.chaos, CHAOS[59].id );
}

function performMarch( player = currentPlayer ) {
    player.units.forEach( u => {
        const usedMoves = getUnitType( u.unitTypeId ).move - u.movesRemaining;
        u.movesRemaining = MARCH_VALUE - usedMoves;
    } );
    if ( player.cards.chaos.includes( CHAOS[59].id ) ) {
        remove( player.cards.chaos, CHAOS[59].id );
    }
}

function performMaster() {
    currentPlayer.districts.tileIds.forEach( t => addUnit( new Unit( getRandomUnitId(), UNIT_TYPES[REAPER].id, t ), currentPlayer ) );
    remove( currentPlayer.cards.chaos, CHAOS[60].id );
}

function performMicro() {
    currentPlayer.special.micro = true;
    remove( currentPlayer.cards.chaos, CHAOS[62].id );
}

function performMonopoly() {
    showPicks(
        CHAOS[63].name,
        CHAOS[63].description,
        RESOURCES.map( r => r.name ),
        false,
        false,
        function( response ) {
            if ( Number.isInteger( response ) ) {
                const resourceId = RESOURCES[response].id;
                if ( !currentPlayer.resources.some( r => r.id === resourceId ) ) {
                    currentPlayer.resources.push( {id: resourceId, count: 0} );
                }

                game.players.forEach( p => {
                    const playerResource = p.resources.find( r => r.id === resourceId );
                    currentPlayer.resources.find( r => r.id === resourceId ).count += playerResource.count;
                    playerResource.count = 0;
                } );
                remove( currentPlayer.cards.chaos, CHAOS[63].id );
            }
        }
    );
}

function performNepotism() {
    const affordableAuctions = AUCTIONS.filter( a => !currentPlayer.advancements.auctions.includes( a.id ) && !a.isLocked( game.players ) && a.getMinimumBid() <= currentPlayer.warBucks );
    if ( affordableAuctions.length ) {
        showPicks(
            CHAOS[65].name,
            CHAOS[65].description,
            affordableAuctions.map( a => a.name ),
            false,
            false,
            function( response ) {
                if ( Number.isInteger( response ) ) {
                    const auctionLot = affordableAuctions[response];
                    currentPlayer.advancements.auctions.push( auctionLot.id );
                    currentPlayer.warBucks -= auctionLot.getMinimumBid();
                    remove( currentPlayer.cards.chaos, CHAOS[65].id );
                }
            }
        );
    }
}

function performParks() { //if you decide this should be limited to players with 2+ districts, add that condition to display-game.js
    if ( currentPlayer.initiatives.culturalTokens ) {
        const remainingGardens = GARDENS.filter( g => !currentPlayer.advancements.gardens.includes( g.id ) );
        showPicks(
            "Gardens",
            "Choose a garden to receive:",
            remainingGardens.map( g => g.name ),
            false,
            false,
            function( response ) {
                if ( Number.isInteger( response ) ) {
                    currentPlayer.initiatives.culturalTokens--;
                    currentPlayer.advancements.gardens.push( remainingGardens[response].id );
                    remove( currentPlayer.cards.chaos, CHAOS[66].id );
                }
            }
        );
    }
    else {
        showToaster( "Must have cultural initiative tokens" );
    }
}

function performPenny() { //todo 4 - may be affected by Midnight
    showNumberPrompt(
        CHAOS[67].name,
        `Enter an amount to invest (maximum of ${currentPlayer.warBucks}WB)`,
        function( response ) {
            if ( Number.isInteger( response ) && response <= currentPlayer.warBucks ) {
                currentPlayer.warBucks -= response;
                currentPlayer.special.gambitBet += response;
                remove( currentPlayer.cards.chaos, CHAOS[67].id );
            }
            else {
                showToaster( "Cannot invest more War-Bucks than you have" );
            }
        }
    );
}

function performPersecution() {
    const activeReligions = getChaosPlayerVictims().filter( p => p.religion ).map( p => p.religion.id );
    showPicks(
        CHAOS[68].name,
        CHAOS[68].description,
        activeReligions.map( r => getReligion( r ).name ),
        false,
        false,
        function( religion ) {
            if ( Number.isInteger( religion ) ) {
                const religionPlayer = game.players.find( p => p.religion && p.religion.id === activeReligions[religion] );
                religionPlayer.religion.tileIds = religionPlayer.religion.tileIds.filter( t => t === religionPlayer.districts.capital );
                remove( currentPlayer.cards.chaos, CHAOS[68].id );
            }
        }
    );
}

function performPioneers() {
    setSpecialAction(
        function( tileId ) { return !isImpassibleTile( tileId, true, true ) && !hasDistrict( tileId ); },
        function( tileId ) {
            addDistrict( currentPlayer, tileId );
            remove( currentPlayer.cards.chaos, CHAOS[69].id );
        }
    );
}

function performPower() {
    game.state.special.powerStruggle = true;
    remove( currentPlayer.cards.chaos, CHAOS[70].id );
}

function performPublic() {
    if ( currentPlayer.initiatives.politicalTokens ) {
        const remainingDoctrines = DOCTRINES.filter( d => !currentPlayer.advancements.doctrines.includes( d.id ) );
        currentPlayer.initiatives.politicalActive--;
        currentPlayer.advancements.doctrines.push( remainingDoctrines.slice( 0, Math.min( remainingDoctrines.length, PUBLIC_ARTS_VALUE ) ).map( d => d.id ) );
        remove( currentPlayer.cards.chaos, CHAOS[72].id );
    }
    else {
        showToaster( "Must have political initiative tokens" );
    }
}

function performPuppeteer() {
    const availableOffices = OFFICES.filter( o => !game.players.some( p => p.cards.offices.includes( o.id ) ) );
    showPicks(
        CHAOS[73].name,
        CHAOS[73].description,
        availableOffices.map( o => o.name ),
        false,
        false,
        function( office ) {
            if ( Number.isInteger( office ) ) {
                game.state.events.office = availableOffices[office].id;
                remove( currentPlayer.cards.chaos, CHAOS[73].id );
            }
        }
    );
}

function performRInvestment() {
    showBinaryChoice( //todo 7 - you should probably just make a modal where you can do this on one screen (pick type and amount)
        "Initiative Tokens",
        "Choose the type you would like to exchange for War-Bucks:", //todo 3 - should update card description to say that you can only exchange one token type
        "Culture",
        "Politics",
        function( response ) {
            if ( Number.isInteger(response) ) {
                const isCulture = response === 0;
                const maxCount = isCulture ? currentPlayer.initiatives.culturalTokens : currentPlayer.initiatives.politicalTokens;
                const exchangeValue = calculateVP( currentPlayer );
                showNumberPrompt(
                    CHAOS[75].name,
                    `Enter an amount to exchange up to ${maxCount} (worth ${exchangeValue}WB)`,
                    function( response ) {
                        if ( Number.isInteger( response ) && response <= maxCount ) {
                            isCulture ? ( currentPlayer.initiatives.culturalTokens -= response ) : ( currentPlayer.initiatives.politicalTokens -= response );
                            currentPlayer.warBucks += ( response * exchangeValue );
                            remove( currentPlayer.cards.chaos, CHAOS[75].id );
                        }
                    }
                );
            }
        }
    );
}

function performSacred() {
    const availableWonders = WONDERS.filter( w => !w.isLocked( currentPlayer, game.players ) );
    if ( availableWonders.length > 1 ) {
        showPicks(
            CHAOS[76],
            "Choose a wonder to construct:",
            availableWonders.map( w => w.name ),
            false,
            false,
            function( response ) {
                if ( Number.isInteger( response ) ) {
                    performSacredCallback( availableWonders[response].id );
                }
            }
        );
    }
    else if ( availableWonders.length === 1 ) {
        performSacredCallback( availableWonders[0].id );
    }
}

function performSacredCallback( wonderId ) {
    setSpecialAction(
        function( tileId ) { return currentPlayer.districts.tileIds.includes( tileId ) && !currentPlayer.dimensions.some( d => d.wonderTileId === tileId ) && game.players.some( p => p.religion.tileIds.includes( tileId ) ); },
        function( tileId ) {
            const wonder = getWonder( wonderId );
            const dimensionId = wonder.getDimensionId();
            currentPlayer.dimensions.find( d => d.id === dimensionId ).wonderTileId = tileId;
            remove( currentPlayer.cards.chaos, CHAOS[76].id );
        }
    );
}

function performScourge() {
    currentPlayer.special.scourge = true;
    remove( currentPlayer.cards.chaos, CHAOS[78].id );
}

function performSeductress() {
    const availablePlayers = getChaosPlayerVictims().filter( p => p.id !== currentPlayer.id && p.cards.offices.length );
    pickPlayers(
        false,
        false,
        function( response ) {
            if ( response ) {
                const player = getPlayer( response );
                const officeId = player.cards.offices.splice( 0, 1 );
                currentPlayer.cards.offices.push( officeId );
                remove( currentPlayer.cards.chaos, CHAOS[79].id );
            }
        },
        availablePlayers
    );
}

function performShift() {
    showBinaryChoice( //todo 7 - you should probably just make a modal where you can do this on one screen (pick type and amount)
        "Initiative Tokens",
        "Choose the type you would like to convert (i.e. get rid of):",
        "Culture",
        "Politics",
        function( response ) {
            if ( Number.isInteger(response) ) {
                const isCulture = response === 0;
                const maxCount = isCulture ? currentPlayer.initiatives.culturalTokens : currentPlayer.initiatives.politicalTokens;
                showNumberPrompt(
                    CHAOS[81].name,
                    `Enter an amount to covert up to ${maxCount}`,
                    function( response ) {
                        if ( Number.isInteger( response ) && response <= maxCount ) {
                            isCulture ? ( currentPlayer.initiatives.culturalTokens -= response ) : ( currentPlayer.initiatives.politicalTokens -= response );
                            isCulture ? ( currentPlayer.initiatives.politicalTokens += response ) : ( currentPlayer.initiatives.culturalTokens += response );
                            remove( currentPlayer.cards.chaos, CHAOS[81].id );
                        }
                    }
                );
            }
        }
    );
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

function performSilent() {
    pickPlayers(
        false,
        false,
        function( response ) {
            if ( response ) {
                const player = getPlayer( response );
                player.special.silentAuction = true;
                remove( currentPlayer.cards.chaos, CHAOS[87].id );
            }
        },
        getChaosPlayerVictims()
    );
}

function performSpace() {
    if ( currentPlayer.initiatives.politicalTokens ) {
        const remainingTechnologies = TECHNOLOGIES.filter( t => !currentPlayer.advancements.technologies.includes( t.id ) );
        currentPlayer.initiatives.politicalActive--;
        currentPlayer.advancements.technologies.push( remainingTechnologies.slice( 0, Math.min( remainingTechnologies.length, SPACE_RACE_VALUE ) ).map( t => t.id ) );
        remove( currentPlayer.cards.chaos, CHAOS[72].id );
    }
    else {
        showToaster( "Must have political initiative tokens" );
    }
}

function performSpiritual() {
    currentPlayer.special.spiritualWarfare = true;
    remove( currentPlayer.cards.chaos, CHAOS[90].id );
}

function performSquelch() {
    pickPlayers(
        false,
        false,
        function( response ) {
            if ( response ) {
                const player = getPlayer( response );
                player.special.squelched = true;
                remove( currentPlayer.cards.chaos, CHAOS[91].id );
            }
        },
        getChaosPlayerVictims()
    );
}

function performStrategic() {
    setSpecialAction(
        function( tileId ) { return currentPlayer.units.some( u => u.tileId === tileId ); },
        function( rootTileId ) {
            setSpecialAction(
                function( tileId ) { return hasEnemyUnits( tileId, true ); },
                function( tileId ) {
                    currentPlayer.units.filter( u => u.tileId === rootTileId ).tileId = tileId;
                    remove( currentPlayer.cards.chaos, CHAOS[92].id );
                }
            );
        }
    );
}

function performTRefund() {
    currentPlayer.warBucks += TAX_REFUND_VALUE;
    remove( currentPlayer.cards.chaos, CHAOS[94].id );
}

function performTClaw() {
    setSpecialAction(
        function( tileId ) { return hasEnemyUnits( tileId, true ); },
        function( tileId ) {
            const enemy = getEnemyPlayer( tileId, true );
            const units = enemy.units.filter( u => u.tileId === tileId );
            showPicks(
                CHAOS[95].name,
                CHAOS[95].description,
                units.map( u => u.name ),
                false,
                false,
                function ( response ) {
                    if ( Number.isInteger( response) ) {
                        removeUnit( units[response], enemy );
                        remove( currentPlayer.cards.chaos, CHAOS[95].id );
                    }
                }
            );
        }
    );
}

function performTGTRobbery() {
    pickPlayers(
        false,
        false,
        function( response ) {
            if ( response ) {
                const player = getPlayer( response );
                const warBucks = player.warBucks / 2;
                player.warBucks -= warBucks;
                currentPlayer.warBucks += warBucks;
                remove( currentPlayer.cards.chaos, CHAOS[95].id );
            }
        },
        getChaosPlayerVictims()
    );
}

function performTSwap() {
    setSpecialAction(
        function( tileId ) { return currentPlayer.districts.tileIds.includes( tileId ) && currentPlayer.districts.capital !== tileId; },
        function( rootTileId ) {
            setSpecialAction(
                function( tileId ) { return hasEnemyDistrict( tileId ); }, //todo 3 - add Capital check to that function
                function( tileId ) {
                    const enemy = game.players.find( p => p.districts.tileIds.includes( id ) );
                    remove( enemy.districts.tileIds, tileId );
                    enemy.districts.tileIds.push( rootTileId );
                    enemy.units.filter( u => u.tileId === tileId ).forEach( u => u.tileId = rootTileId );
                    remove( currentPlayer.districts.tileIds, rootTileId );
                    currentPlayer.districts.tileIds.push( tileId );
                    currentPlayer.units.filter( u => u.tileId === rootTileId ).forEach( u => u.tileId = tileId );
                    remove( currentPlayer.cards.chaos, CHAOS[97].id );
                }
            );
        }
    );
}

function performTithing() {
    currentPlayer.warBucks += currentPlayer.religion.tileIds.length;
    remove( currentPlayer.cards.chaos, CHAOS[98].id );
}

function performWay() {
    currentPlayer.special.wayOfTheSamurai = 0;
    remove( currentPlayer.cards.chaos, CHAOS[99].id );
}

function getChaosPlayerVictims() {
    return game.players.filter( p => !p.special.shutUpProtect );
}


/*** GENERAL ***/


function getChaosCardsAsync( playerIndex, count ) {
    let result = [];

    const playerCount = game.players.length;
    const theoryDeck = new Deck( CHAOS );
    const realDeck = Deck.getCurrentDeck( CHAOS, game.players.map( p => p.cards.chaos ) );

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
        result.push( realDeck.getRandomCards( count - result.length ).map( c => c.id ) ); //could cause problems, but ensures no player is cheated out of cards
    }

    return result;
}