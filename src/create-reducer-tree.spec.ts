import {createReducerTree} from "./create-reducer-tree";
declare function require(string: string): any;

let deepFreeze = require("deep-freeze");
let clone = require("clone");
require("core-js");
let groceriesReducer = jasmine.createSpy("groceries");
let currentListReducer = jasmine.createSpy("currentList");
let listsReducer = jasmine.createSpy("lists");
let groceryListsEditReducer = jasmine.createSpy("groceryListsEdit");
let applicationReducer = jasmine.createSpy("application");
let collapsableSidebarReducer = jasmine.createSpy("collapsableSidebar");

let reducerComposer: any = {
    groceryManagement: {
        data: {
            groceries: {
                initialState: [],
                actions: ["GROCERIES"],
                reducer: groceriesReducer
            }
        },
        container: {
            currentList: {
                initialState: null,
                actions: ["CURRENTLIST", "CURRENTLIST2"],
                reducer: currentListReducer
            }
        }
    },
    listManagement: {
        data: {
            lists: {
                initialState: [],
                actions: ["LISTS"],
                reducer: listsReducer
            }
        },
        container: {
            groceryListsEdit: {
                initialState: {list: null},
                actions: ["GROCERYLISTSEDIT"],
                reducer: groceryListsEditReducer
            }
        }
    },
    common: {
        container: {
            application: {
                initialState: {isBusy: false},
                actions: ["APPLICATION"],
                reducer: applicationReducer
            },
            collapsableSidebar: {
                initialState: {isCollapsed: false},
                actions: ["COLLAPSABLESIDEBAR"],
                reducer: collapsableSidebarReducer
            }
        }
    }
};

describe("When createReducerTree()", () => {
    it("It should return an object with a function for every key", () => {
        let result = createReducerTree(reducerComposer);
        expect(Object.keys(result)).toEqual(Object.keys(reducerComposer));
    });
    describe("When branch does not have a reducer", () => {
        it("should throw an error", () => {
            let badReducerComposer = clone(reducerComposer);
            badReducerComposer.listManagement.data.lists.reducer = null;
            expect(() => createReducerTree(badReducerComposer))
                .toThrowError("The deepest level of every reducer branch should have a reducer");

            delete badReducerComposer.listManagement.data.lists.reducer;
            expect(() => createReducerTree(badReducerComposer))
                .toThrowError("The deepest level of every reducer branch should have a reducer");
        });
    });
    describe("when branch does not have any actions", () => {
        it("should throw an error", () => {
            let badReducerComposer = clone(reducerComposer);
            badReducerComposer.listManagement.data.lists.actions = null;
            expect(() => createReducerTree(badReducerComposer))
                .toThrowError("The deepest level of every reducer branch should have at least one action");

            delete badReducerComposer.listManagement.data.lists.actions;
            expect(() => createReducerTree(badReducerComposer))
                .toThrowError("The deepest level of every reducer branch should have at least one action");
        });
    });
    describe("when branch does not have any initialState", () => {
        it("should throw an error", () => {
            let badReducerComposer = clone(reducerComposer);
            badReducerComposer.listManagement.data.lists.initialState = undefined;
            expect(() => createReducerTree(badReducerComposer))
                .toThrowError("The deepest level of every reducer branch should have initialData");

            delete badReducerComposer.listManagement.data.lists.initialState;
            expect(() => createReducerTree(badReducerComposer))
                .toThrowError("The deepest level of every reducer branch should have initialData");
        });
    });

    describe("when the groceryManagement reducer is called", () => {
        describe("and the action is GROCERIES, CURRENTLIST OR CURRENTLIST2", () => {
            it("should create a new reference and refer to a data and container reducer", () => {
                let groceryManagementReducer = createReducerTree(reducerComposer).groceryManagement;
                let initialState: any = {data: {groceries: []}, container: {currentList: {}}};
                deepFreeze(initialState);
                currentListReducer.and.returnValue({})
                groceriesReducer.and.returnValue([]);

                let result = groceryManagementReducer(initialState, {type: "GROCERIES"});
                expect(Object.keys(result)).toEqual(Object.keys(reducerComposer.groceryManagement));
                expect(result.data.groceries).toEqual(initialState.data.groceries);
                expect(result.data.groceries).not.toBe(initialState.data.groceries);

                result = groceryManagementReducer(initialState, {type: "CURRENTLIST"});
                expect(Object.keys(result)).toEqual(Object.keys(reducerComposer.groceryManagement));
                expect(result.container.currentList).toEqual(initialState.container.currentList);
                expect(result.container.currentList).not.toBe(initialState.data.groceries);
                result = groceryManagementReducer(initialState, {type: "CURRENTLIST2"});
                expect(Object.keys(result)).toEqual(Object.keys(reducerComposer.groceryManagement));
                expect(result.container.currentList).toEqual(initialState.container.currentList);
                expect(result.container.currentList).not.toBe(initialState.data.groceries);
            });
        });
        describe("and the action does not match", () => {
            it("should return the same state", () => {
                let groceryManagementReducer = createReducerTree(reducerComposer).groceryManagement;
                let initialState: any = {data: {groceries: []}, container: {currentList: {}}};
                deepFreeze(initialState);
                currentListReducer.and.returnValue({})
                groceriesReducer.and.returnValue([]);
                let result = groceryManagementReducer(initialState, {type: "LISTS"});
                expect(result).toBe(initialState);

                result = groceryManagementReducer(initialState, {type: "GROCERYLISTSEDIT"});
                expect(result).toBe(initialState);

                result = groceryManagementReducer(initialState, {type: "APPLICATION"});
                expect(result).toBe(initialState);

                result = groceryManagementReducer(initialState, {type: "COLLAPSABLESIDEBAR"});
                expect(result).toBe(initialState);
            });
        });
    });
});

