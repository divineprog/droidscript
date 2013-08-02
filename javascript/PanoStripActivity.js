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
    var stripBasePath = intent.getStringExtra("StripBasePath");
    var stripWidth = parseInt(intent.getStringExtra("StripWidth"));
    var stripHeight = parseInt(intent.getStringExtra("StripHeight"));
    var sliceWidth = parseInt(intent.getStringExtra("SliceWidth"));
    
    var morph = createPanoMorph(
        stripBasePath, 
        stripWidth, 
        stripHeight, 
        sliceWidth);

    Activity.setContentView(morph.theMorph);
}

function createPanoMorph(
    stripBasePath, 
    originalStripWidth, 
    originalStripHeight, 
    originalSliceWidth)
{
    var morph = new Morph(Activity);
    var slices = [];
    var panelX = 0;
    var panelWidth = 100;
    var panelHeight = 100;
    var stripWidth = 0;
    var stripHeight = 0;
    var sliceWidth = 0;
    var scaleFactor = 1;
    var touchDownPosition = 0;
    var touchLastPosition = 0;
    var touchStartTime = 0;
    var touchIsActive = false;
    var readyToDraw = false;
    
    function sliceX(index)
    {
        return sliceWidth * index;
    }
    
    function sliceIndex(x)
    {
        return Math.floor(x / sliceWidth);
    }
    
    function sliceBitmap(index)
    {
        if (null == slices[index]) {
            var fileName = stripBasePath + (index + 1) + ".jpg";
            slices[index] = scaleBitmap(readBitmap(fileName), scaleFactor);
        }
        return slices[index];
    }
    
    // Event handlers
    
    morph.setOnDrawListener(function(canvas)
    {
        if (!readyToDraw) { return; }
        
        // Draw all visible slices
        var index1 = sliceIndex(panelX);
        var index2 = sliceIndex(panelX + panelWidth);
        
        //log("SliceWidth=" + sliceWidth);
        for (var i = index1; i <= index2; ++i) {
            var x = sliceX(i) - panelX;
            var bitmap = sliceBitmap(i);
            if (null != bitmap) {
                //log("drawBitmap: " + x + " " + bitmap.getWidth() + " " + bitmap.getHeight());
                canvas.drawBitmap(bitmap, x, 0, null); 
            }
        }
        
        // Recycle non-visible slices
        for (var i = 0; i < slices.length; ++i) {
            if (i < index1 || i > index2) {
                var bitmap = slices[i];
                if (null != bitmap) {
                    bitmap.recycle();
                    slices[i] = null;
                }
            }
        }
    });
    
    morph.setOnSizeChangedListener(function(w, h, oldw, oldh)
    {
        panelWidth = w.intValue();
        panelHeight = h.intValue();
        scaleFactor = panelHeight / originalStripHeight;
        stripWidth = Math.floor(originalStripWidth * scaleFactor);
        stripHeight = Math.floor(originalStripHeight * scaleFactor);
        sliceWidth = Math.floor(originalSliceWidth * scaleFactor);
        //log("panelWidth: " + panelWidth + " typeof: " + typeof(panelWidth));
        //log("Scale factor: " + scaleFactor);
        readyToDraw = true;
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
                var delta = (x - touchLastPosition); // / 2;
                panelX -= delta;
                if (panelX >= stripWidth - panelWidth) {
                    log("stripWidth - panelWidth: " + (stripWidth - panelWidth));
                    panelX = stripWidth - panelWidth; 
                }
                if (panelX < 0) {
                    panelX = 0; 
                }
                touchLastPosition = x;
            }
        }

        view.invalidate();
        
        return true;
    });
    
    // Return object
    
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

function scaleBitmap(bitmap, scaleFactor)
{
    var bitmapWidth = bitmap.getWidth();
    var bitmapHeight = bitmap.getHeight();
    var scaledWidth = bitmapWidth * scaleFactor;
    var scaledHeight = bitmapHeight * scaleFactor;
    return stretchBitmap(bitmap, scaledWidth, scaledHeight);
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
        [ { title: "About Android Comics", action: function() {  } } ];
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