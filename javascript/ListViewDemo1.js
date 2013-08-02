function onCreate(bundle)
{
    var lang = Packages.java.lang;
    var android = Packages.android;
    var widget = Packages.android.widget;
    var Typeface = Packages.android.graphics.Typeface;
    var Color = Packages.android.graphics.Color;
    
    var listView = new widget.ListView(Activity);
    var fruits  = ["Lemon", "Peach", "Plum"];
    
    listView.setAdapter(createListViewArrayAdapter(
        fruits,
        function(position, convertView) {
            var view = convertView;
            if (null == convertView) {
                view = new widget.TextView(Activity);
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
    
    Activity.setContentView(listView);
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

// Convert a Java array to a JavaScript array
function javaArrayToJsArray(javaArray)
{
    var jsArray = [];
    for (i = 0; i < javaArray.length; ++i) {
        jsArray[i] = javaArray[i];
    }
    return jsArray;
}

// Create an instance of a Java interface
// javaInterface - the interface type
// handler - object that will be sent messages to the instance
function createInstance(javaInterface, handler)
{
    var lang = Packages.java.lang;
    var interfaces = lang.reflect.Array.newInstance(lang.Class, 1);
    interfaces[0] = javaInterface;
    var obj = lang.reflect.Proxy.newProxyInstance(
        lang.ClassLoader.getSystemClassLoader(),
        interfaces,
        // Note, args is a Java array.
        function(proxy, method, args) {
            // Convert Java array to JavaScript array
            return handler[method.getName()].apply(
                null,
                javaArrayToJsArray(args));
        });
    return obj;
}

// Creates a custom ListAdapter
// items - a JavaScript array
// viewFun - a function called to handle the creation 
// of views for the elements in the list
function createListViewArrayAdapter(items, viewFun)
{
    var lang = Packages.java.lang;
    var widget = Packages.android.widget;
    var observer;
    
    var handler = {
        areAllItemsEnabled : function() {
            return lang.Boolean.TRUE; },
        isEnabled : function(position) {
            return lang.Boolean.TRUE; },
        getCount : function() {
            return lang.Integer.valueOf(items.length); },
        getItem : function(position) {
            return items[position]; },
        getItemId : function(position) {
            return lang.Long.valueOf(position); },
        getItemViewType : function(position) {
            return lang.Integer.valueOf(0); },
        getView : function(position, convertView, parent) {
            return viewFun(position, convertView); },
        getViewTypeCount : function(position) {
            return lang.Integer.valueOf(1); },
        hasStableIds : function(position) {
            return true; },
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
