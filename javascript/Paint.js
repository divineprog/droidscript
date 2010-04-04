
//var Morph = from("comikit.droidscript");
//
//var Morph = Packages.comikit.droidscript.Morph;
//
//var common = require("common.js");
//var classes = require("classes.js");


function onCreate(bundle)
{
    var morph = SketchMorph();
    Activity.setContentView(morph);
}

function SketchMorph()
{
    // Java classes
    var MotionEvent = Packages.android.view.MotionEvent;
    var Paint = Packages.android.graphics.Paint;
    var Color = Packages.android.graphics.Color;
    var RectF = Packages.android.graphics.RectF;
    var Point = Packages.android.graphics.Point;
    var Morph = Packages.comikit.droidscript.Morph;
    
    // Instance variables
    var color = Color.WHITE;
    var morph = new Morph(Activity);
    
    // Event handlers
    
    morph.setDrawHandler(function(canvas)
    { 
        paint = new Paint();
        paint.setColor(color);
        paint.setStyle(Paint.Style.FILL);
        paint.setAntiAlias(true);
        canvas.drawOval(
            new RectF(0, 0, 400, 400), 
            paint);
    });
    
//    morph.setMeasureHandler(function(widthMeasureSpec, heightMeasureSpec)
//    {
//        return new Point(400, 400);
//    });
//    
//    morph.setSizeChangedHandler(function(w, h, oldw, oldh)
//    {
//    });
    
    morph.setOnTouchListener(function(view, event)
    {
        var action = event.getAction();
        if (action == MotionEvent.ACTION_DOWN)
        {
            color = Color.BLUE;
            view.invalidate();
        }
        
        if (action == MotionEvent.ACTION_UP)
        {
            color = Color.WHITE;
            view.invalidate();
        }
        
        if (action == MotionEvent.ACTION_MOVE)
        {
            color = Color.RED;
            view.invalidate();
        }
        
        return true;
    });
    
    return morph;
}

/*
public class SketchMorph extends Morph
{
    Bitmap drawing;
    Canvas canvas;
    Point lastPoint;
    
    public SketchMorph(Context context)
    {
        super(context);
        
        // Create drawing area.
        drawing = Bitmap.createBitmap(500, 500, Bitmap.Config.ARGB_8888);
        canvas = new Canvas(drawing);
        Paint paint = new Paint();
        paint.setARGB(255, 255, 255, 255);
        paint.setStyle(Paint.Style.FILL);
        canvas.drawPaint(paint);
        
        // Action handlers.
        drawAction(DrawAction());
        touchDownAction(PaintDot());
        touchMoveAction(PaintStroke());
    }
    
    Action DrawAction()
    {
        return new Action()
        {
            public Object doWith(Object screen)
            {
                asCanvas(screen).drawBitmap(drawing, 0, 0, null);
                return null;
            }
        };
    }
    
    Action PaintDot()
    {
        return new Action()
        {
            public Object doWith(Object event)
            {
                Paint paint = new Paint();
                paint.setColor(Color.BLACK);
                paint.setStyle(Paint.Style.FILL);
                paint.setAntiAlias(true);
                int x = (int) asMotionEvent(event).getX();
                int y = (int) asMotionEvent(event).getY();
                canvas.drawOval(
                    new RectF(x - 10, y - 10, x + 10, y + 10), 
                    paint);
                invalidate();
                lastPoint = new Point(x, y);
                
                return null;
            }
        };
    }
    
    Action PaintStroke()
    {
        return new Action()
        {
            public Object doWith(Object event)
            {
                Paint paint = new Paint();
                paint.setColor(Color.BLACK);
                paint.setStyle(Paint.Style.FILL);
                paint.setAntiAlias(true);
                paint.setStrokeWidth(20);
                paint.setStrokeCap(Paint.Cap.ROUND);
                int x = (int) asMotionEvent(event).getX();
                int y = (int) asMotionEvent(event).getY();
                canvas.drawLine(
                    lastPoint.x, 
                    lastPoint.y, 
                    x, 
                    y, 
                    paint);
                invalidate();
                lastPoint = new Point(x, y);
                
                return null;
            }
        };
    }
}
*/