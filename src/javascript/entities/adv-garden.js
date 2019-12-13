const WATER_GARDEN     = 0;
const VEGETABLE_GARDEN = 1;
const FLOWER_GARDEN    = 2;
const HANGING_GARDEN   = 3;
const GARDEN_OF_EDEN   = 4;

function getGardenCost( districtCount ) { return 7 * districtCount; };

const GARDENS = [
    new Advancement( "0", "Garden", "Water Garden",     getGardenCost, "Units defending a district receive +2 on combat rolls" ),
    new Advancement( "1", "Garden", "Vegetable Garden", getGardenCost, "Every Harvest Phase, each district produces double the resources" ),
    new Advancement( "2", "Garden", "Flower Garden",    getGardenCost, "Every Harvest Phase, receive +1WB per district" ),
    new Advancement( "3", "Garden", "Hanging Garden",   getGardenCost, "Districts and units in districts receive +1 hit deflection" ),
    new Advancement( "4", "Garden", "Garden of Eden",   getGardenCost, "Advancements cost -1WB per district (minimum of 1)" )
];