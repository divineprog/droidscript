package comikit.droidscript;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Point;
import android.view.View;

/**
 * View that has "pluggable" handlers for callbacks. Reduces the need for subclassing View.
 * @author Mikael Kindborg
 * Email: mikael.kindborg@gmail.com
 * Blog: divineprogrammer@blogspot.com
 * Twitter: @divineprog
 * Copyright (c) Mikael Kindborg 2010
 * Source code license: MIT
 */
public class Morph extends View
{
    DrawHandler drawHandler;
    MeasureHandler measureHandler;
    SizeChangedHandler sizeChangedHandler;
    
    public Morph(Context context)
    {
        super(context);
    }
    
    public Morph setDrawHandler(DrawHandler handler) 
    { 
        this.drawHandler = handler; 
        return this; 
    }
    
    public Morph setMeasureHandler(MeasureHandler handler) 
    { 
        this.measureHandler = handler; 
        return this; 
    }
    
    public Morph setSizeChangedHandler(SizeChangedHandler handler) 
    { 
        this.sizeChangedHandler = handler; 
        return this; 
    }
    
    @Override
    protected void onDraw(Canvas canvas)
    {
        super.onDraw(canvas);
        if (null != drawHandler) { drawHandler.draw(canvas); }
    }
    
    @Override
    protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec)
    {
        // View.MeasureSpec.AT_MOST      The child can be as large as it wants up to the specified size.
        // View.MeasureSpec.EXACTLY      The parent has determined an exact size for the child.
        // View.MeasureSpec.UNSPECIFIED  The parent has not imposed any constraint on the child.
        if (null != measureHandler) 
        {
            Point p = measureHandler.measure(widthMeasureSpec, heightMeasureSpec);
            setMeasuredDimension(p.x, p.y); 
        }
        else 
        {
            super.onMeasure(widthMeasureSpec, heightMeasureSpec); 
        }
    }
     
    @Override
    protected void onSizeChanged(int w, int h, int oldw, int oldh)
    {
        if (null != sizeChangedHandler) { sizeChangedHandler.sizeChanged(w, h, oldw, oldh); }
    }
    
    public interface DrawHandler 
    {
        void draw(Canvas canvas);
    }
    
    public interface MeasureHandler 
    {
        Point measure(int widthMeasureSpec, int heightMeasureSpec);
    }
    
    public interface SizeChangedHandler 
    {
        void sizeChanged(int w, int h, int oldw, int oldh);
    }
}
