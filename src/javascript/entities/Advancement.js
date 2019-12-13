class Advancement extends Entity {
    constructor( id, type, name, costFunction, description ) {
        super( id, "ADV-" + type, name, costFunction );
        this.description = description;
    }
}

//todo 4 - finish out all entity files, making classes and helper functions for everything; don't use sub-folders--put it all under entities
