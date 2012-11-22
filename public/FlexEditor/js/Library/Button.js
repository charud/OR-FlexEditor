var Library = Library || {}; 
Library.elements = Library.elements || [];

(function() {

    me.key = "Button";
    me.title = 'Button';
    me.description = 'Import an image you have already created from a URL';

	function me() {
		
	}

    me.createElement = function(renderToElement) {
        var elm = ElementCollection.create(renderToElement);
        
        elm.property('contentType', 'Button');  
        elm.property('background', 'transparent');  
        elm.property('text', '');  

        elm.width(6, 'cells');
        elm.height(4, 'cells');
        elm.property('valign', 'bottom');
        elm.property('halign', 'center');
        elm.property('autosize', false);

        $(elm).on('imageChange', onImageChange);
        $(elm).on('autosizeChange', onAutosizeChanged);
        $(elm).on('widthChange heightChange', onSizeChange);
        elm.property('autosize', true);

        return elm;
    }
    
    //////////////////
    //// Autosize ////
    //////////////////
    var autosizeChangeInProgress = false;
    function onImageChange(e) {
        if(e.target.property('autosize')) onAutosizeChanged(e);
    }

    function onAutosizeChanged(e) {
        var elm = e.target;
        if(elm.property('autosize') == true && elm.property('image')) {        
            // Update this element to get the width and height of the true image
            var img = new Image();
            img.onload = function() {
                autosizeChangeInProgress = true;
                elm.width(this.width, 'absolute');
                elm.height(this.height, 'absolute');
                autosizeChangeInProgress = false;
            }
            img.src = elm.property('image');
        }
    }    

    function onSizeChange(e) {
        // Turn off autosize if the user changes the width or height of the
        // element manually. Check that the change is not triggered by autosize itself
        if(autosizeChangeInProgress) return;
        e.target.property('autosize', false);
    }


    Library.elements[me.key] = me;    
})();