# Create-reducer-tree
This library is created to help you with creating large reducer trees (Hierachical reducer composition). [Reducers](http://redux.js.org/docs/basics/Reducers.html) and [reducer-composition](http://redux.js.org/docs/api/combineReducers.html) are principles from Redux.


## Installing
```sh
npm install create-reducer-tree
```

## Usage
###Import it

```typescript
import {createReducerTree} from "create-reducer-tree";
```
###Create a reducerComposer object
You will have to create an object that looks like the object shown below. It's actually a hierachical object that represents the store. At the deepest level you have to define **actions and one reducer.** Normally you would have to write parentreducers that delegate to childreducers based on certain actions. These parentreducers will determine which references are renewed in the immutable state tree.
createReducerTree will create that boilerplatecode for you.

```typescript
let reducerComposer: any = {
    groceryManagement: {
        data: {
            groceries: {
                initialState: [],
                actions: ["ACTION1", "ACTION2"],
                reducer: groceriesReducer
            }
        },
        container: {
            currentList: {
                initialState: null,
                actions: ["ACTION3", "ACTION4"],
                reducer: currentListReducer
            }
        }
    },
    listManagement: {
        data: {
            lists: {
                initialState: [],
                actions: ["ACTION5"],
                reducer: listsReducer
            }
        },
        container: {
            groceryListsEdit: {
                initialState: {list: null},
                actions: ["ACTION6"],
                reducer: groceryListsEditReducer
            }
        }
    },
    common: {
        container: {
            application: {
                initialState: {isBusy: false},
                actions: ["ACTION7"],
                reducer: applicationReducer
            },
            collapsableSidebar: {
                initialState: {isCollapsed: false},
                actions: ["ACTION8"],
                reducer: collapsableSidebarReducer
            }
        }
    }
};

// generate a store with the boilerplate reducers based on actions and initialstate
let store = createReducerTree(reducerComposer);

```
### Problem explained: scenario
Let's say the store receives ACTION1 or ACTION2. This will result in groceriesReducer to have been called and new references created for:
<ul>
	<li>groceryManagement</li>
	<li>groceryManagement > data</li>
	<li>groceryManagement > data > groceries</li>
	<li>listManagement (but nothing below)</li>
	<li>common (but nothing below)</li>
</ul>
The pieces of state that should **not** have new references are
<ul>
<li>groceryManagement > container and everything below</li>
<li>listManagement > data and everything below</li>
<li>listManagement > container and everything below</li>
<li>common > container and everything below</li>
</ul>

To get this behavior (and make sure that not the entire tree gets new references) you had to manually create reducers for all hierachical levels. Normally you would have to write boilerplate code for all these reducers.
<ul>
<li>groceryManagementReducer </li>
<li>groceryManagementDataReducer </li>
<li>groceryManagementContainerReducer </li>
<li>listManagementReducer </li>
<li>listManagementDataReducer </li>
<li>listManagementContainerReducer </li>
<li>commonReducer </li>
<li>commonContainerReducer </li>
<li>commonCollapsableSidebarReducer </li>
</ul>
Writing the reduces above can take a lot of time to write/unittest/maintain.

This is an example of a reducer that we had to write before to optimize the tree.

```typescript
export function groceryManagementReducer(state: GroceryManagementState = {data:{...}}, action: Action): GroceryManagementState {
    switch (action.type) {
        case "ACTION1":
        case "ACTION2":
            return {
                data: dataReducer(state.data, action),
                container: containerReducer(state.container, action)
            }
    }
    return state;
}
```

All these reducers are generated for you by create-reducer-tree