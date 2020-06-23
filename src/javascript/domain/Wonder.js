class Wonder extends Purchasable {
    constructor( id, name ) {
        super( id, "WONDER", name, Wonder.getCost, Wonder.getAdjustedCost );
    }

    static getCost() { return WONDER_COST; }

    static getAdjustedCost( hasMonuments ) { return hasMonuments ? 0 : Wonder.getCost(); }

    getCostOrLocked( currentPlayer, allPlayers, hasMonuments ) {
        return Purchasable.displayCostLocked( this.isLocked( currentPlayer, allPlayers ), Wonder.getAdjustedCost( hasMonuments ) );
    }

    isLocked( currentPlayer, allPlayers = [] ) {
        const dimensionId = this.getDimensionId();
        return !currentPlayer.dimensions.some( d => d.id === dimensionId ) || allPlayers.map( p => p.dimensions ).flat().filter( d => d.wonderTileId ).map( d => d.id ).some( d => d === dimensionId );
    }

    getDimensionId() {
        return DIMENSIONS.find( d => WONDERS[d.wonderIndex].id === this.id ).id;
    }
}

function getWonder( id ) { return getEntity( id, WONDERS ); }

function getWonderFromDimension( id ) { return WONDERS[getDimension( id ).wonderIndex]; }

const WONDER_COST = 20;

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