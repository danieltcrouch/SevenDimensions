const HUMAN_SACRIFICE           = 0;
const WHISPERS_IN_THE_DESERT    = 1;
const IDOL_WORSHIP              = 2;
const DIVINE_ORACLES            = 3;
const RITUALISM                 = 4;
const WHISPERS_IN_THE_MOUNTAINS = 5;
const MONUMENTS_TO_GOD          = 6;
const CRUSADES                  = 7;
const SECULARISM                = 8;
const WHISPERS_IN_DISTANT_LANDS = 9;
const DIVINE_RIGHT              = 10;

function getDoctrineCost() { return 7; };

const DOCTRINES = [
    new Advancement( "0",  "Doctrine", "Human Sacrifice",           getDoctrineCost, "Speedsters can kamikaze" ),
    new Advancement( "1",  "Doctrine", "Whispers in the Desert",    getDoctrineCost, "Cult of Secrets is founded" ),
    new Advancement( "2",  "Doctrine", "Idol Worship",              getDoctrineCost, "Resources do not have to match when exchanged for War-Bucks" ),
    new Advancement( "3",  "Doctrine", "Divine Oracles",            getDoctrineCost, "After elections, receive a random unused office" ),
    new Advancement( "4",  "Doctrine", "Ritualism",                 getDoctrineCost, "Every Harvest Phase, receive +1WB for districts with religion in your domain" ),
    new Advancement( "5",  "Doctrine", "Whispers in the Mountains", getDoctrineCost, "Path of Enlightenment is founded" ),
    new Advancement( "6",  "Doctrine", "Monuments to God",          getDoctrineCost, "Wonder construction is free" ),
    new Advancement( "7",  "Doctrine", "Crusades",                  getDoctrineCost, "Units receive +2 on combat rolls when invading districts with your religion" ),
    new Advancement( "8",  "Doctrine", "Secularism",                getDoctrineCost, "After purchasing an advancement, receive a Doctrine or Technology" ),
    new Advancement( "9",  "Doctrine", "Whispers in Distant Lands", getDoctrineCost, "Church of Truth is founded" ),
    new Advancement( "10", "Doctrine", "Divine Right",              getDoctrineCost, "Before every Market Phase, you may perform an Inquisition (worth 20WB)" )
];