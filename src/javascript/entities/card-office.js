const HIGH_PRIEST                 = 0;
const MINISTER_OF_DEVELOPMENT     = 1;
const MINISTER_OF_FINANCE         = 2;
const MINISTER_OF_FOREIGN_AFFAIRS = 3;
const MINISTER_OF_STATE           = 4;
const MINISTER_OF_TRAVEL          = 5;
const MINISTER_OF_WAR             = 6;

const OFFICE = [
    new Card( "0",  "Office", "High Priest",                 null, "Receive 1 VP or Discount 1 VP from 2 other players" ),
    new Card( "1",  "Office", "Minister of Development",     null, "In the Market Phase, prohibit a player from researching advancements from a partciular set" ),
    new Card( "2",  "Office", "Minister of Finance",         null, "In the Market Phase, declare a 1WB reduction to an advancement set, Chaos Cards, or units" ),
    new Card( "3",  "Office", "Minister of Foreign Affairs", null, "Ignore the negative affects of the Global Distaster and Mars Attack! events; may select the office for the next election" ),
    new Card( "4",  "Office", "Minister of State",           null, "Receive 2 Initiative Tokens for every district founded by other players" ),
    new Card( "5",  "Office", "Minister of Travel",          null, "In the Expansion Phase, prohibit the units in a tile from moving" ),
    new Card( "6",  "Office", "Minister of War",             null, "Before the Expansion Phase, choose a type of unit which will receive +2 on combat rolls for all players" )
];