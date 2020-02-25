//todo 4 - Make it where I can complete a round moving through players/phases
//todo 5 - Do internal code-cleanup, abstracting to service files
//todo 6 - Click on Capital and have link to pop modal with player/faction info

const NO_TILE_DETAILS = "No Tile Selected";

let game;
let selectedTile;
let currentPlayer;

/****** LOAD ******/

function loadGame() {
    if ( gameId ) {
        if ( gameId === TEST_GAME_ID && newGame ) {
            readTestFile( loadGameCallback );
        }
        else {
            postCallEncoded(
               "php/controller.php",
               {
                   action: "loadGame",
                   id:     gameId
               },
               loadGameCallback
            );
        }
    }
}

function loadGameCallback( response ) {
    game = jsonParse( response );
    game.map = parseMap( game.map );

    loadGameState();
    loadMap();
    loadUser();

    popModals();
}

function parseMap( map ) {
    //Will change when you actually use DB
    return map.map( t => new Tile(
        t.id,
        getTileType( t.tileType.id ),
        t.resources ? t.resources.map( r => getResource( r.id ) ) : null
    ) );
}

function loadGameState() {
    id('roundValue').innerText = (game.state.round + 1) + "";
    id('phaseValue').innerText = getPhase(game.state.phase);
    id('turnValue').innerText = getTurn(game.state.turn);
    id('eventValue').innerText = getEvent(game.state.event);
}

function loadMap() {
    for ( let i = 0; i < game.map.length; i++ ) {
        const tile = game.map[i];

        id(tile.id + "-text").innerHTML = tile.tileType.value + "";

        if ( tile.tileType.id === TILE_TYPES[ATLANTIS].id ) {
            hideById(tile.id + "-text");
            id(tile.id + "-background").setAttributeNS(null, "fill", "url(#atlantis)");
        }
        else if ( tile.tileType.id === TILE_TYPES[VOLCANO].id ) {
            hideById(tile.id + "-text");
            id(tile.id + "-background").setAttributeNS(null, "fill", "url(#volcano)");
        }
        else if ( tile.tileType.id === TILE_TYPES[CAPITAL].id ) {
            hideById(tile.id + "-text");
            const factionId = game.players.find( p => p.districts.capital === tile.id ).factionId;
            id(tile.id + "-background").setAttributeNS(null, "fill", `url(#faction${factionId})`);
        }

        if ( tile.resources ) {
            id(tile.id + "-resource").style.display = "";
            const resourceId = tile.resources.length > 1 ? "All" : tile.resources[0].id;
            id(tile.id + "-resource").setAttributeNS(null, "fill", `url(#res${resourceId})`);
        }

        const tileDetails = getTileDetails( tile.id );
        updateUnitIcons( tileDetails );
        if ( tileDetails.wonderId ) {
            id(tile.id + "-wonder").style.display = "";
            id(tile.id + "-wonder").setAttributeNS(null, "fill", `url(#won${tileDetails.wonderId})`);
        }
        if ( tileDetails.religionIds.length ) {
            const playerReligion = tileDetails.districtPlayerId ? getPlayer( tileDetails.districtPlayerId ).religion : null;
            const playerReligionId = playerReligion ? playerReligion.id : null;
            const religionId = tileDetails.religionIds.includes( playerReligionId ) ? playerReligionId : tileDetails.religionIds[0];
            id(tile.id + "-religion").style.display = "";
            id(tile.id + "-religion").setAttributeNS(null, "fill", `url(#rel${religionId})`);
        }
        if ( tileDetails.politicalInitiatives.length ) {
            tileDetails.politicalInitiatives.forEach( token => id( getInitTokenIconId( token ) ).style.display = "" );
        }

        id(tile.id).onmouseover = tileHoverCallback;
    }

    for ( let i = 0; i < game.players.length; i++ ) {
        let player = game.players[i];
        const color = getColorFromPlayerId( player.id );
        player.districts.tileIds.forEach( function( tileId ) {
            id( tileId + "-background" ).classList.add( color + (isImageTile( tileId ) ? "Image" : "") );
        } );
    }

    id('tileDetailsDiv').innerText = NO_TILE_DETAILS;
}

function loadUser() {
    if ( testPlayerId ) {
        loadUserCallback( testPlayerId );
    }
    else {
        postCallEncoded(
            "php/controller.php",
            {
                action: "getPlayer",
                gameId: gameId,
                userId: userId,
            },
            loadUserCallback,
            function() { showToaster( "User not found." ); }
        );
    }
}

function loadUserCallback( playerId ) {
    currentPlayer = getPlayer( playerId );
    id('playerName').innerText = currentPlayer.username;
    id('factionName').innerText = getFaction( currentPlayer.factionId ).name;

    id('victoryPointsValue').innerText      = calculateVP( currentPlayer ) + "";
    id('warBucksValue').innerText           = currentPlayer.warBucks + "";
    id('technologiesValue').innerText       = currentPlayer.advancements.technologies.length + "/" + TECHNOLOGIES.length;
    id('doctrinesValue').innerText          = currentPlayer.advancements.doctrines.length    + "/" + DOCTRINES.length;
    id('gardensValue').innerText            = currentPlayer.advancements.gardens.length      + "/" + GARDENS.length;
    id('auctionLotsValue').innerText        = currentPlayer.advancements.auctions.length     + "/" + AUCTIONS.length;
    id('initiativeTokensValue').innerText   = ( currentPlayer.initiatives.politicalTokens + currentPlayer.initiatives.culturalTokens ) + "";
    id('chaosCardsValue').innerText         = currentPlayer.cards.chaos.length + "";

    currentPlayer.unitsDisambiguous = disambiguateUnits( currentPlayer.units );
}

function popModals() {
    if ( isMarketAuctionPhase() && !currentPlayer.advancements.auctionBid ) {
        showAuctionActions();
    }
}


/****** HANDLERS ******/


//todo 5 - divide functions into smaller service classes (display-game.js, etc.)
function selectUnits( e ) {
    const spanId = e.target.id;
    const tileId = selectedTile.id;
    const selectionType = spanId.split('-')[1];
    const isAllUnits = selectionType === "all";
    const unitTypeId = !isAllUnits ? selectionType.split('#')[0] : null;
    const movesRemaining = !isAllUnits ? parseInt( selectionType.split('#')[1] ) : null;

    const isAllCurrentlySelected = id(spanId).style.background === "lightgray";
    const isUnitTypeCurrentlyIncluded = selectedUnits.some( u => u.unitType.id === unitTypeId );
    if ( selectedUnits.length && ( ( isAllUnits && isAllCurrentlySelected ) || ( !isAllUnits && isUnitTypeCurrentlyIncluded ) ) ) {
        id(spanId).style.background = "";
        if ( isAllUnits ) {
            document.querySelectorAll( '*[id^="unit-"]' ).forEach( s => s.style.background = "" );
            unselectUnits();
        }
        else {
            selectedUnits = selectedUnits.filter( u => !( u.unitType.id === unitTypeId && u.movesRemaining === movesRemaining ) );
            if ( !selectedUnits.length ) {
                id("unit-all").style.background = "";
                unselectUnits();
            }
        }
    }
    else {
        const relevantUnits = currentPlayer.unitsDisambiguous.filter( u => u.tileId === tileId );
        id(spanId).style.background = "lightgray";
        if ( isAllUnits ) {
            document.querySelectorAll( '*[id^="unit-"]' ).forEach( s => s.style.background = "lightgray" );
            selectedUnits = relevantUnits;
        }
        else {
            const units = relevantUnits.filter( u => u.unitType.id === unitTypeId && u.movesRemaining === movesRemaining );
            if ( units.length > 1 ) {
                selectUnitsByType( units );
            }
            else {
                selectedUnits = selectedUnits.concat( units );
            }
        }
    }

    performUnitAbilities();
}

function selectUnitsByType( units ) {
    const maxUnits = units.length;
    showPrompt(
        "How Many?",
        "How many units of this type would you like to select?",
        function( response ) {
            const count = response ? parseInt( response ) : null;
            if ( count ) {
                if ( count <= maxUnits && count > 0 ) {
                    selectedUnits = selectedUnits.concat( units.slice(0, count) );
                }
                else {
                    selectUnitsByType( units );
                }
            }
        },
        "Up to " + maxUnits
    );
}

function performUnitAbilities() {
    if ( selectedUnits.length === 1 ) {
        const selectedUnit = selectedUnits[0];
        if ( selectedUnit.unitType === UNIT_TYPES[APOSTLE] ) {
            showBinaryChoice(
                "Apostle",
                "Choose an ability or cancel to move:",
                "Found District",
                "Evangelize",
                function( response ) {
                    performApostleAbility( response ? "0" : "1" );
            });
        }
    }
}

function tileHoverCallback( e ) {
    const tileId = e.currentTarget.id;
    if ( isExpansionPhase() && selectedUnits.length ) {
        moveSuggestion( tileId );
    }
}

function moveSuggestion( tileId ) {
    if ( isExpansionPhase() && selectedUnits.length ) {
        nm('move-polygon').forEach( p => p.style.display = "none" );

        const rootTileId = selectedTile.id;
        const destinationTileId = tileId;
        const allTiles = game.map.map( t => t.id );
        const impassableTiles = allTiles.filter( t => {
            const tileDetails = getTileDetails( t );
            return tileDetails.type === TILE_TYPES[VOLCANO].name ||
                (tileDetails.type === TILE_TYPES[CAPITAL].name && tileDetails.districtPlayerId !== currentPlayer.id ) ||
                tileDetails.unitSets.filter( s => s.id !== currentPlayer.id ).some( s => s.combat );
        } );
        const maxMove = Math.min( ...selectedUnits.map( u => u.movesRemaining ) );
        suggestedPath = calculateShortestNonCombatPath( rootTileId, destinationTileId, allTiles, impassableTiles, maxMove );
        for ( let i = 0; i < suggestedPath.length; i++ ) {
            id( "move-polygon-" + i ).style.display = "";
            id( "move-polygon-" + i ).setAttributeNS(null, "points", id(suggestedPath[i] + "-background").getAttributeNS(null, "points") );
        }
    }
}

function tileClickCallback( tileId ) {
    if ( isExpansionPhase() && suggestedPath.includes( tileId ) ) {
        moveUnits( tileId );
    }
    else {
        selectTile( tileId );
    }
}

function moveUnits( tileId ) {
    const rootTileId = selectedTile.id;
    const destinationTileId = tileId;
    selectedUnits.forEach( su => {
        let unitDisambiguous = currentPlayer.unitsDisambiguous.find( u => u.id === su.id );
        unitDisambiguous.movesRemaining -= suggestedPath.length;
        unitDisambiguous.tileId = destinationTileId;
        currentPlayer.units.find( u => u.id === su.unitType.id && u.tileId === rootTileId ).count--;
        currentPlayer.units = currentPlayer.units.filter( u => u.count > 0 );
        let unit = currentPlayer.units.find( u => u.id === su.unitType.id && u.tileId === destinationTileId );
        if ( unit ) {
            unit.count++;
        }
        else {
            currentPlayer.units.push( { id: su.unitType.id, tileId: destinationTileId, count: 1} );
        }
    } );

    updateUnitIconsFromId( rootTileId );
    updateUnitIconsFromId( destinationTileId );

    unselectUnits();
    selectTile( rootTileId );
    suggestedPath = [];
}

function updateUnitIconsFromId( tileId ) {
    updateUnitIcons( getTileDetails( tileId ) );
}

function updateUnitIcons( tileDetails ) {
    const tileId = tileDetails.id;
    if ( tileDetails.unitSets.length > 0 ) {
        const HERO_TYPE_ID = UNIT_TYPES[HERO].id;
        const allUnitIds = tileDetails.unitSets.reduce( ( units, unitSet ) => units.concat( unitSet.units ), [] ).map( u => u.id );
        const unitIds = allUnitIds.filter( u => u !== HERO_TYPE_ID );
        const strongestUnitId = unitIds.length ? Math.max( ...unitIds, "0" ) : HERO_TYPE_ID;
        id(tileId + "-unit").setAttributeNS(null, "fill", `url(#unit${strongestUnitId})`);
        id(tileId + "-unit").style.display = "";
        id(tileId + "-unit-plus").style.display = allUnitIds.length > 1 ? "" : "none";
        if ( !tileDetails.districtPlayerId )
        {
            const color = getColorFromPlayerId( tileDetails.controlPlayerId );
            id(tileId + "-unit").classList.add( `${color}Image` );
        }

        const heroPlayerIds = tileDetails.unitSets.filter( us => us.units.some( u => u.id === HERO_TYPE_ID ) ).map( us => us.id );
        if ( heroPlayerIds.length ) {
            const heroPlayer = getPlayer( heroPlayerIds[0] );
            const heroId = Faction.getHero( heroPlayer.factionId ).id;
            id(tileId + "-hero").setAttributeNS(null, "fill", `url(#hero${heroId})`);
            id(tileId + "-hero").style.display = "";
            if ( !tileDetails.districtPlayerId )
            {
                const color = getColorFromPlayerId( heroPlayer.id );
                id(tileId + "-hero").classList.add( `${color}Image` );
            }
        }
        else {
            id(tileId + "-hero").style.display = "none";
        }
    }
    else {
        id(tileId + "-unit").style.display = "none";
        id(tileId + "-hero").style.display = "none";
        id(tileId + "-unit-plus").style.display = "none";
    }
}

function selectTile( tileId ) {
    const isTileChange = !selectedTile || selectedTile.id !== tileId;
    selectedTile = game.map.find( t => t.id === tileId );

    let polygon = id( tileId + "-border" );
    id( "selected-polygon" ).setAttributeNS(null, "points", polygon.getAttributeNS(null, "points") );

    const tileDetails = getTileDetails( tileId );
    let tileDetailsHTML =
        "Tile Type: " + tileDetails.type + "<br/>" +
        "Population: " + tileDetails.population + "<br/>";
    if ( tileDetails.districtPlayerId ) {
        tileDetailsHTML += "District: " + getPlayer( tileDetails.districtPlayerId ).username + "<br/>";
    }
    if ( tileDetails.culturalInitiatives ) {
        tileDetailsHTML += "Civil Resistance: " + tileDetails.culturalInitiatives + " Reaper(s)<br/>";
    }
    if ( tileDetails.unitSets.length ) {
        tileDetailsHTML += "<br/>";
    }
    tileDetails.unitSets.forEach( us => {
        const player = getPlayer( us.id );
        let unitDescriptions = us.units.map( u => getUnitDisplayName( u.id, u.count, us.id ) );
        let titleSpan = "<span>";
        let unitSpans = Array(unitDescriptions.length).fill( "<span style='margin-left: 1em'>" );
        const isExpansionPlayer = isExpansionPhase() && us.id === currentPlayer.id;
        if ( isExpansionPlayer ) {
            titleSpan = "<span id='unit-all' class='link' onclick='selectUnits(event)'>";
            let units = consolidateActiveUnits( currentPlayer.unitsDisambiguous.filter( u => u.tileId === tileId ) );
            unitDescriptions = units.map( u => getUnitDisplayName( u.id, u.count, us.id ) + " (" + u.movesRemaining + ")" );
            unitSpans = units.map( u => `<span id='unit-${u.id}#${u.movesRemaining}' class='link' style='margin-left: 1em' onclick='selectUnits(event)'>` );
        }
        tileDetailsHTML += titleSpan + "Units (" + player.username + "):" + "</span><br/>";
        tileDetailsHTML += unitDescriptions.map( (unit,index) => unitSpans[index] + unit + "</span><br/>" ).join("\n");
        tileDetailsHTML += "<br/>";
    } );
    id('tileDetailsDiv').innerHTML = tileDetailsHTML;

    if ( isExpansionPhase() && isTileChange ) {
        unselectUnits();
    }
}

function getTileDetails( id ) {
    let tile = game.map.find( t => t.id === id );

    let unitSets = [];
    game.players.forEach( p => {
        let units = p.units.filter( u => u.tileId === id );
        if ( units.length > 0 ) {
            unitSets.push( { id: p.id, combat: !units.every( u => u.id === UNIT_TYPES[APOSTLE].id ), units: units } );
        }
    } );

    const districtPlayer = game.players.find( p => p.districts.tileIds.includes( id ) );
    const districtPlayerId = districtPlayer ? districtPlayer.id : null;
    const controlPlayerId = districtPlayerId || unitSets.reduce( (id, set) => set.combat ? set.id : ( id || set.id ), null ); //district > combat > any unit > null
    const wonderIds = districtPlayer ? districtPlayer.dimensions.filter( d => d.wonderTileId && d.wonderTileId === id ).map( d => WONDERS[getDimension(d.id).wonderIndex].id ) : null;
    const religionIds = game.players.map( p => p.religion ).filter( r => r && r.tileIds.includes( id ) ).map( r => r.id );
    const culturalInitiatives = game.players.map( p => p.initiatives.culturalActive ).flat().filter( i => i.tileId === id ).reduce( (total, i) => total + i.reaperCount, 0 );
    const politicalInitiatives = game.players.map( p => p.initiatives.politicalActive ).flat().filter( i => i.from === id ).map( i => ({ from: i.from, to: i.to }) );

    return {
        id: id,
        type: TileType.getDisplayName( tile.tileType ),
        population: tile.tileType.value,
        districtPlayerId: districtPlayerId,
        controlPlayerId: controlPlayerId,
        wonderId: wonderIds ? wonderIds[0] : null,
        religionIds: religionIds,
        culturalInitiatives: culturalInitiatives,
        politicalInitiatives: politicalInitiatives,
        unitSets: unitSets
    };
}

function getUnitDisplayName( unitTypeId, unitCount, playerId ) {
    const isMultiple = unitCount > 1;
    const unitType = getUnitType( unitTypeId );
    const heroName = playerId ? Faction.getHero( getPlayer( playerId ).factionId ).name : UNIT_TYPES[HERO].name;
    let name = unitTypeId === UNIT_TYPES[HERO].id ? heroName : unitType.name;
    name = isMultiple ? (unitCount + " " + name + "s") : name;
    return name;
}

function consolidateActiveUnits( units ) {
    let result = [];
    for ( let i = 0; i < units.length; i++ ) {
        let activeUnit = units[i];
        let consolidatedUnit = result.find( u => u.id === activeUnit.unitType.id && u.movesRemaining === activeUnit.movesRemaining );
        if ( consolidatedUnit ) {
            consolidatedUnit.count++;
        }
        else {
            result.push( {id: activeUnit.unitType.id, tileId: activeUnit.tileId, movesRemaining: activeUnit.movesRemaining, count: 1 } );
        }
    }
    return result;
}

function unselectUnits() {
    selectedUnits = [];
    document.querySelectorAll( '*[id^="move-polygon-"]' ).forEach( m => m.style.display = "none" );
}


/****** PLAYER ******/


function viewVP() {
    const insurrectionPlayerId = getInsurrectionVictim();
    const isHighPriestActive = currentPlayer.cards.offices.includes( "0" ) || currentPlayer.selects.highPriestVictim;
    let message =
        `<span style='font-weight: bold'>Victory Points Total:</span> ${id('victoryPointsValue').innerText}<br/>
        Districts: ${currentPlayer.districts.tileIds.length}<br/>
        Dimensions: ${currentPlayer.dimensions.length}<br/>
        Wonders: ${(currentPlayer.dimensions.filter( d => !!d.wonderTileId ).length * 2)}<br/>
        Hero: ${(hasHero( currentPlayer.units ) ? "1" : "0")}<br/>
        Chaos Cards: ${(currentPlayer.cards.chaos.filter( c => isHeavensGate( c ) ).length)}<br/>`;
    if ( isHighPriestActive ) {
        message += `High Priest: ${currentPlayer.cards.offices.includes( "0" ) ? "1" : ( currentPlayer.selects.highPriestVictim ? "-1" : "0" )}<br/>`;
    }
    if ( insurrectionPlayerId && insurrectionPlayerId === currentPlayer.id ) {
        message += "Insurrection Event: -1<br/>";
    }
    showMessage( "Victory Points", message );
}

function viewWB() {
    const resourceDisplay = currentPlayer.resources.map( r => r.count + " " + getResource(r.id).name + (r.count > 1 ? "s" : "") ).join("<br/>");
    const message =
        "War-Bucks: " + currentPlayer.warBucks + "<br/><br/>" +
        "<div style='font-weight: bold'>Resources</div>" +
        (resourceDisplay || "None");
    showMessage( "War-Bucks", message );
}

function viewTechnologies() {
    //todo 8 - table poorly formatted on phone
    let message = getAdvancementTable(
        TECHNOLOGIES,
        currentPlayer.advancements.technologies,
        function( item ) { return "7WB" }
    );
    showMessage( "Technologies", message, {padding: ".5em 20%"} );
}

function viewDoctrines() {
    let message = getAdvancementTable(
        DOCTRINES,
        currentPlayer.advancements.doctrines,
        function( item ) { return "7WB" }
    );
    showMessage( "Doctrines", message, {padding: ".5em 20%"} );
}

function viewGardens() {
    let message = getAdvancementTable(
        GARDENS,
        currentPlayer.advancements.gardens,
        function( item ) { return item.costFunction( currentPlayer.districts.tileIds.length ) + "WB"; }
    );
    message += "<div style='margin-top: .5em'>(Cost calculated by 7WB times the number of districts; must have at least 2 districts.)</div>";
    showMessage( "Gardens", message, {padding: ".5em 20%"} );
}

function viewAuctions() {
    let message = getAdvancementTable(
        AUCTIONS,
        currentPlayer.advancements.auctions,
        function( item ) { return item.getCostOrLocked( game.players ); }
    );
    showMessage( "Auction Lots", message, {padding: ".5em 20%"} );
}

function getAdvancementTable( data, userData, costFunction ) {
    let resultHTML = "<table class='advancements'><tbody>";
    for ( let i = 0; i < data.length; i++ ) {
        const item = data[i];
        const ownedClass = ( userData.some( id => id === item.id ) ) ? "owned" : "";
        resultHTML += "<tr class='" + ownedClass + "'><td>" + item.name + "</td>" +
            "<td>" + item.description + "</td>" +
            "<td>" + costFunction( item ) + "</td></tr>";
    }
    resultHTML += "</tbody></table>";
    return resultHTML;
}

function viewInitiatives() {
    const message =
        "Political Initiative Tokens: " + currentPlayer.initiatives.politicalTokens + "<br/>" +
        "Cultural Initiative Tokens: " + currentPlayer.initiatives.culturalTokens;
    showMessage( "Initiative Tokens", message );
}

function viewCards() {
    //show Chaos cards as well as others (Office, etc.)
    showMessage( "Cards", "TODO" );
}


/****** ACTIONS ******/


function submit() {
    let isValidToSubmit = true;
    if ( isMarketPhase() ) {
        if ( isMarketAuctionPhase() ) {
            //
        }
        else {
            if ( currentPlayer.units.some( u => u.tileId === "unassigned" ) ) {
                showToaster( "Must assign purchased units" );
            }
        }
    }
    else if ( isExpansionPhase() ) {
        //
    }
    else if ( isHarvestPhase() ) {
        //
    }
    else if ( isCouncilPhase() ) {
        //
    }

    if ( isValidToSubmit ) {
        incrementTurn();
        updateGame();
    }
}

function showActions() {
    if ( isMarketPhase() ) {
        if ( isMarketAuctionPhase() ) {
            showAuctionActions();
        }
        else {
            showMarketActions();
        }
    }
    else if ( isExpansionPhase() ) {
        showExpansionActions();
    }
    else if ( isHarvestPhase() ) {
        showHarvestActions();
    }
    else if ( isCouncilPhase() ) {
        if ( !isDoomsdayClockPhase() ) {
            showCouncilActions();
        }
        else {
            showDoomsdayActions();
        }
    }
}

function showTrade() {
    showMessage( "Trade", "TODO" );
}

function showHelp() {
    let html = "<a class='link' href='#' onclick='signOut();'>Sign out</a>";
    showMessage( "Help", html );
}


/****** MARKET ******/


function showAuctionActions() {
    const auctionIndex = getNextAuction( game.players );
    const minimum = Math.floor( AUCTIONS[auctionIndex].cost / 2 );
    showPrompt( "Auction", "Enter an amount to bid on " + AUCTIONS[auctionIndex].name + " (minimum: " + minimum + "WB):", function( response ) {
        response = parseInt( response );
        if ( Number.isInteger( response ) ) {
            if ( response <= currentPlayer.warBucks ) {
                currentPlayer.advancements.auctionBid = response;
            }
            else {
                showToaster( "Bid too high." );
            }
        }
    });
}

function showMarketActions() {
    openMarketModal(
        currentPlayer,
        function( response ) {
            currentPlayer = response;
        }
    );
}


/****** EXPANSION ******/


function showExpansionActions() {
    showMessage( "Expansion", "Click on a tile, then click on the units you would like to move." );
}


/****** HARVEST ******/


function showHarvestActions() {
    //todo 4 - change this to act like Auction of Council phase, where turns are taken at the same time and finishing your turn is havingReaped and clicking submit
    if ( !currentPlayer.turn.hasReaped ) {
        const warBuckReward = calculateWarBuckHarvestReward();
        const resourceReward = calculateResourceHarvestReward();
        const resourceDisplay = resourceReward.map( r => r.count + " " + getResource(r.id).name + (r.count > 1 ? "s" : "") ).join(", ");
        const message =
            `This harvest, you are rewarded:<br/>
             ${warBuckReward}WB from districts<br/>
             ${resourceDisplay}`;
        showConfirm(
            "Harvest",
            message,
            function( response ) {
                if ( response ) {
                    currentPlayer.warBucks += warBuckReward;
                    id('warBucksValue').innerText = currentPlayer.warBucks;
                    resourceReward.forEach( r => {
                        const currentResource = currentPlayer.resources.find( cr => cr.id === r.id );
                        if ( currentResource ) {
                            currentResource.count += r.count;
                        }
                        else {
                            currentPlayer.resources.push( {id: r.id, count: r.count} );
                        }
                    } );
                    currentPlayer.hasReaped = true;
                }
        } );
    }
    else {
        showMessage( "Harvest", "You have already reaped your harvest this phase." );
    }
}

function calculateWarBuckHarvestReward() {
    const districts = currentPlayer.districts.tileIds.reduce( function( total, tileId ){
        return total + game.map.find( t => t.id === tileId ).tileType.value;
    }, 0 );
    const religion = 0;
    return districts + religion;
}

function calculateResourceHarvestReward() {
    return currentPlayer.districts.tileIds.reduce( function( result, tileId ) {
        const tileResources = game.map.find( t => t.id === tileId ).resources;
        if ( tileResources ) {
            tileResources.forEach( r => {
                const currentResource = result.find( cr => cr.id === r.id );
                if ( currentResource ) {
                    currentResource.count++;
                }
                else {
                    result.push( {id: r.id, count: 1} );
                }
            } );
        }
        return result;
    }, [] );
}


/****** COUNCIL ******/


function showCouncilActions() {
    openCouncilModal(
        currentPlayer,
        function( response ) {
            currentPlayer = response;
        }
    );
}

function showDoomsdayActions() {
    game.state.events.office = OFFICES[Math.floor(Math.random() * OFFICES.length)].id;
    openEventModal(
        currentPlayer,
        game.state.event,
        game.state.events,
        function( response ) {
            //
        }
    );
}


/****** UTILITY ******/


function updateGame() {
    postCallEncoded(
        "php/controller.php",
        {
            action:    "updateGame",
            userId:    userId,
            gameId:    gameId,
            game:      game
        },
        function( response ) {
            loadGame();
        },
        function( error ) {
            showToaster( "Unable to save game." );
        } );
}

function incrementTurn() {
    game.state.turn++;
    if ( game.state.turn >= game.players.length ) {
        game.state.turn = 0;
        game.state.subPhase++;
        if ( isExpansionPhase() || isHarvestPhase() || game.state.subPhase >= 2 ) { //todo 5 - make into Constant
            game.state.subPhase = 0;
            game.state.phase++;
            if ( game.state.phase >= 4 ) { //todo 5 - make into Constant
                game.state.phase = 0;
                game.state.round++;
                game.state.event++;
                if ( game.state.event >= EVENTS.length ) {
                    game.state.event = 0;
                }

                game.state.ambassador++;
                if ( game.state.ambassador >= game.players.length ) {
                   game.state.ambassador = 0;
                }
            }
        }
    }
}

// function isFinalAuctionBid() {
//     return game.players.filter( p => p.turn.auctionBid ).length === game.players.length;
// }
//
// function isFinalHarvestParticipant() {
//     return game.players.filter( p => p.turn.hasReaped ).length === game.players.length;
// }
//
// function isFinalCouncilParticipant() {
//     return game.players.filter( p => p.turn.attendedCouncil ).length === game.players.length;
// }
//
// function isFinalEventParticipant() {
//     return game.players.filter( p => p.turn.attendedDoomsdayClock ).length === game.players.length;
// }

//todo 7 - make battles

function disambiguateUnits( units ) {
    let result = [];
    for ( let i = 0; i < units.length; i++ ) {
       const unitStack = units[i];
       for ( let j = 0; j < unitStack.count; j++ ) {
           const id = ( Math.floor( Math.random() * 10000 ) + "" ).padStart( 4, '0' );
           result.push( new Unit( id, getUnitType( unitStack.id ), unitStack.tileId ) );
       }
    }
    return result;
}

function calculateVP( player ) {
    let result = 0;
    result += player.districts.tileIds.length;
    result += player.dimensions.length;
    result += player.dimensions.filter( d => !!d.wonderTileId ).length * 2;
    result += hasHero( player.units ) ? 1 : 0;
    result += player.cards.offices.includes( "0" ) ? 1 : 0; //High Priest
    result -= player.selects.highPriestVictim ? 1 : 0;
    result += player.cards.chaos.filter( c => isHeavensGate( c ) ).length;
    result -= getInsurrectionVictim() === player.id ? 1 : 0;
    return result;
}

function getInsurrectionVictim() {
    let result = null;
    if ( game.state.events.disaster === INSURRECTION ) {
        game.state.events.disaster = null;
        result = game.players.reduce( (prev, current) => ( calculateVP(prev) > calculateVP(current) ) ? prev : current ).id;
        game.state.events.disaster = INSURRECTION;
    }
    return result;
}

function getNextAuction( players ) {
    let result = 0;
    players.forEach( function( player ) {
        for ( let i = 0; i < player.advancements.auctionWins.length; i++ ) {
            if ( player.advancements.auctionWins[i] === "1" && i > result ) {
                result = i;
            }
        }
    } );
    return result;
}


/****** HELPER ******/


function getPlayer( playerId ) {
    return game.players.find( p => p.id === playerId );
}

function getPhase( index ) {
    return PHASES[index].name;
}

function isMarketPhase() { return game.state.phase === PHASE_MARKET; }
function isMarketAuctionPhase() { return game.state.phase === PHASE_MARKET && game.state.subPhase === SUBPHASE_MARKET_AUCTION; }
function isMarketSubPhase() { return game.state.phase === PHASE_MARKET && game.state.subPhase === SUBPHASE_MARKET; }
function isExpansionPhase() { return game.state.phase === PHASE_EXPANSION; }
function isHarvestPhase() { return game.state.phase === PHASE_HARVEST; }
function isCouncilPhase() { return game.state.phase === PHASE_COUNCIL; }
function isCouncilSubPhase() { return game.state.phase === PHASE_COUNCIL && game.state.subPhase === SUBPHASE_COUNCIL; }
function isDoomsdayClockPhase() { return game.state.phase === PHASE_COUNCIL && game.state.subPhase === SUBPHASE_COUNCIL_DOOMSDAY; }

function getTurn( index ) {
    let result;
    if ( isMarketAuctionPhase() ) {
        result = "(Auction)";
    }
    else if ( isHarvestPhase() ) {
        result = "All";
    }
    else if ( isCouncilPhase() ) {
        result = "All";
    }
    else {
        result = game.players[index].username;
    }
    return result;
}

function getEvent( index ) {
    return EVENTS[index].name;
}

function isImageTile( tileId ) {
    return id(tileId + "-text").style.display === "none";
}

function getColorFromPlayerId( playerId ) {
    const index = game.players.findIndex( p => p.id === playerId );
    let result = "";
    switch ( index ) {
        case 0:
            result = "red";
            break;
        case 1:
            result = "green";
            break;
        case 2:
            result = "blue";
            break;
        case 3:
            result = "purple";
            break;
        case 4:
            result = "orange";
            break;
        case 5:
            result = "teal";
            break;
        case 6:
            result = "gold";
            break;
    }
    return result;
}

function getStringBooleanCount( value ) {
    let result = 0;
    for ( let i = 0; i < value.length; result += +( "1" === value[i++] ) );
    return result;
}

function getArrayItemsFromString( array, value ) {
    let result = [];
    for ( let i = 0; i < value.length; i++ ) {
        if ( value[i] === "1" ) {
            result.push( array[i] )
        }
    }
    return result;
}

function hasHero( units ) {
    return units.some( u => getUnitType( u.id ) === UNIT_TYPES[HERO] );
}