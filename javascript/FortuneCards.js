//var Droid = Packages.comikit.droidscript.Droid;
var DroidScriptFileHandler = Packages.comikit.droidscript.DroidScriptFileHandler;
var Intent = Packages.android.content.Intent;

function createAppScript()
{
    return """function onCreate(bundle)
    {
        var lang = Packages.java.lang;
        var android = Packages.android;
        var widget = Packages.android.widget;

        var listView = new widget.ListView(Activity);
        
        var numberOfCards = 10000;
        var cards = lang.reflect.Array.newInstance(lang.String, numberOfCards);
        for (var i = 0; i < numberOfCards; ++i)
        {
            cards[i] = "Card " + (i + 1);
        }

        var arrayAdapter =
            new widget.ArrayAdapter(Activity,
               android.R.layout.simple_list_item_1,
               cards);

        listView.setAdapter(arrayAdapter);
        
        listView.setOnItemClickListener(function(parent, view, position, id) {
            var Intent = Packages.android.content.Intent;
            var DroidScriptFileHandler = Packages.comikit.droidscript.DroidScriptFileHandler;
            var script = DroidScriptFileHandler.create().readStringFromFileOrUrl(
                "droidscript/generated/Card" + position + ".js");
            var intent = new Intent();
            intent.setClassName(Activity, "comikit.droidscript.DroidScriptActivity");
            intent.putExtra("Script", script);
            Activity.startActivity(intent);
        });

        Activity.setContentView(listView);
    }
    """;
}

function createCardScript()
{
    function random255() { return Math.random() * 255; }
        
    var script = """function onCreate(bundle)
    {
        var lang = Packages.java.lang;
        var android = Packages.android;
        var widget = Packages.android.widget;
        var Morph = Packages.comikit.droidscript.Morph;
        var Paint = Packages.android.graphics.Paint;
        var Color = Packages.android.graphics.Color;
        var RectF = Packages.android.graphics.RectF;
                
        var morph = new Morph(Activity);
        var width = 100;
        var height = 100;
        
        morph.setOnDrawListener(function(canvas)
        {""";
     
     var red = random255();
     var green = random255();
     var blue = random255();
     
     script += """
            var brushColor = Color.rgb(""" + red + ", " + green + ", " + blue + """);
            var paint = new Paint();
            paint.setColor(brushColor);
            paint.setStyle(Paint.Style.FILL);
            paint.setAntiAlias(true);
            canvas.drawOval(
                new RectF(
                    0,
                    0,
                    width,
                    height),
                paint);""";
                
     script += """});
        
        morph.setOnSizeChangedListener(function(w, h, oldw, oldh)
        {
            width = w;
            height = h;
            morph.invalidate();
        });
        
        Activity.setContentView(morph);
    }""";
    
    return script;
}

function launch(script)
{
    var intent = new Intent();
    intent.setClassName(Activity, "comikit.droidscript.DroidScriptActivity");
    intent.putExtra("Script", script);
    Activity.startActivity(intent);
}
    
function showMessage(message)
{
    var Toast = Packages.android.widget.Toast;
    Toast.makeText(
        Activity,
        message,
        Toast.LENGTH_SHORT).show();
}

// Create directory
var directory = "droidscript/generated/";
var fileHandler = DroidScriptFileHandler.create();
fileHandler.externalStorageCreateDirectory("droidscript/generated/");
    
// Generate main script
fileHandler.writeStringToFile(directory + "CardApp.js", createAppScript());

// Generate card scripts
for (var i = 0; i < 10000; ++i)
{
    fileHandler.writeStringToFile(directory + "Card" + i + ".js", createCardScript());
}

// Launch app
launch(DroidScriptFileHandler.create().readStringFromFileOrUrl(
    "droidscript/generated/CardApp.js"));

