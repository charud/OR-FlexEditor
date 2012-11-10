function Element(parent, options) {
	if(parent == null) throw "Parent for Element cannot be null";
	options = options || {};

	// Parent
	this.parentWidth = $(parent).width();
	this.parentHeight = $(parent).height(); 

	// ID and text
	this.id = Element.idCounter++;
	
	// Position
	this.position = options.position || 'absolute';
	this.rect = { x: 0, y: 0, width: 0, height: 0 };
	if (options.rect) {
		this.x(options.rect.x, this.position);
		this.y(options.rect.y, this.position);
		this.width(options.rect.width, this.position);
		this.height(options.rect.height, this.position);
	}

	// States
	this.showPositionType = options.showPositionType || false;
	this.isMoving = options.isMoving || false;

	// Colors, text and image
	this.text = options.text || '';
	this.background = options.background || '#3276a9';
	this.foreground = options.foreground || '#ffffff';
	this.image = options.image || null;
	this.customClass = options.customClass;
};

Element.idCounter = 0;

Element.prototype.getExport = function() {
	return {
		position: this.position,
		rect: {
			x: this.x(null, this.position),
			y: this.y(null, this.position),
			width: this.width(null, this.position),
			height: this.height(null, this.position)
		},
		text: this.text,
		background: this.background,
		foreground: this.foreground,
		image: this.image
	};
}

Element.prototype.x = function(value, positionType) {
	if (value == null) {
		if(positionType == "relative")
			return this.rect.x;
		else {
			return this.rect.x / 100 * this.parentWidth;
		}
	} else { 
		if(positionType != "relative") value = value / this.parentWidth * 100;
		if(value < 0) value = 0;
		//if(value + this.rect.width <= 100) 
		this.rect.x = value;
	}
};

Element.prototype.y = function(value, positionType) {
	if(value == null) {
		if(positionType == "relative") 
			 return this.rect.y;
		else return this.rect.y / 100 * this.parentHeight;			
	} else { 
		if(positionType != "relative") value = value / this.parentHeight * 100;
		if(value < 0) value = 0;
		//if(value + this.rect.height <= 100) 
		this.rect.y = value;
	}
};

Element.prototype.width = function(value, positionType) {
	if(value == null) 
		if(positionType == "relative")
			 return this.rect.width;
		else return this.rect.width / 100 * this.parentWidth;
	else {
		if(positionType == "relative")		
			 this.rect.width = value;
		else this.rect.width = value / this.parentWidth * 100;	
	}
};

Element.prototype.height = function(value, positionType) {
	if(value == null) 
		if(positionType == "relative") 
			 return this.rect.height;
		else return this.rect.height / 100 * this.parentHeight;
	else 
		if(positionType == "relative") 
			 this.rect.height = value;
		else this.rect.height = value / this.parentHeight * 100;
};
