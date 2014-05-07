/**
* Module dependencies.
*/
var _ 			= require('underscore');
var Twig 		= require("twig");
var express 	= require('express');
var http 		= require('http');
var path 		= require('path');
var Gamify 		= require("gamify");
var _os			= require('os');
var toolset		= require('toolset');
var mime 		= require('mime');
var facebook	= require('tiny-facebook-wrapper');
var request 	= require('request');


var passport 			= require('passport');


var options = _.extend({
	online:			true,
	env:			"dev",
	debug_mode:		false,
	port:			2015,
	db:				"prod",
	mongo_server:	"",
	mongo_login:	"",
	mongo_password:	"",
	mongo_remote:	false,
	mongo_port:		27017,
	stockRefreshRate:	60000,
	monitor:		false
},processArgs());

options.threads			= Math.min(options.threads, _os.cpus().length);
options.cores 			= _os.cpus().length;

var app = express();

// all environments
app.set('port', process.env.PORT || options.port);
app.set('env', options.env);
app.set('views', __dirname + 'templates');
app.set('view engine', 'twig');
app.set('view cache', false);
app.disable('view cache');
app.set("twig options", {
	strict_variables: false
});
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.session({secret:'gamify-passport'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));


// development only
if ('dev' == app.get('env')) {
	app.use(express.errorHandler());
}


Gamify.settings.mongo 					= {
	server:		options.mongo_server,
	login:		options.mongo_login,
	password:	options.mongo_password,
	port:		options.mongo_port,
	remote:		options.mongo_remote
};
Gamify.settings.db 				= options.db;
Gamify.settings.systoken 		= "sys540f40c9968814199ec7ca847ec45";
Gamify.options 					= options;
Gamify.render					= require('renderer').engine;

Gamify.api.init(app, function() {
	console.log("API mapped. Starting the server...");
	
	// Setup the pages route
	
	toolset.file.toObject('settings.json', function(settings) {
		options.settings 	= settings;
		options.serve 		= settings.webdir;
		
		// Start the server
		http.createServer(app).listen(app.get('port'), function(){
			console.log('Server listening on port ' + app.get('port'));
		});
	});	
});


/*************************
**	PASSPORT
**************************/
var passportSetup			= require('./passport');
passportSetup.settings.use	= ["facebook","twitter","github","linkedin"];
passportSetup.settings.route.success	= '/manage';
passportSetup.settings.url	= "http://fleetwit.dev:"+app.get('port')+"";

passportSetup.load(Gamify, passport, app, {
	facebook:	function(profile, callback, token) {
		var stack = new Gamify.stack();
		
		stack.add(function(p, cb) {
			request.get("https://graph.facebook.com/726140583/picture?redirect=false&type=large&access_token="+token, function (error, response, body) {
				if (!error) {
					body = JSON.parse(body);
					
					if (!profile.picture) {
						profile.picture = {};
					}
					profile.picture.regular = body.data.url;
					cb();
				}
			});
		});
		
		stack.add(function(p, cb) {
			request.get("https://graph.facebook.com/726140583/picture?redirect=false&type=square&access_token="+token, function (error, response, body) {
				if (!error) {
					body = JSON.parse(body);
					
					if (!profile.picture) {
						profile.picture = {};
					}
					profile.picture.square = body.data.url;
					cb();
				}
			});
		});
		
		stack.process(function() {
			callback(profile);
		});
		
	},
	twitter:	function(profile, callback, token) {
		Gamify.log("profile",profile);
		if (profile.photos && profile.photos.length > 0) {
			profile.picture = {
				square:	profile.photos[0].value
			};
		}
		
		callback(profile);
	}
});



/*************************
**	API ROUTES
**************************/
var apiRoute = function(req, res) {
	var data = {};
	if (req.route.method=='post') {
		data = _.extend({}, req.body, req.query);
	} else {
		data = _.extend({}, req.query);
		try {
			data.params = _.extend({},JSON.parse(data.params));	// get means we need to parse
		} catch(e) {}
	}
	//console.log("\033[35m data(params):\033[37m",data);
	// Fix the types
	var i;
	for (i in data) {
		if (!isNaN(data[i]*1)) {
			data[i] *= 1;
		}
		if (data[i] == "true") {
			data[i] = true;
		}
		if (data[i] == "false") {
			data[i] = false;
		}
	}
	Gamify.api.execute(req.params.endpoint, req.params.method, data, function() {}, req.params.format, req, res);
}

app.get("/api/:endpoint/:method/:format?", function(req, res){
	apiRoute(req, res);
});
app.post("/api/:endpoint/:method/:format?", function(req, res){
	apiRoute(req, res);
});
app.get("/api/", function(req, res){
	res.set("Content-Type", "application/json");
	res.send(200, JSON.stringify({
		name:		"Gamify-Passport API Server",
		version:	Gamify.version
	}, null, 4));
});
app.get("/static/*", function(req, res){
	var filename = options.serve+'/pages/'+req.params[0];
	routeRequest(filename, req, res);
});

app.get("/components/*", function(req, res){
	var filename = options.serve+'/components/'+req.params[0];
	Gamify.log("filename",filename);
	routeRequest(filename, req, res);
});

















var routeRequest = function(filename, req, res) {
	
	//var filename = options.serve+req.url;
	//console.log("filename",filename, req.params);
	//Check if the file exists
	toolset.file.exists(filename, function(exists) {
		if (exists) {
			if (toolset.file.isDir(filename)) {
				// Check if there is an index file
				var opStack = new toolset.stack();
				var found = false;
				
				_.each(options.settings.index, function(file) {
					opStack.add(function(p, cb) {
						if (found === false) {
							toolset.file.exists(filename+'/'+p.file, function(exists) {
								if (exists) {
									found = filename+'/'+p.file;
								}
								cb();
							});
						} else {
							// index file already found, skip
							cb();
						}
						
					},{file:file});
				});
				
				opStack.process(function() {
					if (found === false) {
						// no index file found
						if (options.settings.listFiles) {
							// List the files and directories
							toolset.file.getDirContent(filename, function(content) {
								res.set("Content-Type", "application/json");
								res.send(200, JSON.stringify(content, null, 4));
							});
						} else {
							res.set("Content-Type", "application/json");
							res.send(403, JSON.stringify({
								message:	"Permission denied."
							}, null, 4));
						}
					} else {
						// index file found
						toolset.file.read(found, function(content) {
							res.set("Content-Type", mime.lookup(found));
							res.send(200, content);
						});
					}
				}, false);	// sync
				
				
			} else {
				toolset.file.read(filename, function(content) {
					res.set("Content-Type", mime.lookup(filename));
					res.send(200, content);
				});
			}
		} else {
			res.set("Content-Type", "application/json");
			res.send(404, JSON.stringify({
				message:	"The file \""+filename+"\" doesn't exist."
			}, null, 4));
		}
	});
}




function processArgs() {
	var i;
	var args 	= process.argv.slice(2);
	var output 	= {};
	for (i=0;i<args.length;i++) {
		var l1	= args[i].substr(0,1);
		if (l1 == "-") {
			if (args[i+1] == "true") {
				args[i+1] = true;
			}
			if (args[i+1] == "false") {
				args[i+1] = false;
			}
			if (!isNaN(args[i+1]*1)) {
				args[i+1] = args[i+1]*1;
			}
			output[args[i].substr(1)] = args[i+1];
			i++;
		}
	}
	return output;
};

/************************************/
/************************************/
/************************************/
// Process Monitoring
setInterval(function() {
	process.send({
		memory:		process.memoryUsage(),
		process:	process.pid
	});
}, 1000);

// Crash Management
if (!options.debug_mode) {
	process.on('uncaughtException', function(err) {
		console.log("err",err);
		//global.monitor.log("Stats.error", err.stack);
	});
}