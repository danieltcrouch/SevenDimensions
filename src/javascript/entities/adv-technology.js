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

function getTechnologyCost() { return 7; };

const TECHNOLOGIES = [
    new Advancement( "0",  "Technology", "Ore Processing",         getTechnologyCost, "Exchange 3 of the same resource for 8WB" ),
    new Advancement( "1",  "Technology", "Military Tactics",       getTechnologyCost, "Reapers receive +1 on combat rolls" ),
    new Advancement( "2",  "Technology", "Subterranean Rails",     getTechnologyCost, "Units receive +1 move range" ),
    new Advancement( "3",  "Technology", "Advanced Flight",        getTechnologyCost, "Speedsters may carry up to 4 Apostles or Reapers" ),
    new Advancement( "4",  "Technology", "Modified Plastics",      getTechnologyCost, "Boomers cost -1WB" ),
    new Advancement( "5",  "Technology", "Adaptive Mapping",       getTechnologyCost, "Units may enter Volcano tiles" ),
    new Advancement( "6",  "Technology", "Long-range Rocketry",    getTechnologyCost, "Boomers, Juggernauts, and Godhands can bombard" ),
    new Advancement( "7",  "Technology", "Global Networking",      getTechnologyCost, "May purchase up to 10 cards and advancements per round" ),
    new Advancement( "8",  "Technology", "Global Travel",          getTechnologyCost, "Units may use 1 move to transport between districts" ),
    new Advancement( "9",  "Technology", "Bio-Domes",              getTechnologyCost, "Gardens cost 4WB per district" ),
    new Advancement( "10", "Technology", "Centralized Curriculum", getTechnologyCost, "Immune to Inquisitions" ),
    new Advancement( "11", "Technology", "Warp Drives",            getTechnologyCost, "Speedsters and Godhands receive +1 move range" ),
    new Advancement( "12", "Technology", "Genetic Resurrection",   getTechnologyCost, "After the Expansion Phase, revive 1 unit that died that round" ),
    new Advancement( "13", "Technology", "Time Travel",            getTechnologyCost, "Killer Robots receive 2 rolls per round-of-combat" )
];