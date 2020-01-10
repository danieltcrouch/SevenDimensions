class Faction extends Entity {
    constructor( id, name, dimensionType, heroIndex, startingSupplies, description ) {
        super( id, "FACTION", name, function() { return null; } );
        this.dimensionType = dimensionType;
        this.heroIndex = heroIndex;
        this.startingSupplies = startingSupplies;
        this.description = description;
    }

    static getHero( id ) { return HEROES[ getFaction( id ).heroIndex ]; }
}

function getFaction( id ) { return getEntity( id, FACTIONS ); }

const CYBER_NET                  = 0;
const HOLY_EMPIRE                = 1;
const DINOSAUR_NATION            = 2;
const AMERICA_THE_BRAVE          = 3;
const LIVING_MOUNTAIN            = 4;
const MEGA_MONEY_CONGLOMERATE    = 5;
const JUSTICE_HEROES             = 6;
const KNIGHTS_OF_THE_ROUND_TABLE = 7;
const LOTS_OF_BEARS              = 8;
const SPACE_DEMONS               = 9;

const FACTIONS = [
    new Faction( "0", "Cyber-NET",                  "Science",  VIRUS,                { warBucks: 8,  units: [ {id:"0",count:1}, {id:"1",count:1}, {id:"2",count:1}, {id:"3",count:1} ],                   advancements: { technology: ["0","2"], doctrine: [],        garden: [],    auction: [] },    politicalTokens: 0, culturalTokens: 0, cards: null }, "If a Technology or Doctrine has already been researched by another player, pay half the price for that advancement" ),
    new Faction( "1", "Holy Empire",                "Faith",    THE_GRAND_INQUISITOR, { warBucks: 8,  units: [ {id:"0",count:1}, {id:"1",count:1}, {id:"2",count:1}, {id:"3",count:1} ],                   advancements: { technology: [],        doctrine: ["0","1"], garden: [],    auction: [] },    politicalTokens: 0, culturalTokens: 0, cards: null }, "Cult of Secrets has been founded in the Capital / Receive +1WB for enemy districts practicing Cult of Secrets / All units can spread religion / Enemy Apostles must be accompanied by a combat unit to purge Cult of Secrets and can move no more" ),
    new Faction( "2", "Dinosaur Nation",            "Culture",  PHILOSORAPTOR,        { warBucks: 8,  units: [ {id:"0",count:1}, {id:"1",count:1}, {id:"2",count:1}, {id:"3",count:1} ],                   advancements: { technology: [],        doctrine: ["0"],     garden: [],    auction: [] },    politicalTokens: 0, culturalTokens: 1, cards: null }, "Initiative Tokens cost a max of 4WB / Receive 2 Cultural Initiative Tokens every round your units are not involved in a battle / Receive 1 Political Initiative Tokens every round your units are involved in a battle" ),
    new Faction( "3", "America the Brave",          "Politics", UNCLE_SAM,            { warBucks: 8,  units: [ {id:"0",count:1}, {id:"1",count:1}, {id:"2",count:1}, {id:"3",count:1} ],                   advancements: { technology: ["0"],     doctrine: [],        garden: [],    auction: [] },    politicalTokens: 1, culturalTokens: 0, cards: null }, "All units except Apostles cost +2WB / Receive +2 Initiative Token strength for any Initiative, political or cultural" ),
    new Faction( "4", "Living Mountain",            "Nature",   GRAVELBOG,            { warBucks: 8,  units: [ {id:"0",count:2}, {id:"1",count:1}, {id:"2",count:1}, {id:"3",count:1} ],                   advancements: { technology: [],        doctrine: [],        garden: ["0"], auction: [] },    politicalTokens: 0, culturalTokens: 0, cards: null }, "Hanging Gardens provide an additional +1 hit deflection / Ignore Gardens when invading districts" ),
    new Faction( "5", "Mega-Money Conglomerate",    "Wealth",   MR_DEEPPOCKETS,       { warBucks: 16, units: [ {id:"0",count:1}, {id:"1",count:1}, {id:"2",count:1}, {id:"3",count:1} ],                   advancements: { technology: [],        doctrine: [],        garden: [],    auction: ["0"] }, politicalTokens: 0, culturalTokens: 0, cards: null }, "During the Market Phase, for every 4WB spent, receive 1WB back" ),
    new Faction( "6", "Justice Heroes",             "Conquest", ULTRA_MAN,            { warBucks: 8,  units: [ {id:"0",count:1}, {id:"1",count:2}, {id:"2",count:2}, {id:"3",count:1}, {id:"4",count:1} ], advancements: { technology: ["0","1"], doctrine: [],        garden: [],    auction: [] },    politicalTokens: 0, culturalTokens: 0, cards: null }, "Units receive +1 on combat rolls" ),
    new Faction( "7", "Knights of the Round Table", "Chaos",    KING_ARTHUR,          { warBucks: 8,  units: [ {id:"1",count:2}, {id:"2",count:3} ],                                                       advancements: { technology: ["0"],     doctrine: ["0"],     garden: [],    auction: [] },    politicalTokens: 0, culturalTokens: 0, cards: null }, "To begin every round, choose a different district as a temporary Camelot / Camelot cannot be attacked and has no limit to its unit capacity" ),
    new Faction( "8", "Lots of Bears",              "Chaos",    WINCHESTER,           { warBucks: 8,  units: [ {id:"1",count:1}, {id:"2",count:1}, {id:"3",count:1}, {id:"6",count:1} ],                   advancements: { technology: ["0","1"], doctrine: [],        garden: [],    auction: [] },    politicalTokens: 0, culturalTokens: 0, cards: null }, "Tiles hold up to 10 units / May choose to go last during any phase" ),
    new Faction( "9", "Space Demons",               "Chaos",    SLORGOTH,             { warBucks: 8,  units: [ {id:"1",count:15} ],                                                                        advancements: { technology: [],        doctrine: [],        garden: [],    auction: [] },    politicalTokens: 0, culturalTokens: 0, cards: 3    }, "Immune to and cannot perform Annexations / Once per round, you may look at another player’s cards / Once per round, you may exchange a Chaos Card for a new card" )
];