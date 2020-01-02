const VIRUS                = 0;
const THE_GRAND_INQUISITOR = 1;
const PHILOSORAPTOR        = 2;
const UNCLE_SAM            = 3;
const GRAVELBOG            = 4;
const MR_DEEPPOCKETS       = 5;
const ULTRA_MAN            = 6;
const KING_ARTHUR          = 7;
const WINCHESTER           = 8;
const SLORGOTH             = 9;

const HEROES = [
    new Hero( "0", null, "Virus",                "When in a successful invading force, receive a free Technology or 5WB" ),
    new Hero( "1", null, "The Grand Inquisitor", "When in a successful invading force, perform a mini-Inquisition (worth 5WB) against the defeated player" ),
    new Hero( "2", null, "Philosoraptor ",       "When in a district, this district cannot be attacked / Players may not enact Diplomatic Immunity on adjacent districts" ),
    new Hero( "3", null, "Uncle Sam",            "When in a district, double the strength of Annexations  from this district" ),
    new Hero( "4", null, "Gravelbog",            "When on a tile with a resource, receive 2 additional resources of that kind during the Harvest Phase" ),
    new Hero( "5", null, "Mr. Deeppockets",      "When in a successful invading force, take 4WB from the defeated player" ),
    new Hero( "6", null, "Ultra-Man",            "Hit value of 4, move range of 3 / Receive +1 on combat rolls when invading districts" ),
    new Hero( "7", null, "King Arthur",          "When starting in Camelot, may initiate a Quest but can no longer move / Enemies are incentivized to come to your aid" ),
    new Hero( "8", null, "Winchester the Bear",  "When in a successful invading force, 2 Bear Berserkers are immediately trained in that district" ),
    new Hero( "9", null, "Slorgoth",             "When in a successful invading force, receive a free Chaos Card" )
];