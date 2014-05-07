window.meanEngine.get('app').directive('themesBootstrapHeaders01', function() {
	var link = function(scope, element, attrs) {
		console.log("themes_bootstrap_Headers_01!",scope);
		
		scope.header = {
			title:	'Your title',
			menu:	[{
				label:	'Quick login',
				url:	'/auth/facebook'
			}],
			menuRight:	[{
				label:	'Login',
				url:	'account/login'
			}]
		}
	}

	return {
		link: 			link,
		transclude:		false,
		templateUrl:	'components/themes/bootstrap/components/Headers/01/component.html',
		scope:			{
			data:	'=',
		}
	};
});