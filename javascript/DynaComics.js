//
// Dynamic Comics Demo
//
// @author Mikael Kindborg
// Email: mikael.kindborg@gmail.com
// Blog: divineprogrammer@blogspot.com
// Twitter: @divineprog
// Copyright (c) Mikael Kindborg 2010
// Source code license: MIT
//

// Java classes

var Paint = Packages.android.graphics.Paint;
var Color = Packages.android.graphics.Color;
var Rect = Packages.android.graphics.Rect;
var RectF = Packages.android.graphics.RectF;
var Point = Packages.android.graphics.Point;
var Bitmap = Packages.android.graphics.Bitmap;
var BitmapFactory = Packages.android.graphics.BitmapFactory;
var Canvas = Packages.android.graphics.Canvas;
var Menu = Packages.android.view.Menu;
var MotionEvent = Packages.android.view.MotionEvent;
var WindowManager = Packages.android.view.WindowManager;
var Window = Packages.android.view.Window;
var ActivityInfo = Packages.android.content.pm.ActivityInfo;
var Toast = Packages.android.widget.Toast;
var MediaStore = Packages.android.provider.MediaStore;
var Morph = Packages.comikit.droidscript.Morph;
var DroidScriptFileHandler = Packages.comikit.droidscript.DroidScriptFileHandler;
    
// Global variables

var PanoMorph;
var OptionsMenuItems;
var VisiblePanel = 0;
var Panels = [
    "PanoStrip01.jpg",
    "PanelPano001.jpg",
    "Panel001.jpg",
    "Panel002.jpg",
    "PanelPano001.jpg",
    "Panel003.jpg",
    "Panel004.jpg",
    "Panel005.jpg",
    "Panel006.jpg",
    "Panel007.jpg"
    ];

function onCreate(bundle)
{
    Activity.setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE);
    Activity.requestWindowFeature(Window.FEATURE_NO_TITLE);
    Activity.getWindow().setFlags(
        WindowManager.LayoutParams.FLAG_FULLSCREEN, 
        WindowManager.LayoutParams.FLAG_FULLSCREEN);

    var stripData = {
        stripWidth: 5612,
        stripHeight: 480,
        sliceWidth: 200,
        stripBasePath: "droidscript/comics/PanoDemoStrip"
    };
    PanoMorph = createPanoMorph(stripData);

    Activity.setContentView(PanoMorph.theMorph);
}

function createPanoMorph(stripData)
{
    // Local variables

    var morph = new Morph(Activity);
    var stripBasePath = stripData.stripBasePath;
    var slices = [];
    var panelX = 0;
    var panelWidth = 100;
    var panelHeight = 100;
    var originalStripWidth = stripData.stripWidth;
    var originalStripHeight = stripData.stripHeight;
    var originalSliceWidth = stripData.sliceWidth;
    var stripWidth = 0;
    var stripHeight = 0;
    var sliceWidth = 0;
    var scaleFactor = 1;
    var touchDownPosition = 0;
    var touchLastPosition = 0;
    var touchStartTime = 0;
    var touchIsActive = false;
    var readyToDraw = false;
    
    // Private methods
    
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
        
        log("SliceWidth=" + sliceWidth);
        for (var i = index1; i <= index2; ++i) {
            var x = sliceX(i) - panelX;
            var bitmap = sliceBitmap(i);
            if (null != bitmap) {
                log("drawBitmap: " + x + " " + bitmap.getWidth() + " " + bitmap.getHeight());
                canvas.drawBitmap(bitmap, x, 0, null); 
            }
            x += sliceWidth;
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
        stripWidth = originalStripWidth * scaleFactor;
        stripHeight = originalStripHeight * scaleFactor;
        sliceWidth = originalSliceWidth * scaleFactor;
        log("panelWidth: " + panelWidth + " typeof: " + typeof(panelWidth));
        log("Scale factor: " + scaleFactor);
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
                panelX += delta;
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

function createFlipMorph()
{
    // Local variables
    
    var morph = new Morph(Activity);
    var panelWidth = 100;
    var panelHeight = 100;
    var panelBitmap = null;
    var panoPosition = 0;
    var touchDownPosition = 0;
    var touchLastPosition = 0;
    var touchStartTime = 0;
    var touchIsActive = false;
    var isPanoramaPanel = false;
    
    //var AnimationUtils = android.view.animation.AnimationUtils;
    //animation = AnimationUtils.makeInAnimation(Activity, false);
    // Use ViewFlipper or View Anim
    
    // Event handlers
    
    morph.setOnDrawListener(function(canvas)
    {
        if (null != panelBitmap) {
            canvas.drawBitmap(panelBitmap, panoPosition, 0, null); }
    });
    
    morph.setOnSizeChangedListener(function(w, h, oldw, oldh)
    {
        panelWidth = w;
        panelHeight = h;
        log("Show panel");
        openPanel(VisiblePanel);
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
            if (touchIsActive && isPanoramaPanel) {
                var delta = (x - touchLastPosition) / 2;
                panoPosition += delta;
                if (panoPosition < panelWidth - panelBitmap.getWidth()) {
                    nextPanel(); 
                    touchIsActive = false; }
                if (panoPosition > 0) {
                    previousPanel(); 
                    touchIsActive = false; }
                touchLastPosition = x;
            }
            else 
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
    
    // Local functions

    function nextPanel()
    {
        log("Next panel: " + VisiblePanel);
        VisiblePanel += 1;
        if (VisiblePanel >= Panels.length) {
            VisiblePanel = Panels.length - 1; }
        openPanel(VisiblePanel);
        panoPosition = 0;
    }

    function previousPanel()
    {
        log("Next panel: " + VisiblePanel);
        VisiblePanel -= 1;
        if (VisiblePanel < 0) {
            VisiblePanel = 0; }
        openPanel(VisiblePanel);
        panoPosition = 0;
        if (isPanoramaPanel && VisiblePanel > 0) {
            panoPosition = panelWidth - panelBitmap.getWidth(); }
    }
    
    function openPanel(panelIndex)
    {
        var fileName = "droidscript/comics/" + Panels[panelIndex];
        if (null != panelBitmap) { panelBitmap.recycle(); }
        panelBitmap = scaleBitmap(readBitmap(fileName));
    }
        
    function scaleBitmap(bitmap)
    {
        var bitmapWidth = bitmap.getWidth();
        var bitmapHeight = bitmap.getHeight();
        var bitmapAspectRatio = bitmapWidth / bitmapHeight;
        //var displayAspectRatio = panelWidth / panelHeight;
        
        // Is the bitmap in panorama format?
        isPanoramaPanel = bitmapAspectRatio > 2;
        
        if (isPanoramaPanel) {
            var scaleFactor = panelHeight / bitmapHeight;
            var scaledWidth = bitmapWidth * scaleFactor;
            var scaledHeight = bitmapHeight * scaleFactor;
            var sourceRect = new Rect(0, 0, bitmapWidth - 1, bitmapHeight - 1);
            var destRect = new Rect(0, 0, scaledWidth - 1, scaledHeight - 1);  
            var scaledBitmap = Bitmap.createBitmap(scaledWidth, scaledHeight, Bitmap.Config.ARGB_8888);
            var scaledCanvas = new Canvas(scaledBitmap);
            var paint = new Paint();
            paint.setStyle(Paint.Style.FILL);
            paint.setARGB(255, 255, 0, 255);
            scaledCanvas.drawPaint(paint);
            scaledCanvas.drawBitmap(bitmap, sourceRect, destRect, paint);
            scaledCanvas.drawText("PANORAMA", 20, 20, paint);
            bitmap.recycle();
            return scaledBitmap; }
        else {
            var sourceRect = new Rect(0, 0, bitmapWidth - 1, bitmapHeight - 1);
            var destRect = new Rect(0, 0, panelWidth - 1, panelHeight - 1);  
            var scaledBitmap = Bitmap.createBitmap(panelWidth, panelHeight, Bitmap.Config.ARGB_8888);
            var scaledCanvas = new Canvas(scaledBitmap);
            var paint = new Paint();
            paint.setStyle(Paint.Style.FILL);
            paint.setARGB(255, 255, 255, 255);
            scaledCanvas.drawPaint(paint);
            scaledCanvas.drawBitmap(bitmap, sourceRect, destRect, paint);
            scaledCanvas.drawText("FLIP", 20, 20, paint);
            bitmap.recycle();
            return scaledBitmap; }
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
            
    //  try {
    //      out = DroidScriptFileHandler.create().openExternalStorageFileOutputStream(filename()));
    //      bitmap.compress(Bitmap.CompressFormat.PNG, 90, out); } 
    //  catch (error) {
    //      showToast("Could not save image"); }
    
    function showToast(message)
    {
        Toast.makeText(
            Activity,
            message,
            Toast.LENGTH_SHORT).show();
    }
    
    // Return object
    
    return {
        theMorph: morph
    };
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