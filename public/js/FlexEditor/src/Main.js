// TODO: Add source map, http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/

function Main(options) {
	this.options = options;
};

(function(me) {

	me.prototype.load = function(options) {
		
		// Merge parameter-options with the constructor-options (or use defaults)
		var options = merge(this.options, options);
		var element = document.getElementById(options.elementId);
		var cellSize = options.cellSize || { width: 10, height: 10 };
		
		// Init button and grid renderer
		var renderer = options.renderer || new Renderer({toElement: element});
		var gridRenderer = options.gridRenderer || new GridRenderer();

		// Render grid lines
		gridRenderer.render(element, cellSize);

		// Compile templates from the tpl folder (and store in the Templates namespace)
		Templates.compile();

		// Init mouse handler and handle onPreSelection (grid selection)
		var mouseHandler = new MouseHandler();
		mouseHandler.register({
			  element: element
			, cellSize: cellSize 
			, onPreSelection: eventHandler(onEvent, { event: 'preselection', renderer: renderer, handler: mouseHandler, buttons: [] })
			,    onSelection: eventHandler(onEvent, { event: 'selection',    renderer: renderer, handler: mouseHandler, buttons: [] })
		});
	};

	var getButtonIndexAtPoint = function(buttons, x, y) {
		for(var i in buttons) {
			var b = buttons[i];
			if(x >= b.left && x < b.left + b.width && 
			   y >= b.top && y < b.top + b.height)
				return parseInt(i);
		}
		return -1;
	}

	var onEvent = function(e, context) {

		switch(context.event) {

			case 'preselection':
				// Is the selection overlapping an existing button?
				// Then we should go into 'move mode'
				// Otherwise we should create a new button preview
				var buttonIndex = getButtonIndexAtPoint(context.buttons, e.rect.x, e.rect.y);
				if(buttonIndex > -1) {	

					// Register a new move aware context for the preselection + selection events						
					context.handler.register(merge(context.handler.context, {
						  onPreSelection: eventHandler(onEvent, merge(context, { 
						  	  event: 'preselection.moving'
						  	, movedButtonIndex: buttonIndex
						  }))
						, mouseDown: true 
					}));

				} else {

					// Create a new button based on preselection rect
					var button = { 
						  position: 'relative'
						, text: ''
						, left: e.rect.x, width:  e.rect.width
						, top:  e.rect.y, height: e.rect.height
					};

					// Render a preview of the selection
					context.renderer.write(Templates.Preselection, context.buttons.concat(button));

					// Register a new preselection aware context for the selection event
					context.handler.register(merge(context.handler.context, {
						onSelection: eventHandler(onEvent, merge(context, {
							  button: button
							, event: 'selection'
						}))
					}));
				}		
			
				break;

			case 'preselection.moving': 
				var before = context.buttons.slice(0, context.movedButtonIndex);
				var after = context.buttons.slice(context.movedButtonIndex + 1);
				var current = context.buttons[context.movedButtonIndex];

				var newButton = merge(current, {
				      position: 'relative'
					, left: e.x, width:  current.width
					, top:  e.y, height: current.height
				});

				// Render a preview of the moved button
				var preButtons = before.concat(newButton).concat(after);
				context.renderer.write(Templates.Preselection, preButtons);

				// Register a new move aware context for the selection event
				context.handler.register(merge(context.handler.context, {
					onSelection: eventHandler(onEvent, merge(context, {
						  movingButton: true
						, buttons: preButtons
						, event: 'selection.moving'
						, movedButtonIndex: null
					}))
				}));
				break;

			case 'selection': 		
				Modal.getResults(Templates.CreateButtonModal, context.renderer, {
					onSuccess: function(results) {		
						// Create a new button based on selection-preview-context and input from modal
						var newButton = merge(context.button, { text: results.inputText });

						// Create a new context with the new button appended
						var newContext = merge(context, { 
							buttons: context.buttons.concat(newButton) 
						});

						// Render it
						context.renderer.write(Templates.Button, newContext.buttons);

						// And re-register selection events with the new button array
						context.handler.register(merge(context.handler.context, {
							  onPreSelection: eventHandler(onEvent, merge(newContext, { event: 'preselection' }))
							, onSelection: eventHandler(onEvent, merge(newContext, { event: 'selection' }))
						}));
					},
					onCancelled: function() {
						// Just render already stored buttons to clear preselection
						context.renderer.write(Templates.Button, context.buttons);
					}
				});				
				break;

			case 'selection.moving':
				// Create a new non moving context
				var newContext = merge(context, { movingButton: false });

				// Render it
				context.renderer.write(Templates.Button, context.buttons);

				// And register selection events with the new context
				context.handler.register(merge(context.handler.context, {
					  onPreSelection: eventHandler(onEvent, merge(newContext, { event: 'preselection' }))
					, onSelection: eventHandler(onEvent, merge(newContext, { event: 'selection' }))
				}));
				break;

		}
	}
	
}(Main));

