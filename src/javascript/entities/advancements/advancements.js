//todo 4 - for each list (advancements, chaos, offices, units, etc.) make a const for each index, so you can reference in the array by the name

const TECHNOLOGIES = [
    { name: "Ore Processing",           cost: 7, description: "Exchange 3 of the same resource for 8WB" },
    { name: "Military Tactics",         cost: 7, description: "Reapers receive +1 on combat rolls" },
    { name: "Subterranean Rails",       cost: 7, description: "Units receive +1 move range" },
    { name: "Advanced Flight",          cost: 7, description: "Speedsters may carry up to 4 Apostles or Reapers" },
    { name: "Modified Plastics",        cost: 7, description: "Boomers cost -1WB" },
    { name: "Adaptive Mapping",         cost: 7, description: "Units may enter Volcano tiles" },
    { name: "Long-range Rocketry",      cost: 7, description: "Boomers, Juggernauts, and Godhands can bombard" },
    { name: "Global Networking",        cost: 7, description: "May purchase up to 10 cards and advancements per round" },
    { name: "Global Travel",            cost: 7, description: "Units may use 1 move to transport between districts" },
    { name: "Bio-Domes",                cost: 7, description: "Gardens cost 4WB per district" },
    { name: "Centralized Curriculum",   cost: 7, description: "Immune to Inquisitions" },
    { name: "Warp Drives",              cost: 7, description: "Speedsters and Godhands receive +1 move range" },
    { name: "Genetic Resurrection",     cost: 7, description: "After the Expansion Phase, revive 1 unit that died that round" },
    { name: "Time Travel",              cost: 7, description: "Killer Robots receive 2 rolls per round-of-combat" }
];

const DOCTRINES = [
    { name: "Human Sacrifice",              cost: 7, description: "Speedsters can kamikaze" },
    { name: "Whispers in the Desert",       cost: 7, description: "Cult of Secrets is founded" },
    { name: "Idol Worship",                 cost: 7, description: "Resources do not have to match when exchanged for War-Bucks" },
    { name: "Divine Oracles",               cost: 7, description: "After elections, receive a random unused office" },
    { name: "Ritualism",                    cost: 7, description: "Every Harvest Phase, receive +1WB for districts with religion in your domain" },
    { name: "Whispers in the Mountains",    cost: 7, description: "Path of Enlightenment is founded" },
    { name: "Monuments to God",             cost: 7, description: "Wonder construction is free" },
    { name: "Crusades",                     cost: 7, description: "Units receive +2 on combat rolls when invading districts with your religion" },
    { name: "Secularism",                   cost: 7, description: "After purchasing an advancement, receive a Doctrine or Technology" },
    { name: "Whispers in Distant Lands",    cost: 7, description: "Church of Truth is founded" },
    { name: "Divine Right",                 cost: 7, description: "Before every Market Phase, you may perform an Inquisition (worth 20WB)" }
];

const GARDENS = [
    { name: "Water Garden",     cost: 7, description: "Units defending a district receive +2 on combat rolls" },
    { name: "Vegetable Garden", cost: 7, description: "Every Harvest Phase, each district produces double the resources" },
    { name: "Flower Garden",    cost: 7, description: "Every Harvest Phase, receive +1WB per district" },
    { name: "Hanging Garden",   cost: 7, description: "Districts and units in districts receive +1 hit deflection" },
    { name: "Garden of Eden",   cost: 7, description: "Advancements cost -1WB per district (minimum of 1)" }
];

const AUCTIONS = [
    { name: "Coastal Property",         cost: 7,  description: "Every Harvest Phase, receive double the War-Bucks from 1 non-Capital district" },
    { name: "Multi-Level Market",       cost: 14, description: "Every Harvest Phase, take 3WB from the players to either side" },
    { name: "Professional Athletics",   cost: 21, description: "Receive 3x as many Initiative Tokens for the Festival of Fairies" },
    { name: "Super-Delegates",          cost: 28, description: "Upon purchase, receive 7 Initiative Tokens" },
    { name: "Think Tank",               cost: 35, description: "Upon purchase, receive 4 Technologies or Doctrines and 4 Chaos Cards" },
    { name: "Atlantis Stock",           cost: 49, description: "Your investment for the Gambler’s Gambit is paid back 7x" },
    { name: "Weapons Manufacturer",     cost: 70, description: "All units cost a maximum of 3WB" },
];