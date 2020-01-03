class Wonder extends Entity {
    constructor( id, name ) {
        super( id, "WONDER", name, function() { return 20; } );
    }
}