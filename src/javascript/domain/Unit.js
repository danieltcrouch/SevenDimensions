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

class Unit extends Entity {
    constructor( id, unitType, tileId ) {
        super( id, unitType.type, unitType.name, function() { return unitType.cost; } );
        this.unitType = unitType;
        this.tileId = tileId;
        this.movesRemaining = unitType.move;
    }
}

class Hero extends Unit {
    constructor( id, tileId, name, description ) {
        super( id, UNIT_TYPES[HERO], tileId );
        this.type = this.type + "-Hero";
        this.name = name;
        this.description = description;

        if ( id === ULTRA_MAN ) {
            this.hit = 4;
            this.move = 3;
        }
    }
}