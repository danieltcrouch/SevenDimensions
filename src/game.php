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
            <!-- TODO - DIVIDER -->
            <div id="playerDetailsDiv" style="margin-bottom: 2em">
                <div id="playerName">[Player Username]</div>
                <div id="factionName" style="margin-bottom: 1em">[Faction]</div>
                <div><span class="link">Victory Points:</span> <span id="victoryPointsValue">0</span></div>
                <div><span class="link">War-Bucks:</span> <span id="warBucksValue">0</span></div>
                <div><span class="link">Advancements </span></div>
                <div><span class="link" style="padding-left: 1em">Technologies:</span> <span id="technologiesValue">0/15</span></div>
                <div><span class="link" style="padding-left: 1em">Doctrines:</span> <span id="doctrinesValue">0/12</span></div>
                <div><span class="link" style="padding-left: 1em">Gardens:</span> <span id="gardensValue">0/5</span></div>
                <div><span class="link" style="padding-left: 1em">Auction Lots:</span> <span id="auctionLotsValue">0/7</span></div>
                <div><span class="link">Political Initiative Tokens:</span> <span id="politicalTokensValue">0</span></div>
                <div><span class="link">Cultural Initiative Tokens:</span> <span id="culturalTokensValue">0</span></div>
                <div><span class="link">Chaos Cards:</span> <span id="chaosCardsValue">0</span></div>
            </div>
            <div id="tileDetailsDiv" style="border: 2px solid black; border-radius: 1em; padding: 1em"></div>
        </div>
        <div class="col-6">
            <div id="mapDiv" class="center"></div>
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
        createMap( "mapDiv", tileClickCallback );
        loadGame( "<?php echo $_GET['id'] ?>" );
    }
</script>
<?php includeModals(); ?>
</html>