window.meanEngine.get('app').directive('themesBootstrapFooters01', function() {
	var link = function(scope, element, attrs) {
		console.log("themes_bootstrap_Footers_01!",scope);
		
	}

	return {
		link: 			link,
		transclude:		false,
		templateUrl:	'components/themes/bootstrap/components/Footers/01/component.html',
		scope:			{
			data:	'=',
		}
	};
});