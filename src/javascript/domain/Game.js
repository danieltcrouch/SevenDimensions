const PHASE_MARKET = 0;
const PHASE_EXPANSION = 1;
const PHASE_HARVEST = 2;
const PHASE_COUNCIL = 3;

const SUBPHASE_MARKET_AUCTION = 0;
const SUBPHASE_MARKET = 1;
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
    { id: "0", name: "Continental Elections" },
    { id: "1", name: "Gambler’s Gambit" },
    { id: "2", name: "Festival of Fairies" },
    { id: "3", name: "Global Disasters" },
    { id: "4", name: "Midterm Elections" },
    { id: "5", name: "Annual Restock" },
    { id: "6", name: "Mars Attack!" }
];


/*** MISCELLANEOUS ***/


const REAPERS_IN_CR = 5; //Civil Resistance

const MAX_ADVANCEMENTS = 7;
const MAX_DISTRICTS = 7;
const MAX_CARDS = 7;
