<?php

function getOrCreateUser( $email )
{
    $result = getUser( $email );
    if ( !$result ) {
        $result = getGUID();
        createUser( $result, $email );
    }

    $_SESSION['userId'] = $result;
    return $result;
}

?>