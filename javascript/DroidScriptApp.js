//
// This file defines the main Activity for the DroidScript application.
// The style used is function based. Global variables and functions are
// used. Like in the old Lisp days! 
//
// I have been thinking about changing the design to use JavaScript objects 
// instead. But it is kind of refreshing to go with a really simple design. 
// The way it works now is that DroidScriptActivity (Java code) calls functions 
// in this file for various events in the program. There might be problems with 
// "name space pollution" if JavaScript libraries become common on DroidScript, 
// so this design may need to change.
//
// TODO: Add better error handling.
//
// @author Mikael Kindborg
// Email: mikael.kindborg@gmail.com
// Blog: divineprogrammer@blogspot.com
// Twitter: @divineprog
// Copyright (c) Mikael Kindborg 2010
// Source code license: MIT
//

// Short names for packages.
var Droid = Packages.comikit.droidscript.Droid;
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

// Global variables.
var Server;
var Editor;

// Called when creating the Activity
function onCreate(icicle)
{
    // An example script that can both be evaluated and run
    // as an activity.
    var script = ''
        + 'var Widget = Packages.android.widget;\n'
        + 'var Gravity = Packages.android.view.Gravity;\n\n'
        + 'function onCreate(icicle) {\n'
        + '    var text = "Welcome to DroidScript - "\n'
        + '        + "JavaScript on Android!\\n"\n'
        + '        + "With a dynamic language like JavaScript "\n'
        + '        + "applications can be authored interactively and "\n'
        + '        + "also be updated dynamically. "\n'
        + '        + "The vision is a web of linked applications, "\n'
        + '        + "similar in spirit to HyperCard stacks.";\n'
        + '    var editor = new Widget.EditText(Activity);\n'
        + '    editor.setGravity(Gravity.TOP);\n'
        + '    editor.setText(text);\n'
        + '    Activity.setContentView(editor); }\n\n'
        + 'Widget.Toast.makeText(Activity,\n'
        + '    "Hello World",\n'
        + '    Widget.Toast.LENGTH_SHORT).show();\n'
        + '\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n';
    
    var editor = new Widget.EditText(Activity);
    editor.setLayoutParams(new Widget.LinearLayout.LayoutParams(
            LayoutParams.FILL_PARENT, LayoutParams.WRAP_CONTENT, 1));
    editor.setGravity(Gravity.TOP);
    editor.setSelectAllOnFocus(false);
    // FIXME: Cannot make the scrollbar visible!
    // FIXME: Virtual keyboard covers the lower half of the text area!
    editor.setVerticalScrollBarEnabled(true);
    editor.setScrollBarStyle(View.SCROLLBARS_OUTSIDE_INSET);
//    editor.setScrollContainer(true);
    editor.setText(script);
    
    // Set global variable (yuck!)
    Editor = editor;
    
    // The button that evaluates the code in the script view.
    var buttonEval = new Widget.Button(Activity);
    buttonEval.setLayoutParams(new Widget.LinearLayout.LayoutParams(
        LayoutParams.FILL_PARENT, LayoutParams.FILL_PARENT, 1));
    buttonEval.setText(Droid.translate("EVALUATE"));
    buttonEval.setOnClickListener(function () { 
        Activity.eval(editor.getText().toString()); });
    
    // Run the code in the script view as a new activity.
    var buttonRun = new Widget.Button(Activity);
    buttonRun.setLayoutParams(new Widget.LinearLayout.LayoutParams(
        LayoutParams.FILL_PARENT, LayoutParams.FILL_PARENT, 1));
    buttonRun.setText(Droid.translate("RUN_AS_ACTIVITY"));
    buttonRun.setOnClickListener(function () { 
        var intent = new Intent();
        intent.setClassName(Activity, "comikit.droidscript.DroidScriptActivity");
        intent.putExtra("Script", editor.getText().toString());
        Activity.startActivity(intent); });
    
    var buttonLayout = new Widget.LinearLayout(Activity);
    buttonLayout.setOrientation(Widget.LinearLayout.HORIZONTAL);
    buttonLayout.setLayoutParams(new Widget.LinearLayout.LayoutParams(
        LayoutParams.FILL_PARENT,  LayoutParams.WRAP_CONTENT, 0));
    buttonLayout.addView(buttonEval);
    buttonLayout.addView(buttonRun);
    
    var mainLayout = new Widget.LinearLayout(Activity);
    mainLayout.setOrientation(Widget.LinearLayout.VERTICAL);
    mainLayout.setLayoutParams(new Widget.LinearLayout.LayoutParams(
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
    menu.clear();
    
    menuAdd(menu, 10, Droid.translate("OPEN_SCRIPT"));
    menuAdd(menu, 11, Droid.translate("START_SERVER"));
    menuAdd(menu, 12, Droid.translate("SHOW_MESSAGES"));
    menuAdd(menu, 13, Droid.translate("UPDATE_APP_SCRIPTS"));
    menuAdd(menu, 14, Droid.translate("QUIT_APP"));

    return true;
}

function onOptionsItemSelected(item)
{
    if (menuItemHasId(item, 10)) { openScript(); }
    else 
    if (menuItemHasId(item, 11)) { openServer(); }
    else
    if (menuItemHasId(item, 12)) { Activity.showMessages(); }
    else
    if (menuItemHasId(item, 13)) { updateApplicationScripts(); }
    else
    if (menuItemHasId(item, 14)) { Activity.finish(); }
    
    return true;
}

function openScript()
{
    var input = new Widget.EditText(Activity);
    input.setText("droidscript/Toast.js");
    var dialog = new AlertDialog.Builder(Activity);
    dialog.setTitle(Droid.translate("OPEN_SCRIPT"));
    dialog.setMessage(Droid.translate("ENTER_FILE_OR_URL"));
    dialog.setView(input);
    dialog.setPositiveButton(Droid.translate("OPEN"), function() {
        var script = Packages.comikit.droidscript.DroidScriptFileHandler
            .create().readStringFromFileOrUrl(input.getText().toString());
        Editor.setText(script);
    });
    dialog.setNegativeButton(Droid.translate("CANCEL"), function() {
    });
    dialog.show();
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
// Activity.openFileOrUrl(Activity.getScriptFileName());

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