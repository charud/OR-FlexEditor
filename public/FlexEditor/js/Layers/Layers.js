function Layers(renderer) {

	var renderToElement;
	var loadedElements;

	this.load = function(elementContainer) {
		// The renderer work on pure elements not wrapped by jQuery
		if(elementContainer instanceof jQuery) elementContainer = elementContainer.get(0);
		renderToElement = elementContainer;
		
		// Check for mouse down on items
		var mouseInput = new MouseInput(renderToElement, null, true);
		mouseInput.start();
		$(mouseInput).on('mousedown', onItemDown.bind(this));

		registerKeyHandler();

		// And render it (currently with no elements)
		this.render([]);
	}

	// Will select the element in the ElementCollection on click
	function onItemDown(e) {
		var $target = $(e.target);


		var elementId  = $(e.target).closest('.layer-element').data('element-id');
		var element = ElementCollection.getById(elementId);

		if($target.is('.layer-element')) {
			ElementCollection.select(element);
		} else if($target.closest('.attribute-locked').length > 0) {
			element.toggleProperty('locked');
			element.invalidate();
		} else if($target.closest('.attribute-position').length > 0) {
			element.property('positionType', (element.property('positionType') == 'absolute') ? 'relative' : 'absolute');
			element.invalidate();
		}
	}

	// Will switch selection between elements with Shift+Up and Shift+Down
	function registerKeyHandler() {
		$(window).keydown(function(e) {
			var keyDown = 40;
			var keyUp = 38;
			var keyD = 68;

			// shift + up/down will move elemnt selection up and down 
			if(e.shiftKey && !e.altKey) {
				// Find which element in the layer list is selected
				var selectedElement = ElementCollection.getSelected();
				var selectedLayerIndex = -1;
				for(var i in loadedElements) {
					if(loadedElements[i] == selectedElement) selectedLayerIndex = i;
				}

				if(e.keyCode == keyDown) {
					var selectLayerIndex = parseInt(selectedLayerIndex) + 1;
					if(selectLayerIndex >= loadedElements.length) selectLayerIndex = 0;
					ElementCollection.select(loadedElements[selectLayerIndex]);
				}
				if(e.keyCode == keyUp) {
					var selectLayerIndex = parseInt(selectedLayerIndex) - 1;
					if(selectLayerIndex < 0) selectLayerIndex = loadedElements.length - 1;
					ElementCollection.select(loadedElements[selectLayerIndex]);
				}
			}

			// alt + d will duplicate current element
			if(e.altKey && !e.shiftKey && e.keyCode == 68) {
				var selectedElementOptions = ElementCollection.getSelected().getOptions();
				var duplicateElement = new Element(selectedElementOptions.parent, selectedElementOptions);
				ElementCollection.add(duplicateElement);
				ElementCollection.select(duplicateElement);
			}
		});
	}

	this.render = function(elements) {
		loadedElements = cloneArrayShallow(elements);
		loadedElements.reverse(); // reverse our copy to get latest layer at top
		renderer.write(loadedElements, renderToElement, Templates.Layer, true, true);
	}

}