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
blueprints._s["edit-vector"] = function(data) {
	var fragment = doc[cf]();
	with (data||{}){
	var elem0 = doc[ce]("li");
	elem0[sa]("class", "vector");
	fragment[ac](elem0);
	
	var elem2 = doc[ce]("h3");
	elem0[ac](elem2);
	elem2[ac](doc[ct](name));
	
	var elem5 = doc[ce]("label");
	elem0[ac](elem5);
	elem5[ac](doc[ct]("i "));
	var elem7 = doc[ce]("input");
	elem7[sa]("type", "text");
	var elem7_attr1 = "";
	elem7_attr1 += "";
	elem7_attr1 += vector[0];
	elem7_attr1 += "";
	elem7[sa]("value", elem7_attr1);
	elem5[ac](elem7);
	
	var elem9 = doc[ce]("label");
	elem0[ac](elem9);
	elem9[ac](doc[ct]("j "));
	var elem11 = doc[ce]("input");
	elem11[sa]("type", "text");
	var elem11_attr1 = "";
	elem11_attr1 += "";
	elem11_attr1 += vector[1];
	elem11_attr1 += "";
	elem11[sa]("value", elem11_attr1);
	elem9[ac](elem11);
	
	var elem13 = doc[ce]("label");
	elem0[ac](elem13);
	elem13[ac](doc[ct]("k "));
	var elem15 = doc[ce]("input");
	elem15[sa]("type", "text");
	var elem15_attr1 = "";
	elem15_attr1 += "";
	elem15_attr1 += vector[2];
	elem15_attr1 += "";
	elem15[sa]("value", elem15_attr1);
	elem13[ac](elem15);
	
		}
	return fragment;
};


blueprints._s["lsystem-settings"] = function(data) {
	var fragment = doc[cf]();
	with (data||{}){
	var elem0 = doc[ce]("div");
	elem0[sa]("class", "selector");
	fragment[ac](elem0);
	
	var elem2 = doc[ce]("label");
	elem2[sa]("for", "lsystem");
	elem0[ac](elem2);
	elem2[ac](doc[ct]("Pick an L-System to render: "));
	
	var elem5 = doc[ce]("select");
	elem5[sa]("id", "lsystem");
	elem0[ac](elem5);
	exampleDefinitions.forEach(function(definition, index) {
	var elem7 = doc[ce]("option");
	var elem7_attr0 = "";
	elem7_attr0 += "";
	elem7_attr0 += index;
	elem7_attr0 += "";
	elem7[sa]("value", elem7_attr0);
	elem5[ac](elem7);
	elem7[ac](doc[ct](definition.name));
	});
	
	
	var elem12 = doc[ce]("div");
	elem12[sa]("class", "definition");
	fragment[ac](elem12);
	
	var elem14 = doc[ce]("h1");
	elem12[ac](elem14);
	elem14[ac](doc[ct](currentDefinition.name));
	
	var elem17 = doc[ce]("h2");
	elem12[ac](elem17);
	elem17[ac](doc[ct]("Axiom"));
	
	var elem20 = doc[ce]("input");
	elem20[sa]("type", "text");
	var elem20_attr1 = "";
	elem20_attr1 += "";
	elem20_attr1 += currentDefinition.system.axiom;
	elem20_attr1 += "";
	elem20[sa]("value", elem20_attr1);
	elem12[ac](elem20);
	
	var elem22 = doc[ce]("h2");
	elem12[ac](elem22);
	elem22[ac](doc[ct]("Iterations"));
	
	var elem25 = doc[ce]("input");
	elem25[sa]("type", "text");
	var elem25_attr1 = "";
	elem25_attr1 += "";
	elem25_attr1 += currentDefinition.iterations;
	elem25_attr1 += "";
	elem25[sa]("value", elem25_attr1);
	elem12[ac](elem25);
	
	var elem27 = doc[ce]("h2");
	elem12[ac](elem27);
	elem27[ac](doc[ct]("Constants"));
	if (currentDefinition.system.constants) {
	var elem30 = doc[ce]("ul");
	elem30[sa]("class", "constants");
	elem12[ac](elem30);
	Object.keys(currentDefinition.system.constants).forEach(function(key) {
	var elem32 = doc[ce]("li");
	elem30[ac](elem32);
	
	var elem34 = doc[ce]("input");
	elem34[sa]("type", "text");
	elem34[sa]("class", "key");
	var elem34_attr2 = "";
	elem34_attr2 += "";
	elem34_attr2 += key;
	elem34_attr2 += "";
	elem34[sa]("value", elem34_attr2);
	elem32[ac](elem34);
	
	var elem36 = doc[ce]("input");
	elem36[sa]("type", "text");
	var elem36_attr1 = "";
	elem36_attr1 += "";
	elem36_attr1 += currentDefinition.system.constants[key];
	elem36_attr1 += "";
	elem36[sa]("value", elem36_attr1);
	elem32[ac](elem36);
	
	});
	}
	var elem40 = doc[ce]("h2");
	elem12[ac](elem40);
	elem40[ac](doc[ct]("Rules"));
	if (currentDefinition.system.rules) {
	var elem43 = doc[ce]("ul");
	elem12[ac](elem43);
	Object.keys(currentDefinition.system.rules).forEach(function(key) {
	var rule = currentDefinition.system.rules[key];
	var elem45 = doc[ce]("li");
	elem43[ac](elem45);
	
	var elem47 = doc[ce]("input");
	elem47[sa]("type", "text");
	elem47[sa]("class", "key");
	var elem47_attr2 = "";
	elem47_attr2 += "";
	elem47_attr2 += key;
	elem47_attr2 += "";
	elem47[sa]("value", elem47_attr2);
	elem45[ac](elem47);
	if (typeof rule === 'function') {
	var elem49 = doc[ce]("textarea");
	elem45[ac](elem49);
	elem49[ac](doc[ct](rule));
	} else {
	var elem52 = doc[ce]("input");
	elem52[sa]("type", "text");
	var elem52_attr1 = "";
	elem52_attr1 += "";
	elem52_attr1 += rule;
	elem52_attr1 += "";
	elem52[sa]("value", elem52_attr1);
	elem45[ac](elem52);
	}
	});
	}
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
	var elem0 = doc[ce]("div");
	elem0[sa]("class", "selector");
	fragment[ac](elem0);
	
	var elem2 = doc[ce]("label");
	elem2[sa]("for", "turtleType");
	elem0[ac](elem2);
	elem2[ac](doc[ct]("Pick the type of turtle to use when rendering: "));
	
	var elem5 = doc[ce]("select");
	elem5[sa]("id", "turtleType");
	elem0[ac](elem5);
	turtles.forEach(function(turtle) {
	var elem7 = doc[ce]("option");
	var elem7_attr0 = "";
	elem7_attr0 += "";
	elem7_attr0 += turtle;
	elem7_attr0 += "";
	elem7[sa]("value", elem7_attr0);
	elem5[ac](elem7);
	elem7[ac](doc[ct](turtle));
	});
	
	
	var elem12 = doc[ce]("div");
	elem12[sa]("class", "definition");
	fragment[ac](elem12);
	
	var elem14 = doc[ce]("h1");
	elem12[ac](elem14);
	elem14[ac](doc[ct]("Initial State"));
	
	var elem17 = doc[ce]("h2");
	elem12[ac](elem17);
	elem17[ac](doc[ct]("Orientation"));
	
	var elem20 = doc[ce]("ul");
	elem12[ac](elem20);
	elem20[ac](blueprints('edit-vector', { name: 'Position', vector: state.position }));
	elem20[ac](blueprints('edit-vector', { name: 'Heading', vector: state.heading }));
	elem20[ac](blueprints('edit-vector', { name: 'Left', vector: state.left }));
	elem20[ac](blueprints('edit-vector', { name: 'Up', vector: state.up }));
	
	var elem23 = doc[ce]("h2");
	elem12[ac](elem23);
	elem23[ac](doc[ct]("Defaults"));
	
	var elem26 = doc[ce]("ul");
	elem12[ac](elem26);
	
	var elem28 = doc[ce]("li");
	elem26[ac](elem28);
	var elem29 = doc[ce]("h3");
	elem28[ac](elem29);
	elem29[ac](doc[ct]("Distance"));
	var elem31 = doc[ce]("input");
	elem31[sa]("type", "text");
	var elem31_attr1 = "";
	elem31_attr1 += "";
	elem31_attr1 += state.defaultDistance;
	elem31_attr1 += "";
	elem31[sa]("value", elem31_attr1);
	elem28[ac](elem31);
	
	var elem33 = doc[ce]("li");
	elem26[ac](elem33);
	var elem34 = doc[ce]("h3");
	elem33[ac](elem34);
	elem34[ac](doc[ct]("Angle"));
	var elem36 = doc[ce]("input");
	elem36[sa]("type", "text");
	var elem36_attr1 = "";
	elem36_attr1 += "";
	elem36_attr1 += state.defaultAngle;
	elem36_attr1 += "";
	elem36[sa]("value", elem36_attr1);
	elem33[ac](elem36);
	
	
	var elem39 = doc[ce]("h2");
	elem12[ac](elem39);
	elem39[ac](doc[ct]("Styling"));
	
	var elem42 = doc[ce]("ul");
	elem12[ac](elem42);
	
	var elem44 = doc[ce]("li");
	elem42[ac](elem44);
	var elem45 = doc[ce]("h3");
	elem44[ac](elem45);
	elem45[ac](doc[ct]("Line Width"));
	var elem47 = doc[ce]("input");
	elem47[sa]("type", "text");
	var elem47_attr1 = "";
	elem47_attr1 += "";
	elem47_attr1 += state.lineWidth;
	elem47_attr1 += "";
	elem47[sa]("value", elem47_attr1);
	elem44[ac](elem47);
	
	
	var elem50 = doc[ce]("h2");
	elem12[ac](elem50);
	elem50[ac](doc[ct]("Tropism"));
	
	var elem53 = doc[ce]("ul");
	elem53[sa]("class", "tropism");
	elem12[ac](elem53);
	
	var elem55 = doc[ce]("li");
	elem53[ac](elem55);
	var elem56 = doc[ce]("h3");
	elem55[ac](elem56);
	elem56[ac](doc[ct]("Enabled"));
	var elem58 = doc[ce]("input");
	elem58[sa]("type", "checkbox");
	elem58[sa]("class", "enabled");
	var elem58_attr2 = "";
	elem58_attr2 += "";
	elem58_attr2 += state.tropismEnabled;
	elem58_attr2 += "";
	elem58[sa]("value", elem58_attr2);
	elem55[ac](elem58);
	
	var elem60 = doc[ce]("li");
	elem53[ac](elem60);
	var elem61 = doc[ce]("h3");
	elem60[ac](elem61);
	elem61[ac](doc[ct]("Constant"));
	var elem63 = doc[ce]("input");
	elem63[sa]("type", "text");
	elem63[sa]("class", "constant");
	var elem63_attr2 = "";
	elem63_attr2 += "";
	elem63_attr2 += state.tropismConstant;
	elem63_attr2 += "";
	elem63[sa]("value", elem63_attr2);
	elem60[ac](elem63);
	elem53[ac](blueprints('edit-vector', { name: 'Vector', vector: state.tropism }));
	
		}
	return fragment;
};
window.blueprints = blueprints;
})(document);