const ERUPTION                 = 0;
const SCANDAL                  = 1;
const THE_COST_OF_DISCIPLESHIP = 2;
const SHORTAGE                 = 3;
const PAYDAY                   = 4;
const INSURRECTION             = 5;
const INFLATION                = 6;

const DISASTER = [
    new Card( "0",  "Global Disaster", "Eruption",                  null, "All units besides Godhands and Heroes that are in or around volcano tiles die" ),
    new Card( "1",  "Global Disaster", "Scandal",                   null, "Each player discards 1 Initiative Token for each of their districts" ),
    new Card( "2",  "Global Disaster", "The Cost of Discipleship",  null, "Remove all Juggernauts and Killer Robots from the map" ),
    new Card( "3",  "Global Disaster", "Shortage",                  null, "No Resources may be collected next round" ),
    new Card( "4",  "Global Disaster", "Payday",                    null, "Each player pays 2WB for each unit they wish to be left alive; the rest are disbanded" ),
    new Card( "5",  "Global Disaster", "Insurrection",              null, "The player with the most VP must discount 1 VP" ),
    new Card( "6",  "Global Disaster", "Inflation",                 null, "Next Market Phase, all units cost +1WB" )
];