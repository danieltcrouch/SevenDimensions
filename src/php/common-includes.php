<?php

function getCommonPhpPath()
{
    $public = "public_html";
    $path = $_SERVER['DOCUMENT_ROOT'];
    $length = strpos( $path, $public ) + strlen( $public );
    return substr( $path, 0, $length ) . "/common/php/";
}

require_once( getCommonPhpPath() . "common-file.php" );
require_once( getCommonPhpPath() . "common-service.php" );

?>