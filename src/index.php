<?php include("$_SERVER[DOCUMENT_ROOT]/php/startup.php"); ?>
<!DOCTYPE html>
<html>
<head>
	<title>Seven Dimensions</title>
    <?php includeHeadInfo(); ?>
</head>

<body>

	<!--Header-->
    <?php includeHeader(); ?>
    <div class="col-10 header">
        <div class="title center"><span class="clickable">
            Seven Dimensions
            <img style="width: .5em; padding-bottom: .25em" src="<?php getHelpImage() ?>" alt="help">
        </span></div>
        <div id="instructions" style="display: none">
            This is a supplemental tool for the board game <i>Seven Dimensions</i>.<br/><br/>
            It can be used for keeping track of War Bucks awarded each turn as well as advancements.
            It can also be used for sandboxing games.
        </div>
    </div>

    <!--Main-->
    <div class="col-10 main">
        <div class="title center">This Page is under construction</div>
        <br />
        <div class="center"><img src="<?php getConstructionImage(); ?>" width="300px"></div>
    </div>

</body>
<?php includeModals(); ?>
</html>