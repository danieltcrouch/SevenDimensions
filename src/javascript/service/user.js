let userId;

function setLoginUser( appName, callback ) {
    setLoginAttributes( appName, function (response) {
        if ( response && response.email ) {
            getUser( response.email, callback );
        }
        else {
            callback();
        }
    } );
}

function getUser( email, callback ) {
        postCallEncoded(
           "php/main-controller.php",
           {
               action: "getOrCreateUser",
               email:  email
           },
           function (response) {
               userId = response;
               callback();
           }
        );
}