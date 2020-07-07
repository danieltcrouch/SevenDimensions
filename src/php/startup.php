<?php
session_start();

//Redirect added through BlueHost -> https://seven.dcrouch.site
//Whitelist old and new domains for Google Sign-In -> https://console.developers.google.com/apis/credentials?project=seven-dimensions-1578000910474&supportedpurview=project

$appCode     = "seven";
$project     = "sevenDimensions";
$siteTitle   = "Seven Dimensions";
$pageTitle   = "Seven Dimensions";
$image       = "https://seven.religionandstory.com/images/seven.jpg";
$description = "Use this Seven Dimensions board game helper (currently in development) to aid managing your faction.";
$keywords    = "Seven Dimensions,faction,victory points,Atlantis,board game,table top game,game,Twilight Imperium";
$homeUrl     = "https://seven.religionandstory.com";

function getCommonPhpPath()
{
    $public = "public_html";
    $path = $_SERVER['DOCUMENT_ROOT'];
    $length = strpos( $path, $public ) + strlen( $public );
    return substr( $path, 0, $length ) . "/common/php/";
}

require_once( getCommonPhpPath() . "common-startup.php" );

/*** ADDITIONAL ***/

function getSvgDefinitions()
{
    include_once(getSubPath() . "html/svg-def.html");
}

?>