//
// This file defines the DroidScript server Activity. The activity starts
// a tiny web server and listens for requests on port 4042 (as default).
// PUT and GET requests are accepted. There is no security what so ever!
//
// @author Mikael Kindborg
// Email: mikael.kindborg@gmail.com
// Blog: divineprogrammer@blogspot.com
// Twitter: @divineprog
// Copyright (c) Mikael Kindborg 2010
// Source code license: MIT
//

// Java classes
var AlertDialog = Packages.android.app.AlertDialog;
var DialogInterface = Packages.anroid.content.DialogInterface;
var TextView = Packages.android.widget.TextView;
var LayoutParams = Packages.android.view.ViewGroup.LayoutParams;
var View = Packages.android.view.View;
var Gravity = Packages.android.view.Gravity;
var Intent = Packages.android.content.Intent;
var Menu = Packages.android.view.Menu;
var Intent = Packages.android.content.Intent;
var Uri = Packages.android.net.Uri;
var DroidScriptServer = Packages.comikit.droidscript.DroidScriptServer;
var Droid = Packages.comikit.droidscript.Droid;

// Global variables
var Server; // The web server
var OptionsMenuItems; // Items in the options menu
var MessageView; // The main view with status text
var AppView; // For use by scripts to set the view of the scripted app

function onCreate(icicle)
{
    if (isUndefined(MessageView))
    {
        var view = new TextView(Activity);
        view.setGravity(Gravity.TOP);
        view.setTextSize(20);
        view.setText(
            "Welcome to the DroidScript Live Server!\n"
            + "IP-address:\n"
            + DroidScriptServer.getIpAddressesAsString()
        );
        
        // Remember the view.
        MessageView = view;
    }

    if (isDefined(AppView)) { showView(AppView); }
    else 
    if (isDefined(MessageView)) { showView(MessageView); }
}

function onResume()
{
    log("onResume - starting server");
    startServer();
}

function onPause()
{
    log("onPause - stopping server");
    stopServer();
}

function onCreateOptionsMenu(menu)
{
    return true;
}

function onPrepareOptionsMenu(menu)
{
    menu.clear();
    
    menuAdd(menu, 10, Droid.translate("Messages"));
    menuAdd(menu, 11, Droid.translate("Stop server"));
    menuAdd(menu, 12, Droid.translate("Start server"));
    menuAdd(menu, 13, Droid.translate("Close"));
    
    return true;
}

function onPrepareOptionsMenu(menu)
{
    OptionsMenuItems = 
        [[Droid.translate("STOP_SERVER"), function() { stopServer(); }],
         [Droid.translate("START_SERVER"), function() { startServer(); }],
         [Droid.translate("CLOSE"), function() { stopServer(); Activity.finish(); }]];
    menu.clear();
    menuAddItems(menu, OptionsMenuItems);
    
    return true;
}

function onOptionsItemSelected(item)
{
    menuDispatch(item, OptionsMenuItems);
    return true;
}

function menuAddItems(menu, items)
{
    for (var i = 0; i < items.length; ++i)
    {
        menu.add(Menu.NONE, Menu.FIRST + i, Menu.NONE, items[i][0]);
    }
}

function menuDispatch(item, items)
{
    var i = item.getItemId() - Menu.FIRST;
    items[i][1]();;
}

function showView(view)
{
    if (isDefined(view)) 
    {
        var parent = view.getParent();
        if (isDefined(parent)) { parent.removeView(view); }
        Activity.setContentView(view);
    }
}

function log(s)
{
    var Log = Packages.android.util.Log;
    Log.i("DroidScript", s);
}

function startServer()
{
    DroidScriptServer.setLoggingIsOn(true);
    Server = DroidScriptServer.create();
    Server.setPort(4042);
    Server.setRequestHandler(function(method, uri, data) {
        // TODO: Add save and get script.
        // TODO: Add support for favicon: URI=/favicon.ico 
        
        //log("METHOD=" + method + " URI=" + uri + " DATA=" + data);
        log("METHOD=" + method + " URI=" + uri);
        
        if (("PUT" == method) && (uri.length() > 5) && ("/eval/" == uri.substring(0, 6)))
        {
            return Activity.eval(data);
        }
        else
        if (("PUT" == method) && (uri.length() > 4) && ("/run/" == uri.substring(0, 5)))
        {
            var intent = new Intent();
            intent.setClassName(Activity, "comikit.droidscript.DroidScriptActivity");
            intent.putExtra("Script", data);
            Activity.startActivity(intent);
            return;
        }
        else
        if (("GET" == method) && (uri.length() > 5) && ("/eval/" == uri.substring(0, 6)))
        {
            return Activity.eval(uri.substring(6));
        }
        else
        if (("GET" == method) && (uri.length() > 5) && ("/hello" == uri.substring(0, 6)))
        {
            return "Welcome to the wonderful world of DroidScript!";
        }
        
        return "Unknown request";
    });
    Server.startServer();
}

function stopServer()
{
    Server.stopServer();
}

function isUndefined(x)
{
    return x === undefined;
}

function isDefined(x)
{
    return x !== undefined && x !== null;
}

