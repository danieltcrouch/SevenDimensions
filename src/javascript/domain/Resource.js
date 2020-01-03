class Resource extends Entity {
    constructor( id, name ) {
        super( id, "RESOURCE", name, function() { return 2; } );
    }
}