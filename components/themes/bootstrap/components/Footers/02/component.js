window.meanEngine.get('app').directive('themesBootstrapFooters02', function() {
	var link = function(scope, element, attrs) {
		console.log("themes_bootstrap_Footers_02!",scope);
		
	}

	return {
		link: 			link,
		transclude:		false,
		templateUrl:	'components/themes/bootstrap/components/Footers/02/component.html',
		scope:			{
			data:	'=',
		}
	};
});