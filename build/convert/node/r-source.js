/**
 * @license r.js Copyright (c) 2010, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/requirejs for details
 */

/*jslint nomen: false */
/*global require: true, process: false, global: false */
"use strict";

/*
 This file is an adapter file to allow RequireJS to run in node.
 If you are in the directory that contains the JS file you want node to
 run, then issue this command (assuming you want to run index.js):
 > node path/to/r.js index.js
*/

(function () {
    var fs = require("fs"),
        sys = require("sys"),
        path = require("path"),
        cwd = process.cwd(),
        appFilePath = (process.argv[2] || "main.js"),
        paths = require.paths,
        isDebug = false,
        appDir, content;

    if (appFilePath === "debug") {
        isDebug = true;
        appFilePath = process.argv[3];
    }

    //Make sure path to app file is absolute.
    if (appFilePath.charAt(0) !== "/") {
        appFilePath = [cwd, appFilePath].join("/");
    }

    if (!path.existsSync(appFilePath)) {
        sys.puts("Cannot find .js file at " + appFilePath);
        return;
    }

    //Now get app directory.
    appDir = appFilePath.split("/");
    appDir.pop();
    if (appDir.length) {
        appDir = appDir.join("/");
    } else {
        appDir = '.';
    }

    //Create some temporary globals that will be removed by the injected file.
    global.__requireIsDebug = isDebug;
    global.__requireLog = sys.puts;
    global.__requireReadFile = function (path) {
        return fs.readFileSync(path) + '';
    };
    global.__requireFileExists = function (fileName) {
        return path.existsSync(fileName);
    };
    global.__requirePaths = paths;

    //dist.sh will inject the modified requireAdapter content as a string.
    process.compile('/*INSERT STRING HERE*/', "requirejs/requireAdapter.js");

    //Set the baseUrl to be the app directory, and pass in the paths.
    process.compile("require({baseUrl: '" + appDir + "'});", "baseUrl");

    //Showtime!
    //Try to support __dirname and __filename for node.
    content = 'var __filename = "' + appFilePath +
              '"; var __dirname = "' + appDir + '";\n' +
              fs.readFileSync(appFilePath);
    process.compile(content, appFilePath);
}());
