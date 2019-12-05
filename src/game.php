<?php include("php/startup.php"); ?>
<!DOCTYPE html>
<html>
<head>
    <?php includeHeadInfo(); ?>
    <link rel="stylesheet" type="text/css" href="css/map.css"/>
    <script src="javascript/game.js"></script>
    <script src="javascript/map/map.js"></script>
</head>

<body>

	<!--Header-->
    <?php includeHeader(); ?>
    <div class="col-10 header" style="display: none"></div>

    <!--Main-->
    <div class="col-10 main">
        <div class="col-2">
            <div class="subtitle">
                <span class="clickable">Seven Dimensions</span>
            </div>
            <div id="roundDetailsDiv" style="margin-bottom: 2em">
                <div><span style="font-weight: bold">Round: </span><span id="roundValue">0</span></div>
                <div><span style="font-weight: bold">Phase: </span><span id="phaseValue">0</span></div>
                <div><span style="font-weight: bold">Turn: </span><span id="turnValue">0</span></div>
                <div><span style="font-weight: bold">Doomsday Clock: </span><span id="eventValue">0</span></div>
            </div>
            <hr>
            <div id="playerDetailsDiv" style="margin-bottom: 2em">
                <div id="playerName">[Player Username]</div>
                <div id="factionName" style="margin-bottom: 1em">[Faction]</div>
                <div><span class="link" onclick="viewVP()">Victory Points:</span> <span id="victoryPointsValue">0</span></div>
                <div><span class="link" onclick="viewWB()">War-Bucks:</span> <span id="warBucksValue">0</span></div>
                <div><span style="font-weight: bold">Advancements </span></div>
                <div><span class="link" style="padding-left: 1em" onclick="viewTechnologies()">Technologies:</span> <span id="technologiesValue">0/15</span></div>
                <div><span class="link" style="padding-left: 1em" onclick="viewDoctrines()">Doctrines:</span> <span id="doctrinesValue">0/12</span></div>
                <div><span class="link" style="padding-left: 1em" onclick="viewGardens()">Gardens:</span> <span id="gardensValue">0/5</span></div>
                <div><span class="link" style="padding-left: 1em" onclick="viewLots()">Auction Lots:</span> <span id="auctionLotsValue">0/7</span></div>
                <div><span class="link" onclick="viewPIT()">Political Initiative Tokens:</span> <span id="politicalTokensValue">0</span></div>
                <div><span class="link" onclick="viewCIT()">Cultural Initiative Tokens:</span> <span id="culturalTokensValue">0</span></div>
                <div><span class="link" onclick="viewCards()">Chaos Cards:</span> <span id="chaosCardsValue">0</span></div>
            </div>
            <div id="tileDetailsDiv" style="border: 2px solid black; border-radius: 1em; padding: 1em"></div>
        </div>
        <div class="col-6">
            <div id="mapDiv" class="center">
                <svg id="map" width="100%">
                    <defs>
                        <pattern id="atlantis" patternUnits="objectBoundingBox" x="0" y="0" width="1" height="1">
                            <image xlink:href="https://seven.religionandstory.com/images/atlantis.png" x="-0.1" y="-0.1" width="16.75%" height="13%"></image>
                            <!--<image xlink:href="https://seven.religionandstory.com/images/atlantis.png" x="0" y="0" width="20px" height="18px"></image>-->
                        </pattern>
                        <pattern id="volcano" patternUnits="objectBoundingBox" x="0" y="0" width="1" height="1">
                            <!-- todo: This image is 5MB--reduce it -->
                            <image xlink:href="https://seven.religionandstory.com/images/volcano.png" x="-0.1" y="-0.1" width="16.75%" height="13%"></image>
                            <!--<image xlink:href="https://seven.religionandstory.com/images/volcano.png" x="0" y="0" width="20px" height="18px"></image>-->
                        </pattern>
                        <pattern id="hem" patternUnits="objectBoundingBox" x="0" y="0" width="1" height="1">
                            <image xlink:href="https://seven.religionandstory.com/images/heroes/hem.png" x="-0.1" y="-0.1" width="16.75%" height="13%"></image>
                            <!--<image xlink:href="https://seven.religionandstory.com/images/heroes/hem.png" x="0" y="0" width="20px" height="18px"></image>-->
                        </pattern>
                        <filter id="hover" x="0" y="0">
                            <feColorMatrix in="SourceGraphic" type="matrix" values=" 0 1 0 0 .66  0 1 0 0 .66  0 1 0 0 .66  0 1 0 1  0 "></feColorMatrix>
                        </filter>
                        <filter id="selected" x="0" y="0">
                            <!--<feColorMatrix in="SourceGraphic" type="matrix" values=" 0 1 0 0 .33  0 1 0 0 .33  0 1 0 0 .33  0 1 0 1  0 "></feColorMatrix>-->
                            <feColorMatrix in="SourceGraphic" type="matrix" values=" -1 0 0 0 1  0 -1 0 0 1  0 0 -1 0 1 0 0 0 1 0 "></feColorMatrix>
                        </filter>
                    </defs>
                </svg>
            </div>
        </div>
        <div class="col-2">
            <div id="playerDiv" class="center">
                <div><button id="submit" class="button" style="width: 7em; margin-bottom: .5em" onclick="submit()">Submit</button></div>
                <div><button id="phase"  class="button" style="width: 7em; margin-bottom: .5em" onclick="showActions()">Actions</button></div>
                <div><button id="trade"  class="button" style="width: 7em; margin-bottom: .5em" onclick="showTrade()">Trade</button></div>
                <div><button id="help"   class="button" style="width: 7em; margin-bottom: .5em" onclick="showHelp()">Help</button></div>
            </div>
        </div>
    </div>

</body>

<script>
    const userId = "<?php echo "ABC" ?>";
    const isSecure = true;
    if ( isSecure )
    {
        createMap( tileClickCallback );
        loadGame( "<?php echo $_GET['id'] ?>" );
    }
</script>
<?php includeModals(); ?>
</html>