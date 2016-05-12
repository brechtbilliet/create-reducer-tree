import {require} from "./create-reducer-tree.spec";
import * as clone from "clone";
export function createReducerTree(reducerTree: any): any {
    let compositionTree = {};
    let keys = fetchKeysInItem(reducerTree);
    keys.forEach(key => {
        checkValidityBranch(reducerTree[key]);
        compositionTree[key] = createParentReducer(reducerTree[key]);
    });
    return compositionTree;
}

export function fetchKeysInItem(item: any): Array<string> {
    return (Array.isArray(item) || typeof item !== "object") ? [] : Object.keys(item);
}

export function fetchActionsForTree(item: any, actionTypes: Array<string> = []): Array<string> {
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

export function generateInitialState(tree: any): any {
    function removeActionsAndReducers(state) {
        for (var i in state) {
            if (i === "actions" || i === "reducer") {
                delete state[i];
            }
            removeActionsAndReducers(state[i]);
        }
    }

    let state = JSON.parse(JSON.stringify(tree));
    removeActionsAndReducers(state);
    return state;
}

export function createParentReducer(reducerTree: any): Function {
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

export function checkValidityBranch(reducerTree: any) {
    let deepestLevels = getDeepestLevels(reducerTree);
    deepestLevels.forEach((deepestLevel) => {
        if (!deepestLevel.reducer || typeof deepestLevel.reducer !== "function") {
            throw Error("The deepest level of every reducer branch should have a reducer");
        }
        if (!deepestLevel.actions || deepestLevel.actions.length === 0) {
            throw Error("The deepest level of every reducer branch should have at least one action");
        }
    });
}

export function getDeepestLevels(reducerTree: any, deepestLevels: any = []): Array<{actions: Array<string>, reducer: Function}> {
    let keys: Array<string> = fetchKeysInItem(reducerTree);
    // if no keys except maybe "actions" or "reducer"
    let filtered = keys.filter((key) => key !== "actions" && key !== "reducer");
    if (filtered.length === 0) {
        deepestLevels.push(reducerTree);
    }
    keys.forEach((key: string) => {
        if (typeof reducerTree[key] === "object" && reducerTree[key]) {
            if (key !== "actions" && key !== "reducer") {
                getDeepestLevels(reducerTree[key], deepestLevels);
            }
        }
    });
    return deepestLevels;
}