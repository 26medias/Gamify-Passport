
    var icons = require('./icons.json');

    for (var i = 0; i < icons.length; i++) {
        var icon = icons[i];
        console.log(".socicon." + icon.id + " {\n\tbackground-color: " + icon.color + ";\n}");
    };