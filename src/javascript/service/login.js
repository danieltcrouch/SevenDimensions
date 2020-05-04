//https://developers.google.com/identity/sign-in/web/sign-in
//todo 4 - move Google Sign-In to Common
//  Will require moving PHP backend code as well
//todo 5 - do a major code clean-up across Common and all projects [Seven, Bracket, Reviews, Overflow (except Poker), Turing, Football]
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
    postCallEncoded(
        "php/main-controller.php",
        {
            action:    "validateUser",
            appName:   location.hostname.split(".")[0], //todo 4 - possibly use global variables from startup.php
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
        },
        function( error ) {
            failCallback();
        }
    );
}

function failCallback() {
    let currentLocation = location.href;
    currentLocation = currentLocation.replace( /www|\/index.php.*/gi, "" );
    let homePage = location.origin
    if ( !( currentLocation === homePage || currentLocation === (homePage + "/") ) ) {
        location.replace( homePage );
    }
}

function signOut() {
    let auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then( function() {
        console.log( "User signed out." );
        failCallback();
    } );
}

//TO MOVE * * * *

function postCallEncoded( endPoint, data, successCallback, failureCallback = function(){}, asynchronous = true ) {
    return postCall( endPoint, data, successCallback, failureCallback, asynchronous, false );
}

function postCall( endPoint, data, successCallback, failureCallback = function(){}, asynchronous = true, contentTypeJson = true ) { //todo 4 - use this one for this project (removes the need for $_POST all over the place)
    let contentType = contentTypeJson ? "application/json" : "application/x-www-form-urlencoded; charset=UTF-8";
    data = contentTypeJson ? JSON.stringify( data ) : urlEncodeJson( data );

    //todo 5 - get rid of jQuery completely
    let httpRequest = new XMLHttpRequest();
    httpRequest.open( "POST", endPoint, asynchronous );
    httpRequest.setRequestHeader( "Content-Type", contentType );
    httpRequest.onload = function() {
        if ( this.status === 200 ) {
            //successCallback( jsonParse( this.responseText ) ); //todo 5 - make it where you parse JSON in this function
            successCallback( this.responseText );
        }
        else {
            console.log( this.responseText );
            failCallback();
        }
    };
    httpRequest.send( data );
}

function urlEncodeJson( data ) {
    let result = [];
    for ( let key in data ) {
        result.push( encodeURIComponent( key ) + "=" + encodeURIComponent( data[key] ) );
    }
    return result.join("&");
}