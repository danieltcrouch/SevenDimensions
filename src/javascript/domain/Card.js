class Card extends Purchasable {
    constructor( id, type, name, description, cost ) {
        super( id, "CARD-" + type, name, function() { return cost; }, function() { Card.getAdjustedCost( cost ); } );
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

const DITTO = [20, 21, 22, 23, 24];
const ESPIONAGE = [31, 32];
const HEAVENS_GATE = [48, 49, 50, 51, 52, 53, 54];
const SHUT_UP = [82, 83, 84, 85, 86];

const CHAOS = [
    new Chaos( "0",  "Amnesia",                  "Remove a player’s Technology or Doctrine advancement" ),
    new Chaos( "1",  "Assimilation",             "Double the strength of your next Annexation" ),
    // new Chaos( "2",  "Benefactor",               "Receive 15WB to use during an Auction" ),
    // new Chaos( "3",  "Bounty",                   "Place a bounty on another player; when a tile controlled with units by that player is taken, the player that took it receives 15WB" ),
    // new Chaos( "4",  "Bulldozers",               "For 1 round, units receive +1 on combat rolls" ),
    // new Chaos( "5",  "Calling the Shots",        "Before an election, announce you are using this card and abstain from voting; write down your prediction for the winner and if you are correct receive 20WB" ),
    // new Chaos( "6",  "Cargo Hull",               "Do not discard Chaos Cards during the Annual Restock" ),
    // new Chaos( "7",  "Cease-Fire",               "No player can battle you for 1 round (Note: unoccupied districts may still be taken)" ),
    // new Chaos( "8",  "Chaos Shuffle",            "Each player passes their Chaos Cards to the left" ),
    // new Chaos( "9",  "Church and State",         "Players must pay you 2WB for every district they have with a religion you founded" ),
    // new Chaos( "10", "Clone Army",               "Duplicate all units that are not Heroes, Godhands, or Killer Robots" ),
    // new Chaos( "11", "Copy-Cats",                "For 1 round, receive 1 Faction-specific ability" ),
    // new Chaos( "12", "Coup d’état",              "Kill all the units in another player’s Capital" ),
    // new Chaos( "13", "Coward’s Way Out",         "Retreat at any point during a battle; retreat into any adjacent tile—even one with another player’s units—besides the original tile for the attacker" ),
    // new Chaos( "14", "Critical Hit",             "During a battle, if an enemy unit survives because of a hit deflection, kill that unit" ),
    // new Chaos( "15", "D-Day",                    "Choose a district and for 1 round, units receive +1 on combat rolls when invading that district and receive 1WB for each friendly unit that dies" ),
    // new Chaos( "16", "Dark Ages",                "For 1 round, choose 1 player who cannot research advancements" ),
    // new Chaos( "17", "Defectors",                "Take 1 unit that is not a Godhand or Hero from each player and place them in your own district as your units" ),
    // new Chaos( "18", "Deserters",                "Remove 3 enemy units from the map" ),
    // new Chaos( "19", "Distinguished Diplomat",   "Receive an extra 5 votes during the Continental Elections" ),
    // new Chaos( "20", "Ditto",                    "Copy another card already played" ),
    // new Chaos( "21", "Ditto",                    "Copy another card already played" ),
    // new Chaos( "22", "Ditto",                    "Copy another card already played" ),
    // new Chaos( "23", "Ditto",                    "Copy another card already played" ),
    // new Chaos( "24", "Ditto",                    "Copy another card already played" ),
    // new Chaos( "25", "Diversify Your Crop",      "Exchange 1 of each resource for 15WB" ),
    // new Chaos( "26", "Double Cross",             "Before a battle, all Reapers in the enemy tile join your forces" ),
    // new Chaos( "27", "Double Down",              "During a Harvest Phase, receive twice as many War-Bucks" ),
    // new Chaos( "28", "Dualism",                  "Immediately, replace this card with 2 new Chaos Cards" ),
    new Chaos( "29", "Epiphany",                 "Receive 1 Technology or Doctrine" ),
    // new Chaos( "30", "Espionage",                "Take a random Chaos Card from another player" ),
    // new Chaos( "31", "Espionage",                "Take a random Chaos Card from another player" ),
    // new Chaos( "32", "Espionage",                "Take a random Chaos Card from another player" ),
    // new Chaos( "33", "Exclusive Card Club",      "No other player may purchase a Chaos Card this round" ),
    // new Chaos( "34", "Exhaust",                  "Choose a district and for 1 round, its owner may not use the units in that district" ),
    // new Chaos( "35", "Famine",                   "All other players must discard all resources" ),
    // new Chaos( "36", "Fortitude",                "Ignore the effects of the Global Disaster" ),
    // new Chaos( "37", "Friendly Fire",            "During a battle, for each of your enemy’s hits, they must remove 1 Reaper" ),
    // new Chaos( "38", "Friendly Terms",           "At the end of a round, anyone you did not battle must pay you 3WB" ),
    // new Chaos( "39", "Front Lines",              "Before a battle, remove all of your enemy’s Reapers and Boomers in the tile you are attacking" ),
    // new Chaos( "40", "Gamebreaker",              "Move the Doomsday Clock to any round" ),
    // new Chaos( "41", "Get Outta Dodge",          "If invaded, before your enemy can take your district, move all their attacking units to another tile" ),
    // new Chaos( "42", "Gideon’s Ruse",            "Choose a tile and its units to battle another without the option of retreat" ),
    // new Chaos( "43", "Give Me Your Tired…",      "Steal 5 Initiative Tokens from another player" ),
    // new Chaos( "44", "Go to Jail",               "Choose a player to skip the Expansion Phase" ),
    // new Chaos( "45", "Great Awakening",          "Spread an active religion to 3 districts" ),
    // new Chaos( "46", "Hand of God",              "Receive 1 Godhand" ),
    // new Chaos( "47", "Hands of Fate",            "During a battle, re-roll up to 7 misses" ),
    // new Chaos( "48", "Heaven’s Gates",           "Receive 1 VP" ),
    // new Chaos( "49", "Heaven’s Gates",           "Receive 1 VP" ),
    // new Chaos( "50", "Heaven’s Gates",           "Receive 1 VP" ),
    // new Chaos( "51", "Heaven’s Gates",           "Receive 1 VP" ),
    // new Chaos( "52", "Heaven’s Gates",           "Receive 1 VP" ),
    // new Chaos( "53", "Heaven’s Gates",           "Receive 1 VP" ),
    // new Chaos( "54", "Heaven’s Gates",           "Receive 1 VP" ),
    // new Chaos( "55", "Identity Crisis",          "For 1 round, choose 1 player to lose their Faction-specific ability" ),
    // new Chaos( "56", "Inspired Leadership",      "Receive 2 Initiative Tokens" ),
    // new Chaos( "57", "Laissez-faire",            "For 1 round, all trades must be agreed on by you" ),
    // new Chaos( "58", "Manifest Destiny",         "All units can found districts" ),
    // new Chaos( "59", "March through the Night",  "For 1 round, all units have a move range of 4" ),
    // new Chaos( "60", "Master of the Domain",     "Receive 1 Reaper on every district" ),
    // new Chaos( "61", "Men of Steel",             "For 1 round, all units receive +1 hit deflection" ),
    // new Chaos( "62", "Micronization",            "Receive +2 tile unit capacity" ),
    // new Chaos( "63", "Monopoly",                 "Claim a resource and each player must give you all of that resource that they own" ),
    // new Chaos( "64", "Muscle Out",               "During the Continental Elections, choose 1 player that cannot be elected" ),
    // new Chaos( "65", "Nepotism",                 "Pay the minimum bid price for an Auction lot" ),
    // new Chaos( "66", "Parks Project",            "Exchange 1 Cultural Initiative Token for 1 Garden" ),
    // new Chaos( "67", "Penny Stocks",             "For 1 round, invest for the Gambler's Gambit regardless of what round it is" ),
    // new Chaos( "68", "Persecution",              "Choose a religion and purge all disciple tokens of that religion" ),
    // new Chaos( "69", "Pioneers",                 "Receive 1 district" ),
    // new Chaos( "70", "Power Struggle",           "During the Council Phase, no player may claim victory" ),
    // new Chaos( "71", "Prophetic Vision",         "Skip the necessary prerequisites for an advancement" ),
    // new Chaos( "72", "Public Arts",              "Exchange 1 Political Initiative Token for 2 Doctrines" ),
    // new Chaos( "73", "Puppeteer",                "During the Continental Elections, choose the elected office to be voted on (trumps Minister of Foreign Affairs)" ),
    // new Chaos( "74", "Reign of Terror",          "Perform an Inquisition" ),
    // new Chaos( "75", "Return on Investment",     "For 1 round, you may sell Initiative Tokens for War-Bucks equal to your Victory Points total" ),
    // new Chaos( "76", "Sacred Shrine",            "Build a Wonder in a non-Capital district with a religion for free" ),
    // new Chaos( "77", "Scorched Earth",           "Upon being invaded, raze and loot your own district for 10WB" ),
    new Chaos( "78", "Scourge",                  "For 1 round, ignore Gardens when invading districts" ),
    // new Chaos( "79", "Seductress",               "Take the Office Card from a player previously elected" ),
    // new Chaos( "80", "Setting the Agenda",       "Look at and rearrange the top five Chaos Cards" ),
    // new Chaos( "81", "Shifting Culture",         "Exchange types of Initiative Tokens" ),
    new Chaos( "82", "Shut Up",                  "When a card is played, cancel its effects" ),
    new Chaos( "83", "Shut Up",                  "When a card is played, cancel its effects" ),
    new Chaos( "84", "Shut Up",                  "When a card is played, cancel its effects" ),
    new Chaos( "85", "Shut Up",                  "When a card is played, cancel its effects" ),
    new Chaos( "86", "Shut Up",                  "When a card is played, cancel its effects" ),
    // new Chaos( "87", "Silent Auction",           "Choose a player to not participate in an Auction" ),
    // new Chaos( "88", "Sneak Attack",             "At the end of the Expansion Phase, take a second turn" ),
    // new Chaos( "89", "Space Race",               "Exchange 1 Political Initiative Token for 2 Technologies" ),
    // new Chaos( "90", "Spiritual Warfare",        "All units can spread religion; can spread religion to adjacent tiles if The Holy Empire" ),
    // new Chaos( "91", "Squelch the Rebellion",    "When enacting an Annexation, Cultural Initiative Tokens cannot be used to defend" ),
    // new Chaos( "92", "Strategic Maneuvers",      "Transport all units in 1 tile to any non-enemy tiles" ),
    // new Chaos( "93", "Strongholds",              "If invading a district with a population of 5, all units receive +1 on combat rolls" ),
    // new Chaos( "94", "Tax Refund",               "Receive 10WB" ),
    // new Chaos( "95", "The Claw",                 "Remove 1 unit on the map that is not a Godhand or Hero" ),
    // new Chaos( "96", "The Great Train Robbery",  "Take half of another player’s War-Bucks" ),
    // new Chaos( "97", "The Swap",                 "Switch control of 1 of your districts with another player’s district (not the Capital); units in the districts switch locations" ),
    // new Chaos( "98", "Tithing",                  "Receive 1WB for each district with a religion you founded" ),
    // new Chaos( "99", "Way of the Samurai",       "For 1 round, receive 1WB for each of your units killed" )
];


/**** OFFICE ****/


class Office extends Card {
    constructor( id, name, description ) {
        super( id, "Office", name, description, null );
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
    new Office( "1",  "Minister of Development",     "In the Market Phase, prohibit a player from researching advancements from a partciular set" ),
    new Office( "2",  "Minister of Finance",         "In the Market Phase, declare a 1WB reduction to an advancement set, Chaos Cards, or units" ),
    new Office( "3",  "Minister of Foreign Affairs", "Ignore the negative affects of the Global Distaster and Mars Attack! events; may select the office for the next election" ),
    new Office( "4",  "Minister of State",           "Receive 2 Initiative Tokens for every district founded by other players" ),
    new Office( "5",  "Minister of Travel",          "In the Expansion Phase, prohibit the units in a tile from moving" ),
    new Office( "6",  "Minister of War",             "Before the Expansion Phase, choose a type of unit which will receive +2 on combat rolls for all players" )
];


/**** DISASTER ****/


class Disaster extends Card {
    constructor( id, name, description ) {
        super( id, "Global Disaster", name, description, null );
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