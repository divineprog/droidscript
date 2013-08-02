
var ListView = Packages.android.widget.ListView;
var TextView = Packages.android.widget.TextView;
var Typeface = Packages.android.graphics.Typeface;
var Color = Packages.android.graphics.Color;
    
var Fruits  = ["Lemon", "Peach", "Plum", "Lemon", "Peach", "Plum",
               "Lemon", "Peach", "Plum", "Lemon", "Peach", "Plum",
               "Lemon", "Peach", "Plum", "Lemon", "Peach", "Plum",
               "Lemon", "Peach", "Plum", "Lemon", "Peach", "Plum",
               "Lemon", "Peach", "Plum", "Lemon", "Peach", "Plum",
               "Lemon", "Peach", "Plum", "Lemon", "Peach", "Plum",
               "Lemon", "Peach", "Plum", "Lemon", "Peach", "Plum",
               "Lemon", "Peach", "Plum", "Lemon", "Peach", "Plum",
               "Lemon", "Peach", "Plum", "Lemon", "Peach", "Plum",
               "Lemon", "Peach", "Plum", "Lemon", "Peach", "Plum"];

function onCreate(bundle)
{
    Activity.setContentView(createListView());
}

// List to hold the items in the listview.
// First item is a graphic image presenting the program.
function createListView()
{
    var listView = new ListView(Activity);
    
    listView.setAdapter(createListViewArrayAdapter(
        Fruits,
        function(position, convertView) {
            var view = convertView;
            if (null == convertView) {
                view = new TextView(Activity);
                view.setPadding(25, 15, 25, 15);
                var font = Typeface.create(
                    Typeface.SANS_SERIF,
                    Typeface.BOLD);
                view.setTypeface(font);
                view.setTextSize(26);
                view.setBackgroundColor(Color.rgb(0, 0, 64));
                view.setTextColor(Color.rgb(255, 255, 255));
                // It is also possible to put actions on list items
                //view.setOnClickListener(function () {
                //    view.setText("You Clicked Me!"); })
            }
            view.setText(fruits[position]);
            return view; }));
    listView.setOnItemClickListener(function(parent, view, position, id) {
        showMessage("You picked: " + fruits[position]); });
    return listView;
}

// Display a Toast on the device
function showMessage(message)
{
    var Toast = Packages.android.widget.Toast;
    Toast.makeText(
        Activity,
        message,
        Toast.LENGTH_LONG).show();
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
    var Class = Packages.lang.reflect.Class;
    var Array = Packages.lang.reflect.Array;
    var Proxy = Packages.lang.reflect.Proxy;
    var ClassLoader = Packages.lang.reflect.ClassLoader;
    
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
