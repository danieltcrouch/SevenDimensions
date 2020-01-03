const COASTAL_PROPERTY       = 0;
const MULTI_LEVEL_MARKET     = 1;
const PROFESSIONAL_ATHLETICS = 2;
const SUPER_DELEGATES        = 3;
const THINK_TANK             = 4;
const ATLANTIS_STOCK         = 5;
const WEAPONS_MANUFACTURER   = 6;

const LOCKED_SPAN = "<span style='font-style: italic'>Locked</span>";

function isLockedAuction( auction, players ) {
    return !players.some( p => p.advancements.auctionWins[ AUCTIONS.indexOf( auction ) ] === "1" );
}

const AUCTIONS = [
    new Advancement( "0", "Auction Lot", "Coastal Property",       function() { return 7;  }, "Every Harvest Phase, receive double the War-Bucks from 1 non-Capital district" ),
    new Advancement( "1", "Auction Lot", "Multi-Level Market",     function() { return 14; }, "Every Harvest Phase, take 3WB from the players to either side" ),
    new Advancement( "2", "Auction Lot", "Professional Athletics", function() { return 21; }, "Receive 3x as many Initiative Tokens for the Festival of Fairies" ),
    new Advancement( "3", "Auction Lot", "Super-Delegates",        function() { return 28; }, "Upon purchase, receive 7 Initiative Tokens" ),
    new Advancement( "4", "Auction Lot", "Think Tank",             function() { return 35; }, "Upon purchase, receive 4 Technologies or Doctrines and 4 Chaos Cards" ),
    new Advancement( "5", "Auction Lot", "Atlantis Stock",         function() { return 49; }, "Your investment for the Gambler’s Gambit is paid back 7x" ),
    new Advancement( "6", "Auction Lot", "Weapons Manufacturer",   function() { return 70; }, "All units cost a maximum of 3WB" )
];