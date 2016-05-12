declare function require(string: string): any;

let clone = require("clone");

export function createReducerTree(reducerTree: any): any {
    let compositionTree = {};
    let keys = fetchKeysInItem(reducerTree);
    keys.forEach(key => {
        checkValidityBranch(reducerTree[key]);
        compositionTree[key] = createParentReducer(reducerTree[key]);
    });
    return compositionTree;
}

function fetchKeysInItem(item: any): Array<string> {
    return (Array.isArray(item) || typeof item !== "object") ? [] : Object.keys(item);
}

function fetchActionsForTree(item: any, actionTypes: Array<string> = []): Array<string> {
    let keys: Array<string> = fetchKeysInItem(item);
    keys.forEach((key: string) => {
        if (typeof item[key] === "object" && item[key]) {
            if (key === "actions") {
                actionTypes.push(...item[key]);
            }
            fetchActionsForTree(item[key], actionTypes);
        }
    });
    return actionTypes;
}
function generateInitialState(tree: any): any {
    function handleStateChunk(state: any) {
        let newState = {};
        let keys = fetchKeysInItem(state);
        keys.forEach(key => {
            if (key !== "initialState" && key !== "actions" && key !== "reducer") {
                newState[key] = handleStateChunk(state[key]);
            }
            if (key === "initialState") {
                newState = state[key];
            }
        });
        return newState;
    }

    let state = JSON.parse(JSON.stringify(tree));
    return handleStateChunk(state);
}
function createParentReducer(reducerTree: any): Function {
    let actions = fetchActionsForTree(reducerTree);
    let keys = fetchKeysInItem(reducerTree);
    let initialState = generateInitialState(reducerTree);
    return function (state: any = clone(initialState), action: {type: string, payload: any}) {
        if (actions.indexOf(action.type) > -1) {
            let newState = {};
            if (keys.indexOf("actions") > -1) {
                return reducerTree.reducer(state, action);
            } else {
                keys.forEach(key => {
                    let reducer = createParentReducer(reducerTree[key]);
                    newState[key] = reducer(state[key], action);
                });
            }

            return newState;
        }
        return state;
    };
}

function checkValidityBranch(reducerTree: any) {
    let deepestLevels = getDeepestLevels(reducerTree);
    deepestLevels.forEach((deepestLevel) => {
        if (!deepestLevel.reducer || typeof deepestLevel.reducer !== "function") {
            throw Error("The deepest level of every reducer branch should have a reducer");
        }
        if (!deepestLevel.actions || deepestLevel.actions.length === 0) {
            throw Error("The deepest level of every reducer branch should have at least one action");
        }
        if (deepestLevel.initialState === undefined) {
            throw Error("The deepest level of every reducer branch should have initialData");
        }
    });
}

function getDeepestLevels(reducerTree: any, deepestLevels: any = []): Array<{actions: Array<string>, reducer: Function, initialState: any}> {
    let keys: Array<string> = fetchKeysInItem(reducerTree);
    // if no keys except maybe "actions" or "reducer"
    let filtered = keys.filter((key) => key !== "actions" && key !== "reducer" && key !== "initialState");
    if (filtered.length === 0) {
        deepestLevels.push(reducerTree);
    }
    keys.forEach((key: string) => {
        if (typeof reducerTree[key] === "object" && reducerTree[key]) {
            if (key !== "actions" && key !== "reducer" && key !== "initialState") {
                getDeepestLevels(reducerTree[key], deepestLevels);
            }
        }
    });
    return deepestLevels;
}