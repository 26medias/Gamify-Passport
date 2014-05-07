var _ 					= require('underscore');
var qs 					= require("querystring");

// Users
function page() {
	
}
page.prototype.init = function(Gamify, callback){
	var scope = this;
	
	this.Gamify = Gamify;
	
	// Return the methods
	var paths = {
		
		'/': {
			require:		[],
			auth:			false,
			description:	"Homepage",
			params:			{},
			status:			'dev',
			version:		1.0,
			callback:		function(params, req, res, callback) {
				
				Gamify.render("index.html", {
					user: 	req.user,
					title:	"hello",
					dependencies:	['MeanEngine','starter-pack']
				}, function(rendered) {
					callback(rendered);
				}, Gamify, res, req);
				
			}
		},
		'/account/login': {
			require:		[],
			auth:			false,
			description:	"Login page",
			params:			{},
			status:			'dev',
			version:		1.0,
			callback:		function(params, req, res, callback) {
				
				Gamify.render("account/login.html", {
					user: 	req.user,
					title:	"Login",
					dependencies:	['MeanEngine','starter-pack','theme']
				}, function(rendered) {
					callback(rendered);
				}, Gamify, res, req);
				
			}
		},
		'/manage': {
			require:		[],
			auth:			'passport',
			description:	"Login page",
			params:			{},
			status:			'dev',
			version:		1.0,
			callback:		function(params, req, res, callback) {
				
				Gamify.render("site/manage.html", {
					user: 				req.user,
					title:				"Page Editor",
					dependencies:		['MeanEngine','starter-pack','theme'],
					themes:				Gamify.service.themes.themes,
					componentFiles:		Gamify.service.themes.componentFiles
				}, function(rendered) {
					callback(rendered);
				}, Gamify, res, req);
				
			}
		}
	};
	
	// Init a connection
	this.mongo	= new this.Gamify.mongo({database:Gamify.settings.db});
	this.mongo.init(function() {
		callback(paths);
	});
}
exports.page = page;