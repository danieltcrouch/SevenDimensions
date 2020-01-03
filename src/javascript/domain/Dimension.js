class Dimension extends Entity {
    constructor( id, name, wonderIndex, description ) {
        super( id, "DIMENSION", name, function() { return null; } );
        this.wonderIndex = wonderIndex;
        this.description = description;
    }
}