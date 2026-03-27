# Task Completion Plan for MEAN Task App Experiment/Study

## Approved Plan Steps:
1. **Fix script src mismatch**: Edit index.html to change `<script src="app.js"></script>` to `script.js`.
2. **Add 'Clear All' button (Experiment)**:
   - Edit index.html: Add `<button id="clearBtn">Clear All</button>` in input-section.
   - Edit style.css: Add styling for `#clearBtn`.
   - Edit script.js: Add event listener for `#clearBtn` to clear `taskList.innerHTML = ''`.
3. **Change background color (Experiment)**: Edit style.css body `background-color` to `#e8f4fd` (light blue).
4. **Study/Verify**: Confirm `addEventListener` and `document.createElement` usage (note: current JS uses innerHTML; optionally refactor to explicit createElement).
5. **Test**: Suggest browser refresh or live server.

## Progress:
- [x] Step 1
- [x] Step 2\n- [x] Step 3
- [ ] Step 4
- [ ] Step 5

Updated as steps complete.
