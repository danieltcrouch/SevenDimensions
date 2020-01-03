class Faction extends Entity {
    constructor( id, name, dimensionType, heroIndex, startingSupplies, description ) {
        super( id, "FACTION", name, function() { return null; } );
        this.dimensionType = dimensionType;
        this.heroIndex = heroIndex;
        this.startingSupplies = startingSupplies;
        this.description = description;
    }
}