<?php include("php/startup.php"); ?>
<!DOCTYPE html>
<html>
<head>
    <?php includeHeadInfo(); ?>
    <script src="javascript/game.js"></script>
</head>

<body>

	<!--Header-->
    <?php includeHeader(); ?>
    <div class="col-10 header" style="display: none"></div>

    <!--Main-->
    <div class="col-10 main">
        <div class="col-2">
            <div class="subtitle">
                <span>Seven Dimensions</span>
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
                <div id="unassignedWonders" style="margin-top: .5em; display: none">
                    <span style="font-weight: bold">Unassigned Wonders:</span>
                    <div id="unassignedWondersValue"></div>
                </div>
                <div id="unassignedUnits" style="margin-top: .5em; display: none">
                    <span id="units-all-unassigned" class="link" onclick="selectAllUnits('unassigned')">Unassigned Units:</span>
                    <div id="unassignedUnitsValue"></div>
                </div>
                <div id="unassignedAdvancements" style="margin-top: .5em; display: none">
                    <span class="link" onclick="chooseFreeAdvancements()">Free Advancements</span>
                </div>
                <div id="unassignedInitiatives" style="margin-top: .5em; display: none">
                    <span class="link" onclick="chooseFreeInitiatives()">Free Initiative Tokens</span>
                </div>
            </div>
            <div id="tileDetailsDiv" style="border: 2px solid black; border-radius: 1em; padding: 1em">
                <div id="tileDetailsNoContents">No Tile Selected</div>
                <div id="tileDetailsContents" style="display: none">
                    <div>Tile Type: <span id="tileTypeValue"></span></div>
                    <div>Population: <span id="tilePopulationValue"></span></div>
                    <div id="tileDistrict">District: <span id="tileDistrictValue"></span></div>
                    <div id="tileCR">Civil Resistance: <span id="tileCRValue"></span></div>
                    <div id="tileUnits" style="margin-top: 1em"></div>
                </div>
            </div>
            <div><button id="ability" class="button" style="width: 100%; margin-top: .5em; display: none" onclick="performUnitAbilities()">Use Ability</button></div>
            <div><button id="annex"   class="button" style="width: 100%; margin-top: .5em; display: none" onclick="performAnnex()">Annex</button></div>
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
                <div><button id="submit"  class="button" style="width: 7em; margin-bottom: .5em" onclick="submit()">Submit</button></div>
                <div><button id="phase"   class="button" style="width: 7em; margin-bottom: .5em" onclick="showActions()">Phase</button></div>
                <div><button id="ability" class="button" style="width: 7em; margin-bottom: .5em" onclick="showAbilities()">Abilities</button></div>
                <div><button id="trade"   class="button" style="width: 7em; margin-bottom: .5em" onclick="showTrade()">Trade</button></div>
                <div><button id="help"    class="button" style="width: 7em; margin-bottom: .5em" onclick="showHelp()">Help</button></div>
            </div>
        </div>
    </div>

</body>

<?php include("modals/capital-modal.html"); ?>
<?php include("modals/market-modal.html"); ?>
<?php include("modals/battle-modal.html"); ?>
<?php include("modals/event-modal.html"); ?>
<?php includeModals(); ?>

<?php include("html/include-domain.html"); ?>

<script>
    const gameId       = "<?php echo $_GET['id']; ?>";
    const testPlayerId = "<?php echo $_GET['testPlayerId']; ?>";
    const newGame      = "<?php echo $_GET['newGame']; ?>";

    docReady(function() {
        setLoginAttributes( loadGame );
        generateMapSVG( tileClickCallback );
    });
</script>
</html>