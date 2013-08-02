/*
http://wiki.commonjs.org/wiki/Modules/1.1
http://www.davidflanagan.com/2009/11/commonjs-module.html
http://lucassmith.name/2009/11/commonjs-require-api-is-a-poor-fit-for-client-side-js.html
http://pmuellr.blogspot.com/2010/02/modjewel-020-commonjs-require-function.html
*/

/*
 * An implementation of the CommonJS Modules 1.0
 * Copyright (c) 2009 by David Flanagan
 */
var require = function require(id) {
    var origid = id, filename;

    // If the module id is relative, convert it to a toplevel id
    // The normalize function is below.
    if (id.substring(0,2) == "./" || id.substring(0,3) == "../")
        id = normalize(require._current_module_dir, id);

    // Now resolve the toplevel id relative to require.dir
    filename = require.dir + id + ".js";

    // Only load the module if it is not already cached.
    if (!require._cache.hasOwnProperty(filename)) {

        // Remember the directory we're loading this module from
        var olddir = require._current_module_dir;
        require._current_module_dir = id.substring(0, id.lastIndexOf('/')+1);
        
        try {
            // Load the text of the module
            var modtext = gettext(filename);
            // Wrap it in a function
            var f = new Function("require", "exports", "module", modtext);
            // Prepare function arguments
            var context = {};                            // Invoke on empty obj
            var exports = require._cache[filename] = {}; // API goes here
            var module = { id: id, uri: filename };      // For Modules 1.1
            f.call(context, require, exports, module);   // Execute the module
        }
        catch(x) {
            throw new Error("Can't load module " + origid + ": " + x);
        }
        finally { // Restore the directory we saved above
            require._current_module_dir = olddir;
        }
    }
    return require._cache[filename];  // Return the module API from the cache

    /* Return the text of the specified url, script element or file */
    function gettext(url) {
        if (typeof XMLHttpRequest !== "undefined") { // Running in a browser
            var req = new XMLHttpRequest();
            req.open("GET", url, false);             // Note synchronous get
            req.send(null);
            if (req.status && req.status != 200) throw req.statusText;
            return req.responseText;
        }
        else if (typeof readUrl == "function") return readUrl("file:" + url);
        else if (typeof snarf == "function") return snarf(url); // Tracemonkey
        else if (typeof read == "function") return read(url);   // V8
        else throw "No mechanism to load module text";
    }

    function normalize(dir, file) {
        for(;;) {
            if (file.substring(0,2) == "./")
                file = file.substring(2);
            else if (file.substring(0,3) == "../") {
                file = file.substring(3);
                dir = up(dir);
            }
            else break;
        }
        return dir+file;
        
        function up(dir) { // Return the parent directory of dir
            if (dir == "") throw "Can't go up from ''";
            if (dir.charAt(dir.length-1) != "/") throw "dir doesn't end in /";
            return dir.substring(0, dir.lastIndexOf('/', dir.length-2)+1);
        }
    }
};

// Set require.dir to point to the directory from which modules should be
// loaded.  It must be an empty string or a string that ends with "/".
require.dir = "";
require._cache = {};               // So we only load modules once
require._current_module_dir = "";  // For relative module names

        
        