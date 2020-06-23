class Dimension extends Entity {
    constructor( id, name, wonderIndex, description ) {
        super( id, "DIMENSION", name );
        this.wonderIndex = wonderIndex;
        this.description = description;
    }
}

function getDimension( id ) { return getEntity( id, DIMENSIONS ); }

const ROBOT_COUNT = 5;
const REAPER_COUNT = 10;
const INITIATIVE_TOKENS_COUNT = 30;
const AUCTION_WINS = 2;

const SCIENCE  = 0;
const FAITH    = 1;
const NATURE   = 2;
const WEALTH   = 3;
const CULTURE  = 4;
const POLITICS = 5;
const CONQUEST = 6;

const DIMENSIONS = [
    new Dimension( "0", "Science",  SPACE_ANTENNA,        "All Technologies" ),
    new Dimension( "1", "Faith",    SACRED_TEMPLE,        "All Doctrines and founded religion" ),
    new Dimension( "2", "Nature",   SPIRAL_GARDEN,        "All Gardens" ),
    new Dimension( "3", "Wealth",   WORLD_MONEY_EXCHANGE, "Win 2 Auctions, or purchase all Auction lots" ),
    new Dimension( "4", "Culture",  ARCH_OF_BEAUTY,       "30 Cultural Initiative Tokens" ),
    new Dimension( "5", "Politics", GREAT_SENATEHOUSE,    "30 Political Initiative Tokens" ),
    new Dimension( "6", "Conquest", BLOOD_ALTAR,          "Godhand, 5 Killer Robots, 10 Reapers, and Hero on the map" )
];