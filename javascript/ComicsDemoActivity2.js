
var ListView = Packages.android.widget.ListView;
var TextView = Packages.android.widget.TextView;
var ImageView = Packages.android.widget.ImageView;
var Typeface = Packages.android.graphics.Typeface;
var Color = Packages.android.graphics.Color;
var WindowManager = Packages.android.view.WindowManager;
var Window = Packages.android.view.Window;
var ActivityInfo = Packages.android.content.pm.ActivityInfo;
var Log = Packages.android.util.Log;

var TextColor = Color.rgb(35, 31, 32);
var BackgroundColor = Color.rgb(210, 217, 77);

var ListItems;

function onCreate(bundle)
{
    Activity.setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE);
    Activity.requestWindowFeature(Window.FEATURE_NO_TITLE);
    Activity.getWindow().setFlags(
        WindowManager.LayoutParams.FLAG_FULLSCREEN,
        WindowManager.LayoutParams.FLAG_FULLSCREEN);

    ListItems = [
        { view: createImageView("ComicsSplash.png"),
          action: function() { } },
        { view: createImageView("ComicsButtonFlipComic.png"),
          action: function() { openDemoFlipComic(); } },
        { view: createImageView("ComicsButtonPanoFrame.png"),
          action: function() { openDemoPanoFrame(); } },
        { view: createImageView("ComicsButtonPanoStrip.png"),
          action: function() { openDemoPanoStrip(); } },
        { view: createTextView("Click here to read more about comics on Android!"),
          action: function() { openComiKitWebSite(); } }
    ];

    Activity.setContentView(createListView());
}

function createTextView(text)
{
    var view = new TextView(Activity);
    var font = Typeface.create(
        Typeface.SANS_SERIF,
        Typeface.BOLD);
    view.setTypeface(font);
    view.setTextSize(26);
    view.setPadding(25, 15, 25, 15);
    view.setBackgroundColor(BackgroundColor);
    view.setTextColor(TextColor);
    view.setText(text);
    return view;
}

function createImageView(fileName)
{
    var DisplayMetrics = Packages.android.util.DisplayMetrics;
    var metrics = new DisplayMetrics();
    Activity.getWindowManager().getDefaultDisplay().getMetrics(metrics);
    var bitmap = readBitmap(fileName);
    //showMessage("Display height: " + metrics.heightPixels);
    var scaleFactor = metrics.widthPixels / bitmap.getWidth();
    var view = new ImageView(Activity);
    view.setImageBitmap(bitmap);
    view.setMaxWidth(bitmap.getWidth() * scaleFactor);
    view.setMaxHeight(bitmap.getHeight() * scaleFactor);
    view.setAdjustViewBounds(true);
    view.setScaleType(ImageView.ScaleType.FIT_XY); // FIT_CENTER
    return view;
}

function readBitmap(fileName)
{
    var BitmapFactory = Packages.android.graphics.BitmapFactory;
    var fileHandler = Packages.comikit.droidscript.DroidScriptFileHandler.create();
    var stream = fileHandler.openExternalStorageFileInputStream(
        "/droidscript/comics/" + fileName);
    var bitmap = BitmapFactory.decodeStream(stream);
    stream.close();
    return bitmap;
}

function getListView(position, convertView)
{
    return ListItems[position].view;
}

// List to hold the items in the listview.
// First item is a graphic image presenting the program.
function createListView()
{
    var listView = new ListView(Activity);
    listView.setAdapter(createListViewArrayAdapter(ListItems, getListView));
    listView.setOnItemClickListener(function(parent, view, position, id) {
        showMessage("You picked: " + position);
        ListItems[position].action(); });
    return listView;
}

function openDemoFlipComic()
{
    showMessage("openDemoFlipComic");
}

function openDemoPanoFrame()
{
    showMessage("openDemoPanoFrame");
}

function openDemoPanoStrip()
{
    showMessage("openDemoPanoStrip");
}

function openComiKitWebSite()
{
    showMessage("openComiKitWebSite");
}

// Display a Toast on the device
function showMessage(message)
{
    var Toast = Packages.android.widget.Toast;
    Toast.makeText(
        Activity,
        message,
        Toast.LENGTH_SHORT).show();
}

// Creates a custom ListAdapter
// items - a JavaScript array
// viewFun - a function called to handle the creation
//   of views for the elements in the list
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

// Helper functions

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

// Launch new activity.
function openActivity(scriptFileName)
{
    var DroidScriptActivity = Packages.comikit.droidscript.DroidScriptActivity;
    var Intent = Packages.android.content.Intent;
    var script = DroidScriptFileHandler.create().readStringFromFileOrUrl(scriptFileName);
    var intent = new Intent();
    intent.setClassName(Activity, "comikit.droidscript.DroidScriptActivity");
    intent.putExtra("Script", script);
    Activity.startActivity(intent);
}

// Open web site.
function openWebPage(url)
{
    var Intent = Packages.android.content.Intent;
    var Uri = Packages.android.net.Uri;
    var intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
    Activity.startActivity(intent);
}

//try {
//    var fileHandler = Packages.comikit.droidscript.DroidScriptFileHandler.create();
//    var stream = fileHandler.openUrl("http://comikit.se/ComiKitWebLogo.png");
//    IntroImage = Packages.android.graphics.BitmapFactory.decodeStream(stream);
//    stream.close();
//    IntroView = new ImageView(Activity);
//    IntroView.setImageBitmap(IntroImage);
//    IntroView.setScaleType(ImageView.ScaleType.FIT_XY);
//}
//catch (error) {
//    Activity.reportError("JS Error: " + error);
//     }



