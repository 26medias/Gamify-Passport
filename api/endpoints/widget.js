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
		
		remove: {
			require:		['id'],
			auth:			'apikey',
			description:	"Remove a widget",
			params:			{id:"Widget ID"},
			status:			'stable',
			version:		1,
			callback:		function(params, req, res, callback) {
				
				// Remove from my friendlist
				scope.mongo.remove({
					collection:	'widgets',
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
			require:		['page', 'path', 'directory'],
			auth:			'apikey',
			description:	"Add a widget",
			params:			{},
			status:			'stable',
			version:		1,
			callback:		function(params, req, res, callback) {
				
				var id = Gamify.crypto.md5(Gamify.uuid.v4());
				
				scope.mongo.insert({
					collection:	'widgets',
					data:	{
						id:			id,
						uid:		params.__auth,
						date:		new Date(),
						page:		params.page,
						path:		params.path,
						directory:	params.directory,
						directive:	params.path.split('.').join('_'),
						data:		{}
					}
				}, function() {
					scope.mongo.find({
						collection:	'widgets',
						query:		{
							id:			id
						}
					}, function(response) {
						callback({
							added: 		true,
							id:			id,
							widget:		response[0]
						});
					});
				});
				
				
				
			}
		},
		
		update: {
			require:		['id','data'],
			auth:			'apikey',
			description:	"Update a widget",
			params:			{id:"Widget ID", data:"Widget data"},
			status:			'stable',
			version:		1,
			callback:		function(params, req, res, callback) {
				
				scope.mongo.update({
					collection:	'widgets',
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