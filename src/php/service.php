<?php

function validateUser( $app, $authToken, $createNew )
{
    $paramString = http_build_query( ['id_token' => $authToken], "", "&", PHP_QUERY_RFC3986 );
    $url = "https://oauth2.googleapis.com/tokeninfo?$paramString";
    $response = json_decode(file_get_contents($url)); //todo 2 - validate

    //todo 2 - Backend: validate user ID with Google
    //todo 2 - Backend: validate user ID in DB or create new, return DB userId
    return $response;
}

function getGUID() //todo - have global PHP helper class
{
	mt_srand((double)microtime()*10000);
	return strtoupper(md5(uniqid(rand(), true)));
}

function getNullValue( $value )
{
	return $value ? $value : null;
}

?>