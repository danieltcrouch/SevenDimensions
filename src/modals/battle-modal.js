let currentPlayerDetails;
let enemyPlayerDetails;
let isAttacking;
let timeLimit;
let battleModalCallback;
let isFirstRound;
let isAiActivated;

function openBattleModal( currentPlayer, enemyPlayer, isAttackingValue, timeLimitValue, callback ) {
    currentPlayerDetails = currentPlayer;
    enemyPlayerDetails = enemyPlayer;
    isAttacking = isAttackingValue;
    timeLimit = timeLimitValue;
    battleModalCallback = callback;

    isFirstRound = true;
    isAiActivated = false;

    displayUnits();
    displayButtons();

    show( "battleModal", true, "block" );
    setCloseHandlersJS( "battleModal" );
    blurBackground();
}

function displayUnits() {
    displayUnitsByPlayer( currentPlayerDetails.id, currentPlayerDetails.units, 'currentUnits' );
    displayUnitsByPlayer( enemyPlayerDetails.id, enemyPlayerDetails.units, 'enemyUnits' );
}

function displayUnitsByPlayer( playerId, units, divId ) {
    let wrapper = id( divId );
    wrapper.innerHTML = "";

    for ( let i = 0; i < units.length; i++ ) {
        const unit = units[i];
        const id = "unit-" + unit.id;
        let div = document.createElement( "DIV" );
        if ( playerId === currentPlayerDetails.id ) {
            let input = document.createElement( "INPUT" );
            input.id = id;
            input.name = "units";
            input.type = "checkbox";
            input.checked = ( playerId === isAttacking ) ? "checked" : "";
            input.disabled = ( playerId === isAttacking ) ? "disabled" : "";
            let label = document.createElement( "LABEL" );
            label.htmlFor = id;
            label.id = id + "Display";
            label.innerHTML = getUnitDisplayName( unit.id, playerId );
            div.appendChild( input );
            div.appendChild( label );
        }
        else {
            let span = document.createElement( "SPAN" );
            span.id = id + "Display";
            div.appendChild( span );
        }
        let rollSpan = document.createElement( "SPAN" );
        rollSpan.id = id + "Rolls";
        rollSpan.style.fontWeight = "bold";
        div.appendChild( rollSpan );
        wrapper.appendChild( div );
    }
}

function displayButtons() {
    updateButtons( true );
    if ( isAttacking ) {
        show('retreat');
    }
}

function getSelectedUnits() {
    return nm('units').filter( c => c.checked ).map( c => {
        const unitId = c.id.split('-')[1];
        return currentPlayerDetails.units.find( u => u.id === unitId );
    } );
}

function displayHits() {
    currentPlayerDetails.units.forEach( u => {
        id(`unit${u.id}Rolls`).innerText = `Roll: ${u.roll} ` + (u.hit ? "(HIT)" : "");
    } );

    enemyPlayerDetails.units.forEach( u => {
        id(`unit${u.id}Rolls`).innerText = `Roll: ${u.roll} ` + (u.hit ? "(HIT)" : "");
    } );
}

function clearHits() {
    currentPlayerDetails.units.forEach( u => {
        id(`unit${u.id}Rolls`).innerText = "";
    } );

    enemyPlayerDetails.units.forEach( u => {
        id(`unit${u.id}Rolls`).innerText = "";
    } );
}

function updateUnits() {
    currentPlayerDetails.units.forEach( u => {
        if ( u.disbanded ) {
            id(`unit${u.id}Display`).style.textDecoration = "line-through";
            id(`unit${u.id}`).checked = false
            id(`unit${u.id}`).disabled = "disabled";
        }
    } );

    enemyPlayerDetails.units.forEach( u => {
        if ( u.disbanded ) {
            id(`unit${u.id}Display`).style.textDecoration = "line-through";
            id(`unit${u.id}`).checked = false;
            id(`unit${u.id}`).disabled = "disabled";
        }
    } );
}

function updateButtons( isRolling ) {
    show( 'attack', isRolling );
    show( 'disband', !isRolling );
}

function startDisbands() {
    updateButtons( false );
    if ( isAttacking ) {
        isFirstRound = false;
        updateStatus( 'D' );
    }
}

function startAttacking() {
    clearHits();
    updateButtons( true );
    if ( isAttacking ) {
        updateStatus( 'A' );
    }
}

function attack() {
    const assignedUnits = getSelectedUnits();
    if ( assignedUnits && assignedUnits.length ) {
        const rollResults = rollForUnits( assignedUnits );
        currentPlayerDetails = addRollsToDetails( currentPlayerDetails, rollResults );

        saveHits( currentPlayerDetails, isAttacking, function() {
            id('status').innerText = "Waiting on opponent to submit attack...";
            getHits(
                isAttacking,
                isAttacking ? ( isFirstRound ? timeLimit : ( isAiActivated ? AI_TIMEOUT : NORMAL_TIMEOUT ) ) : MAX_TIMEOUT,
                getHitsCallback,
                function() {
                    if ( isAttacking ) {
                        //AI Takeover
                        isAiActivated = true;
                        const rollResults = rollForUnits( enemyPlayerDetails.units );
                        enemyPlayerDetails = addRollsToDetails( enemyPlayerDetails, rollResults );
                        saveHits( enemyPlayerDetails, !isAttacking, function() { getHitsCallback( enemyPlayerDetails ); } );
                    }
                    else {
                        showToaster( "Consider playing with someone less rude." );
                    }
                }
            );
        } );
    }
    else {
        showToaster( "Must choose units." );
    }
}

function getHitsCallback( enemyPlayer ) {
    enemyPlayerDetails = enemyPlayer;
    displayHits();
    currentPlayerDetails.units.forEach( u => { u.roll = null; u.hit = null; } );
    startDisbands();
}

function disband() {
    const assignedUnits = getSelectedUnits();
    if ( assignedUnits && assignedUnits.length === countHits( enemyPlayerDetails.units ) ) {
        currentPlayerDetails = addDisbandsToDetails( currentPlayerDetails, assignedUnits );

        saveDisbands( currentPlayerDetails, function() {
            id('status').innerText = "Waiting on opponent to submit disbands...";
            getDisbands(
                isAttacking ? ( isAiActivated ? AI_TIMEOUT : NORMAL_TIMEOUT ) : MAX_TIMEOUT,
                getDisbandsCallback,
                function() {
                    if ( isAttacking ) {
                        //AI Takeover
                        isAiActivated = true;
                        const disbandUnits = getLowestDisbands( enemyPlayerDetails.units, countHits( enemyPlayerDetails.units ) );
                        enemyPlayerDetails = addDisbandsToDetails( enemyPlayerDetails, disbandUnits );
                        saveDisbands( enemyPlayerDetails, function() { getDisbandsCallback( enemyPlayerDetails ); } );
                    }
                    else {
                        showToaster( "Consider playing with someone less rude." );
                    }
                }
            );
        } );
    }
    else {
        showToaster( "Must disband units equal to the number of enemy hits." );
    }
}

function getDisbandsCallback( enemyPlayer ) {
    enemyPlayerDetails = enemyPlayer;
    updateUnits();

    const currentAlive = currentPlayerDetails.units.filter( u => !u.disbanded ).length;
    const enemyAlive = enemyPlayerDetails.units.filter( u => !u.disbanded ).length;
    if ( currentAlive && enemyAlive ) {
        startAttacking();
    }
    else {
        if ( currentAlive ) {
            showToaster( "You have won!" );
        }
        else if ( enemyAlive ) {
            showToaster( "You have lost." );
        }
        else {
            showToaster( "The battle is a draw." );
        }
    }
}

function retreat() {
    closeOutBattleModal();
}

function closeOutBattleModal() {
    if ( isAttacking ) {
        endBattle( currentPlayerDetails, enemyPlayerDetails );
    }

    closeModalJS( "battleModal" );
    battleModalCallback( currentPlayerDetails, enemyPlayerDetails );
}