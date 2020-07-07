<?php include("php/startup.php"); ?>
<!DOCTYPE html>
<html>
<head>
    <?php includeHeadInfo(); ?>
    <script src="javascript/user.js"></script>
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
        </div>
    </div>

    <!--Main-->
    <div class="col-10 main">
        <div class="center">
            <div class="g-signin2" data-onsuccess="onSignIn"></div>
        </div>
    </div>

</body>
<style>
    .g-signin2 > div {
        margin: 0 auto;
    }
</style>
<script>
    const appName = "<?php echo getAppCode(); ?>";
    setLoginUser( appName, function() { location.assign( "https://seven.religionandstory.com/lobby.php" ); } );
</script>
<?php includeModals(); ?>
</html>