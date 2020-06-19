class Entity {
    constructor( id, type, name, costFunction ) {
        this.id = id;
        this.type = type;
        this.name = name;
        this.costFunction = costFunction;
    }
}

function getEntity( id, list ) { return list.find( i => i.id === id ); }