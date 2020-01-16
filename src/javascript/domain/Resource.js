class Resource extends Entity {
    constructor( id, name ) {
        super( id, "RESOURCE", name, function() { return 2; } );
    }
}

function getResource( id ) { return getEntity( id, RESOURCES ); }

function getAetherCount(     playerResources ) { return playerResources.find( r => r.id === "2" ).count; }
function getChronotineCount( playerResources ) { return playerResources.find( r => r.id === "1" ).count; }
function getUnobtaniumCount( playerResources ) { return playerResources.find( r => r.id === "0" ).count; }

const RESOURCES = [
    new Resource( "0", "Unobtanium" ),
    new Resource( "1", "Chronotine" ),
    new Resource( "2", "Aether" )
];