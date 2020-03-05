//todo 5 - Do internal code-cleanup, abstracting to service files
//todo 6 - Click on Capital and have link to pop modal with player/faction info

let game;
let selectedTile;
let currentPlayer;
let currentPlayerDisambiguousUnits;

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
    return map.map( t => new Tile( t.id, t.tileTypeId, t.resourceIds ) );
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

        id(tile.id + "-text").innerHTML = tile.getTileType().value + "";

        if ( tile.tileTypeId === TILE_TYPES[ATLANTIS].id ) {
            hideById(tile.id + "-text");
            id(tile.id + "-background").setAttributeNS(null, "fill", "url(#atlantis)");
        }
        else if ( tile.tileTypeId === TILE_TYPES[VOLCANO].id ) {
            hideById(tile.id + "-text");
            id(tile.id + "-background").setAttributeNS(null, "fill", "url(#volcano)");
        }
        else if ( tile.tileTypeId === TILE_TYPES[CAPITAL].id ) {
            hideById(tile.id + "-text");
            const factionId = game.players.find( p => p.districts.capital === tile.id ).factionId;
            id(tile.id + "-background").setAttributeNS(null, "fill", `url(#faction${factionId})`);
        }

        if ( tile.resourceIds ) {
            id(tile.id + "-resource").style.display = "";
            const resourceId = tile.resourceIds.length > 1 ? "All" : tile.resourceIds[0];
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

    clearSelectedTile();
    id('perform').style.display = isExpansionPhase() ? "" : "none";
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

    displayUnassignedUnits();

    currentPlayerDisambiguousUnits = disambiguateUnits( currentPlayer.units );
}

function popModals() {
    if ( isMarketAuctionPhase() && !Number.isInteger( currentPlayer.turn.auctionBid ) ) {
        showAuctionActions();
    }
    else if ( isHarvestPhase() && !currentPlayer.turn.hasReaped ) {
        showHarvestActions();
    }
    else if ( isDoomsdayClockPhase() ) {
        showToaster("Time is slipping...");
    }
}


/****** HANDLERS ******/


//todo 5 - divide functions into smaller service classes (display-game.js, etc.)
function selectAllUnits( tileSelectType ) {
    const spanId = `units-all-${tileSelectType}`;
    const tileId = tileSelectType === "selected" ? selectedTile.id : "unassigned";

    const isAllCurrentlySelected = id(spanId).style.background === "lightgray";
    if ( selectedUnits.length && isAllCurrentlySelected ) {
        id(spanId).style.background = "";
        document.querySelectorAll( '*[id^="units-"]' ).forEach( s => s.style.background = "" );
        unselectUnits();
    }
    else {
        const unitsInTile = currentPlayerDisambiguousUnits.filter( u => u.tileId === tileId );
        id(spanId).style.background = "lightgray";
        document.querySelectorAll( '*[id^="units-"]' ).forEach( s => s.style.background = "lightgray" );
        selectedUnits = unitsInTile;
    }
}

function selectUnits( tileSelectType, unitTypeId, movesRemaining ) {
    const spanId = `units-${unitTypeId}-${movesRemaining}`;
    const tileId = tileSelectType === "selected" ? selectedTile.id : "unassigned";

    const isUnitTypeCurrentlyIncluded = selectedUnits.some( u => u.unitType.id === unitTypeId );
    if ( selectedUnits.length && isUnitTypeCurrentlyIncluded ) {
        id(spanId).style.background = "";
        selectedUnits = selectedUnits.filter( u => !( u.unitType.id === unitTypeId && u.movesRemaining === movesRemaining ) );
        if ( !selectedUnits.length ) {
            id(`units-all-${tileSelectType}`).style.background = "";
            unselectUnits();
        }
    }
    else {
        const unitsInTile = currentPlayerDisambiguousUnits.filter( u => u.tileId === tileId );
        const units = unitsInTile.filter( u => u.unitType.id === unitTypeId && (u.movesRemaining === movesRemaining || tileId === "unassigned") );
        id(spanId).style.background = "lightgray";
        if ( units.length > 1 ) {
            selectUnitsByType( units );
        }
        else {
            selectedUnits = selectedUnits.concat( units );
        }
    }
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
    else {
        showToaster("Must have only 1 unit selected.");
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
    else if ( selectedUnits.length && selectedUnits.every( u => u.tileId === "unassigned" ) ) {
        moveUnits( tileId );
    }
    else {
        selectTile( tileId );
    }
}

function moveUnits( tileId ) {
    const rootTileId = selectedTile ? selectedTile.id : "unassigned";
    const destinationTileId = tileId;
    selectedUnits.forEach( su => {
        let unitDisambiguous = currentPlayerDisambiguousUnits.find( u => u.id === su.id );
        if ( unitDisambiguous ) {
            unitDisambiguous.movesRemaining -= suggestedPath.length;
            unitDisambiguous.tileId = destinationTileId;
        }
        currentPlayer.units.find( u => u.id === su.unitType.id && u.tileId === rootTileId ).count--;
        currentPlayer.units = currentPlayer.units.filter( u => u.count > 0 );
        let unitStack = currentPlayer.units.find( u => u.id === su.unitType.id && u.tileId === destinationTileId );
        if ( unitStack ) {
            unitStack.count++;
        }
        else {
            currentPlayer.units.push( { id: su.unitType.id, tileId: destinationTileId, count: 1} );
        }
    } );

    updateUnitIconsFromId( destinationTileId );
    if ( rootTileId !== "unassigned" ) {
        updateUnitIconsFromId( rootTileId );
        selectTile( rootTileId );
    }
    else {
        displayUnassignedUnits();
    }

    unselectUnits();
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
    showTileDetails();
    id('tileTypeValue').innerText = tileDetails.type;
    id('tilePopulationValue').innerText = tileDetails.population;
    id('tileDistrict').style.display = tileDetails.districtPlayerId ? "" : "none";
    id('tileDistrictValue').innerText = tileDetails.districtPlayerId ? getPlayer( tileDetails.districtPlayerId ).username : "";
    id('tileCR').style.display = tileDetails.culturalInitiatives ? "" : "none";
    id('tileCRValue').innerText = tileDetails.culturalInitiatives + " Reaper(s)";

    let tileUnitsHTML = "";
    id('tileUnits').style.display = tileDetails.unitSets.length ? "" : "none"; //todo 10 - show and hide function in Common displayElement( element, show, displayType = "" ) //element can accept DOM or string; if string, use id()
    tileDetails.unitSets.forEach( us => {
        const player = getPlayer( us.id );
        const isExpansionPlayer = isExpansionPhase() && us.id === currentPlayer.id;
        const spanTitleAttributes = isExpansionPlayer ? " id='units-all-selected' class='link' onclick='selectAllUnits(\"selected\")'" : "";
        const units = isExpansionPlayer ? consolidateActiveUnits( currentPlayerDisambiguousUnits.filter( u => u.tileId === tileId ) ) : us.units;
        tileUnitsHTML += `<div><span${spanTitleAttributes}>Units (${player.username}): </span></div>`;
        for ( let i = 0; i < units.length; i++ ) {
            const unit = units[i];
            const spanUnitAttributes = isExpansionPlayer ? ` id='units-${unit.id}-${unit.movesRemaining||0}' class='link' onclick='selectUnits("selected","${unit.id}",${unit.movesRemaining})'` : "";
            const unitDisplay = getUnitDisplayName( unit.id, unit.count, us.id ) + ( unit.movesRemaining ? ` (${unit.movesRemaining})` : "" );
            tileUnitsHTML += `<div style='padding-left: 1em'><span${spanUnitAttributes}>${unitDisplay}</span></div>\n`;
        }
    } );
    id('tileUnits').innerHTML = tileUnitsHTML;

    if ( isExpansionPhase() && isTileChange ) {
        unselectUnits();
    }
}

function showTileDetails( show = true ) {
    id('tileDetailsContents').style.display = show ? "" : "none";
    id('tileDetailsNoContents').style.display = !show ? "" : "none";
}

function getTileDetails( id ) {
    let result = null;
    let tile = game.map.find( t => t.id === id );
    if ( tile ) {

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

        result = {
            id: id,
            type: TileType.getDisplayName( tile.getTileType() ),
            population: tile.getTileType().value,
            districtPlayerId: districtPlayerId,
            controlPlayerId: controlPlayerId,
            wonderId: wonderIds ? wonderIds[0] : null,
            religionIds: religionIds,
            culturalInitiatives: culturalInitiatives,
            politicalInitiatives: politicalInitiatives,
            unitSets: unitSets
        };
    }
    return result;
}

function getUnitDisplayName( unitTypeId, unitCount, playerId ) {
    const isMultiple = unitCount > 1;
    const unitType = getUnitType( unitTypeId );
    let name = unitTypeId === UNIT_TYPES[HERO].id ? ( playerId ? Faction.getHero( getPlayer( playerId ).factionId ).name : UNIT_TYPES[HERO].name ) : unitType.name;
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
    suggestedPath = [];
    document.querySelectorAll( '*[id^="move-polygon-"]' ).forEach( m => m.style.display = "none" );
}

function clearSelectedTile() {
    showTileDetails( false );
    selectedTile = null;
    id( "selected-polygon" ).setAttributeNS(null, "points", "" );
    unselectUnits();
}


/****** PLAYER ******/


function displayUnassignedUnits() {
    const unassignedUnits = currentPlayer.units.filter( u => u.tileId === "unassigned" );
    if ( unassignedUnits.length ) {
        id('unassignedUnits').style.display = "";
        let unitsHTML = "";
        for ( let i = 0; i < unassignedUnits.length; i++ ) {
            const unit = unassignedUnits[i];
            const unitDisplay = getUnitDisplayName( unit.id, unit.count, currentPlayer.id );
            unitsHTML += `<div style='padding-left: 1em'><span id='units-${unit.id}-1' class='link' onclick='selectUnits("unassigned","${unit.id}",1)'>${unitDisplay}</span></div>\n`;
        }
        id('unassignedUnitsValue').innerHTML = unitsHTML;
    }
    else {
        id('unassignedUnits').style.display = "none";
    }
}

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
    if ( currentPlayer.turn.hasSubmitted ) {
        isValidToSubmit = false;
        showToaster( "Player has already submitted" );
    }
    else if ( isMarketSubPhase() || isExpansionPhase() ) {
        if ( !isCurrentPlayerTurn() ) {
            isValidToSubmit = false;
            showToaster( "It is not your turn." );
        }
    }
    else if ( isMarketPhase() ) {
        if ( isMarketAuctionPhase() ) {
            if ( Number.isNaN( currentPlayer.turn.auctionBid ) ) {
                isValidToSubmit = false;
                showToaster( "Must bid or pass for auction" );
            }
        }
        else {
            if ( currentPlayer.units.some( u => u.tileId === DEFAULT_TILE ) ) {
                isValidToSubmit = false;
                showToaster( "Must assign purchased units" );
            }
        }
    }
    else if ( isExpansionPhase() ) {
        //
    }
    else if ( isHarvestPhase() ) {
        if ( !currentPlayer.turn.hasReaped ) {
            isValidToSubmit = false;
            showToaster( "Must reap harvest" );
        }
    }
    else if ( isCouncilPhase() ) {
        if ( !isDoomsdayClockPhase() ) {
            //
        }
        else {
            //
        }
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
    const hasBid = Number.isInteger( currentPlayer.turn.auctionBid );
    const auctionLot = getNextAuction( game.players );
    if ( auctionLot ) {
        const minimum = Math.floor( auctionLot.costFunction() / 2 );
        showPrompt( "Auction",
            "Enter an amount to bid on " + auctionLot.name + " (minimum: " + minimum + "WB):",
            function( response ) {
                const isCancel = response === undefined;
                if ( !(isCancel && hasBid) ) {
                    const value = parseInt( response );
                    if ( Number.isInteger( value ) && ( value >= minimum || value === 0 ) ) {
                        if ( value <= currentPlayer.warBucks ) {
                            currentPlayer.turn.auctionBid = value;
                        }
                        else {
                            showToaster( "Bid too high." );
                        }
                    }
                    else {
                        showToaster( "Invalid Bid." );
                    }
                }
            },
            hasBid ? currentPlayer.turn.auctionBid : ""
        );
    }
}

function showMarketActions() {
    openMarketModal(
        currentPlayer,
        function( response ) {
            currentPlayer = response;
            showToaster( "Purchase complete" );
            reloadPage( true );
        }
    );
}


/****** EXPANSION ******/


function showExpansionActions() {
    showMessage( "Expansion", "Click on a tile, then click on the units you would like to move." );
}


/****** HARVEST ******/


function showHarvestActions() {
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
                    currentPlayer.turn.hasReaped = true;
                }
        } );
    }
    else {
        showMessage( "Harvest", "You have already reaped your harvest this phase." );
    }
}

function calculateWarBuckHarvestReward() {
    const districts = currentPlayer.districts.tileIds.reduce( ( total, tileId ) => {
        return total + game.map.find( t => t.id === tileId ).getTileType().value;
    }, 0 );
    const religion = 0;
    return districts + religion;
}

function calculateResourceHarvestReward() {
    return currentPlayer.districts.tileIds.reduce( ( result, tileId ) => {
        const tileResourceIds = game.map.find( t => t.id === tileId ).resourceIds;
        if ( tileResourceIds.length ) {
            tileResourceIds.forEach( id => {
                const currentResource = result.find( cr => cr.id === id );
                if ( currentResource ) {
                    currentResource.count++;
                }
                else {
                    result.push( {id: id, count: 1} );
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
            game:      JSON.stringify( game )
        },
        function( response ) {
            showToaster("Turn successfully saved.");
            reloadPage();
        },
        function( error ) {
            showToaster( "Unable to save game." );
        } );
}

function reloadPage( internal = false ) {
    if ( internal ) {
        loadGameCallback( JSON.stringify( game ) );
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

function incrementTurn() {
    currentPlayer.turn.hasSubmitted = true;

    game.state.turn++;
    if ( game.state.turn >= game.players.length ) {
        completeSubPhase();
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

function completeSubPhase() {
    if ( isMarketPhase() ) {
        if ( isMarketAuctionPhase() ) {
            const auctionLot = getNextAuction( game.players );
            if ( auctionLot ) {
                const highestBidderId = game.players.reduce( (prev, current) => {
                    return ( current.turn.auctionBid > prev.turn.auctionBid || (current.turn.auctionBid === prev.turn.auctionBid && getPlayerNumber(current.id) < getPlayerNumber(prev.id)) ) ? current : prev },
                    game.players[game.state.ambassador]
                ).id;
                const winner = getPlayer( highestBidderId );
                if ( !winner.advancements.auctions.includes( auctionLot.id ) ) {
                    winner.advancements.auctions.push( auctionLot.id );
                }
                winner.advancements.auctionWins.push( auctionLot.id );
                winner.warBucks -= winner.turn.auctionBid;
                game.players.forEach( p => {
                    p.turn.auctionBid = null;
                });
            }
        }
        else {
            //
        }
    }
    else if ( isExpansionPhase() ) {
        //
    }
    else if ( isHarvestPhase() ) {
        //
    }
    else if ( isCouncilPhase() ) {
        if ( !isDoomsdayClockPhase() ) {
            //
        }
        else {
            //Doomsday stuff?
            //check for winner
        }
    }

    game.players.forEach( p => p.turn.hasSubmitted = false );
}

function getPlayerNumber( id ) {
    let result = game.players.findIndex( p => p.id === id ) - game.state.ambassador;
    if ( result < 0 ) {
        result = game.players.length + result;
    }
    return result;
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
    let auctionIndex = null;
    for ( let i = 0; i < AUCTIONS.length; i++ ) {
        if ( !players.some( p => p.advancements.auctionWins.includes( AUCTIONS[i].id ) ) ) {
            auctionIndex = i;
            break;
        }
    }

    let result = null;
    if ( Number.isInteger( auctionIndex ) ) {
        result = AUCTIONS[auctionIndex];
    }
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

function isCurrentPlayerTurn() {
    return isPlayerTurn( currentPlayer.id );
}

function isPlayerTurn( id ) {
    return game.players[game.state.turn].id === id;
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