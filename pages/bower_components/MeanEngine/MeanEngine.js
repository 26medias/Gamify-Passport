(function() {
	var meanEngine = function() {
		this.settings 		= {};
		this.services 		= {};
		this.version		= "alpha-1.0";
		this._cookiePrefix 	= "meanEngine_";
		this._jsonPrefix 	= "__JSON__";
	};
	meanEngine.prototype.init = function() {
		
	};
	meanEngine.prototype.set = function(name, data, persist) {
		this.settings[name] = data;
		if (persist) {
			// Also save as a cookie, with a prefix
			this.setCookie(this._cookiePrefix+name, data, 365);
		}
	};
	meanEngine.prototype.unset = function(name) {
		if (this.settings[name]) {
			delete this.settings[name];
		}
		if (this.getCookie(this._cookiePrefix+name)) {
			this.setCookie(this._cookiePrefix+name, null, -1);
		}
		return true;
	};
	meanEngine.prototype.get = function(name) {
		if (this.settings[name]) {
			return this.settings[name];
		} else if (this.getCookie(this._cookiePrefix+name)) {
			return this.getCookie(this._cookiePrefix+name);
		}
		return false;
	};
	meanEngine.prototype.service = function(name, callback) {
		if (callback) {
			this.services[name] = callback();
		} else {
			return this.services[name];
		}
	};
	meanEngine.prototype.setCookie = function(name,value,days) {
		
		// encode JSON if required
		if (typeof value != "string" && typeof value != "number") {
			value = this._jsonPrefix+JSON.stringify(value);
		}
		
		if (days) {
			var date = new Date();
			date.setTime(date.getTime()+(days*24*60*60*1000));
			var expires = "; expires="+date.toGMTString();
		} else{
			var expires = "";
		}
		document.cookie = name+"="+value+expires+"; path=/;";
		return true;
	};
	meanEngine.prototype.getCookie = function(name) {
		
		var nameEQ = name + "=";
		var ca = document.cookie.split(';');
		for(var i=0;i < ca.length;i++) {
			var c = ca[i];
			while (c.charAt(0)==' ') c = c.substring(1,c.length);
			if (c.indexOf(nameEQ) == 0){
				var cookieValue = c.substring(nameEQ.length,c.length);
				// Now we decode if required
				if (cookieValue.substr(0, this._jsonPrefix.length) == this._jsonPrefix) {
					cookieValue = JSON.parse(cookieValue.substr(this._jsonPrefix.length));
				}
				return cookieValue;
			}
		}
		return null;
	};
	
	window.meanEngine = new meanEngine();
})();