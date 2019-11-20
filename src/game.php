<?php include("php/startup.php"); ?>
<!DOCTYPE html>
<html>
<head>
    <?php includeHeadInfo(); ?>
    <script src="javascript/game.js"></script>
    <script src="javascript/map/map.js"></script>
</head>

<body>

	<!--Header-->
    <?php includeHeader(); ?>
    <div class="col-10 header">
        <div class="subtitle center">
            <span class="clickable">
                Seven Dimensions
                <img id="helpIcon" style="width: .5em; padding-bottom: .25em" src="<?php getHelpImage() ?>" alt="help">
            </span>
        </div>
        <div id="helpText" style="display: none">
        </div>
    </div>

    <!--Main-->
    <div class="col-10 main">
        <div class="col-2">
            <div id="playerDetailsDiv">
                <div id="playerName">[Player Username]</div>
                <div id="factionName" style="margin-bottom: 1em">[Faction]</div>
                <div><span style="font-weight: bold">Victory Points: </span><span id="victoryPointsValue">0</span></div>
                <div><span style="font-weight: bold">War-Bucks: </span><span id="warBucksValue">0</span></div>
                <div><span style="font-weight: bold">Advancements </span></div>
                <div><span style="font-weight: bold; padding-left: .5em">Technologies: </span><span id="technologiesValue">0/15</span></div>
                <div><span style="font-weight: bold; padding-left: .5em">Doctrines: </span><span id="doctrinesValue">0/12</span></div>
                <div><span style="font-weight: bold; padding-left: .5em">Gardens: </span><span id="gardensValue">0/5</span></div>
                <div><span style="font-weight: bold; padding-left: .5em">Auction Lots: </span><span id="auctionLotsValue">0/7</span></div>
                <div><span style="font-weight: bold">Political Initiative Tokens: </span><span id="politicalTokensValue">0</span></div>
                <div><span style="font-weight: bold">Cultural Initiative Tokens: </span><span id="culturalTokensValue">0</span></div>
                <div><span style="font-weight: bold">Chaos Cards: </span><span id="chaosCardsValue">0</span></div>
            </div>
            <div id="tileDetailsDiv"></div>
        </div>
        <div class="col-6">
            <div id="roundDetailsDiv">
                <div><span style="font-weight: bold">Round: </span><span id="roundValue">0</span></div>
                <div><span style="font-weight: bold">Turn: </span><span id="turnValue">0</span></div>
                <div><span style="font-weight: bold">Doomsday Clock: </span><span id="doomsdayValue">0</span></div>
            </div>
            <div id="mapDiv"></div>
        </div>
        <div class="col-2">
            <div id="phasesDiv">
                <input id="market"      name="phaseButton" type="button" value="Market">
                <input id="expansion"   name="phaseButton" type="button" value="Expansion">
                <input id="harvest"     name="phaseButton" type="button" value="Harvest">
                <input id="council"     name="phaseButton" type="button" value="Council">
            </div>
            <div id="playerDiv">
                <input id="trade"  type="button" value="Trade">
                <input id="submit" type="button" value="Submit">
            </div>
        </div>
    </div>

</body>

<script>
    const userId = "<?php echo "USER" ?>";
    const isSecure = true;
    if ( isSecure )
    {
        createMap( "mapDiv", tileClickCallback );
        loadGame( "<?php echo $_GET['id'] ?>" );
    }
</script>
<?php includeModals(); ?>
</html>