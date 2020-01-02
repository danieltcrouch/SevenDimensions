class Advancement extends Entity {
    constructor( id, type, name, costFunction, description ) {
        super( id, "ADV-" + type, name, costFunction );
        this.description = description;
    }
}
