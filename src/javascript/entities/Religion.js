class Religion extends Entity {
    constructor( id, name, doctrineIndex ) {
        super( id, "RELIGION", name, function() { return null; } );
        this.doctrineIndex = doctrineIndex;
    }
}