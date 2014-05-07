window.meanEngine.get('app').directive('themesBootstrapHeaders02', function() {
	var link = function(scope, element, attrs) {
		console.log("themes_bootstrap_Headers_02!",scope);
		
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
		templateUrl:	'components/themes/bootstrap/components/Headers/02/component.html',
		scope:			{
			data:	'=',
		}
	};
});