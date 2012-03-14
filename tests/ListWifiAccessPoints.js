var ConnMan = require('../index.js');

var connman = new ConnMan();
connman.init(function() {
	if (connman.Wifi.isPowered)
		console.log('Wifi is powered');
	else
		console.log('Wifi is not powered');

	if (connman.Wifi.isConnected)
		console.log('Wifi is connected');
	else
		console.log('Wifi is not connected');

	console.log('Scanning Access Point...');
	connman.Wifi.Scan(function() {
		connman.Wifi.ListAPs(function(list) {
			console.log('Got ' + list.length + ' Access Point(s)');
			for (var index in list) {
				var ap = list[index];
				console.log('[' + ap.Name + ']');
				console.log('Strength: ' + ap.Strength + '%');
				console.log('Security: ' + ap.Security);
				console.log('');
			}
		});
	});
});