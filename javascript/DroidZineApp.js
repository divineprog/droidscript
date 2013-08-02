Activity.evalFileOrUrl("droidscript/DroidZineDSL.js");

//var Droid = Packages.comikit.droidscript.Droid;
var DroidScriptFileHandler = Packages.comikit.droidscript.DroidScriptFileHandler;
var Intent = Packages.android.content.Intent;
var WindowManager = Packages.android.view.WindowManager;
var Window = Packages.android.view.Window;
var ActivityInfo = Packages.android.content.pm.ActivityInfo;
var Log = Packages.android.util.Log;
var Menu = Packages.android.view.Menu;
var Toast = Packages.android.widget.Toast;
var ArrayAdapter = Packages.android.widget.ArrayAdapter;
var Intent = Packages.android.content.Intent;
var DroidScriptFileHandler = Packages.comikit.droidscript.DroidScriptFileHandler;
var ListView = Packages.android.widget.ListView;
var EditText = Packages.android.widget.EditText;
var TextView = Packages.android.widget.TextView;
var Typeface = Packages.android.graphics.Typeface;
var Color = Packages.android.graphics.Color;
var lang = Packages.java.lang;
var android = Packages.android;

function onCreate(bundle)
{
    Activity.setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE);
    Activity.requestWindowFeature(Window.FEATURE_NO_TITLE);
    
    // Get the master url list
    var urlList = DroidScriptFileHandler.create().readStringFromFileOrUrl(
        "http://www.droidzine.org/issue1/comics/urls.txt");
    
    var urls = urlList.split("\n");
    var comicsList = lang.reflect.Array.newInstance(lang.String, urls.length);
    var urlList = [];
    for (var i = 0; i < urls.length; ++i) 
    {
        Log.i("***Reading", urls[i]);
        var script = stripDroidZineTags(
            DroidScriptFileHandler.create().readStringFromFileOrUrl(urls[i]));
        Log.i("***DSLScript", script);
        var thePage = Activity.eval(script);
        comicsList[i] = thePage.title + " by " + thePage.author;
        urlList.push(urls[i]);
    }

    var listView = createListView(comicsList); //new ListView(Activity);
    
//    var arrayAdapter =
//        new ArrayAdapter(Activity,
//           android.R.layout.simple_list_item_1,
//           comicsList);
//    listView.setAdapter(arrayAdapter);
    
    listView.setOnItemClickListener(function(parent, view, position, id) {
        var script = DroidScriptFileHandler.create().readStringFromFileOrUrl(
            "droidscript/DroidZineView.js");
        var intent = new Intent();
        intent.setClassName(Activity, "comikit.droidscript.DroidScriptActivity");
        intent.putExtra("Script", script);
        intent.putExtra("Url", urlList[position]);
        Activity.startActivity(intent);
    });

    Activity.setContentView(listView);
}

//List to hold the items in the listview.
//First item is a graphic image presenting the program.
function createListView(comicsList)
{
    var listView = new ListView(Activity);
    
    listView.setAdapter(createListViewArrayAdapter(
       comicsList,
       function(position, convertView) {
           var view = convertView;
           if (null == convertView) {
               view = new TextView(Activity);
               view.setPadding(25, 15, 25, 15);
               var font = Typeface.create(
                   Typeface.SANS_SERIF,
                   Typeface.BOLD);
               view.setTypeface(font);
               view.setTextSize(20);
               if (position % 2 == 0)
               {
                   view.setBackgroundColor(Color.rgb(255, 150, 150));
               }
               else
               {
                   view.setBackgroundColor(Color.rgb(255, 100, 100));
               }
               view.setTextColor(Color.rgb(255, 255, 255));
               // It is also possible to put actions on list items
               //view.setOnClickListener(function () {
               //    view.setText("You Clicked Me!"); })
           }
           view.setText(comicsList[position]);
           return view; 
       }));
    
    return listView;
}

function stripDroidZineTags(data)
{
    var beginTag = "DROIDZINE_BEGIN";
    var endTag = "DROIDZINE_END";
    var beginIndex = data.indexOf(beginTag);
    var endIndex = data.indexOf(endTag);
    
    if (beginIndex > -1 && endIndex > -1) 
    {
        return data.substring(beginIndex + beginTag.length, endIndex);
    }
}

function onCreateOptionsMenu(menu)
{
    // We create the menu dynamically instead!
    return true;
}

function onPrepareOptionsMenu(menu)
{
    OptionsMenuItems = 
        [["Open Comic", function() { openDialog(); }],
         ["About", function() { showToast(
             "DroidZine App by Jonas Beckman & Mikael Kindborg, GTUG Hackathon Stockholm May 1, 2010"); }]
        ];
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

function openDialog()
{
    var input = new EditText(Activity);
    input.setText("http://");
    var dialog = new AlertDialog.Builder(Activity);
    dialog.setTitle("Open DroidZine Comic");
    dialog.setMessage("Enter web address");
    dialog.setView(input);
    dialog.setPositiveButton(Droid.translate("Open"), function() {
        var scriptFileName = input.getText().toString();
        openScript(scriptFileName);
    });
    dialog.setNegativeButton(Droid.translate("Cancel"), function() {
    });
    dialog.show();
}



//function createListView()
//{
//    var listView = new ListView(Activity);
//    listView.setDrawSelectorOnTop(true);
//    listView.getSelector().setAlpha(100);
//    listView.setChoiceMode(ListView.CHOICE_MODE_SINGLE);
//    listView.setAdapter(createListViewArrayAdapter(ListItems, getListView));
//    listView.setOnItemClickListener(function(parent, view, position, id) {
//        //showMessage("You picked: " + position);
//        view.setSelected(true);
//        ListItems[position].action(); });
//    return listView;
//}

//Creates a custom ListAdapter
//items - a JavaScript array
//viewFun - a function called to handle the creation
//of views for the elements in the list
function createListViewArrayAdapter(items, viewFun)
{
    var Boolean = Packages.java.lang.Boolean;
    var Integer = Packages.java.lang.Integer;
    var Long = Packages.java.lang.Long;
    var observer;
    
    var handler = {
       areAllItemsEnabled: function() {
           return Boolean.TRUE; },
       isEnabled: function(position) {
           return Boolean.TRUE; },
       getCount: function() {
           return Integer.valueOf(items.length); },
       getItem: function(position) {
           return items[position]; },
       getItemId: function(position) {
           return Long.valueOf(position); },
       getItemViewType: function(position) {
           return Integer.valueOf(0); },
       getView: function(position, convertView, parent) {
           return viewFun(position, convertView); },
       getViewTypeCount: function(position) {
           return Integer.valueOf(1); },
       hasStableIds: function(position) {
           return Boolean.TRUE; },
       isEmpty : function(position) {
           return 0 == items.length; },
       // We can only have one observer!
       registerDataSetObserver : function(theObserver) {
           observer = theObserver; },
       unregisterDataSetObserver : function(theObserver) {
           observer = null; },
    };
    
    return createInstance(Packages.android.widget.ListAdapter, handler);
}

//Helper functions

function createInstance(javaInterface, object)
{
    var Class = Packages.java.lang.Class;
    var ClassLoader = Packages.java.lang.ClassLoader;
    var Array = Packages.java.lang.reflect.Array;
    var Proxy = Packages.java.lang.reflect.Proxy;
    
    // Convert a Java array to a JavaScript array
    function javaArrayToJsArray(javaArray)
    {
       var jsArray = [];
       for (i = 0; i < javaArray.length; ++i) {
           jsArray[i] = javaArray[i];
       }
       return jsArray;
    }
    
    var interfaces = Array.newInstance(Class, 1);
    interfaces[0] = javaInterface;
    var obj = Proxy.newProxyInstance(
       ClassLoader.getSystemClassLoader(),
       interfaces,
       // Note, args is a Java array
       function(proxy, method, args) {
           // Convert Java array to JavaScript array
           return object[method.getName()].apply(
               null,
               javaArrayToJsArray(args));
       });
    return obj;
}
