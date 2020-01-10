class Resource extends Entity {
    constructor( id, name ) {
        super( id, "RESOURCE", name, function() { return 2; } );
    }
}

function getResource( id ) { return getEntity( id, RESOURCES ); }

const RESOURCES = [
    new Resource( "0", "Unobtanium" ),
    new Resource( "1", "Chronotine" ),
    new Resource( "2", "Aether" )
];