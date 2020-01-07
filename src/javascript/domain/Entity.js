class Entity {
    constructor( index, type, name, costFunction ) {
        this.id = index + "";
        this.type = type;
        this.name = name;
        this.costFunction = costFunction;
    }
}