<?php
session_start();

//Redirect added through BlueHost -> https://seven.dcrouch.site
//Whitelist old and new domains for Google Sign-In -> https://console.developers.google.com/apis/credentials?project=seven-dimensions-1578000910474&supportedpurview=project

$project     = "sevenDimensions";
$siteTitle   = "Seven Dimensions";
$pageTitle   = "Seven Dimensions";
$image       = "https://seven.religionandstory.com/images/seven.jpg";
$description = "Use this Seven Dimensions board game helper (currently in development) to aid managing your faction.";
$keywords    = "Seven Dimensions,faction,victory points,Atlantis,board game,table top game,game,Twilight Imperium";
$homeUrl     = "https://seven.religionandstory.com";

function getAppCode()
{
    global $project;
    return $project;
}

function getRootPath()
{
    $public = "public_html";
    $path = $_SERVER['DOCUMENT_ROOT'];
    $length = strpos( $path, $public ) + strlen( $public );
    return substr( $path, 0, $length ) . "/";
}

function getSubPath()
{
    return getRootPath() . "seven/";
}

function includeHeadInfo()
{
    global $siteTitle;
    global $pageTitle;
    global $image;
    global $description;
    global $keywords;
    include(getRootPath() . "common/html/head.php");
    include(getSubPath() . "html/include-login.html");
}

function includeHeader()
{
    global $homeUrl;
    include(getRootPath() . "common/html/header.php");
}

function includeModals()
{
    include(getRootPath() . "common/html/modal.html");
    include(getRootPath() . "common/html/modal-choice.html");
    include(getRootPath() . "common/html/modal-prompt.html");
    include(getRootPath() . "common/html/modal-prompt-big.html");
    include(getRootPath() . "common/html/toaster.html");
}

function getHelpImage()
{
    echo "https://religionandstory.com/common/images/question-mark.png";
}

function getConstructionImage()
{
    echo "https://image.freepik.com/free-icon/traffic-cone-signal-tool-for-traffic_318-62079.jpg";
}

function getSvgDefinitions()
{
    include(getSubPath() . "html/svg-def.html");
}

?>