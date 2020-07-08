const PHASE_MARKET = 0;
const PHASE_EXPANSION = 1;
const PHASE_HARVEST = 2;
const PHASE_COUNCIL = 3;

const SUBPHASE_MARKET_AUCTION = 0;
const SUBPHASE_MARKET = 1;
const SUBPHASE_PRE_EXPANSION = 0;
const SUBPHASE_EXPANSION = 1;
const SUBPHASE_COUNCIL = 0;
const SUBPHASE_COUNCIL_DOOMSDAY = 1;

const PHASES = [
    { id: "0", name: "Market" },
    { id: "1", name: "Expansion" },
    { id: "2", name: "Harvest" },
    { id: "3", name: "Council" }
];


/**** EVENT ****/


class Event extends Entity {
    constructor( id, name, description ) {
        super( id, "EVENT", name );
        this.description = description;
    }
}

const POST_EVENT = "Midnight";

const EVENT_ELECTION = 0;
const EVENT_GAMBIT = 1;
const EVENT_FESTIVAL = 2;
const EVENT_DISASTER = 3;
const EVENT_MIDTERM = 4;
const EVENT_RESTOCK = 5;
const EVENT_MARS = 6;

const EVENTS = [
    new Event( "0", "Continental Elections", "Reveal an office and elect a player to that office." ),
    new Event( "1", "Gambler’s Gambit",      "Players may invest War-Bucks to be paid back at a later time with interest." ),
    new Event( "2", "Festival of Fairies",   "Players are awarded Initiative Tokens based on their number of units: 1 for more than 7 units, 3 for more than 3 units, 5 otherwise." ),
    new Event( "3", "Global Disasters",      "Draw a Global Disaster card and follow its instructions." ),
    new Event( "4", "Midterm Elections",     "Perform another election." ),
    new Event( "5", "Annual Restock",        "Players exchange Chaos Cards for 3 new cards. All investments are paid back 2x." ),
    new Event( "6", "Mars Attack!",          "Aliens attack with power determined by the number of districts. Defeat them by donating units. If successful, donating players receives 5WB, otherwise all players lose 15WB and donated units die. The player that donates the most receives 50WB." )
];


/**** OFFICE ****/


class Office extends Entity {
    constructor( id, name, description ) {
        super( id, "OFFICE", name );
        this.description = description;
    }
}

function getOfficeCard( id ) { return getEntity( id, OFFICES ); }

const HIGH_PRIEST                 = 0;
const MINISTER_OF_DEVELOPMENT     = 1;
const MINISTER_OF_FINANCE         = 2;
const MINISTER_OF_FOREIGN_AFFAIRS = 3;
const MINISTER_OF_STATE           = 4;
const MINISTER_OF_TRAVEL          = 5;
const MINISTER_OF_WAR             = 6;

const OFFICES = [
    new Office( "0",  "High Priest",                 "Receive 1 VP or Discount 1 VP from 2 other players" ),
    new Office( "1",  "Minister of Development",     "In the Market Phase, prohibit a player from researching advancements from a particular set" ),
    new Office( "2",  "Minister of Finance",         "In the Market Phase, declare a 1WB reduction to an advancement set, Chaos Cards, or units" ),
    new Office( "3",  "Minister of Foreign Affairs", "Ignore the negative affects of the Global Disaster and Mars Attack! events; may select the office for the next election" ),
    new Office( "4",  "Minister of State",           "Receive 2 Initiative Tokens for every district founded by other players" ),
    new Office( "5",  "Minister of Travel",          "In the Expansion Phase, prohibit the units in a tile from moving" ),
    new Office( "6",  "Minister of War",             "Before the Expansion Phase, choose a type of unit which will receive +2 on combat rolls for all players" )
];


/**** DISASTER ****/


class Disaster extends Entity {
    constructor( id, name, description ) {
        super( id, "GLOBAL_DISASTER", name );
        this.description = description;
    }
}

function getDisasterCard( id ) { return getEntity( id, DISASTERS ); }

const ERUPTION                 = 0;
const SCANDAL                  = 1;
const THE_COST_OF_DISCIPLESHIP = 2;
const SHORTAGE                 = 3;
const PAYDAY                   = 4;
const INSURRECTION             = 5;
const INFLATION                = 6;

const DISASTERS = [
    new Disaster( "0",  "Eruption",                  "All units besides Godhands and Heroes that are in or around volcano tiles die" ),
    new Disaster( "1",  "Scandal",                   "Each player discards 1 Initiative Token for each of their districts" ),
    new Disaster( "2",  "The Cost of Discipleship",  "Remove all Juggernauts and Killer Robots from the map" ),
    new Disaster( "3",  "Shortage",                  "No Resources may be collected next round" ),
    new Disaster( "4",  "Payday",                    "Each player pays 2WB for each unit they wish to be left alive; the rest are disbanded" ),
    new Disaster( "5",  "Insurrection",              "The player with the most VP must discount 1 VP" ),
    new Disaster( "6",  "Inflation",                 "Next Market Phase, all units cost +1WB" )
];


/*** MISCELLANEOUS ***/


const MAX_VP = 14;

const MAX_ADVANCEMENTS = 7;
const MAX_DISTRICTS = 7;
const MAX_CARDS = 7;
const MAX_UNITS_TILE = 7;

const VALUE_OF_ANNEX = 5;
const REAPERS_IN_CR = 5;

const EVENT_GG_RETURN = 2;
const EVENT_FF_UNITS_1 = 7;
const EVENT_FF_UNITS_2 = 3;
const EVENT_FF_AWARD_1 = 1;
const EVENT_FF_AWARD_2 = 3;
const EVENT_FF_AWARD_3 = 5;
const EVENT_DISASTER_PAYDAY_COST = 2;
const EVENT_RESTOCK_CARDS = 3;
const EVENT_MARS_REWARD = 5;
const EVENT_MARS_GRAND_REWARD = 50;
const EVENT_MARS_COST = 15;

const DEFAULT_TILE = "unassigned";
