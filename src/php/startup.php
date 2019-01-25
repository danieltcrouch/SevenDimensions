<?php
session_start();

$project    = "sevenDimensions";
$siteTitle  = "Seven Dimensions";
$pageTitle  = "Seven Dimensions";
$image      = "https://seven.religionandstory.com/images/seven.jpg";
$description= "Use this Seven Dimensions board game helper (currently in development) to aid managing your faction.";
$keywords   = "Seven Dimensions,faction,victory points,Atlantis,board game,table top game,game,Twilight Imperium";
$homeUrl    = "https://seven.religionandstory.com";

function includeHeadInfo()
{
    global $siteTitle;
    global $pageTitle;
    global $image;
    global $description;
    global $keywords;
    include("$_SERVER[DOCUMENT_ROOT]/../common/html/head.php");
}

function includeHeader()
{
    global $homeUrl;
    include("$_SERVER[DOCUMENT_ROOT]/../common/html/header.php");
}

function includeModals()
{
    include("$_SERVER[DOCUMENT_ROOT]/../common/html/modal.html");
    include("$_SERVER[DOCUMENT_ROOT]/../common/html/toaster.html");
}

function getHelpImage()
{
    echo "https://religionandstory.com/common/images/question-mark.png";
}

function getConstructionImage()
{
    echo "https://image.freepik.com/free-icon/traffic-cone-signal-tool-for-traffic_318-62079.jpg";
}

?>