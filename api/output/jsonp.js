exports.output = function(input, server, params) {
	console.log("output params", params);
	server.set("Content-Type", "application/json");
	server.send(200, params.callback+"("+JSON.stringify(input)+");");
	return true;
}