Activity.evalFileOrUrl("droidscript/DroidZineDSL.js");

var Paint = Packages.android.graphics.Paint;
var Color = Packages.android.graphics.Color;
var Rect = Packages.android.graphics.Rect;
var Point = Packages.android.graphics.Point;
var Bitmap = Packages.android.graphics.Bitmap;
var BitmapFactory = Packages.android.graphics.BitmapFactory;
var Canvas = Packages.android.graphics.Canvas;
var Menu = Packages.android.view.Menu;
var MotionEvent = Packages.android.view.MotionEvent;
var WindowManager = Packages.android.view.WindowManager;
var Window = Packages.android.view.Window;
var ActivityInfo = Packages.android.content.pm.ActivityInfo;
//var MediaStore = Packages.android.provider.MediaStore;
var Morph = Packages.comikit.droidscript.Morph;
var DroidScriptFileHandler = Packages.comikit.droidscript.DroidScriptFileHandler;
var Log = Packages.android.util.Log;

var OptionsMenuItems;

function onCreate(bundle)
{
    Activity.setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE);
    Activity.requestWindowFeature(Window.FEATURE_NO_TITLE);
//    Activity.getWindow().setFlags(
//        WindowManager.LayoutParams.FLAG_FULLSCREEN, 
//        WindowManager.LayoutParams.FLAG_FULLSCREEN);

    var panelDSL = DroidScriptFileHandler.create().readStringFromFileOrUrl(
        "droidscript/DroidZineExampleDSL.js");
    var thePage = Activity.eval(panelDSL);
    for (var i = 0; i < thePage.panels.length; ++i) 
    {
        var p = thePage.panels[i];
        
        Log.i("***P.box ", p.box);
    }
    
    var intent = Activity.getIntent();
    // var url = intent.getStringExtra("Url");
    
    var morph = createZineMorph(thePage);
    
    Activity.setContentView(morph.theMorph);
}

function createZineMorph(thePage)
{
    var morph = new Morph(Activity);
    var panelWidth = 100;
    var panelHeight = 100;
    var panelBitmap = null;
    var touchDownPositionX = 0;
    var touchLastPositionY = 0;
    var touchDownPositionX = 0;
    var touchLastPositionY = 0;
    var touchStartTime = 0;
    var touchIsActive = false;
    var visiblePanel = 0;
    
    //var AnimationUtils = android.view.animation.AnimationUtils;
    //animation = AnimationUtils.makeInAnimation(Activity, false);
    // Use ViewFlipper or View Anim
    
    //var originalBitmap = readBitmapFromUrl(thePage.imageUrl);
    var originalBitmap = readBitmapFromExternalStorageFileInputStream(
        "droidscript/PMOCT__R1_P9_by_annarowlye.jpg");
    var originalBitmapWidth = originalBitmap.getWidth();
    var originalBitmapHeight = originalBitmap.getHeight();
    
    morph.setOnDrawListener(function(canvas)
    {
        if (null != panelBitmap) {
            canvas.drawBitmap(panelBitmap, 0, 0, null); }
    });
    
    morph.setOnSizeChangedListener(function(w, h, oldw, oldh)
    {
        panelWidth = w;
        panelHeight = h;
        //log("Show panel");
        openPanel(visiblePanel);
        morph.invalidate();
    });
    
    morph.setOnTouchListener(function(view, event)
    {
        var action = event.getAction();
        var x = event.getX();
        var y = event.getY();
        
        if (action == MotionEvent.ACTION_DOWN)
        {
            touchDownPositionX = x;
            touchLastPositionX = x;
            touchDownPositionY = y;
            touchLastPositionY = y;
            touchStartTime = new Date().getTime();
            touchIsActive = true;
        }
        
        if (action == MotionEvent.ACTION_MOVE)
        {
            if (touchIsActive) {
                var deltaX = touchDownPositionX - x;
                var deltaY = touchDownPositionY - y;
                var deltaTime = new Date().getTime() - touchStartTime;
                if (deltaX < -100 && deltaTime < 200) {
                    goLeft(); 
                    touchIsActive = false; }
                else
                if (deltaX > 100 && deltaTime < 200) {
                    goRight();
                    touchIsActive = false; } 
                else
                if (deltaY < -50 && deltaTime < 200) {
                    goUp(); 
                    touchIsActive = false; }
                else
                if (deltaY > 50 && deltaTime < 200) {
                    goDown();
                    touchIsActive = false; } 
            }
        }

        view.invalidate();
        
        return true;
    });

    function goRight()
    {
        var panel = thePage.panels[visiblePanel];
        if (panel.moves.right != undefined)
        {
            visiblePanel = panel.moves.right - 1;
            Log.i("Moving right", "Panel " + visiblePanel);
        }
        openPanel(visiblePanel);
    }

    function goLeft()
    {
        var panel = thePage.panels[visiblePanel];
        if (panel.moves.left != undefined)
        {
            visiblePanel = panel.moves.left - 1;
            Log.i("Moving left", "Panel " + visiblePanel);
        }
        openPanel(visiblePanel);
    }

    function goDown()
    {
        var panel = thePage.panels[visiblePanel];
        if (panel.moves.down != undefined)
        {
            visiblePanel = panel.moves.down - 1;
            Log.i("Moving down", "Panel " + visiblePanel);
        }
        openPanel(visiblePanel);
    }

    function goUp()
    {
        var panel = thePage.panels[visiblePanel];
        if (panel.moves.up != undefined)
        {
            visiblePanel = panel.moves.up - 1;
            Log.i("Moving up", "Panel " + visiblePanel);
        }
        openPanel(visiblePanel);
    }
    
    function openPanel(panelIndex)
    {
        if (null != panelBitmap) { panelBitmap.recycle(); }
        
        var panel = thePage.panels[panelIndex];
        var x = panel.box.x;
        var y = panel.box.y;
        var h = panel.box.h;
        var w = panel.box.w;
        
        Log.i("Drawing rect ", "" + x + "," + y + "," + w + "," + h);
        panelBitmap = sliceBitmap(originalBitmap, x, y, x + w, y + h, panelWidth, panelHeight);
    }
    
    return {
        theMorph: morph
    };
}

function readBitmapFromUrl(url)
{
    //log("Opening: " + fileName);
    var stream = DroidScriptFileHandler.create().openUrl(url);
    var bitmap = BitmapFactory.decodeStream(stream);
    stream.close();
    //log("Bitmap: " + bitmap.getWidth() + " " + bitmap.getHeight());
    return bitmap;
}

function readBitmapFromExternalStorageFileInputStream(path)
{
    //log("Opening: " + fileName);
    var stream = DroidScriptFileHandler.create().openExternalStorageFileInputStream(path);
    var bitmap = BitmapFactory.decodeStream(stream);
    stream.close();
    //log("Bitmap: " + bitmap.getWidth() + " " + bitmap.getHeight());
    return bitmap;
}

function stretchBitmap(bitmap, w, h)
{
    var bitmapWidth = bitmap.getWidth();
    var bitmapHeight = bitmap.getHeight();
    var sourceRect = new Rect(0, 0, bitmapWidth, bitmapHeight);
    var destRect = new Rect(0, 0, w, h);  
    var scaledBitmap = Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888);
    var scaledCanvas = new Canvas(scaledBitmap);
    var paint = new Paint();
    paint.setStyle(Paint.Style.FILL);
    paint.setARGB(255, 255, 0, 255);
    scaledCanvas.drawPaint(paint);
    scaledCanvas.drawBitmap(bitmap, sourceRect, destRect, paint);
    return scaledBitmap;
}

function scaleBitmap(bitmap, scaleFactor)
{
    var bitmapWidth = bitmap.getWidth();
    var bitmapHeight = bitmap.getHeight();
    var scaledWidth = bitmapWidth * scaleFactor;
    var scaledHeight = bitmapHeight * scaleFactor;
    return stretchBitmap(bitmap, scaledWidth, scaledHeight);
}

function sliceBitmap(bitmap, x, y, w, h, scaledW, scaledH)
{
    var sourceRect = new Rect(x, y, w, h);
    var destRect = new Rect(0, 0, scaledW, scaledH);  
    var scaledBitmap = Bitmap.createBitmap(scaledW, scaledH, Bitmap.Config.ARGB_8888);
    var scaledCanvas = new Canvas(scaledBitmap);
    var paint = new Paint();
    paint.setStyle(Paint.Style.FILL);
    paint.setARGB(255, 255, 0, 255);
    scaledCanvas.drawPaint(paint);
    scaledCanvas.drawBitmap(bitmap, sourceRect, destRect, paint);
    return scaledBitmap;
}


//function onCreateOptionsMenu(menu)
//{
//    return true;
//}
//
//function onPrepareOptionsMenu(menu)
//{
//    OptionsMenuItems = 
//        [ { title: "About Flip Comics", action: function() {  } } ];
//    menu.clear();
//    menuAddItems(menu, OptionsMenuItems);
//    
//    return true;
//}
//
//function onOptionsItemSelected(item)
//{
//    menuDispatch(item, OptionsMenuItems);
//    return true;
//}
//
//function menuAddItems(menu, items)
//{
//    for (var i = 0; i < items.length; ++i)
//    {
//        menu.add(Menu.NONE, Menu.FIRST + i, Menu.NONE, items[i].title);
//    }
//}
//
//function menuDispatch(item, items)
//{
//    var i = item.getItemId() - Menu.FIRST;
//    items[i].action();;
//}

function log(s)
{
    var Log = Packages.android.util.Log;
    Log.i("DroidScript", s);
}
