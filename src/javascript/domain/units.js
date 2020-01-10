const APOSTLE      = 0;
const REAPER       = 1;
const BOOMER       = 2;
const SPEEDSTER    = 3;
const JUGGERNAUT   = 4;
const ROBOT        = 5;
const GODHAND      = 6;
const HERO         = 7;

function getUnitTypeFromId( id ) {
    return UNIT_TYPES.find( u => u.id === id );
}

const UNIT_TYPES = [
    new UnitType( "0", "Apostle",      6,  0,  1 ),
    new UnitType( "1", "Reaper",       1,  12, 1 ),
    new UnitType( "2", "Boomer",       3,  10, 1 ),
    //Bear-serker
    new UnitType( "3", "Speedster",    5,  9,  3 ),
    new UnitType( "4", "Juggernaut",   7,  7,  2 ),
    new UnitType( "5", "Killer Robot", 11, 6,  2, 5 ),
    new UnitType( "6", "Godhand",      13, 4,  1, 1 ),
    new UnitType( "7", "Hero",         25, 7,  2, 1 )
];

const APOSTLE_FOUND = "0";
const APOSTLE_EVANG = "1";

function performApostleAbility( abilityId, unit, player ) {
    if ( abilityId === APOSTLE_FOUND ) {
        //remove unit in both places
        //add district to player
        //remove unit display (combine to killing in object in abstracted method for adding/removing units)
        //add district display
    }
    else if ( abilityId === APOSTLE_EVANG ) {
        //add religion to player
        //add religion display
    }
}

function addUnit( unit, player ) {
    //
}

function removeUnit() {
    //
}