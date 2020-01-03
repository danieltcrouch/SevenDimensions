//https://developers.google.com/identity/sign-in/web/sign-in
//todo 10 - do this correctly with sessions and auth_tokens and whatever else
let loginCallback = function() {};
let isSignInPage = false;
let userId = "";

function setSignInPage( isSignInPageValue = false ) {
    isSignInPage = isSignInPageValue;
}

function setLoginCallback( loginCallbackFunction ) {
    loginCallback = loginCallbackFunction;
}

function initializeUser() {
    gapi.load( 'auth2', function() {
        gapi.auth2.init().then( function( auth2 ){
            if ( auth2.isSignedIn.get() ) {
                userId = auth2.currentUser.get().getId();
                loginCallback();
            }
            else if ( !isSignInPage ) {
                window.location = "https://seven.religionandstory.com/";
            }
        } );
    } );
}

function onSignIn( googleUser ) {
    window.location = "https://seven.religionandstory.com/lobby.php";
}

function signOut() {
    let auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then( function() {
        console.log( "User signed out." );
        window.location = "https://seven.religionandstory.com/";
    } );
}