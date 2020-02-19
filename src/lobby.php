<?php include("php/startup.php"); ?>
<!DOCTYPE html>
<html>
<head>
    <?php includeHeadInfo(); ?>
    <script src="javascript/lobby.js"></script>
</head>

<body>

	<!--Header-->
    <?php includeHeader(); ?>
    <div class="col-10 header">
        <div class="title center"><span class="clickable">
            Seven Dimensions
            <img id="helpIcon" style="width: .5em; padding-bottom: .25em" src="<?php getHelpImage() ?>" alt="help">
        </span></div>
        <div id="helpText" style="display: none">
            <!--How to use the lobby.-->
        </div>
    </div>

    <!--Main-->
    <div class="col-10 main">
        <div class="center" style="margin-bottom: 1em">
            <button id="single" name="userType" class="button inverseButton" style="width: 8em; margin: .25em;">Single</button>
            <button id="multi"  name="userType" class="button inverseButton" style="width: 8em; margin: .25em;">Multi</button>
        </div>
        <div class="center">
            <button id="start" class="button" style="display: none; width: 8em; margin: .25em;" onclick="startGame()">Start</button>
        </div>
    </div>

</body>

<script>
    setRadioCallback( "userType", function( userType ) {
        setUserType( userType );
    });
</script>
<?php includeModals(); ?>
</html>