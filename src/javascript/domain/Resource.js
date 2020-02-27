class Resource extends Entity {
    constructor( id, name ) {
        super( id, "RESOURCE", name, function() { return 2; } );
    }
}

function getResource( id ) { return getEntity( id, RESOURCES ); }

function getAetherCount(     playerResources ) { return playerResources.reduce( (prev, current) => current.id === "2" ? current.count : prev, 0 ); }
function getChronotineCount( playerResources ) { return playerResources.reduce( (prev, current) => current.id === "1" ? current.count : prev, 0 ); }
function getUnobtaniumCount( playerResources ) { return playerResources.reduce( (prev, current) => current.id === "0" ? current.count : prev, 0 ); }

const RESOURCES = [
    new Resource( "0", "Unobtanium" ),
    new Resource( "1", "Chronotine" ),
    new Resource( "2", "Aether" )
];