### TODO:

* Search
* Space for radio/checkbox (if desired?)
* Version column/select
* "autoexpand" to current location given an input selection
* "Current Project" dropdown options
* Lots of styling
* Optimization/tests/code cleanup
* Much more

```jsx
<EntityFinder 
  sessionToken={sessionToken}
  initialContainerId={"syn24610451"}
  selectMultiple={true}
  onConfirm={(selectedEntityIds) => {console.log(selectedEntityIds)}}
/>
```