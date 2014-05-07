var element2D = function(element) {
	this.element = element;
}
element2D.prototype.hittest = function(target) {
	if (_.isObject(target) && _.isNumber(target.x) && _.isNumber(target.y)) {
		var offset = this.element.offset();
		if (target.x >= offset.left && target.x <= offset.left+this.element.outerWidth() && target.y >= offset.top && target.y <= offset.top+this.element.outerHeight()) {
			return true;
		}
	}
	return false;
}

var scrollOffset = function(element) {
	var total = {
		x:	0,
		y:	0
	};
	while(element.parent().length > 0) {
		total.x += element.parent().scrollLeft();
		total.y += element.parent().scrollTop();
		element = element.parent();
	}
	return total;
}


function css(element) {
	var dom = element.get(0);
	var style;
	var returns = {};
	if(window.getComputedStyle){
		var camelize = function(a,b){
			return b.toUpperCase();
		};
		style = window.getComputedStyle(dom, null);
		for(var i = 0, l = style.length; i < l; i++){
			var prop = style[i];
			var camel = prop.replace(/\-([a-z])/g, camelize);
			var val = style.getPropertyValue(prop);
			returns[camel] = val;
		};
		return returns;
	};
	if(style = dom.currentStyle){
		for(var prop in style){
			returns[prop] = style[prop];
		};
		return returns;
	};
	return this.css();
}
function ResetCss(element) {
	var dom = element.get(0);
	var style;
	var returns = {};
	if(window.getComputedStyle){
		var camelize = function(a,b){
			return b.toUpperCase();
		};
		style = window.getComputedStyle(dom, null);
		for(var i = 0, l = style.length; i < l; i++){
			var prop = style[i];
			dom.style[prop] = "";
			/*var camel = prop.replace(/\-([a-z])/g, camelize);
			var val = style.getPropertyValue(prop);
			returns[camel] = val;*/
		};
		return returns;
	};
	if(style = dom.currentStyle){
		for(var prop in style){
			dom.style[prop] = "";
			//returns[prop] = style[prop];
		};
		return returns;
	};
	return this.css();
}

var drag = function(options) {
	this.options = _.extend({
		element:	$(),
		target:		$(),
		parent:		$(),
		onStart:	function() {},
		onDrag:		function() {},
		onEnd:		function() {},
		onDrop:		function() {}
	},options);
	
	// Variables
	this.mousedown 	= false;
	this.clone		= $();
	this.offset		= {x:0, y:0};
	
	this.init();
}
drag.prototype.remove = function() {
	this.touchEvent.unbind();
}
drag.prototype.init = function() {
	var scope = this;
	this.touchEvent = new touchEvent(this.options.parent, function(touchData) {
		
		var e2d_element 	= new element2D(scope.options.element);
		var hit_element		= e2d_element.hittest({
			x:	touchData.pos.x,
			y:	touchData.pos.y
		});
		
		
		var hit_target		= false;
		var drop_target		= $();
		scope.options.target.each(function(idx, target) {
			var e2d_target 		= new element2D($(target));
			var hit = e2d_target.hittest({
				x:	touchData.pos.x,
				y:	touchData.pos.y
			});
			hit_target |= hit;
			if (hit) {
				drop_target = $(target);
			}
		});
		
		
		switch (touchData.type) {
			case "mousedown":
			console.log("hit_element",hit_element);
				if (hit_element) {
					
					// Calculate the offset
					var pos 			= scope.options.element.position();
					scope.offset.x 		= touchData.pos.x-pos.left;
					scope.offset.y 		= touchData.pos.y-pos.top;
					var scroll_offset 	= scrollOffset(scope.options.element);
					
					scope.mousedown = true;
					
					// Force the CSS, ignore classes
					scope.options.element.css(css(scope.options.element));
					
					// Clone the element
					scope.clone = scope.options.element.clone().appendTo(scope.options.element.parent());
					scope.clone.data('clone',true);
					
					scope.options.element.css('opacity', 0.2);
					scope.clone.css('opacity', 0.9);
					scope.clone.css({
						position:	'absolute',
						width:		scope.options.element.outerWidth(),
						height:		scope.options.element.outerHeight(),
						left:		touchData.pos.x-scope.offset.x+scroll_offset.x,
						top:		touchData.pos.y-scope.offset.y+scroll_offset.y
					});
					
					
					
					// Callback
					scope.options.onStart();
				}
			break;
			case "mouseup":
				if (scope.mousedown) {
					
					scope.mousedown = false;
					
					
					scope.options.element.css('opacity', 1);
					
					// Remove the clone
					scope.clone.remove();
					
					// Reset the hard styles
					scope.options.element.get(0).style = "";
					ResetCss(scope.options.element);
					
					if (hit_target) {
						scope.options.onDrop(drop_target);
					}
					
					// Callback
					scope.options.onEnd();
				}
			break;
			case "mousedrag":
				if (scope.mousedown) {
					// Get Scroll Offset
					var scroll_offset 	= scrollOffset(scope.options.element);
					
					// Move the clone
					scope.clone.css({
						left:		touchData.pos.x-scope.offset.x+scroll_offset.x,
						top:		touchData.pos.y-scope.offset.y+scroll_offset.y
					});
					
					// Callback
					scope.options.onDrag();
				}
			break;
		}
	}, true);
}
function touchEvent(el, callback, noPropagation, cellSize) {
	this.element 	= el;
	var scope 		= this;
	this.mousedown 	= false;
	this.cellSize 	= cellSize;
	this.callback 	= callback;
	this.stopped	= false;
	this.clickPos = {
		x:	0,
		y:	0
	};
	
	this.element.bind("vmousedown", function(e) {
		if (scope.stopped) {
			return true;
		}
		// exception on hint and instruction buttons on mobiles
		if (noPropagation) {
			var targ;
			if (e.target) {
				targ = e.target;
			} else if (e.srcElement) {
				targ = e.srcElement;
			}
			if (targ.nodeType == 3) { // defeat Safari bug
				targ = targ.parentNode;
			}
			if (!$(targ).data || !$(targ).data('allowclick')) {
				e.preventDefault();
			}
		}
		scope.mousedown = true;
		// Are we on a grid with cells?
		if (cellSize) {
			scope.clickPos = scope.toGrid(e.pageX,e.pageY);
		} else {
			scope.clickPos = {
				x:	e.pageX,
				y:	e.pageY
			};
		}
		scope.callback({
			type: 	'mousedown',
			pos:	scope.clickPos,
			event:	e
		});
	});
	this.element.bind("vmouseup", function(e) {
		if (scope.stopped) {
			return true;
		}
		scope.mousedown = false;
		if (cellSize) {
			var fixedPos = scope.toGrid(e.pageX,e.pageY);
			scope.callback({
				type: 	'mouseup',
				pos:	{
					x:	fixedPos.x,
					y:	fixedPos.y
				},
				event:	e
			});
		} else {
			scope.callback({
				type: 	'mouseup',
				pos:	{
					x:	e.pageX,
					y:	e.pageY
				},
				event:	e
			});
		}
	});
	this.element.bind("vmousemove", function(e) {
		if (scope.stopped) {
			return true;
		}
		if (cellSize) {
			var fixedPos = scope.toGrid(e.pageX,e.pageY);
			scope.callback({
				type: 	'mousemove',
				pos:	{
					x:	fixedPos.x,
					y:	fixedPos.y
				},
				event:	e
			});
		} else {
			scope.callback({
				type: 	'mousemove',
				pos:	{
					x:	e.pageX,
					y:	e.pageY
				},
				event:	e
			});
		}
		if (scope.mousedown) {
			if (cellSize) {
				var fixedPos 		= scope.toGrid(e.pageX,e.pageY);
				
				scope.callback({
					type: 	'mousedrag',
					pos:	{
						x:	fixedPos.x,
						y:	fixedPos.y
					},
					distance:	{
						x:	fixedPos.x-scope.clickPos.x,
						y:	fixedPos.y-scope.clickPos.y
					},
					start:	{
						x:	scope.clickPos.x,
						y:	scope.clickPos.y
					},
					event:	e
				});
			} else {
				scope.callback({
					type: 	'mousedrag',
					pos:	{
						x:	e.pageX,
						y:	e.pageY
					},
					distance:	{
						x:	e.pageX-scope.clickPos.x,
						y:	e.pageY-scope.clickPos.y
					},
					start:	{
						x:	scope.clickPos.x,
						y:	scope.clickPos.y
					},
					event:	e
				});
			}
		}
	});
};
touchEvent.prototype.toGrid = function(x,y) {
	// get the [0;0] position of the element
	var origin 	= this.element.offset();
	
	var fixedX	= x-origin.left;
	var fixedY	= y-origin.top;
	
	return {
		x:	Math.floor(fixedX/this.cellSize),
		y:	Math.floor(fixedY/this.cellSize),
	}
};
touchEvent.prototype.unbind = function() {
	this.stopped = true;
};




// This is a combination of two modified files from jQuery Mobile, 
// jquery.mobile.vmouse.js and jquery.mobile.event.js
// They were modified to only provide the touch event shortcuts, and 
// avoid the rest of the jQuery Mobile framework.
// The normal jQuery Mobile license applies. http://jquery.org/license
//
// This plugin is an experiment for abstracting away the touch and mouse
// events so that developers don't have to worry about which method of input
// the device their document is loaded on supports.
//
// The idea here is to allow the developer to register listeners for the
// basic mouse events, such as mousedown, mousemove, mouseup, and click,
// and the plugin will take care of registering the correct listeners
// behind the scenes to invoke the listener at the fastest possible time
// for that device, while still retaining the order of event firing in
// the traditional mouse environment, should multiple handlers be registered
// on the same element for different events.
//
// The current version exposes the following virtual events to jQuery bind methods:
// "vmouseover vmousedown vmousemove vmouseup vclick vmouseout vmousecancel"

(function($, window, document, undefined ) {
$.attrFn = $.attrFn || {};
var dataPropertyName = "virtualMouseBindings",
	touchTargetPropertyName = "virtualTouchID",
	virtualEventNames = "vmouseover vmousedown vmousemove vmouseup vclick vmouseout vmousecancel".split( " " ),
	touchEventProps = "clientX clientY pageX pageY screenX screenY".split( " " ),
	mouseHookProps = $.event.mouseHooks ? $.event.mouseHooks.props : [],
	mouseEventProps = $.event.props.concat( mouseHookProps ),
	activeDocHandlers = {},
	resetTimerID = 0,
	startX = 0,
	startY = 0,
	didScroll = false,
	clickBlockList = [],
	blockMouseTriggers = false,
	blockTouchTriggers = false,
	eventCaptureSupported = "addEventListener" in document,
	$document = $( document ),
	nextTouchID = 1,
	lastTouchID = 0;

$.vmouse = {
	moveDistanceThreshold: 10,
	clickDistanceThreshold: 10,
	resetTimerDuration: 1500
};

function getNativeEvent( event ) {

	while ( event && typeof event.originalEvent !== "undefined" ) {
		event = event.originalEvent;
	}
	return event;
}

function createVirtualEvent( event, eventType ) {

	var t = event.type,
		oe, props, ne, prop, ct, touch, i, j;

	event = $.Event(event);
	event.type = eventType;

	oe = event.originalEvent;
	props = $.event.props;

	// addresses separation of $.event.props in to $.event.mouseHook.props and Issue 3280
	// https://github.com/jquery/jquery-mobile/issues/3280
	if ( t.search( /^(mouse|click)/ ) > -1 ) {
		props = mouseEventProps;
	}

	// copy original event properties over to the new event
	// this would happen if we could call $.event.fix instead of $.Event
	// but we don't have a way to force an event to be fixed multiple times
	if ( oe ) {
		for ( i = props.length, prop; i; ) {
			prop = props[ --i ];
			event[ prop ] = oe[ prop ];
		}
	}

	// make sure that if the mouse and click virtual events are generated
	// without a .which one is defined
	if ( t.search(/mouse(down|up)|click/) > -1 && !event.which ){
		event.which = 1;
	}

	if ( t.search(/^touch/) !== -1 ) {
		ne = getNativeEvent( oe );
		t = ne.touches;
		ct = ne.changedTouches;
		touch = ( t && t.length ) ? t[0] : ( (ct && ct.length) ? ct[ 0 ] : undefined );

		if ( touch ) {
			for ( j = 0, len = touchEventProps.length; j < len; j++){
				prop = touchEventProps[ j ];
				event[ prop ] = touch[ prop ];
			}
		}
	}

	return event;
}

function getVirtualBindingFlags( element ) {

	var flags = {},
		b, k;

	while ( element ) {

		b = $.data( element, dataPropertyName );

		for (  k in b ) {
			if ( b[ k ] ) {
				flags[ k ] = flags.hasVirtualBinding = true;
			}
		}
		element = element.parentNode;
	}
	return flags;
}

function getClosestElementWithVirtualBinding( element, eventType ) {
	var b;
	while ( element ) {

		b = $.data( element, dataPropertyName );

		if ( b && ( !eventType || b[ eventType ] ) ) {
			return element;
		}
		element = element.parentNode;
	}
	return null;
}

function enableTouchBindings() {
	blockTouchTriggers = false;
}

function disableTouchBindings() {
	blockTouchTriggers = true;
}

function enableMouseBindings() {
	lastTouchID = 0;
	clickBlockList.length = 0;
	blockMouseTriggers = false;

	// When mouse bindings are enabled, our
	// touch bindings are disabled.
	disableTouchBindings();
}

function disableMouseBindings() {
	// When mouse bindings are disabled, our
	// touch bindings are enabled.
	enableTouchBindings();
}

function startResetTimer() {
	clearResetTimer();
	resetTimerID = setTimeout(function(){
		resetTimerID = 0;
		enableMouseBindings();
	}, $.vmouse.resetTimerDuration );
}

function clearResetTimer() {
	if ( resetTimerID ){
		clearTimeout( resetTimerID );
		resetTimerID = 0;
	}
}

function triggerVirtualEvent( eventType, event, flags ) {
	var ve;

	if ( ( flags && flags[ eventType ] ) ||
				( !flags && getClosestElementWithVirtualBinding( event.target, eventType ) ) ) {

		ve = createVirtualEvent( event, eventType );

		$( event.target).trigger( ve );
	}

	return ve;
}

function mouseEventCallback( event ) {
	var touchID = $.data(event.target, touchTargetPropertyName);

	if ( !blockMouseTriggers && ( !lastTouchID || lastTouchID !== touchID ) ){
		var ve = triggerVirtualEvent( "v" + event.type, event );
		if ( ve ) {
			if ( ve.isDefaultPrevented() ) {
				event.preventDefault();
			}
			if ( ve.isPropagationStopped() ) {
				event.stopPropagation();
			}
			if ( ve.isImmediatePropagationStopped() ) {
				event.stopImmediatePropagation();
			}
		}
	}
}

function handleTouchStart( event ) {

	var touches = getNativeEvent( event ).touches,
		target, flags;

	if ( touches && touches.length === 1 ) {

		target = event.target;
		flags = getVirtualBindingFlags( target );

		if ( flags.hasVirtualBinding ) {

			lastTouchID = nextTouchID++;
			$.data( target, touchTargetPropertyName, lastTouchID );

			clearResetTimer();

			disableMouseBindings();
			didScroll = false;

			var t = getNativeEvent( event ).touches[ 0 ];
			startX = t.pageX;
			startY = t.pageY;

			triggerVirtualEvent( "vmouseover", event, flags );
			triggerVirtualEvent( "vmousedown", event, flags );
		}
	}
}

function handleScroll( event ) {
	if ( blockTouchTriggers ) {
		return;
	}

	if ( !didScroll ) {
		triggerVirtualEvent( "vmousecancel", event, getVirtualBindingFlags( event.target ) );
	}

	didScroll = true;
	startResetTimer();
}

function handleTouchMove( event ) {
	if ( blockTouchTriggers ) {
		return;
	}

	var t = getNativeEvent( event ).touches[ 0 ],
		didCancel = didScroll,
		moveThreshold = $.vmouse.moveDistanceThreshold;
		didScroll = didScroll ||
			( Math.abs(t.pageX - startX) > moveThreshold ||
				Math.abs(t.pageY - startY) > moveThreshold ),
		flags = getVirtualBindingFlags( event.target );

	if ( didScroll && !didCancel ) {
		triggerVirtualEvent( "vmousecancel", event, flags );
	}

	triggerVirtualEvent( "vmousemove", event, flags );
	startResetTimer();
}

function handleTouchEnd( event ) {
	if ( blockTouchTriggers ) {
		return;
	}

	disableTouchBindings();

	var flags = getVirtualBindingFlags( event.target ), t;
	triggerVirtualEvent( "vmouseup", event, flags );

	if ( !didScroll ) {
		var ve = triggerVirtualEvent( "vclick", event, flags );
		if ( ve && ve.isDefaultPrevented() ) {
			// The target of the mouse events that follow the touchend
			// event don't necessarily match the target used during the
			// touch. This means we need to rely on coordinates for blocking
			// any click that is generated.
			t = getNativeEvent( event ).changedTouches[ 0 ];
			clickBlockList.push({
				touchID: lastTouchID,
				x: t.clientX,
				y: t.clientY
			});

			// Prevent any mouse events that follow from triggering
			// virtual event notifications.
			blockMouseTriggers = true;
		}
	}
	triggerVirtualEvent( "vmouseout", event, flags);
	didScroll = false;

	startResetTimer();
}

function hasVirtualBindings( ele ) {
	var bindings = $.data( ele, dataPropertyName ),
		k;

	if ( bindings ) {
		for ( k in bindings ) {
			if ( bindings[ k ] ) {
				return true;
			}
		}
	}
	return false;
}

function dummyMouseHandler(){};

function getSpecialEventObject( eventType ) {
	var realType = eventType.substr( 1 );

	return {
		setup: function( data, namespace ) {
			// If this is the first virtual mouse binding for this element,
			// add a bindings object to its data.

			if ( !hasVirtualBindings( this ) ) {
				$.data( this, dataPropertyName, {});
			}

			// If setup is called, we know it is the first binding for this
			// eventType, so initialize the count for the eventType to zero.
			var bindings = $.data( this, dataPropertyName );
			bindings[ eventType ] = true;

			// If this is the first virtual mouse event for this type,
			// register a global handler on the document.

			activeDocHandlers[ eventType ] = ( activeDocHandlers[ eventType ] || 0 ) + 1;

			if ( activeDocHandlers[ eventType ] === 1 ) {
				$document.bind( realType, mouseEventCallback );
			}

			// Some browsers, like Opera Mini, won't dispatch mouse/click events
			// for elements unless they actually have handlers registered on them.
			// To get around this, we register dummy handlers on the elements.

			$(this).bind(realType, dummyMouseHandler);

			// For now, if event capture is not supported, we rely on mouse handlers.
			if ( eventCaptureSupported ) {
				// If this is the first virtual mouse binding for the document,
				// register our touchstart handler on the document.

				activeDocHandlers[ "touchstart" ] = ( activeDocHandlers[ "touchstart" ] || 0) + 1;

				if (activeDocHandlers[ "touchstart" ] === 1) {
					$document.bind( "touchstart", handleTouchStart )
						.bind( "touchend", handleTouchEnd )

						// On touch platforms, touching the screen and then dragging your finger
						// causes the window content to scroll after some distance threshold is
						// exceeded. On these platforms, a scroll prevents a click event from being
						// dispatched, and on some platforms, even the touchend is suppressed. To
						// mimic the suppression of the click event, we need to watch for a scroll
						// event. Unfortunately, some platforms like iOS don't dispatch scroll
						// events until *AFTER* the user lifts their finger (touchend). This means
						// we need to watch both scroll and touchmove events to figure out whether
						// or not a scroll happenens before the touchend event is fired.

						.bind( "touchmove", handleTouchMove )
						.bind( "scroll", handleScroll );
				}
			}
		},

		teardown: function( data, namespace ) {
			// If this is the last virtual binding for this eventType,
			// remove its global handler from the document.

			--activeDocHandlers[ eventType ];

			if ( !activeDocHandlers[ eventType ] ) {
				$document.unbind( realType, mouseEventCallback );
			}

			if ( eventCaptureSupported ) {
				// If this is the last virtual mouse binding in existence,
				// remove our document touchstart listener.

				--activeDocHandlers[ "touchstart" ];

				if ( !activeDocHandlers[ "touchstart" ] ) {
					$document.unbind( "touchstart", handleTouchStart )
						.unbind( "touchmove", handleTouchMove )
						.unbind( "touchend", handleTouchEnd )
						.unbind( "scroll", handleScroll );
				}
			}

			var $this = $( this ),
				bindings = $.data( this, dataPropertyName );

			// teardown may be called when an element was
			// removed from the DOM. If this is the case,
			// jQuery core may have already stripped the element
			// of any data bindings so we need to check it before
			// using it.
			if ( bindings ) {
				bindings[ eventType ] = false;
			}

			// Unregister the dummy event handler.

			$this.unbind( realType, dummyMouseHandler );

			// If this is the last virtual mouse binding on the
			// element, remove the binding data from the element.

			if ( !hasVirtualBindings( this ) ) {
				$this.removeData( dataPropertyName );
			}
		}
	};
}

// Expose our custom events to the jQuery bind/unbind mechanism.

for ( var i = 0; i < virtualEventNames.length; i++ ){
	$.event.special[ virtualEventNames[ i ] ] = getSpecialEventObject( virtualEventNames[ i ] );
}

// Add a capture click handler to block clicks.
// Note that we require event capture support for this so if the device
// doesn't support it, we punt for now and rely solely on mouse events.
if (eventCaptureSupported) {
	document.addEventListener( "click", function( e ){
		var cnt = clickBlockList.length,
			target = e.target,
			x, y, ele, i, o, touchID;

		if ( cnt ) {
			x = e.clientX;
			y = e.clientY;
			threshold = $.vmouse.clickDistanceThreshold;

			// The idea here is to run through the clickBlockList to see if
			// the current click event is in the proximity of one of our
			// vclick events that had preventDefault() called on it. If we find
			// one, then we block the click.
			//
			// Why do we have to rely on proximity?
			//
			// Because the target of the touch event that triggered the vclick
			// can be different from the target of the click event synthesized
			// by the browser. The target of a mouse/click event that is syntehsized
			// from a touch event seems to be implementation specific. For example,
			// some browsers will fire mouse/click events for a link that is near
			// a touch event, even though the target of the touchstart/touchend event
			// says the user touched outside the link. Also, it seems that with most
			// browsers, the target of the mouse/click event is not calculated until the
			// time it is dispatched, so if you replace an element that you touched
			// with another element, the target of the mouse/click will be the new
			// element underneath that point.
			//
			// Aside from proximity, we also check to see if the target and any
			// of its ancestors were the ones that blocked a click. This is necessary
			// because of the strange mouse/click target calculation done in the
			// Android 2.1 browser, where if you click on an element, and there is a
			// mouse/click handler on one of its ancestors, the target will be the
			// innermost child of the touched element, even if that child is no where
			// near the point of touch.

			ele = target;

			while (ele) {
				for ( i = 0; i < cnt; i++ ) {
					o = clickBlockList[ i ];
					touchID = 0;

					if ( ( ele === target && Math.abs( o.x - x ) < threshold && Math.abs( o.y - y ) < threshold ) ||
								$.data( ele, touchTargetPropertyName ) === o.touchID ) {
						// XXX: We may want to consider removing matches from the block list
						//      instead of waiting for the reset timer to fire.
						e.preventDefault();
						e.stopPropagation();
						return;
					}
				}
				ele = ele.parentNode;
			}
		}
	}, true);
}
})( jQuery, window, document );


(function( $, window, undefined ) {// add new event shortcuts
$.each(("touchstart touchmove touchend tap taphold swipe swipeleft swiperight" ).split(""), function(i, name) {
	
		$.fn[name] = function(fn) {
			return fn ? this.bind(name, fn) : this.trigger(name);
		};
		
		$.attrFn[name] = true;
	}
);

function triggerCustomEvent(obj, eventType, event) {
	var originalType = event.type;
	event.type = eventType;
	$.event.dispatch.call( obj, event );	
	event.type = originalType;
}

// also handles taphold
$.event.special.tap = {
		
	setup: function() {
		var thisObject = this,
			$this = $(thisObject);

			$this.bind( "touchstart", function( event ) {

			if ( event.which && event.which !== 1 ) {
				return false;
			}

			var origTarget = event.target,
				origEvent = event.originalEvent,
				timer;

			function clearTapTimer() {
				clearTimeout( timer );
			}

			function clearTapHandlers() {
				clearTapTimer();

				$this.unbind( "vclick", clickHandler )
					.unbind( "vmouseup", clearTapTimer );
				$( document ).unbind( "vmousecancel", clearTapHandlers );
			}

			function clickHandler(event) {
				clearTapHandlers();

				// ONLY trigger a 'tap' event if the start target is
				// the same as the stop target.
				if ( origTarget == event.target ) {
					triggerCustomEvent( thisObject, "tap", event );
				}
			}

			$this.bind( "vmouseup", clearTapTimer )
				.bind( "vclick", clickHandler );
			$( document ).bind( "vmousecancel", clearTapHandlers );

			timer = setTimeout(function() {
				triggerCustomEvent(
					thisObject, "taphold", $.Event( "taphold", { target: origTarget } )
				);
			}, 750 );
		});
	}
};

// also handles swipeleft, swiperight
$.event.special.swipe = {
	// More than this horizontal displacement, and we will suppress scrolling.
	scrollSupressionThreshold: 10,
	
	// More time than this, and it isn't a swipe.
	durationThreshold: 1000,
	
	// Swipe horizontal displacement must be more than this.
	horizontalDistanceThreshold: 30,
	
	// Swipe vertical displacement must be less than this.
	verticalDistanceThreshold: 75,  

	setup: function() {
		var thisObject = this,
			$this = $( thisObject );

		$this.bind( "touchstart", function( event ) {
			var data = event.originalEvent.touches ?
								event.originalEvent.touches[ 0 ] : event,
				start = {
					time: ( new Date() ).getTime(),
					coords: [ data.pageX, data.pageY ],
					origin: $( event.target )
				},
				stop;

			function moveHandler( event ) {

				if ( !start ) {
					return;
				}

				var data = event.originalEvent.touches ?
						event.originalEvent.touches[ 0 ] : event;

				stop = {
					time: ( new Date() ).getTime(),
					coords: [ data.pageX, data.pageY ]
				};

				// prevent scrolling
				if ( Math.abs( start.coords[ 0 ] - stop.coords[ 0 ] ) > $.event.special.swipe.scrollSupressionThreshold ) {
					event.preventDefault();
				}
			}
			
			$this.bind( "touchmove", moveHandler )
				.one( "touchend", function( event ) {
					$this.unbind( "touchmove", moveHandler );

					if ( start && stop ) {
						if ( stop.time - start.time < $.event.special.swipe.durationThreshold &&
								Math.abs( start.coords[ 0 ] - stop.coords[ 0 ] ) > $.event.special.swipe.horizontalDistanceThreshold &&
								Math.abs( start.coords[ 1 ] - stop.coords[ 1 ] ) < $.event.special.swipe.verticalDistanceThreshold ) {

							start.origin.trigger( "swipe" )
								.trigger( start.coords[0] > stop.coords[ 0 ] ? "swipeleft" : "swiperight" );
						}
					}
					start = stop = undefined;
				});
		});
	}
};


$.each({
	taphold: "tap",
	swipeleft: "swipe",
	swiperight: "swipe"
}, function( event, sourceEvent ) {
	$.event.special[ event ] = {
		setup: function() {
			$( this ).bind( sourceEvent, $.noop );
		}
	};
});

})( jQuery, this );
