class Dimension extends Entity {
    constructor( id, name, wonderIndex, cost, description ) {
        super( id, "DIMENSION", name, Dimension.getCost );
        this.wonderIndex = wonderIndex;
        this.description = description;
    }

    static getCost() { return 20; }
}

function getDimension( id ) { return getEntity( id, DIMENSIONS ); }

const WEALTH   = 0;
const SCIENCE  = 1;
const FAITH    = 2;
const CULTURE  = 3;
const POLITICS = 4;
const NATURE   = 5;
const CONQUEST = 6;

const DIMENSIONS = [
    new Dimension( "0", "Wealth",   ARCH_OF_BEAUTY,       "Win 2 Auctions, or purchase all Auction lots" ),
    new Dimension( "1", "Science",  GREAT_SENATEHOUSE,    "All Technologies" ),
    new Dimension( "2", "Faith",    SPACE_ANTENNA,        "All Doctrines and founded religion" ),
    new Dimension( "3", "Culture",  SACRED_TEMPLE,        "30 Cultural Initiative Tokens" ),
    new Dimension( "4", "Politics", WORLD_MONEY_EXCHANGE, "30 Political Initiative Tokens" ),
    new Dimension( "5", "Nature",   SPIRAL_GARDEN,        "All Gardens" ),
    new Dimension( "6", "Conquest", BLOOD_ALTAR,          "Godhand, 5 Killer Robots, 10 Reapers, and Hero on the map" )
];