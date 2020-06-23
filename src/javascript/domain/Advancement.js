class Advancement extends Purchasable {
    constructor( id, type, name, description, costFunction, adjustedCostFunction ) {
        super( id, "ADV-" + type, name, costFunction, adjustedCostFunction );
        this.description = description;
    }
}

function getAdvancement( id, list ) { return getEntity( id, list ); }


/**** TECHNOLOGY ****/


class Technology extends Advancement {
    constructor( id, name, description ) {
        super( id, "Technology", name, description, Technology.getCost, Technology.getAdjustedCost );
    }

    static getCost() { return 7; }

    static getAdjustedCost( edenCount ) { return Math.max(7 - edenCount, 1); }
}

function getTechnology( id ) { return getEntity( id, TECHNOLOGIES ); }

const ADVANCED_FLIGHT_CAPACITY = 4;
const GLOBAL_NETWORKING_CARD_MAX = 10;
const GLOBAL_NETWORKING_ADVANCEMENT_MAX = 10;
const BIODOMES_GARDEN_MULTIPLIER = 4;

const ORE_PROCESSING         = 0;
const MILITARY_TACTICS       = 1;
const SUBTERRANEAN_RAILS     = 2;
const ADVANCED_FLIGHT        = 3;
const MODIFIED_PLASTICS      = 4;
const ADAPTIVE_MAPPING       = 5;
const LONG_RANGE_ROCKETRY    = 6;
const GLOBAL_NETWORKING      = 7;
const GLOBAL_TRAVEL          = 8;
const BIODOMES               = 9;
const CENTRALIZED_CURRICULUM = 10;
const WARP_DRIVES            = 11;
const GENETIC_RESURRECTION   = 12;
const TIME_TRAVEL            = 13;

const TECHNOLOGIES = [
    new Technology( "0",  "Ore Processing",         "Exchange 3 of the same resource for 8WB" ),
    new Technology( "1",  "Military Tactics",       "Reapers receive +1 on combat rolls" ),
    new Technology( "2",  "Subterranean Rails",     "Units receive +1 move range" ),
    new Technology( "3",  "Advanced Flight",        "Speedsters may carry up to 4 Apostles or Reapers" ),
    new Technology( "4",  "Modified Plastics",      "Boomers cost -1WB" ),
    new Technology( "5",  "Adaptive Mapping",       "Units may enter Volcano tiles" ),
    new Technology( "6",  "Long-range Rocketry",    "Boomers, Juggernauts, and Godhands can bombard" ),
    new Technology( "7",  "Global Networking",      "May purchase up to 10 cards and advancements per round" ),
    new Technology( "8",  "Global Travel",          "Units may use 1 move to transport between districts" ),
    new Technology( "9",  "Bio-Domes",              "Gardens cost 4WB per district" ),
    new Technology( "10", "Centralized Curriculum", "Immune to Inquisitions" ),
    new Technology( "11", "Warp Drives",            "Speedsters and Godhands receive +1 move range" ),
    new Technology( "12", "Genetic Resurrection",   "After the Expansion Phase, revive 1 unit that died that round" ),
    new Technology( "13", "Time Travel",            "Killer Robots receive 2 rolls per round-of-combat" )
];


/**** DOCTRINE ****/


class Doctrine extends Advancement {
    constructor( id, name, description ) {
        super( id, "Doctrine", name, description, Doctrine.getCost, Doctrine.getAdjustedCost );
    }

    static getCost() { return 7; }

    static getAdjustedCost( edenCount ) { return Math.max(7 - edenCount, 1); }
}

function getDoctrine( id ) { return getEntity( id, DOCTRINES ); }

const CRUSADE_HIT = 2;
const INQUISITION_VALUE = 20;

const HUMAN_SACRIFICE           = 0;
const WHISPERS_IN_THE_DESERT    = 1;
const IDOL_WORSHIP              = 2;
const DIVINE_ORACLES            = 3;
const RITUALISM                 = 4;
const WHISPERS_IN_THE_MOUNTAINS = 5;
const MONUMENTS_TO_GOD          = 6;
const CRUSADES                  = 7;
const SECULARISM                = 8;
const WHISPERS_IN_DISTANT_LANDS = 9;
const DIVINE_RIGHT              = 10;

const DOCTRINES = [
    new Doctrine( "0",  "Human Sacrifice",           "Speedsters can kamikaze" ),
    new Doctrine( "1",  "Whispers in the Desert",    "Cult of Secrets is founded" ),
    new Doctrine( "2",  "Idol Worship",              "Resources do not have to match when exchanged for War-Bucks" ),
    new Doctrine( "3",  "Divine Oracles",            "After elections, receive a random unused office" ),
    new Doctrine( "4",  "Ritualism",                 "Every Harvest Phase, receive +1WB for districts with religion in your domain" ),
    new Doctrine( "5",  "Whispers in the Mountains", "Path of Enlightenment is founded" ),
    new Doctrine( "6",  "Monuments to God",          "Wonder construction is free" ),
    new Doctrine( "7",  "Crusades",                  "Units receive +2 on combat rolls when invading districts with your religion" ),
    new Doctrine( "8",  "Secularism",                "After purchasing an advancement, receive a Doctrine or Technology" ),
    new Doctrine( "9",  "Whispers in Distant Lands", "Church of Truth is founded" ),
    new Doctrine( "10", "Divine Right",              "Before every Market Phase, you may perform an Inquisition (worth 20WB)" )
];


/**** GARDEN ****/


class Garden extends Advancement {
    constructor( id, name, description ) {
        super( id, "Garden", name, description, Garden.getCost, Garden.getAdjustedCost );
    }

    static getCost( districtCount ) { return GARDEN_MULTIPLIER * districtCount; }

    static getAdjustedCost( districtCount, hasBioDomes, edenCount ) {
        let cost = (hasBioDomes ? BIODOMES_GARDEN_MULTIPLIER : GARDEN_MULTIPLIER) * districtCount;
        cost = Math.max(cost - edenCount, 1);
        return cost;
    }

    static isLocked( districtCount ) { return districtCount < 2; }

    getCostOrLocked( districtCount, hasBioDomes, edenCount ) {
        return Purchasable.displayCostLocked( Garden.isLocked( districtCount ), Garden.getAdjustedCost( districtCount, hasBioDomes, edenCount ) );
    }
}

function getGarden( id ) { return getEntity( id, GARDENS ); }

const GARDEN_MULTIPLIER = 7;
const WATER_GARDEN_HIT = 2;
const VEGETABLE_GARDEN_VALUE = 2;

const WATER_GARDEN     = 0;
const VEGETABLE_GARDEN = 1;
const FLOWER_GARDEN    = 2;
const HANGING_GARDEN   = 3;
const GARDEN_OF_EDEN   = 4;

const GARDENS = [
    new Garden( "0", "Water Garden",     "Units defending a district receive +2 on combat rolls" ),
    new Garden( "1", "Vegetable Garden", "Every Harvest Phase, each district produces double the resources" ),
    new Garden( "2", "Flower Garden",    "Every Harvest Phase, receive +1WB per district" ),
    new Garden( "3", "Hanging Garden",   "Districts and units in districts receive +1 hit deflection" ),
    new Garden( "4", "Garden of Eden",   "Advancements cost -1WB per district (minimum of 1)" )
];


/**** AUCTION ****/


class Auction extends Advancement {
    constructor( id, name, cost, description ) {
        super( id, "Auction Lot", name, description, function() { return cost; }, function( edenCount ) { Auction.getAdjustedCost( cost, edenCount ); } );
    }

    static getAdjustedCost( cost, edenCount ) {
        return Math.max(cost - edenCount, 1);
    }

    getCostOrLocked( players, edenCount ) {
        return Purchasable.displayCostLocked( this.isLocked( players ), Auction.getAdjustedCost( this.defaultCost(), edenCount ) );
    }

    isLocked( players ) {
        return !players.some( p => p.advancements.auctionWins.includes( this.id ) );
    }
}

function getAuctionLot( id ) { return getEntity( id, AUCTIONS ); }

const MULTI_LEVEL_MARKET_VALUE = 3;
const PROFESSIONAL_ATHLETICS_VALUE = 3;
const SUPER_DELEGATES_VALUE = 7;
const THINK_TANK_VALUE = 4;
const ATLANTIS_STOCK_VALUE = 7;
const WEAPONS_MANUFACTURER_VALUE = 3;

const COASTAL_PROPERTY       = 0;
const MULTI_LEVEL_MARKET     = 1;
const PROFESSIONAL_ATHLETICS = 2;
const SUPER_DELEGATES        = 3;
const THINK_TANK             = 4;
const ATLANTIS_STOCK         = 5;
const WEAPONS_MANUFACTURER   = 6;

const AUCTIONS = [
    new Auction( "0", "Coastal Property",        7, "Every Harvest Phase, receive double the War-Bucks from 1 non-Capital district" ),
    new Auction( "1", "Multi-Level Market",     14, "Every Harvest Phase, take 3WB from the players to either side" ),
    new Auction( "2", "Professional Athletics", 21, "Receive 3x as many Initiative Tokens for the Festival of Fairies" ),
    new Auction( "3", "Super-Delegates",        28, "Upon purchase, receive 7 Initiative Tokens" ),
    new Auction( "4", "Think Tank",             35, "Upon purchase, receive 4 Technologies or Doctrines and 4 Chaos Cards" ),
    new Auction( "5", "Atlantis Stock",         49, "Your investment for the Gambler’s Gambit is paid back 7x" ),
    new Auction( "6", "Weapons Manufacturer",   70, "All units cost a maximum of 3WB" )
];