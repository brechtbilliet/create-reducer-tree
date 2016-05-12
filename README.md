# Create-reducer-tree
This library is created to help you with creating large reducer trees (Hierachical reducer composition). [Reducers](http://redux.js.org/docs/basics/Reducers.html) and [reducer-composition](http://redux.js.org/docs/api/combineReducers.html) are principles from Redux.

Let's say that when you have a 3 levels of reducers in a hierachical order, you have to create parentreducers for that. Those reducers should only return a new state based on matching actions.

## Installing
```sh
npm install create-reducer-tree
```

## Usage
import it

```typescript
import {createReducerTree} from "create-reducer-tree";
```

You will have to create some kind of reducerTree that looks like this:
At the deepest level we always define **actions and one reducer.**

```typescript
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
let store = createReducerTree(reducerComposer);

```

When ACTION1 or ACTION2 is sent to the store we can not update the reference of groceryManagement > container. 

When ACTION1, ACTION2, ACTION3 or ACTION4 is sent to the store we can not update the references of listManagement > data, listManagement > container, common > container.

This results in the fact that we have to create reducers for every hierarchical step, so the reducers are called correctly based on actions.

This is what this tiny piece of code is all about. **When using createReducerTree we do not have to create the following reducers anymore:**
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
        case "ACTION3":
        case "ACTION4":
            return {
                data: dataReducer(state.data, action),
                container: containerReducer(state.container, action)
            }
    }
    return state;
}
```