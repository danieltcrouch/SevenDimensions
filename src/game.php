<?php include("php/startup.php"); ?>
<!DOCTYPE html>
<html>
<head>
    <?php includeHeadInfo(); ?>
    <script src="javascript/game.js"></script>
    <?php include(getSubPath() . "html/include-domain.html"); ?>
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
            <div id="playerDetailsDiv" style="margin-top: 2em; margin-bottom: 2em">
                <div id="playerName" style="font-style: italic">[Player Username]</div>
                <div id="factionName" style="margin-bottom: 1em">[Faction]</div>
                <div><span class="link" onclick="viewVP()">Victory Points:</span> <span id="victoryPointsValue">0</span></div>
                <div><span class="link" onclick="viewWB()">War-Bucks:</span> <span id="warBucksValue">0</span></div>
                <div><span style="font-weight: bold">Advancements </span></div>
                <div><span class="link" style="padding-left: 1em" onclick="viewTechnologies()">Technologies:</span> <span id="technologiesValue">0/14</span></div>
                <div><span class="link" style="padding-left: 1em" onclick="viewDoctrines()">Doctrines:</span> <span id="doctrinesValue">0/11</span></div>
                <div><span class="link" style="padding-left: 1em" onclick="viewGardens()">Gardens:</span> <span id="gardensValue">0/5</span></div>
                <div><span class="link" style="padding-left: 1em" onclick="viewAuctions()">Auction Lots:</span> <span id="auctionLotsValue">0/7</span></div>
                <div><span class="link" onclick="viewInitiatives()">Initiative Tokens:</span> <span id="initiativeTokensValue">0</span></div>
                <div><span class="link" onclick="viewCards()">Chaos Cards:</span> <span id="chaosCardsValue">0</span></div>
            </div>
            <div id="tileDetailsDiv" style="border: 2px solid black; border-radius: 1em; padding: 1em"></div>
        </div>
        <div class="col-6">
            <div id="mapDiv" class="center">
                <svg id="map" width="100%">
                    <?php getSvgDefinitions(); ?>
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
    const gameId = "<?php echo $_GET['id']; ?>";

    setLoginCallback( function() {
        loadGame();
    } );

    generateMapSVG( tileClickCallback );
</script>
<?php include("html/market-modal.html"); ?>
<?php includeModals(); ?>
</html>