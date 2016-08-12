initialState = {customer: {age: 30, name: 'Bob'}};

var ReduxBehavior = PolymerRedux(createStore());
var store;

function createStore() {
    store = Redux.createStore(createReducer(), {}, Redux.applyMiddleware(LoggerMiddleware()));
    store.asyncReducers = {};
    return store;
}

function createReducer(asyncReducers) {
    return Redux.combineReducers(Object.assign({
        nameReducer: nameReducer,
        ageReducer: ageReducer
    }, asyncReducers));
}


function injectAsyncReducer(name, asyncReducer) {
    store.asyncReducers[name] = asyncReducer;
    store.replaceReducer(createReducer(store.asyncReducers))
}


function nameReducer(state, action) {
    state = state || initialState;
    switch (action.type) {
        case 'update':
            return action.value || state;
        default:
            return state;
    }
}
function ageReducer(state, action) {
    state = state || initialState;
    switch (action.type) {
        case 'increase':
            return state + 1;
        case 'decrease':
            return state - 1;
        default:
            return state
    }
}




function LoggerMiddleware() {
    var timer = typeof window.performance !== 'undefined' && typeof window.performance.now === 'function' ? window.performance : Date;
    var console = window.console;

    return middleware;

    function middleware(localstore) {
        return function (next) {
            return function (action) {
                var time = new Date();

                var started = timer.now();
                var prevState = localstore.getState();
                console.log(prevState);
                var returnValue = next(action);
                var took = timer.now() - started;

                var nextState = localstore.getState();

                var formattedTime = ' @ ' + new Intl.DateTimeFormat().format(time);
                var formattedDuration = ' in ' + took.toFixed(2) + ' ms';
                var formattedAction = action;
                var message = 'action ' + formattedAction.type + formattedTime + formattedDuration;

                var shouldCollapse = typeof console.groupCollapsed === 'function';

                if (shouldCollapse) {
                    console.groupCollapsed(message);
                } else {
                    console.debug(message);
                }

                console.debug('%c prev state', 'color: #9E9E9E; font-weight: bold', prevState);
                console.debug('%c action', 'color: #03A9F4; font-weight: bold', formattedAction);
                console.debug('%c next state', 'color: #4CAF50; font-weight: bold', nextState);

                if (shouldCollapse) {
                    console.groupEnd();
                }

                return returnValue;
            };
        };
    }
}