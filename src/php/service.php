<?php
//todo 10 - most/all of this file should be moved to Common

/*** GOOGLE SIGN-IN ***/
function validateUser( $app, $authToken, $createNew )
{
    $result = "";
    $response = httpCall( "https://oauth2.googleapis.com/tokeninfo", ['id_token' => $authToken] );
    if ( $response ) {
        $result = getUser( $response->email );
        if ( !$result && $createNew ) {
            $result = getGUID();
            saveUser( $result, $response->email );
        }
    }
    return $result;
}

/*** HTTP CALL ***/
function httpCall( $baseUrl, $params )
{
    $result = null;

    try {
        $paramString = http_build_query( $params, "", "&", PHP_QUERY_RFC3986 );
        $url = "$baseUrl?$paramString";
        $result = json_decode( file_get_contents( $url ) );
    }
    catch ( Exception $e ) {
        echo "Error: " . $e->getMessage();
    }

    return $result;
}

/*** EMAIL ***/
function sendEmail( $addressList, $subject, $message )
{
    //todo 11 - clean this up and make more re-usable
    $to = "danieltcrouch@gmail.com";
    $message = wordwrap($message, 70);
    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8\r\n";
    $headers .= "From: ReligionAndStory<noreply@religionandstory.com>\r\n" . //todo 11 - possibly use global variables from startup.php
                "Bcc: " . implode( ',', $addressList );
    return mail($to, $subject, $message, $headers);
}

/*** OTHER ***/
function getGUID()
{
	mt_srand((double)microtime()*10000);
	return strtoupper(md5(uniqid(rand(), true)));
}

function getNullValue( $value )
{
	return $value ? $value : null;
}

?>