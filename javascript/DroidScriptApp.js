//
// This file defines the main Activity for the DroidScript application.
// The style used is function based. Global variables and functions are
// used. Like in the old Lisp days! 
//
// I have been thinking about changing the design to use JavaScript objects 
// instead. But it is kind of refreshing to go with a really simple design. 
// The way it works is that DroidScriptActivity (Java code) calls functions 
// in this file for various events in the program. 
// TODO: Add more "onXXX" functions.
//
// TODO: For libraries to have their own namespace, the require function in
// CommonJS should be implemented.
//
// @author Mikael Kindborg
// Email: mikael.kindborg@gmail.com
// Blog: divineprogrammer@blogspot.com
// Twitter: @divineprog
// Copyright (c) Mikael Kindborg 2010
// Source code license: MIT
//

// Short names for Java classes
var Droid = Packages.comikit.droidscript.Droid;
var DroidScriptFileHandler = Packages.comikit.droidscript.DroidScriptFileHandler;
var AlertDialog = Packages.android.app.AlertDialog;
var DialogInterface = Packages.anroid.content.DialogInterface;
var EditText = Packages.android.widget.EditText;
var Button = Packages.android.widget.Button;
var Toast = Packages.android.widget.Toast;
var LinearLayout = Packages.android.widget.LinearLayout;
var LayoutParams = Packages.android.widget.LinearLayout.LayoutParams;
var View = Packages.android.view.View;
var Gravity = Packages.android.view.Gravity;
var Intent = Packages.android.content.Intent;
var Menu = Packages.android.view.Menu;
var Intent = Packages.android.content.Intent;
var Uri = Packages.android.net.Uri;

// Global variables
var Server;
var Editor;
var OptionsMenuItems;

// Called when creating the Activity
function onCreate(icicle)
{
    // An example script that can both be evaluated and run
    // as an activity.
    var script = DroidScriptFileHandler.create()
        .readStringFromFileOrUrl("droidscript/Hello.js");
    var editor = new EditText(Activity);
    editor.setLayoutParams(new LayoutParams(
            LayoutParams.FILL_PARENT, LayoutParams.WRAP_CONTENT, 1));
    editor.setGravity(Gravity.TOP);
    editor.setSelectAllOnFocus(false);
    // FIXME: Cannot make the scrollbar visible!
    // FIXME: Virtual keyboard covers the lower half of the text area!
    editor.setVerticalScrollBarEnabled(true);
    editor.setScrollBarStyle(View.SCROLLBARS_OUTSIDE_INSET);
//    editor.setScrollContainer(true);
    editor.setText(script);
    
    // Remember the editor view.
    Editor = editor;
    
    // Button that evaluates the code in the script view.
    var buttonRun = new Button(Activity);
    buttonRun.setLayoutParams(new LayoutParams(
        LayoutParams.FILL_PARENT, LayoutParams.FILL_PARENT, 1));
    buttonRun.setText(Droid.translate("RUN"));
    buttonRun.setOnClickListener(function () { 
        Activity.eval(editor.getText().toString()); });
    
    // Button that runs the code in the script view as a new activity.
    var buttonRunAsActivity = new Button(Activity);
    buttonRunAsActivity.setLayoutParams(new LayoutParams(
        LayoutParams.FILL_PARENT, LayoutParams.FILL_PARENT, 1));
    buttonRunAsActivity.setText(Droid.translate("RUN_AS_ACTIVITY"));
    buttonRunAsActivity.setOnClickListener(function () { 
        var intent = new Intent();
        intent.setClassName(Activity, "comikit.droidscript.DroidScriptActivity");
        intent.putExtra("Script", editor.getText().toString());
        Activity.startActivity(intent); });

    // Button that starts a server for a remote editor.
    var buttonStartServer = new Button(Activity);
    buttonStartServer.setLayoutParams(new LayoutParams(
        LayoutParams.FILL_PARENT, LayoutParams.FILL_PARENT, 1));
    buttonStartServer.setText(Droid.translate("START_SERVER"));
    buttonStartServer.setOnClickListener(function () { openServer(); });
    
    var buttonLayout = new LinearLayout(Activity);
    buttonLayout.setOrientation(LinearLayout.HORIZONTAL);
    buttonLayout.setLayoutParams(new LayoutParams(
        LayoutParams.FILL_PARENT,  LayoutParams.WRAP_CONTENT, 0));
    buttonLayout.addView(buttonRun);
    buttonLayout.addView(buttonRunAsActivity);
    buttonLayout.addView(buttonStartServer);
    
    var mainLayout = new LinearLayout(Activity);
    mainLayout.setOrientation(LinearLayout.VERTICAL);
    mainLayout.setLayoutParams(new LayoutParams(
        LayoutParams.FILL_PARENT, LayoutParams.FILL_PARENT));
    mainLayout.addView(editor);
    mainLayout.addView(buttonLayout);

    Activity.setContentView(mainLayout);
}

function onResume()
{
}

function onPause()
{
}

function onCreateOptionsMenu(menu)
{
    // We create the menu dynamically instead!
    return true;
}

function onPrepareOptionsMenu(menu)
{
    OptionsMenuItems = 
        [[Droid.translate("OPEN_SCRIPT"), function() { openScriptDialog(); }],
         ["Colors app", function() { openScript("droidscript/Colors.js"); showToast("Press Run Activity"); }],
         ["Paint app", function() { openScript("droidscript/Paint.js"); showToast("Press Run Activity"); }],
//         ["Comics", function() { openScript("droidscript/ComicsDemoActivity.js"); showToast("Press Run Activity"); }],
         [Droid.translate("BE_KIND"), function() { showToast(Droid.translate("BE_KIND_MESSAGE")); }],
         [Droid.translate("UPDATE_APP_SCRIPTS"), function() { updateApplicationScripts(); }],
         [Droid.translate("QUIT_APP"), function() { Activity.finish(); }]];
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

function showToast(message)
{
    Toast.makeText(
        Activity,
        message,
        Toast.LENGTH_SHORT).show();
}

function openScriptDialog()
{
    var input = new EditText(Activity);
    input.setText("droidscript/Toast.js");
    var dialog = new AlertDialog.Builder(Activity);
    dialog.setTitle(Droid.translate("OPEN_SCRIPT"));
    dialog.setMessage(Droid.translate("ENTER_FILE_OR_URL"));
    dialog.setView(input);
    dialog.setPositiveButton(Droid.translate("OPEN"), function() {
        var scriptFileName = input.getText().toString();
        openScript(scriptFileName);
    });
    dialog.setNegativeButton(Droid.translate("CANCEL"), function() {
    });
    dialog.show();
}

function openScript(scriptFileName)
{
    var DroidScriptActivity = Packages.comikit.droidscript.DroidScriptActivity;
    var script = DroidScriptFileHandler.create().readStringFromFileOrUrl(scriptFileName);
    Editor.setText(DroidScriptActivity.extractCodeFromDroidScriptTags(script));
}

function openServer()
{
    // Launch new activity.
    var intent = new Intent();
    intent.setClassName(Activity, "comikit.droidscript.DroidScriptActivity");
    intent.putExtra("ScriptName", "droidscript/DroidScriptServer.js");
    Activity.startActivity(intent);
}

function updateApplicationScripts()
{
    var dialog = new AlertDialog.Builder(Activity);
    dialog.setTitle(Droid.translate("UPDATE_APP_SCRIPTS"));
    dialog.setMessage(Droid.translate("THIS_WILL_OVERWRITE_ALL_APP_SCRIPTS"));
    dialog.setPositiveButton(Droid.translate("UPDATE"), function() {
        Activity.reinstallApplicationFiles();
        updateApplicationScriptsDone();
    });
    dialog.setNegativeButton(Droid.translate("CANCEL"), function() {
    });
    dialog.show();
}

function updateApplicationScriptsDone()
{
    var dialog = new AlertDialog.Builder(Activity);
    dialog.setTitle(Droid.translate("UPDATE_APP_SCRIPTS_DONE"));
    dialog.setMessage(Droid.translate("UPDATE_APP_SCRIPTS_DONE_RESTART"));
    dialog.setPositiveButton(Droid.translate("OK"), function() {
    });
    dialog.show();
}


//--------------------------------------------------------------------

//
//function button() {
//    var n = 1;
//    var Graphics = Packages.android.graphics;
//    var font = Graphics.Typeface.create(
//        Graphics.Typeface.SANS_SERIF,
//        Graphics.Typeface.BOLD);
//    var button = new Packages.android.widget.Button(Activity);
//    button.setTypeface(font);
//    button.setTextSize(26);
//    button.setBackgroundColor(Graphics.Color.rgb(0, 0, 64));
//    button.setTextColor(Graphics.Color.rgb(255, 255, 255));
//    button.setText("How many times can you click me?");
//    button.setOnClickListener(function () {
//        button.setText("You clicked me " + n + " times!");
//        n = n + 1;
//    });
//    return button;
//}
//
//var layout = new Packages.android.widget.LinearLayout(Activity);
//layout.setOrientation(Widget.LinearLayout.VERTICAL);
//layout.addView(button());
//layout.addView(button());
//layout.addView(button());
//Activity.setContentView(layout);

// The following is a bunch of comments I keep around, may not make sense to you.

// "Satsa på onlineteknolgi istället för offlineteknologi" Göran on byggverktyg 20100201

//adb push Hello.js /data/data/comikit.droidscript/files/

//How to work with the emulator
//Create an SD card image:
//mksdcard 256M sdcard.iso
//Launch emulator:
//emulator -avd myavd -sdcard sdcard.iso
//Copy files to the card:
//adb push Hello.js /sdcard/Hello.js
//Set up port forwarding to the emulator:
//adb forward tcp:4042 tcp:4042
//My start script
//source gods.sh
//(alias gods='source /path/to/script')

//var Lang = Packages.java.lang;
//var R = Packages.java.lang.reflect;
//
//var x = 10;
//
//Lang.Class.forName("java.io.Serializable");
//
//Packages.android.view.View.OnClickListener.getClass()
//
//var v = Lang.Class.forName("android.view.View");
//var loader = v.getClassLoader()
//var interfac = Lang.Class.forName("android.view.View.OnClickListener");
//var loader = interface.getClassLoader();
//var p = R.Proxy.getProxyClass(loader, Packages.android.view.View.OnClickListener);
//
//var intent = new Intent();
//intent.setClassName(Activity, "comikit.droidscript.RhinoDroidWorkspace");
//Activity.startActivity(intent); 

// Old code that reloaded the current script file:
// Activity.evalFileOrUrl(Activity.getScriptFileName());

// Open web site
//var intent = new Intent(Intent.ACTION_VIEW, Uri.parse("http://comikit.se/"));
//Activity.startActivity(intent); 

//function openScriptList()
//{
//    var list = new Widget.ListView(Activity);
//    var listAdapter = Widget.BaseAdapter({
//        
//    });
//
//}
//
//public class myListAdapter extends BaseAdapter {
//    public myListAdapter(Context c) { ...
//    public int getCount() { ...
//    public Object getItem(int position) { ...
//    public long getItemId(int position) { ...
//@Override
//    public View getView(int position, View convertView, ViewGroup parent) {
//
//            cursor.moveToPosition(position);
//             RowView rv;
//             if (convertView == null) {
//            rv = new RowView(mContext,(cursor.getString(2)),
//                            (cursor.getString(5)), position);
//        } else {
//            rv = (RowView) convertView;
//            rv.setTitle(cursor.getString(2));
//            rv.setDialogue(cursor.getString(5));
//            rv.setFocusable(true);
//            rv.setClickable(true);
//        }
//         return rv;
//       }
//
//}


//fun onOptionsItemSelected(item)
//    var Intent = Packages.android.content.Intent
//    var Uri = Packages.android.net.Uri
//    var Menu = Packages.android.view.Menu
//    
//    if ((Menu.FIRST + 1) == item.getItemId())
//        var intent = new Intent()
//        intent.setClassName(Activity, "comikit.rhinodroid.RhinoDroidWorkspace")
//        Activity.startActivity(intent)
//    else if ((Menu.FIRST + 2) == item.getItemId()) 
//        var intent = new Intent(Intent.ACTION_VIEW, Uri.parse("http://comikit.se/"))
//        Activity.startActivity(intent)
//    
//    return true
// 
//--------------------------------------------------------------------