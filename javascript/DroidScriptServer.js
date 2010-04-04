//
// This file defines the DroidScript server Activity. The activity starts
// a tiny web server and listens for requests on port 4042 (as default).
// PUT and GET requests are accepted. There is no security what so ever
// at this stage!
//
// TODO: Clean up the code. Add translations.
//
// @author Mikael Kindborg
// Email: mikael.kindborg@gmail.com
// Blog: divineprogrammer@blogspot.com
// Twitter: @divineprog
// Copyright (c) Mikael Kindborg 2010
// Source code license: MIT
//

var AlertDialog = Packages.android.app.AlertDialog;
var DialogInterface = Packages.anroid.content.DialogInterface;
var Widget = Packages.android.widget;
var LayoutParams = Packages.android.view.ViewGroup.LayoutParams;
var View = Packages.android.view.View;
var Gravity = Packages.android.view.Gravity;
var Intent = Packages.android.content.Intent;
var Menu = Packages.android.view.Menu;
var Intent = Packages.android.content.Intent;
var Uri = Packages.android.net.Uri;
var DroidScript = Packages.comikit.droidscript;
var Droid = Packages.comikit.droidscript.Droid;

var Server;

function onCreate(icicle)
{
    var view = new Widget.TextView(Activity);
    view.setGravity(Gravity.TOP);
    view.setTextSize(20);
    view.setText(
        "Welcome to the DroidScript Live Server!\n"
        + "IP-address:\n"
        + DroidScript.DroidScriptServer.getIpAddressesAsString()
    );
    
    // Set global variable (yuck!)
    MessageView = view;

    Activity.setContentView(view);
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

function onOptionsItemSelected(item)
{
    if (menuItemHasId(item, 10)) { Activity.showMessages(); }
    else
    if (menuItemHasId(item, 11)) { stopServer(); }
    else
    if (menuItemHasId(item, 12)) { startServer(); }
    else
    if (menuItemHasId(item, 13)) { stopServer(); Activity.finish(); }

    return true;
}

// Menu helper function.
function menuAdd(menu, id, label)
{
    menu.add(Menu.NONE, Menu.FIRST + id, Menu.NONE, label);
}

// Menu helper function.
function menuItemHasId(item, id)
{
    return (Menu.FIRST + id) == item.getItemId();
}

function log(s)
{
    var Log = Packages.android.util.Log;
    Log.i("DroidScript", s);
}

function startServer()
{
    var DroidScriptServer = Packages.comikit.droidscript.DroidScriptServer;
    Server = DroidScriptServer.create();
    Server.setPort(4042);
    Server.setRequestHandler(function(method, uri, data) {
        // TODO: Handle PUT and GET, look for action in request (eval or run).
        // TODO: Add save and get script.
        // URI=/favicon.ico 
        log("METHOD=" + method + " URI=" + uri + " DATA=" + data);
        if (("PUT" == method) && (uri.length() > 5) && ("/eval/" == uri.substring(0, 6)))
        {
            return Activity.eval(data);
        }
        if (("PUT" == method) && (uri.length() > 4) && ("/run/" == uri.substring(0, 5)))
        {
            var intent = new Intent();
            intent.setClassName(Activity, "comikit.droidscript.DroidScriptActivity");
            intent.putExtra("Script", data);
            Activity.startActivity(intent);
            return;
        }
        if (("GET" == method) && (uri.length() > 5) && ("/eval/" == uri.substring(0, 6)))
        {
            return Activity.eval(uri.substring(6));
        }
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
