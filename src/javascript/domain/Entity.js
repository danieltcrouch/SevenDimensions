class Entity {
    constructor( id, type, name ) {
        this.id = id;
        this.type = type;
        this.name = name;
    }
}

function getEntity( id, list ) { return list.find( i => i.id === id ); }

class Purchasable extends Entity {
    constructor( id, type, name, defaultCostFunction, adjustedCostFunction = null ) {
        super( id, type, name );
        this.defaultCost  = defaultCostFunction;
        this.adjustedCost = adjustedCostFunction || defaultCostFunction;
    }

    static displayCostLocked( cost, isLocked ) {
        return isLocked ? LOCKED_SPAN : ( cost + "WB");
    }

    static displayCost( cost ) {
        return Purchasable.displayCostLocked( cost, false );
    }
}

const LOCKED_SPAN = "<span style='font-style: italic'>Locked</span>";