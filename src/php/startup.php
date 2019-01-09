<?php

session_start();

$project = "sevenDimensions";
$homeUrl = "http://seven.religionandstory.com";

function includeHeadInfo()
{
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
    echo "http://religionandstory.com/common/images/question-mark.png";
}

function getConstructionImage()
{
    echo "https://image.freepik.com/free-icon/traffic-cone-signal-tool-for-traffic_318-62079.jpg";
}

?>