class UnitType {
    constructor( id, name, cost, hit, move, max ) {
        this.id = id;
        this.type = "UNIT";
        this.name = name;
        this.hit = hit;
        this.move = move;
        this.cost = cost;
        this.max = max;
    }
}

function getUnitType( id ) { return UNIT_TYPES.find( u => u.id === id ); }

const APOSTLE      = 0;
const REAPER       = 1;
const BOOMER       = 2;
const SPEEDSTER    = 3;
const JUGGERNAUT   = 4;
const ROBOT        = 5;
const GODHAND      = 6;
const HERO         = 7;

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


/**** ENTITY ****/


class Unit extends Entity {
    constructor( id, unitType, tileId ) {
        super( id, unitType.type, unitType.name, function() { return unitType.cost; } );
        this.unitType = unitType;
        this.tileId = tileId;
        this.movesRemaining = unitType.move;
    }
}


/**** HERO ****/


class Hero extends Unit {
    constructor( id, tileId, name, description ) {
        super( id, UNIT_TYPES[HERO], tileId );
        this.type = this.type + "-Hero";
        this.name = name;
        this.description = description;

        if ( id === (ULTRA_MAN+"") ) {
            this.hit = 4;
            this.move = 3;
        }
    }
}

function getHero( id ) { return getEntity( id, HEROES ); }

const VIRUS                = 0;
const THE_GRAND_INQUISITOR = 1;
const PHILOSORAPTOR        = 2;
const UNCLE_SAM            = 3;
const GRAVELBOG            = 4;
const MR_DEEPPOCKETS       = 5;
const ULTRA_MAN            = 6;
const KING_ARTHUR          = 7;
const WINCHESTER           = 8;
const SLORGOTH             = 9;

const HEROES = [
    new Hero( "0", null, "Virus",                "When in a successful invading force, receive a free Technology or 5WB" ),
    new Hero( "1", null, "The Grand Inquisitor", "When in a successful invading force, perform a mini-Inquisition (worth 5WB) against the defeated player" ),
    new Hero( "2", null, "Philosoraptor ",       "When in a district, this district cannot be attacked / Players may not enact Diplomatic Immunity on adjacent districts" ),
    new Hero( "3", null, "Uncle Sam",            "When in a district, double the strength of Annexations  from this district" ),
    new Hero( "4", null, "Gravelbog",            "When on a tile with a resource, receive 2 additional resources of that kind during the Harvest Phase" ),
    new Hero( "5", null, "Mr. Deeppockets",      "When in a successful invading force, take 4WB from the defeated player" ),
    new Hero( "6", null, "Ultra-Man",            "Hit value of 4, move range of 3 / Receive +1 on combat rolls when invading districts" ),
    new Hero( "7", null, "King Arthur",          "When starting in Camelot, may initiate a Quest but can no longer move / Enemies are incentivized to come to your aid" ),
    new Hero( "8", null, "Winchester the Bear",  "When in a successful invading force, 2 Bear Berserkers are immediately trained in that district" ),
    new Hero( "9", null, "Slorgoth",             "When in a successful invading force, receive a free Chaos Card" )
];


/**** APOSTLE ****/


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
    //todo 5 - move to move service
}

function removeUnit() {
    //todo 5 - move to move service
}