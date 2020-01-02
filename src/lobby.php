<?php include("php/startup.php"); ?>
<!DOCTYPE html>
<html>
<head>
    <?php includeHeadInfo(); ?>
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
            This is a supplemental tool for the board game <i>Seven Dimensions</i>.<br/><br/>
            <!--It can be used for keeping track of War Bucks awarded each turn as well as advancements.-->
            <!--It can also be used for sandboxing games.-->
        </div>
    </div>

    <!--Main-->
    <div class="col-10 main">
        <div class="center">
            <div class="g-signin2" data-onsuccess="onSignIn"></div>
        </div>
<!--        <div class="center" style="margin-bottom: 1em">-->
<!--            <button id="single" name="userType" class="button inverseButton" style="width: 8em; margin: .25em;">Single</button>-->
<!--            <button id="multi"  name="userType" class="button inverseButton" style="width: 8em; margin: .25em;">Multi</button>-->
<!--        </div>-->
<!--        <div class="center">-->
<!--            <button id="start" class="button" style="display: none; width: 8em; margin: .25em;" onclick="startGame()">Start</button>-->
<!--        </div>-->
    </div>

</body>

<script>
    function onSignIn( googleUser ) {
        window.location = "https://seven.religionandstory.com/game.php?id=1"; //todo 10
        //const profile = googleUser.getBasicProfile();
        //console.log( 'ID: ' + profile.getId() ); // Do not send to your backend! Use an ID token instead.
        //console.log( 'Name: ' + profile.getName() );
        //console.log( 'Image URL: ' + profile.getImageUrl() );
        //console.log( 'Email: ' + profile.getEmail() ); // This is null if the 'email' scope is not present.
    }
</script>
<?php includeModals(); ?>
</html>