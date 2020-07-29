class Card extends Purchasable {
    constructor( id, type, name, description, cost ) {
        super( id, "CARD-" + type, name, function() { return cost; }, function() { return Card.getAdjustedCost( cost ); } );
        this.description = description;
        this.inUse = false;
    }

    static getAdjustedCost( cost ) {
        return cost;
    }
}

function getCard( id, list ) { return getEntity( id, list ); }


/**** CHAOS ****/


class Chaos extends Card {
    constructor( id, name, description ) {
        super( id, "Chaos", name, description, Chaos.getCost() );
    }

    static getCost() { return DEFAULT_CHAOS_COST; }
}

function getChaosCard( id ) { return getEntity( id, CHAOS ); }

function isDitto( id ) {
    return DITTO.some( index => CHAOS[index].id === id );
}

function isEspionage( id ) {
    return ESPIONAGE.some( index => CHAOS[index].id === id );
}

function isHeavensGate( id ) {
    return HEAVENS_GATE.some( index => CHAOS[index].id === id );
}

function isShutUp( id ) {
    return SHUT_UP.some( index => CHAOS[index].id === id );
}

const DEFAULT_CHAOS_COST = 4;

const ASSIMILATION_VALUE = 2;
const BENEFACTOR_VALUE = 15;
const BOUNTY_VALUE = 15;
const CHURCH_AND_STATE_VALUE = 2;
const DESERTER_VALUE = 3;
const DIVERSIFY_VALUE = 15;
const DUALISM_VALUE = 2;
const FRIENDLY_TERMS_VALUE = 3;
const GIVE_TIRED_VALUE = 5;
const GREAT_AWAKENING_VALUE = 3;
const INSPIRED_LEADERSHIP_VALUE = 2;
const MARCH_VALUE = 4;
const MICRONIZATION_VALUE = 2;
const PUBLIC_ARTS_VALUE = 2;
const SCORCHED_EARTH_VALUE = 10;
const SPACE_RACE_VALUE = 2;
const TAX_REFUND_VALUE = 10;

const DITTO = [19, 20, 21, 22, 23];
const ESPIONAGE = [29, 30, 31];
const HEAVENS_GATE = [47, 48, 49, 50, 51, 52, 53];
const SHUT_UP = [80, 81, 82, 83, 84, 85, 86];

const CHAOS = [ //todo 3 - make sure descriptions are accurate
    new Chaos( "0",  "Amnesia",                  "Remove a player’s Technology or Doctrine advancement" ),
    new Chaos( "1",  "Assimilation",             "Double the strength of your next Annexation" ),
    new Chaos( "2",  "Benefactor",               "Add 15WB to your next Auction bid" ),
    new Chaos( "3",  "Bounty",                   "Place a bounty on another player; when a tile controlled with units by that player is taken, the player that took it receives 15WB" ),
    new Chaos( "4",  "Bulldozers",               "For 1 round, units receive +1 on combat rolls" ),
    // new Chaos( "5",  "Calling the Shots",        "Before an election, announce you are using this card and abstain from voting; write down your prediction for the winner and if you are correct receive 20WB" ),
    new Chaos( "6",  "Cargo Hull",               "Do not discard Chaos Cards during the Annual Restock" ),
    new Chaos( "7",  "Cease-Fire",               "No player can battle you for 1 round (Note: unoccupied districts may still be taken)" ),
    new Chaos( "8",  "Chaos Shuffle",            "Each player passes their Chaos Cards to the left" ),
    new Chaos( "9",  "Church and State",         "Players must pay you 2WB for every district they have with a religion you founded" ),
    new Chaos( "10", "Clone Army",               "Duplicate all units that are not Heroes, Godhands, or Killer Robots" ),
    new Chaos( "11", "Copy-Cats",                "For 1 round, receive 1 Faction-specific ability" ),
    new Chaos( "12", "Coup d’état",              "Kill all the units in another player’s Capital" ),
    new Chaos( "13", "Critical Hit",             "During a battle, prevent an enemy from using hit deflections" ),
    new Chaos( "14", "D-Day",                    "Choose a tile and for 1 round, units receive +1 on combat rolls when invading that district and receive 1WB for each friendly unit that dies" ),
    new Chaos( "15", "Dark Ages",                "For 1 round, choose 1 player who cannot research advancements" ),
    new Chaos( "16", "Defectors",                "Take 1 random unit that is not a Hero, Godhand, or Killer Robot from each player and place them in your own district as your units" ),
    new Chaos( "17", "Deserters",                "Remove 3 random enemy units from the map that are not a Hero, Godhand, or Killer Robot" ),
    // new Chaos( "18", "Distinguished Diplomat",   "Receive an extra 5 votes during the Continental Elections" ),
    new Chaos( "19", "Ditto",                    "Copy a card in the deck (not Heaven’s Gates)" ),
    new Chaos( "20", "Ditto",                    "Copy a card in the deck (not Heaven’s Gates)" ),
    new Chaos( "21", "Ditto",                    "Copy a card in the deck (not Heaven’s Gates)" ),
    new Chaos( "22", "Ditto",                    "Copy a card in the deck (not Heaven’s Gates)" ),
    new Chaos( "23", "Ditto",                    "Copy a card in the deck (not Heaven’s Gates)" ),
    new Chaos( "24", "Diversify Your Crop",      "Exchange 1 of each resource for 15WB" ),
    new Chaos( "25", "Double Cross",             "Before a battle, all Reapers in the enemy tile being attacked join your forces" ),
    new Chaos( "26", "Double Down",              "During a Harvest Phase, receive twice as many War-Bucks" ),
    new Chaos( "27", "Dualism",                  "Immediately, replace this card with 2 new Chaos Cards" ),
    new Chaos( "28", "Epiphany",                 "Receive 1 Technology or Doctrine" ),
    new Chaos( "29", "Espionage",                "Take a random Chaos Card from another player" ),
    new Chaos( "30", "Espionage",                "Take a random Chaos Card from another player" ),
    new Chaos( "31", "Espionage",                "Take a random Chaos Card from another player" ),
    new Chaos( "32", "Exclusive Card Club",      "No other player may purchase a Chaos Card this round" ),
    new Chaos( "33", "Exhaust",                  "Choose a district and for 1 round, its owner may not use the units in that district" ),
    new Chaos( "34", "Famine",                   "All other players must discard all resources" ),
    new Chaos( "35", "Fortitude",                "Ignore the effects of the Global Disaster" ),
    new Chaos( "36", "Friendly Fire",            "During a battle, for each of your enemy’s hits, they must remove 1 Reaper" ),
    new Chaos( "37", "Friendly Terms",           "At the end of a round, anyone you did not battle must pay you 3WB" ),
    new Chaos( "38", "Front Lines",              "Before a battle, remove all of your enemy’s Reapers and Boomers in the tile you are attacking" ),
    new Chaos( "39", "Gamebreaker",              "Move the Doomsday Clock to any round" ),
    new Chaos( "40", "Get Outta Dodge",          "If invaded, before your enemy can take your district, move all their attacking units to another tile" ),
    new Chaos( "41", "Gideon’s Ruse",            "Choose a tile and its units to battle another without the option of retreat" ),
    new Chaos( "42", "Give Me Your Tired…",      "Steal 5 Initiative Tokens from another player" ),
    new Chaos( "43", "Go to Jail",               "Choose a player to skip the Expansion Phase" ),
    new Chaos( "44", "Great Awakening",          "Spread an active religion to 3 districts" ),
    new Chaos( "45", "Hand of God",              "Receive 1 Godhand" ),
    // new Chaos( "46", "Hands of Fate",            "During a battle, re-roll up to 7 misses" ),
    new Chaos( "47", "Heaven’s Gates",           "Receive 1 VP" ),
    new Chaos( "48", "Heaven’s Gates",           "Receive 1 VP" ),
    new Chaos( "49", "Heaven’s Gates",           "Receive 1 VP" ),
    new Chaos( "50", "Heaven’s Gates",           "Receive 1 VP" ),
    new Chaos( "51", "Heaven’s Gates",           "Receive 1 VP" ),
    new Chaos( "52", "Heaven’s Gates",           "Receive 1 VP" ),
    new Chaos( "53", "Heaven’s Gates",           "Receive 1 VP" ),
    new Chaos( "54", "Identity Crisis",          "For 1 round, choose 1 player to lose their Faction-specific ability" ),
    new Chaos( "55", "Inspired Leadership",      "Receive 2 Initiative Tokens" ),
    new Chaos( "56", "Laissez-faire",            "For 1 round, all trades must be with you" ),
    new Chaos( "57", "Manifest Destiny",         "All units can found districts" ),
    new Chaos( "58", "March through the Night",  "For 1 round, all units have a move range of 4" ),
    new Chaos( "59", "Master of the Domain",     "Receive 1 Reaper on every district" ),
    new Chaos( "60", "Men of Steel",             "For 1 round, all units receive +1 hit deflection" ),
    new Chaos( "61", "Micronization",            "Receive +2 tile unit capacity" ),
    new Chaos( "62", "Monopoly",                 "Claim a resource and each player must give you all of that resource that they own" ),
    // new Chaos( "63", "Muscle Out",               "During the Continental Elections, choose 1 player that cannot be elected" ),
    new Chaos( "64", "Nepotism",                 "Pay the minimum bid price for an Auction lot" ),
    new Chaos( "65", "Parks Project",            "Exchange 1 Cultural Initiative Token for 1 Garden" ),
    new Chaos( "66", "Penny Stocks",             "For 1 round, invest for the Gambler's Gambit regardless of what round it is" ),
    new Chaos( "67", "Persecution",              "Choose a religion and purge all disciple tokens of that religion" ),
    new Chaos( "68", "Pioneers",                 "Receive 1 district" ),
    new Chaos( "69", "Power Struggle",           "During the Council Phase, no player may claim victory" ),
    // new Chaos( "70", "Prophetic Vision",         "Skip the necessary prerequisites for an advancement" ), //todo 3 - only tech or doctrine
    new Chaos( "71", "Public Arts",              "Exchange 1 Political Initiative Token for 2 Doctrines" ),
    new Chaos( "72", "Puppeteer",                "During the Continental Elections, choose the elected office to be voted on (trumps Minister of Foreign Affairs)" ),
    new Chaos( "73", "Reign of Terror",          "Perform an Inquisition" ),
    new Chaos( "74", "Return on Investment",     "For 1 round, you may sell Initiative Tokens for War-Bucks equal to your Victory Points total" ),
    new Chaos( "75", "Sacred Shrine",            "Build a Wonder in a non-Capital district with a religion for free" ),
    new Chaos( "76", "Scorched Earth",           "Upon being invaded, raze and loot your own district for 10WB" ),
    new Chaos( "77", "Scourge",                  "For 1 round, ignore Gardens when invading districts" ),
    new Chaos( "78", "Seductress",               "Take the Office Card from a player previously elected" ),
    new Chaos( "79", "Shifting Culture",         "Exchange types of Initiative Tokens" ),
    new Chaos( "80", "Shut Up",                  "When a card is played, cancel its effects" ),
    new Chaos( "81", "Shut Up",                  "When a card is played, cancel its effects" ),
    new Chaos( "82", "Shut Up",                  "When a card is played, cancel its effects" ),
    new Chaos( "83", "Shut Up",                  "When a card is played, cancel its effects" ),
    new Chaos( "84", "Shut Up",                  "When a card is played, cancel its effects" ),
    new Chaos( "85", "Shut Up",                  "When a card is played, cancel its effects" ),
    new Chaos( "86", "Shut Up",                  "When a card is played, cancel its effects" ),
    new Chaos( "87", "Silent Auction",           "Choose a player to not participate in an Auction" ),
    // new Chaos( "88", "Sneak Attack",             "At the end of the Expansion Phase, take a second turn" ),
    new Chaos( "89", "Space Race",               "Exchange 1 Political Initiative Token for 2 Technologies" ),
    new Chaos( "90", "Spiritual Warfare",        "All units can spread religion; can spread religion to adjacent tiles if The Holy Empire" ),
    new Chaos( "91", "Squelch the Rebellion",    "When enacting an Annexation, Cultural Initiative Tokens cannot be used to defend" ),
    new Chaos( "92", "Strategic Maneuvers",      "Transport all units in 1 tile to any non-enemy tiles" ),
    new Chaos( "93", "Strongholds",              "If invading a district with a population of 5, all units receive +1 on combat rolls" ),
    new Chaos( "94", "Tax Refund",               "Receive 10WB" ),
    new Chaos( "95", "The Claw",                 "Remove 1 unit on the map " ),
    new Chaos( "96", "The Great Train Robbery",  "Take half of another player’s War-Bucks" ),
    new Chaos( "97", "The Swap",                 "Switch control of 1 of your districts with another player’s district (not the Capital); units in the districts switch locations" ),
    new Chaos( "98", "Tithing",                  "Receive 1WB for each district with a religion you founded" ),
    new Chaos( "99", "Way of the Samurai",       "For 1 round, receive 1WB for each of your units killed" )
];