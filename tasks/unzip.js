/*
 * grunt-unzip
 * https://github.com/camMCC/grunt-unzip
 *
 * Copyright (c) 2015 Cam Birch
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {
    var edge = require("edge");
    var path = require("path");
    var minimatch = require("minimatch");
    
    var unzipit = edge.func({
        source: path.join(__dirname, "unzipTask.cs"),
        references: ["System.IO.Compression.dll", "System.IO.Compression.FileSystem.dll"]
    });

    // Please see the Grunt documentation for more information regarding task
    // creation: http://gruntjs.com/creating-tasks
    
    /**
     * Perform console logging.  Primarily for testing purposes during development.
     * Built so that it works from edge.js
     * @param message {string} The message to log
     * @param callback {function} The callback function to call once the potentially async function is complete (yes, this is required for edge.js)
     */
    function log(message, callback) {
        console.log("log", data);

        callback();
    }
    function success(message, callback) {
        grunt.log.ok(message);
        callback();
    }


    grunt.registerMultiTask('unzip', 'Unzips zip/nuget files in a customizable way.', function () {
        // Merge task-specific and/or target-specific options with these defaults.
        var options = this.options({
            glob: '',
            flatten: false,
            overwrite: true,
            leaveOriginalDate: false,
        });
        
        
        function matchGlob(fileToMatch, callback) {
            var result = minimatch(fileToMatch, options.glob);
            //console.log("isMatch", fileToMatch, result);
            callback(null, result);
        }
        

        var done = this.async();
        var loops = 0;
        function loopComplete() {
            loops--;
            if (loops <= 0) done();
        };
        
        // Iterate over all specified file groups.
        this.files.forEach(function (fGroup) {

            // Iterate over each file in the group
            fGroup.src.forEach(function (filePath) {
               
                var params = {
                    path: filePath,
                    dest: fGroup.dest,
                    flatten: options.flatten,
                    overwrite: options.overwrite,
                    leaveOriginalDate: options.leaveOriginalDate,
                    log: log,
                    success: success,
                    match: matchGlob,
                };
                
                loops++;

                unzipit(params, function (error, result) {      // This is async
                    if (error) throw error;

                    grunt.log.ok("File complete. " + params.path);
                    loopComplete();
                });
                
                 
            });
        });
    });

};
