class Religion extends Entity {
    constructor( id, name, doctrineIndex ) {
        super( id, "RELIGION", name );
        this.doctrineIndex = doctrineIndex;
    }
}

function getReligion( id ) { return getEntity( id, RELIGIONS ); }

function getReligionFromDoctrine( id ) { return RELIGIONS.find( r => id === DOCTRINES[r.doctrineIndex].id ); }

const RELIGIONS = [
    new Religion( "0", "Cult of Secrets",       WHISPERS_IN_THE_DESERT ),
    new Religion( "1", "Path of Enlightenment", WHISPERS_IN_THE_MOUNTAINS ),
    new Religion( "2", "Church of Truth",       WHISPERS_IN_DISTANT_LANDS )
];