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

var OptionsMenuItems;

function onCreate(bundle)
{
    Activity.setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE);
    Activity.requestWindowFeature(Window.FEATURE_NO_TITLE);
    Activity.getWindow().setFlags(
        WindowManager.LayoutParams.FLAG_FULLSCREEN, 
        WindowManager.LayoutParams.FLAG_FULLSCREEN);

    var intent = Activity.getIntent();
    var panelBasePath = intent.getStringExtra("PanelBasePath");
    var numberOfPanels = parseInt(intent.getStringExtra("NumberOfPanels"));
    
    var morph = createFlipMorph(panelBasePath, numberOfPanels);
    
    Activity.setContentView(morph.theMorph);
}

function createFlipMorph(panelBasePath, numberOfPanels)
{
    var morph = new Morph(Activity);
    var panelWidth = 100;
    var panelHeight = 100;
    var panelBitmap = null;
    var touchDownPosition = 0;
    var touchLastPosition = 0;
    var touchStartTime = 0;
    var touchIsActive = false;
    var visiblePanel = 0;
    
    //var AnimationUtils = android.view.animation.AnimationUtils;
    //animation = AnimationUtils.makeInAnimation(Activity, false);
    // Use ViewFlipper or View Anim
    
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
            touchDownPosition = x;
            touchLastPosition = x;
            touchStartTime = new Date().getTime();
            touchIsActive = true;
        }
        
        if (action == MotionEvent.ACTION_MOVE)
        {
            if (touchIsActive) {
                var deltaX = x - touchDownPosition;
                var deltaTime = new Date().getTime() - touchStartTime;
                if (deltaX < -100 && deltaTime < 200) {
                    nextPanel(); 
                    touchIsActive = false; }
                if (deltaX > 100 && deltaTime < 200) {
                    previousPanel();
                    touchIsActive = false; } 
            }
        }

        view.invalidate();
        
        return true;
    });

    function nextPanel()
    {
        //log("Next panel: " + visiblePanel);
        visiblePanel = Math.min(visiblePanel + 1, numberOfPanels - 1);
        openPanel(visiblePanel);
    }

    function previousPanel()
    {
        //log("Prev panel: " + visiblePanel);
        visiblePanel = Math.max(visiblePanel - 1, 0);
        openPanel(visiblePanel);
    }
    
    function openPanel(panelIndex)
    {
        var fileName = panelBasePath + (panelIndex + 1) + ".jpg";
        if (null != panelBitmap) { panelBitmap.recycle(); }
        panelBitmap = stretchBitmap(readBitmap(fileName), panelWidth, panelHeight);
    }
    
    //  try {
    //      out = DroidScriptFileHandler.create().openExternalStorageFileOutputStream(filename()));
    //      bitmap.compress(Bitmap.CompressFormat.PNG, 90, out); } 
    //  catch (error) {
    //      showToast("Could not save image"); }
    
    return {
        theMorph: morph
    };
}

function readBitmap(fileName)
{
    //log("Opening: " + fileName);
    var stream = DroidScriptFileHandler.create().openExternalStorageFileInputStream(fileName);
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
    bitmap.recycle();
    return scaledBitmap;
}

function onCreateOptionsMenu(menu)
{
    return true;
}

function onPrepareOptionsMenu(menu)
{
    OptionsMenuItems = 
        [ { title: "About Flip Comics", action: function() {  } } ];
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
        menu.add(Menu.NONE, Menu.FIRST + i, Menu.NONE, items[i].title);
    }
}

function menuDispatch(item, items)
{
    var i = item.getItemId() - Menu.FIRST;
    items[i].action();;
}

function log(s)
{
    var Log = Packages.android.util.Log;
    Log.i("DroidScript", s);
}