(function(doc) {

var ce="createElement",
ct="createTextNode",
ac="appendChild",
sa="setAttribute",
cf="createDocumentFragment";

function blueprints(id, data) {
	return blueprints._s[id](data, blueprints);
}

blueprints._s = { };
blueprints._s["lsystem-settings"] = function(data) {
	var fragment = doc[cf]();
	with (data||{}){
	var elem0 = doc[ce]("h1");
	fragment[ac](elem0);
	elem0[ac](doc[ct]("Lsystem settings"));
		}
	return fragment;
};


blueprints._s["structure"] = function(data) {
	var fragment = doc[cf]();
	with (data||{}){
	
	var elem1 = doc[ce]("div");
	elem1[sa]("class", "canvas-container");
	fragment[ac](elem1);
	
	var elem3 = doc[ce]("div");
	elem3[sa]("class", "settings");
	fragment[ac](elem3);
	
	var elem5 = doc[ce]("div");
	elem5[sa]("class", "lsystem-settings");
	elem5[sa]("data-title", "L-System");
	elem3[ac](elem5);
	
	var elem7 = doc[ce]("div");
	elem7[sa]("class", "turtle-settings");
	elem7[sa]("data-title", "Turtle");
	elem3[ac](elem7);
	
		}
	return fragment;
};


blueprints._s["turtle-settings"] = function(data) {
	var fragment = doc[cf]();
	with (data||{}){
	var elem0 = doc[ce]("h1");
	fragment[ac](elem0);
	elem0[ac](doc[ct]("Turtle settings"));
		}
	return fragment;
};
window.blueprints = blueprints;
})(document);