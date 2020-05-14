let currentPlayerDetails;
let enemyPlayerDetails;
let isAttacker;
let status;
let battleModalCallback;
let isFirstRound;
let isAiActivated;
let hasSubmitted;

function openBattleModal( currentName, enemyName, currentPlayer, enemyPlayer, isAttackerValue, statusValues, callback ) {
    currentPlayerDetails = currentPlayer;
    enemyPlayerDetails = enemyPlayer;
    isAttacker = isAttackerValue;
    status = statusValues;
    battleModalCallback = callback;

    isFirstRound = status.attackStatus === null;
    isAiActivated = false;

    displayNames( currentName, enemyName );
    displayUnits();
    refreshDetails();

    //todo X - add link from home screen to join battle if you close it

    show( "battleModal", true, "block" );
    setCloseHandlersJS( "battleModal" );
    blurBackground();
}

function displayNames( currentName, enemyName ) {
    id('currentPlayerName').innerText = currentName;
    id('enemyPlayerName').innerText = enemyName;
    hide('ai');
}

function displayUnits() {
    displayUnitsByPlayer( currentPlayerDetails.id, currentPlayerDetails.units, 'currentUnits' );
    displayUnitsByPlayer( enemyPlayerDetails.id, enemyPlayerDetails.units, 'enemyUnits' );
}

function displayUnitsByPlayer( playerId, units, divId ) {
    let wrapper = id( divId );
    wrapper.innerHTML = ( playerId === currentPlayerDetails.id ) ?
        "<div><input id='battleSelectAll' type='checkbox' onclick='selectAllBattleUnits()'><label for='battleSelectAll'>Select All</label></div>" :
        "";

    for ( let i = 0; i < units.length; i++ ) {
        const unit = units[i];
        const id = "unit-" + unit.id;
        let div = document.createElement( "DIV" );
        if ( playerId === currentPlayerDetails.id ) {
            let input = document.createElement( "INPUT" );
            input.id = id;
            input.name = "units";
            input.type = "checkbox";
            input.checked = ( playerId === isAttacker ) ? "checked" : "";
            input.disabled = ( playerId === isAttacker ) ? "disabled" : "";
            let label = document.createElement( "LABEL" );
            label.htmlFor = id;
            label.id = id + "-display";
            label.name = "unitDisplays";
            label.innerHTML = getUnitDisplayName( unit.unitTypeId, playerId );
            div.appendChild( input );
            div.appendChild( label );
        }
        else {
            let span = document.createElement( "SPAN" );
            span.id = id + "-display";
            span.innerText = getUnitDisplayName( unit.unitTypeId, playerId );
            div.appendChild( span );
        }
        let rollSpan = document.createElement( "SPAN" );
        rollSpan.id = id + "-rolls";
        rollSpan.style.fontWeight = "bold";
        rollSpan.style.marginLeft = ".3em";
        div.appendChild( rollSpan );
        let kSpan = document.createElement( "SPAN" );
        kSpan.id = id + "-kamikaze";
        kSpan.innerHTML = `(Use Kamikaze <input id='${kSpan.id}-kamikazeCheck' name="kamikazes" type="checkbox">)`;
        kSpan.style.marginLeft = ".3em";
        kSpan.style.display = "none";
        div.appendChild( kSpan );
        let dSpan = document.createElement( "SPAN" );
        dSpan.id = id + "-deflection";
        dSpan.innerHTML = `(Use Hit Deflection <input id='${dSpan.id}-deflectionCheck' name="deflections" type="checkbox">)`;
        dSpan.style.marginLeft = ".3em";
        dSpan.style.display = "none";
        div.appendChild( dSpan );
        wrapper.appendChild( div );
    }
}

function refreshDetails() {
    if ( isAttacker ) {
        isFirstRound = false;
    }

    updateUnits();
    updateButtons();
    updateStatusDisplay();
}

function updateUnits() {
    currentPlayerDetails.units.forEach( updateUnitDisplay );
    enemyPlayerDetails.units.forEach( updateUnitDisplay );

    showTotalHits();
    showSpecialAttacks();
    showHitDeflections();
}

function updateUnitDisplay( unit ) {
    if ( unit.disbanded ) {
        id(`unit-${unit.id}-display`).style.textDecoration = "line-through";
        let input = id(`unit-${unit.id}`);
        if ( input ) {
            input.checked = false
            input.disabled = "disabled";
        }
    }

    if ( unit.roll ) {
        id(`unit-${unit.id}-rolls`).innerText = unit.roll ? (`Roll: ${unit.roll} ` + (unit.hit ? "(HIT)" : "")) : "";
    }
    else {
        id(`unit-${unit.id}-rolls`).innerText = "";
    }
}

function showSpecialAttacks() {
    const isAttackPhase = status.status === 'A';
    if ( currentPlayerDetails.bonuses.kamikaze && isAttackPhase ) {
        currentPlayerDetails.units.forEach( u => {
            const isShow = ( u.unitTypeId === UNIT_TYPES[SPEEDSTER].id && !u.disbanded );
            show( `unit-${u.id}-kamikaze`, isShow );
        } );
    }
    else {
        document.querySelectorAll('[id$="-kamikaze"]').forEach( e => hide(e.id) );
        nm('kamikazes').forEach( e => e.checked = false );
    }
}

function showHitDeflections() {
    const isDisbandPhase = status.status === 'D';
    if ( (currentPlayerDetails.bonuses.hangingGarden || currentPlayerDetails.bonuses.menOfSteel) && isDisbandPhase ) {
        currentPlayerDetails.units.forEach( u => {
            if ( u.hitDeflections ) {
                show( `unit-${u.id}-deflection` );
            }
        } );
    }
    else {
        document.querySelectorAll('[id$="-deflection"]').forEach( e => hide( e.id ) );
        nm('deflections').forEach( e => e.checked = false );
    }
}

function showTotalHits() {
    const isDisbandPhase = status.status === 'D';
    if ( isDisbandPhase ) {
        id('totalHits').innerHTML = ` &ndash; Total Hits: ${countHits(currentPlayerDetails.units, enemyPlayerDetails.units)}`;
        show('totalHits');
    }
    else {
        hide('totalHits');
    }
}

function updateButtons() {
    const isAttackPhase = status.status === 'A';
    show( 'attack', isAttackPhase );
    show( 'disband', !isAttackPhase );

    if ( isAttacker ) {
        show( 'retreat', isAttackPhase );
    }
}

function updateStatusDisplay() {
    if ( getStatus() !== null && getEnemyStatus() === null ) {
        if ( status.status === 'A' ) {
            id('status').innerText = "Waiting on opponent to submit attack...";
        }
        else {
            id('status').innerText = "Waiting on opponent to submit disband...";
        }
    }
    else {
        id('status').innerText = "";
    }
}

function updateAI( isAI ) {
    isAiActivated = isAI;
    show( 'ai', isAI );
}

function selectAllBattleUnits() {
    const isChecked = id('battleSelectAll').checked;
    nm('units').forEach( i => i.checked = isChecked && !i.disabled );
}

function getSelectedUnits() {
    return nm('units').filter( c => c.checked ).map( c => {
        const unitId = c.id.split('-')[1];
        return currentPlayerDetails.units.find( u => u.id === unitId );
    } );
}

function getKamikazeIds() {
    return nm('kamikazes').filter( e => e.checked ).map( e => e.id.split('-')[1] );
}

function getDeflectionIds() {
    return nm('deflections').filter( e => e.checked ).map( e => e.id.split('-')[1] );
}

function getStatus() {
    return isAttacker ? status.attackStatus : status.defendStatus;
}

function getEnemyStatus() {
    return !isAttacker ? status.attackStatus : status.defendStatus;
}

function attack() {
    if ( getStatus() === null ) {
        const assignedUnits = getSelectedUnits();
        if ( assignedUnits.length || !isAttacker ) {
            currentPlayerDetails.units.forEach( u => { u.roll = null; u.hit = null; } );
            enemyPlayerDetails.units.forEach(   u => { u.roll = null; u.hit = null; } );

            const kamikazeIds = getKamikazeIds();
            const rollResults = rollForUnits( assignedUnits, kamikazeIds );
            currentPlayerDetails = addRollsToDetails( currentPlayerDetails, rollResults );
            if ( kamikazeIds.length ) {
                currentPlayerDetails = addDisbandsToDetails( currentPlayerDetails, kamikazeIds.map( i => ({id: i}) ) );
            }

            saveAttack( currentPlayerDetails, isAttacker, getOpponentAttack );
            isAttacker ? status.attackStatus = 'S' : status.defendStatus = 'S';
            updateUnits();
            updateStatusDisplay();
        }
        else {
            showToaster( "Must choose units." );
        }
    }
}

function getOpponentAttack() {
    getAttacks(
        isAttacker,
        isAttacker ? ( isFirstRound ? FIRST_TIMEOUT : ( isAiActivated ? AI_TIMEOUT : NORMAL_TIMEOUT ) ) : MAX_TIMEOUT,
        function( enemyPlayerDetails ) {
            updateAI( false );
            getOpponentAttackCallback( enemyPlayerDetails );
        },
        function() {
            if ( isAttacker ) {
                updateAI( true );
                const rollResults = rollForUnits( enemyPlayerDetails.units );
                enemyPlayerDetails = addRollsToDetails( enemyPlayerDetails, rollResults );
                saveAttack( enemyPlayerDetails, false, function() {
                    getOpponentAttackCallback( enemyPlayerDetails );
                    updatePlayerStatus( false, status.defendStatus );
                } );
            }
            else {
                showToaster( "Consider playing with someone less rude." );
            }
        }
    );
}

function getOpponentAttackCallback( enemyPlayer ) {
    enemyPlayerDetails = enemyPlayer;
    status.attackStatus = 'R';
    status.defendStatus = 'R';

    status = updateStatus( 'D' );
    refreshDetails();

    id('battleSelectAll').checked = false;
    selectAllBattleUnits();
}

function disband() {
    if ( getStatus() === null ) {
        const assignedUnits = getSelectedUnits();
        if ( assignedUnits && assignedUnits.length === countHits( currentPlayerDetails.units, enemyPlayerDetails.units )  ) {
            const deflectionIds = getDeflectionIds();
            currentPlayerDetails = addDisbandsToDetails( currentPlayerDetails, assignedUnits, deflectionIds );

            hasSubmitted = true;
            saveDisbands( currentPlayerDetails, isAttacker, getOpponentDisband );
            isAttacker ? status.attackStatus = 'S' : status.defendStatus = 'S';
            updateUnits();
            updateStatusDisplay();
        }
        else {
            showToaster( "Must disband units equal to the number of enemy hits." );
        }
    }
}

function getOpponentDisband() {
    getDisbands(
        isAttacker,
        isAttacker ? ( isAiActivated ? AI_TIMEOUT : NORMAL_TIMEOUT ) : MAX_TIMEOUT,
        function( enemyPlayerDetails ) {
            updateAI( false );
            getOpponentDisbandCallback( enemyPlayerDetails );
        },
        function() {
            if ( isAttacker ) {
                updateAI( true );
                const disbandUnits = getLowestDisbands( enemyPlayerDetails.units, countHits( enemyPlayerDetails.units ) );
                enemyPlayerDetails = addDisbandsToDetails( enemyPlayerDetails, disbandUnits );
                saveDisbands( enemyPlayerDetails, false, function() {
                    getOpponentDisbandCallback( enemyPlayerDetails );
                    updatePlayerStatus( false, status.defendStatus );
                } );
            }
            else {
                showToaster( "Consider playing with someone less rude." );
            }
        }
    );
}

function getOpponentDisbandCallback( enemyPlayer ) {
    enemyPlayerDetails = enemyPlayer;
    status.attackStatus = 'R';
    status.defendStatus = 'R';

    checkEnd();
}

function checkEnd() {
    const currentAlive = currentPlayerDetails.units.filter( u => !u.disbanded ).length;
    const enemyAlive = enemyPlayerDetails.units.filter( u => !u.disbanded ).length;
    if ( currentAlive && enemyAlive ) {
        status = updateStatus( 'A' );
        refreshDetails();
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

        status = {
            status: null,
            attackStatus: null,
            defendStatus: null,
        };
        end();
        refreshDetails();
        hide( 'attack');
        hide( 'disband');
        hide( 'retreat');
    }
}

function retreat() {
    endBattle( currentPlayerDetails, enemyPlayerDetails );
    closeOutBattleModal();
}

function closeOutBattleModal() {
    battleId = null;

    closeModalJS( "battleModal" );
    battleModalCallback( currentPlayerDetails, enemyPlayerDetails );
}