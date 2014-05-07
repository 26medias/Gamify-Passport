var _ 					= require('underscore');
var qs 					= require("querystring");

// Users
function api() {
	
}
api.prototype.init = function(Gamify, callback){
	var scope = this;
	
	this.Gamify = Gamify;
	
	// Return the methods
	var methods = {
		
		get: {
			require:		[],
			auth:			'apikey',
			description:	"List the pages",
			params:			{},
			status:			'dev',
			version:		1.0,
			callback:		function(params, req, res, callback) {
				
				scope.mongo.find({
					collection:	'pages',
					query:	{
						uid:	params.__auth
					}
				}, function(response) {
					// List the page ids
					var ids = [];
					_.each(response, function(page) {
						ids.push(page.id);
					});
					// Get the widgets
					scope.mongo.find({
						collection:	'widgets',
						query:	{
							page:	{
								$in:	ids
							}
						}
					}, function(widgets) {
						var grouped = _.groupBy(widgets, function(widget) {
							return widget.page;
						});
						response = _.map(response, function(page) {
							if (grouped[page.id]) {
								page.widgets = grouped[page.id];
							} else {
								page.widgets = [];
							}
							return page;
						});
						callback(response);
					});
					
				});
			}
		},
		
		remove: {
			require:		['id'],
			auth:			'apikey',
			description:	"Remove a page",
			params:			{id:"Page ID"},
			status:			'stable',
			version:		1,
			callback:		function(params, req, res, callback) {
				
				// Remove from my friendlist
				scope.mongo.remove({
					collection:	'pages',
					query:		{
						id:			params.id,
						uid:		params.__auth
					}
				}, function() {});
				
				callback({
					removed: 	true,
					id:			params.id
				});
			}
		},
		
		create: {
			require:		[],
			auth:			'apikey',
			description:	"Add a page",
			params:			{},
			status:			'stable',
			version:		1,
			callback:		function(params, req, res, callback) {
				
				var id = Gamify.crypto.md5(Gamify.uuid.v4());
				
				scope.mongo.insert({
					collection:	'pages',
					data:	{
						id:			id,
						uid:		params.__auth,
						name:		"[untitled]",
						date:		new Date()
					}
				}, function() {});
				
				callback({
					added: 		true,
					id:			id
				});
				
			}
		},
		
		update: {
			require:		['id','data'],
			auth:			'apikey',
			description:	"Update a page",
			params:			{id:"Page ID", data:"Page data"},
			status:			'stable',
			version:		1,
			callback:		function(params, req, res, callback) {
				
				scope.mongo.update({
					collection:	'pages',
					query:	{
						id:			params.id,
						uid:		params.__auth
					},
					data:	{
						$set:	params.data
					}
				}, function() {});
				
				callback({
					updated: 	true,
					id:			params.id
				});
				
			}
		}
	};
	
	// Init a connection
	this.mongo	= new this.Gamify.mongo({database:Gamify.settings.db});
	this.mongo.init(function() {
		callback(methods);
	});
}
exports.api = api;