var _ 					= require('underscore');
var passport 			= require('passport');
var FacebookStrategy 	= require('passport-facebook').Strategy;
var TwitterStrategy 	= require('passport-twitter').Strategy;
var GitHubStrategy 		= require('passport-github').Strategy;
var LinkedInStrategy 	= require('passport-linkedin').Strategy;
var YoutubeStrategy 	= require('passport-youtube-v3').Strategy;

exports.settings = {
	url:		"http://localhost:5000",
	use:		["facebook","twitter"],
	route:		{
		success:	'/',
		fail:		'account/login'
	},
	facebook:	{
		clientID:		"134440473403755",
		clientSecret: 	"867f79116bb20aea709664cb8d75445c",
		callbackURL: 	"/auth/facebook/callback"
	},
	twitter:	{
		clientID: 		"HJoENa2IEb5uIxZhMeDA",
		clientSecret: 	"Pnpve4jxXJxfYS5uFTUN7fybYJVJQX3kCgC1KjIMWto",
		callbackURL: 	"/auth/twitter/callback"
	},
	github:	{
		clientID: 		"35fae3ec4339ff12366c",
		clientSecret: 	"553a2e467d7db0bfab9a723c793e055581ab029c",
		callbackURL: 	"/auth/github/callback"
	},
	linkedin:	{
		clientID: 		"751m8f68lf7kbw",
		clientSecret: 	"LTYIKffZElSBC6U2",
		callbackURL: 	"/auth/linkedin/callback"
	},
	youtube:	{
		clientID: 		"125128809737-il1c44lu685o0veuap6gcj3tljvmqcg7.apps.googleusercontent.com",
		clientSecret: 	"125128809737-il1c44lu685o0veuap6gcj3tljvmqcg7@developer.gserviceaccount.com",
		callbackURL: 	"/auth/youtube/callback",
		scope:			['https://www.googleapis.com/auth/youtube.readonly']
	}
};
exports.load = function(Gamify, passport, app, hooks) {
	if (!exports.settings.use) {
		exports.settings.use = ["facebook","twitter"]
	}
	if (!hooks) {
		hooks = {};
	}
	
	passport.serializeUser(function(user, done) {
		done(null, user);
	});
	
	passport.deserializeUser(function(user, done) {
		done(null, user);
	});
	
	app.get('/logout', function(req, res){
		req.logout();
		res.redirect(exports.settings.route.success);
	});
	
	
	_.each(exports.settings.use, function(type) {
		switch (type) {
			case	"facebook":
				passport.use(new FacebookStrategy({
					clientID: 		exports.settings.facebook.clientID,
					clientSecret: 	exports.settings.facebook.clientSecret,
					callbackURL: 	exports.settings.url+exports.settings.facebook.callbackURL,
					passReqToCallback: 		true
				}, function(req, accessToken, refreshToken, profile, done) {
					var query = {};
					if (req.user) {
						query.id = req.user.id;
					} else {
						query['facebook.id'] = profile.id;
					}
					
					profile.data = profile._json;
					delete profile._json;
					delete profile._raw;
					
					if (!hooks[type]) {
						hooks[type] = function(data,cb,token){cb(data);}
					}
					
					hooks[type](profile, function(profile) {
						Gamify.api.execute("user","findOrCreate", {
							authtoken:	Gamify.settings.systoken,
							query:		query,
							profile:	profile,
							type:		'facebook'
						}, function(user) {
							done(null, user);
						});
					}, accessToken);
					
				}));
				app.get('/auth/facebook', passport.authenticate('facebook', {
					scope: 'read_stream,manage_pages'
				}));
				app.get('/auth/facebook/callback', passport.authenticate('facebook', {
					successRedirect: exports.settings.route.success,
					failureRedirect: exports.settings.route.fail
				}));
			break;
			case "twitter":
				passport.use(new TwitterStrategy({
					consumerKey: 	exports.settings.twitter.clientID,
					consumerSecret: exports.settings.twitter.clientSecret,
					callbackURL: 	exports.settings.url+exports.settings.twitter.callbackURL,
					userAuthorizationURL: 	"https://api.twitter.com/oauth/authorize",
					passReqToCallback: 		true
				},function(req, token, tokenSecret, profile, done) {
					var query = {};
					if (req.user) {
						query.id = req.user.id;
					} else {
						query['twitter.id'] = profile.id;
					}
					
					profile.data = profile._json;
					delete profile._json;
					delete profile._raw;
					
					console.log("hooks["+type+"]",hooks[type]);
					
					if (!hooks[type]) {
						hooks[type] = function(data,cb,token){cb(data);}
					}
					
					hooks[type](profile, function(profile) {
						Gamify.api.execute("user","findOrCreate", {
							authtoken:	Gamify.settings.systoken,
							query:		query,
							profile:	profile,
							type:		'twitter'
						}, function(user) {
							done(null, user);
						});
					}, tokenSecret);
					
				}));
				app.get('/auth/twitter', passport.authenticate('twitter'), function(req, res) {
					console.log("req, res", req, res);
				});
				app.get('/auth/twitter/callback', passport.authenticate('twitter', {
					successRedirect: exports.settings.route.success,
					failureRedirect: exports.settings.route.fail
				}), function(res) {
					console.log("res",res);
					res.redirect(exports.settings.route.success);
				});
			break;
			case "github":
				passport.use(new GitHubStrategy({
					clientID: 		exports.settings.github.clientID,
					clientSecret: 	exports.settings.github.clientSecret,
					callbackURL: 	exports.settings.url+exports.settings.github.callbackURL,
					passReqToCallback: 		true
				}, function(req, accessToken, refreshToken, profile, done) {
					var query = {};
					if (req.user) {
						query.id = req.user.id;
					} else {
						query['github.id'] = profile.id;
					}
					
					profile.data = profile._json;
					delete profile._json;
					delete profile._raw;
					
					if (!hooks[type]) {
						hooks[type] = function(data,cb,token){cb(data);}
					}
					
					hooks[type](profile, function(profile) {
						Gamify.api.execute("user","findOrCreate", {
							authtoken:	Gamify.settings.systoken,
							query:		query,
							profile:	profile,
							type:		'github'
						}, function(user) {
							done(null, user);
						});
					}, accessToken);
					
				}));
				app.get('/auth/github', passport.authenticate('github'), function(req, res) {
					console.log("req, res", req, res);
				});
				app.get('/auth/github/callback', passport.authenticate('github', {
					successRedirect: exports.settings.route.success,
					failureRedirect: exports.settings.route.fail
				}), function(res) {
					console.log("res",res);
					res.redirect(exports.settings.route.success);
				});
			break;
			case "linkedin":
				passport.use(new LinkedInStrategy({
					consumerKey: 	exports.settings.linkedin.clientID,
					consumerSecret: exports.settings.linkedin.clientSecret,
					callbackURL: 	exports.settings.url+exports.settings.linkedin.callbackURL,
					passReqToCallback: 		true
				}, function(req, accessToken, refreshToken, profile, done) {
					var query = {};
					if (req.user) {
						query.id = req.user.id;
					} else {
						query['linkedin.id'] = profile.id;
					}
					
					profile.data = profile._json;
					delete profile._json;
					delete profile._raw;
					
					if (!hooks[type]) {
						hooks[type] = function(data,cb,token){cb(data);}
					}
					
					hooks[type](profile, function(profile) {
						Gamify.api.execute("user","findOrCreate", {
							authtoken:	Gamify.settings.systoken,
							query:		query,
							profile:	profile,
							type:		'linkedin'
						}, function(user) {
							done(null, user);
						});
					}, accessToken);
					
				}));
				app.get('/auth/linkedin', passport.authenticate('linkedin'), function(req, res) {
					console.log("req, res", req, res);
				});
				app.get('/auth/linkedin/callback', passport.authenticate('linkedin', {
					successRedirect: exports.settings.route.success,
					failureRedirect: exports.settings.route.fail
				}), function(res) {
					console.log("res",res);
					res.redirect(exports.settings.route.success);
				});
			break;
			case "youtube":
				passport.use(new YoutubeStrategy({
					clientID: 		exports.settings.youtube.clientID,
					clientSecret: 	exports.settings.youtube.clientSecret,
					callbackURL: 	exports.settings.url+exports.settings.youtube.callbackURL,
					passReqToCallback: 		true,
					scope: 			exports.settings.youtube.scope
				}, function(req, accessToken, refreshToken, profile, done) {
					var query = {};
					if (req.user) {
						query.id = req.user.id;
					} else {
						query['youtube.id'] = profile.id;
					}
					
					profile.data = profile._json;
					delete profile._json;
					delete profile._raw;
					
					if (!hooks[type]) {
						hooks[type] = function(data,cb,token){cb(data);}
					}
					
					hooks[type](profile, function(profile) {
						Gamify.api.execute("user","findOrCreate", {
							authtoken:	Gamify.settings.systoken,
							query:		query,
							profile:	profile,
							type:		'youtube'
						}, function(user) {
							done(null, user);
						});
					}, accessToken);
					
				}));
				app.get('/auth/youtube', passport.authenticate('youtube'), function(req, res) {
					console.log("req, res", req, res);
				});
				app.get('/auth/youtube/callback', passport.authenticate('youtube', {
					successRedirect: exports.settings.route.success,
					failureRedirect: exports.settings.route.fail
				}), function(res) {
					console.log("res",res);
					res.redirect(exports.settings.route.success);
				});
			break;
		}
	});
};