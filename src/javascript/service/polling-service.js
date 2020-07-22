//This could maybe use WebSocket technology or something similar, but I opted for polling
const DELAY = 1000; //1 second
const PASSIVE_DELAY = 5000; //5 seconds

function poll( checkEventFunction ) {
    window.setInterval( checkEventFunction, PASSIVE_DELAY );
}

function pollWithTimeout( maxTime, callback, timeOutCallback ) {
    setLimitedInterval( DELAY, maxTime, callback, timeOutCallback );
}

function setLimitedInterval( delay, maxTime, callback, timeOutCallback ) {
    const maxRepetitions = maxTime / delay;
    let x = 0;
    const intervalId = window.setInterval( function () {
       if ( ++x <= maxRepetitions ) {
           callback( intervalId );
       }
       else {
           window.clearInterval( intervalId );
           timeOutCallback();
       }
    }, delay );
}