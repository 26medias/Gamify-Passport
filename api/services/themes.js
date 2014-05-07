var _ 					= require('underscore');
var toolset				= require('toolset');

exports.service = function (Gamify) {
	
	Gamify.service.themes = new (function() {
		
		console.log("Theme Service loaded.");
		
		
		var scope 			= this;
		this.themes 		= {};
		this.componentFiles	= [];
		this.basePath		= 'components/themes';
		
		this.refresh = function() {
			// List the themes
			toolset.file.getDirContent(scope.basePath, function(themesContent) {
				Gamify.log("themesContent", themesContent);
				
				var loadStack 	= new Gamify.stack();
				
				_.each(themesContent.directories, function(themeDirectory) {
					scope.themes[themeDirectory] = {
						components:	{}
					};
					
					var path = ['themes',themeDirectory];
					console.log("path",path);
					
					loadStack.add(function(p, cb) {
						
						var substack 	= new Gamify.stack();
						
						// Get the config file
						substack.add(function(p, cb2) {
							toolset.file.toObject(scope.basePath+"/"+themeDirectory+"/theme.json", function(obj) {
								scope.themes[themeDirectory].data = obj;
								cb2();
							});
						});
						
						// Get the components
						substack.add(function(p, cb2) {
							toolset.file.getDirContent(scope.basePath+"/"+themeDirectory+"/components", function(themeComponents) {
								
								Gamify.log("themeComponents",themeComponents.directories);
								
								var componentStack 	= new Gamify.stack();
								// For each component directory
								_.each(themeComponents.directories, function(componentDirectory) {
									var _path = path.slice(0);
									_path.push(componentDirectory);
									
									console.log("_path",_path);
									
									scope.themes[themeDirectory].components[componentDirectory] = {};
									componentStack.add(function(p, cb3) {
										// List the widgets
										toolset.file.getDirContent(scope.basePath+"/"+themeDirectory+"/components/"+componentDirectory, function(widgets) {
											Gamify.log("widgets",widgets);
											// Get the content of each widget
											var widgetStack 	= new Gamify.stack();
											_.each(widgets.directories, function(widgetDirectory) {
												
												var __path = _path.slice(0);
												__path.push(widgetDirectory);
												console.log("__path",__path);
												widgetStack.add(function(p, cb4) {
													toolset.file.getDirContent(scope.basePath+"/"+themeDirectory+"/components/"+componentDirectory+"/"+widgetDirectory, function(widgetContent) {
														scope.themes[themeDirectory].components[componentDirectory][widgetDirectory] = {
															files:	widgetContent.files,
															path:	__path.join('.'),
															directive:	__path.join('_'),
															directory:	'/components/themes/'+themeDirectory+'/components/'+componentDirectory+'/'+widgetDirectory+'/'
														};
														scope.componentFiles.push('/components/themes/'+themeDirectory+'/components/'+componentDirectory+'/'+widgetDirectory+'/component.js');	// __path.join('/')
														cb4();
													});
												});
											});
											widgetStack.process(function() {
												cb3();
											});
										});
									});
								});
								
								componentStack.process(function() {
									cb2();
								});
							});
						});
						
						substack.process(function() {
							cb();
						});
					});
				});
				
				loadStack.process(function() {
					Gamify.log("scope.themes",scope.themes);
					Gamify.log("scope.componentFiles",scope.componentFiles);
				});
				
			});
		};
		
		this.mongo	= new Gamify.mongo({database: Gamify.settings.db});
		this.mongo.init(function() {
			scope.refresh();
		});
		
	})();
};