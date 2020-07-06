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

const POST_EVENT = "Midnight";

const EVENT_ELECTION = 0;
const EVENT_GAMBIT = 1;
const EVENT_FESTIVAL = 2;
const EVENT_DISASTER = 3;
const EVENT_MIDTERM = 4;
const EVENT_RESTOCK = 5;
const EVENT_MARS = 6;

const EVENTS = [
    { id: "0", name: "Continental Elections", description: "Reveal an office and elect a player to that office." },
    { id: "1", name: "Gambler’s Gambit",      description: "Players may invest War-Bucks to be paid back at a later time with interest." },
    { id: "2", name: "Festival of Fairies",   description: "Players are awarded Initiative Tokens based on their number of units: 1 for more than 7 units, 3 for more than 3 units, 5 otherwise." },
    { id: "3", name: "Global Disasters",      description: "Draw a Global Disaster card and follow its instructions." },
    { id: "4", name: "Midterm Elections",     description: "Perform another election." },
    { id: "5", name: "Annual Restock",        description: "Players exchange Chaos Cards for 3 new cards. All investments are paid back 2x." },
    { id: "6", name: "Mars Attack!",          description: "Aliens attack with power determined by the number of districts. Defeat them by donating units. If successful, donating players receives 5WB, otherwise all players lose 15WB and donated units die. The player that donates the most receives 50WB." }
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
