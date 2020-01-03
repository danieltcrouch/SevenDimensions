//https://developers.google.com/identity/sign-in/web/sign-in
let userId = "";

function initializeUser() {
    gapi.load( 'auth2', function() {
        gapi.auth2.init().then( function( auth2 ){
            if ( auth2.isSignedIn.get() ) {
                userId = auth2.currentUser.get().getId();
                initializeGame();
            }
            else {
                window.location = "https://seven.religionandstory.com/";
            }
        } );
    } );
}

function onSignIn( googleUser ) {
    window.location = "https://seven.religionandstory.com/lobby.php"; //todo 1
    //const profile = googleUser.getBasicProfile();
    //console.log( 'ID: ' + profile.getId() ); // Do not send to your backend! Use an ID token instead.
    //console.log( 'Name: ' + profile.getName() );
    //console.log( 'Image URL: ' + profile.getImageUrl() );
    //console.log( 'Email: ' + profile.getEmail() ); // This is null if the 'email' scope is not present.
}

function signOut() {
    let auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then( function() {
        console.log( "User signed out." );
        window.location = "https://seven.religionandstory.com/lobby.php";
    } );
}