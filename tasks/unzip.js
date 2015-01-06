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
    
    grunt.registerMultiTask('unzip', 'Unzips zip/nuget files in a customizable way.', function () {
        // Merge task-specific and/or target-specific options with these defaults.
        var options = this.options({
            glob: '',
            flatten: false,
            overwrite: true,
        });
        
        var done = this.async();
        
        // Iterate over all specified file groups.
        this.files.forEach(function (fGroup) {

            // Iterate over each file in the group
            fGroup.src.forEach(function (filePath) {
               
                var params = {
                    path: filePath,
                    dest: fGroup.dest,
                    flatten: options.flatten,
                    overwrite: options.overwrite,
                    log: function (data, callback) {
                        console.log("log", data);
                        callback();
                    },
                    match: function (data, callback) {
                        var result = minimatch(data, options.glob);
                        console.log("isMatch", data, result);
                        callback(null, result);
                    },
                };
                
                unzipit(params, function (error, result) {
                    console.log("log2", error, result);
                    grunt.log.writeln(JSON.stringify(result));
                    done();
                });
                
                 
            });





      //// Concat specified files.
      //var src = f.src.filter(function(filepath) {
      //  // Warn on and remove invalid source files (if nonull was set).
      //  if (!grunt.file.exists(filepath)) {
      //    grunt.log.warn('Source file "' + filepath + '" not found.');
      //    return false;
      //  } else {
      //    return true;
      //  }
      //}).map(function(filepath) {
      //  // Read file source.
      //  return grunt.file.read(filepath);
      //}).join(grunt.util.normalizelf(options.separator));

      //// Handle options.
      //src += options.punctuation;

      //// Write the destination file.
      //grunt.file.write(f.dest, src);

      //// Print a success message.
      //grunt.log.writeln('File "' + f.dest + '" created.');
        });
    });

};
