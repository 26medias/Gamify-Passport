
window.meanEngine.set('api', {
	protocol:	"http",
	hostname:	"fleetwit.dev",
	port:		2000
});

window.meanEngine.set('app', angular.module('main', []));
window.meanEngine.get('app').controller('headerCtrl', function ($scope) {
	
	// Default header and menu
	
	if (!userData || !userData._id) {
		$scope.header = {
			title:	'Prototype',
			menu:	[{
				label:	'Quick login',
				url:	'/auth/facebook'
			}],
			menuRight:	[{
				label:	'Login',
				url:	'account/login'
			}]
		}
	} else {
		$scope.header = {
			title:	'Prototype',
			menu:	[{
				label:	'Manage',
				url:	'/manage'
			}],
			menuRight:	[{
				label:	'Account',
				items:	[{
					label:	'Profile',
					url:	'account/profile.html'
				},{
					label:	'Update my account',
					url:	'account/edit.html'
				},{
					label:	'Logout',
					url:	'account/logout.html'
				}]
			}]
		}
	}
});

window.meanEngine.get('app').run(['$rootScope', function($rootScope) {
	$rootScope.safeApply = function(fn) {
		var phase = this.$root.$$phase;
		if(phase == '$apply' || phase == '$digest') {
			if(fn && (typeof(fn) === 'function')) {
				fn();
			}
		} else {
			this.$apply(fn);
		}
	};
}]);
