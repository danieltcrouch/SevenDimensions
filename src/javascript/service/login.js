//https://developers.google.com/identity/sign-in/web/sign-in
//todo 10 - move Google Sign-In to Common
//  Will require moving PHP backend code as well
//todo 11 - do a major code clean-up across Common and all projects [Seven, Bracket, Reviews, Overflow (except Poker), Turing, Football]
let loginCallback = function() {};
let userId = "";

function setLoginAttributes( loginCallbackFunction ) {
    loginCallback = loginCallbackFunction;
}

function onSignIn( googleUser, createNew = true ) {
    if ( googleUser ) {
        validateUser(
            googleUser.getAuthResponse().id_token,
            createNew
        );
    }

}

function initializeUser() {
    gapi.load( 'auth2', function() {
        gapi.auth2.init().then( function( auth2 ){
            onSignIn( auth2.currentUser.get(), false );
        } );
    } );
}

function validateUser( authToken, createNew = false ) {
    $.post( //todo 11 - get rid of jQuery completely?
        "php/controller.php",
        {
            action:    "validateUser",
            appName:   location.hostname.split(".")[0], //todo 10 - possibly use global variables from startup.php
            authToken: authToken,
            createNew: createNew
        },
        function( response ) {
            userId = jsonParse(response);
            if ( userId ) {
                loginCallback();
            }
            else {
                failCallback();
            }
        }
    ).fail( function( error ) {
        failCallback();
    });
}

function failCallback() {
    if ( window.location.replace( /\/index.php.*/gi, "" ) !== location.hostname ) {
        window.location = location.hostname;
    }
}

function signOut() {
    let auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then( function() {
        console.log( "User signed out." );
        failCallback();
    } );
}