class Wonder extends Entity {
    constructor( id, name ) {
        super( id, "WONDER", name, Wonder.getCost );
    }

    static getCost() { return 20; }
}

function getWonder( id ) { return getEntity( id, WONDERS ); }

const SPACE_ANTENNA        = 0;
const SACRED_TEMPLE        = 1;
const SPIRAL_GARDEN        = 2;
const WORLD_MONEY_EXCHANGE = 3;
const ARCH_OF_BEAUTY       = 4;
const GREAT_SENATEHOUSE    = 5;
const BLOOD_ALTAR          = 6;

const WONDERS = [
    new Wonder( "0", "The Arch of Beauty" ),
    new Wonder( "1", "The Great Senatehouse" ),
    new Wonder( "2", "The Space Antenna" ),
    new Wonder( "3", "The Sacred Temple" ),
    new Wonder( "4", "The World Money Exchange" ),
    new Wonder( "5", "The Spiral Garden" ),
    new Wonder( "6", "The Blood Altar" )
];