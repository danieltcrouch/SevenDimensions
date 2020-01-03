class Card extends Entity {
    constructor( id, type, name, cost, description ) {
        super( id, "CARD-" + type, name, function() { return cost; } );
        this.description = description;
        this.inUse = false;
    }
}