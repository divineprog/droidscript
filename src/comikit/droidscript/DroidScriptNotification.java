package comikit.droidscript;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.Gravity;
import android.widget.TextView;

/**
 * Activity that displays a notification message.
 * 
 * @author Mikael Kindborg
 * Email: mikael.kindborg@gmail.com
 * Blog: divineprogrammer@blogspot.com
 * Twitter: @divineprog
 * Copyright (c) Mikael Kindborg 2010
 * Source code license: MIT
 */
public class DroidScriptNotification extends Activity
{
    TextView view;
    
    @Override
    public void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);
        
        view = new TextView(this);
        view.setGravity(Gravity.TOP);
        view.setTextSize(20);
        
        this.setContentView(view);
    }
    
    @Override
    public void onResume()
    {
        super.onResume();        
        
        String text = "The message was not specified.";
        
        Intent intent = getIntent();
        if (null != intent)
        {
            String message = intent.getStringExtra("NotificationMessage");
            if (null != message) 
            {   
                text = message;
                Log.i("DroidScript", "IntentExtra=" + text);
            }
        }
        
        view.setText(text);
    }
}
