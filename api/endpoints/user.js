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
		
		findOrCreate: {
			require:		['query','profile','type'],
			auth:			'sys',
			description:	"Find or create a user account",
			params:			{query:"Object", profile:"Object", type:"Type of account"},
			status:			'dev',
			version:		1.0,
			callback:		function(params, req, res, callback) {
				scope.mongo.find({
					collection:	'users',
					query:	params.query
				}, function(response) {
					if (response.length == 0) {
						// Create
						var user = {
							id:		scope.Gamify.crypto.md5(scope.Gamify.uuid.v4()),
							apikey:	scope.Gamify.crypto.md5(scope.Gamify.uuid.v4())
						};
						console.log("We create");
					} else {
						// Update
						var user = response[0];
						console.log("We update");
					}
					
					var updateData 					= {};
					updateData.$set 				= {};
					
					updateData.$set[params.type] 	= params.profile;
					updateData.$set.id 				= user.id;
					updateData.$set.apikey 			= user.apikey;
					
					if (params.profile.emails && _.isArray(params.profile.emails)) {
						if (!updateData.$addToSet) {
							updateData.$addToSet = {};
						}
						updateData.$addToSet.emails = params.profile.emails;
						if (!user.emails) {
							user.emails = [params.profile.emails[0]];
						}
						if (!user.email) {
							updateData.$set.email = user.emails[0];
						}
					}
					if (params.profile.company) {
						if (!user.company) {
							updateData.$set.company = params.profile.company;
						}
					}
					if (params.profile.name && params.profile.name.familyName) {
						if (!user.lastname) {
							updateData.$set.lastname = params.profile.name.familyName;
						}
					}
					if (params.profile.name && params.profile.name.givenName) {
						if (!user.lastname) {
							updateData.$set.firstname = params.profile.name.givenName;
						}
					}
					if (params.profile.gender) {
						if (!user.gender) {
							updateData.$set.gender = params.profile.gender;
						}
					}
					
					Gamify.log("Searching with:", params.query);
					// Update
					scope.mongo.update({
						collection:	"users",
						query:		params.query,
						data:		updateData
					}, function(a, b) {
						scope.mongo.find({
							collection:	"users",
							query:		params.query
						}, function(response2, err) {
							callback(response2[0]);
						});
					});
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