//https://developers.google.com/identity/sign-in/web/sign-in
//todo 2 - do this correctly with sessions and auth_tokens and whatever else
//todo 10 - move Google Sign-In to Common
//  Will require moving PHP backend code as well
//todo 11 - do a major code clean-up across Common and all projects [Seven, Bracket, Reviews, Overflow (except Poker), Turing, Football]
let loginCallback = function() {};
let appName = "";
let userId = "";

function setLoginAttributes( loginCallbackFunction, appValue ) {
    loginCallback = loginCallbackFunction;
    appName = appValue;
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
            onSignIn( auth2.isSignedIn.get(), false );
        } );
    } );
}

function validateUser( authToken, createNew = false ) {
    $.post(
        "php/controller.php",
        {
            action:    "validateUser",
            app:       appName,
            authToken: authToken,
            createNew: createNew
        },
        function( response ) {
            userId = response;
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