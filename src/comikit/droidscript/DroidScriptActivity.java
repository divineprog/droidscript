package comikit.droidscript;

import java.util.Collection;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.atomic.AtomicReference;

import org.mozilla.javascript.Context;
import org.mozilla.javascript.EcmaError;
import org.mozilla.javascript.Function;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.ScriptableObject;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.ContextMenu;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.TextView;

/**
 * Activity that has a JavaScript interpreter.
 * 
 * TODO: Make the interpreter run as a Service so that
 * we don't lose interpreter context when app is paused.
 * Or use onRetainNonConfigurationInstance().
 * 
 * @author Mikael Kindborg
 * Email: mikael.kindborg@gmail.com
 * Blog: divineprogrammer@blogspot.com
 * Twitter: @divineprog
 * Copyright (c) Mikael Kindborg 2010
 * Source code license: MIT
 */
public class DroidScriptActivity extends Activity 
{
    Interpreter interpreter;
    String scriptFileName;
    MessageLog messages = new MessageLog();
    
    @Override
    public void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);
        
        createInterpreter();
        
        // Read in the script given in the intent.
        Intent intent = getIntent();
        if (null != intent)
        {
            String filenameOrUrl = intent.getStringExtra("ScriptName");
            String script = intent.getStringExtra("Script");
            if (null != filenameOrUrl) 
            {   
                setScriptFileName(filenameOrUrl);
                openFileOrUrl(filenameOrUrl);
            }
            else
            if (null != script) 
            {   
                eval(script);
            }
        }
        
        // Call the onCreate JavaScript function.
        callJsFunction("onCreate", savedInstanceState);
        
        // We should not have any errors at this point.
        // Check the log and display errors if there are any.
        if (0 < messages.getNumberOfMessages()) 
        {
            showMessages();
        }
    }
    
    @Override
    public void onStart()
    {
        super.onStart();
        callJsFunction("onStart");
    }

    @Override
    public void onRestart()
    {
        super.onRestart();
        callJsFunction("onRestart");
    }
    
    @Override
    public void onResume()
    {
        super.onResume();
        callJsFunction("onResume");
    }
    
    @Override
    public void onPause()
    {
        super.onPause();
        callJsFunction("onPause");
    }
    
    @Override
    public void onStop()
    {
        super.onStop();
        callJsFunction("onStop");
    }
    
    @Override
    public void onDestroy()
    {
        super.onDestroy();
        callJsFunction("onDestroy");
    }
    
    @Override
    public Object onRetainNonConfigurationInstance()
    {
        // TODO: We will need to somehow also allow JS to save
        // data and rebuild the UI. Perhaps record and replay
        // JavaScript statements? Rather than saving the 
        // interpreter state?!
        return interpreter;
    }
    
    @Override
    public void onCreateContextMenu(
            ContextMenu menu, 
            View view, 
            ContextMenu.ContextMenuInfo info)
    {
        callJsFunction("onCreateContextMenu", menu, view, info);
    }

    @Override
    public boolean onContextItemSelected(MenuItem item)
    {
        callJsFunction("onContextItemSelected", item);
        return true;
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu)
    {
        callJsFunction("onCreateOptionsMenu", menu);
        return true;
    }

    @Override
    public boolean onPrepareOptionsMenu(Menu menu)
    {
        callJsFunction("onPrepareOptionsMenu", menu);
        return true;
    }
    
    @Override
    public boolean onOptionsItemSelected(MenuItem item)
    {
         callJsFunction("onOptionsItemSelected", item);
         return true;
    }
    
    public void setScriptFileName(String fileName)
    {
        scriptFileName = fileName;
    }
    
    public String getScriptFileName()
    {
        return scriptFileName;
    }
    
    /**
     * Run a script in the application directory. Less useful since the user 
     * has no access to this area, better to use the SD card.
     */
    public Object openApplicationFile(final String filename)
    {
        try 
        {
            String code = DroidScriptFileHandler.create().readStringFromApplicationFile(this, filename);
            return eval(code);
        } 
        catch (Throwable e) 
        {
            e.printStackTrace();
            logMessage("Error in openApplicationFile: " + e.toString());
            return e;
        }
    }
    
    /**
     * Run a script on the SD card or at an url.
     */
    public Object openFileOrUrl(final String filenameOrUrl)  {
        try 
        {
            return eval(DroidScriptFileHandler.create().readStringFromFileOrUrl(filenameOrUrl));
        } 
        catch (Throwable e) 
        {
            e.printStackTrace();
            logMessage("Error in openApplicationFile: " + e.toString());
            return e;
        }
    }

    public Object eval(final String code)
    {
        final AtomicReference<Object> result = new AtomicReference<Object>(null);
        
        runOnUiThread(new Runnable() 
        {
            public void run() 
            {
                try 
                {
                    //cx = ContextFactory.getGlobal().enterContext(cx);
                    result.set(interpreter.eval(code));
                }
                catch (Throwable e)
                {
                    e.printStackTrace();
                    Log.i("DroidScript", "Error in eval: " + e.toString());
                    logMessage("Error in eval: " + e.toString());
                    result.set(e);
                }
            }
        });
        
        while (null == result.get()) 
        {
            Thread.yield();
        }
        
        return result.get();
    }
    
    /**
     * This works because it is called from the "onXXX" methods which are
     * called in the UI-thread. 
     * TODO: Make interpreter less thread sensitive.
     */
    public Object callJsFunction(String funName, Object... args)
    {
        try 
        {
            return interpreter.callJsFunction(funName, args);
        }
        catch (EcmaError error)
        {
            error.printStackTrace();
            logMessage("Error in callJsFunction: " + error.toString());
            Log.i("JavaScript", "Error on line: " + error.lineNumber() + ": " + error.getLineSource());
            return null;
        }
        catch (Throwable e)
        {
            e.printStackTrace();
            return null;
        }
    }

    void reportEvalError(Throwable e)
    {
        new AlertDialog.Builder(this)
            .setTitle("JavaScript eval error")
            .setMessage(e.toString())
            .setNeutralButton("Close", null)
            .show();
    }
    
    void createInterpreter()
    {
        if (null == interpreter) 
        {
            Object obj = getLastNonConfigurationInstance();
            if (null != obj)
            {
                interpreter = (Interpreter) obj;
                interpreter.setActivity(this);
            }
            else
            {
                interpreter = new Interpreter().setActivity(this);
            }
        }
    }
    
    public void logMessage(String errorMessage) 
    {
        messages.add(errorMessage);
    }
    
    public void clearMessages() 
    {
        messages.clear();
    }
    
    public void showMessages()
    {
        TextView view = new TextView(this);
        view.setText(messages.getMessagesAsString());
        AlertDialog.Builder dialog = new AlertDialog.Builder(this);
        dialog.setTitle(Droid.translate("MESSAGES"));
        dialog.setView(view);
        dialog.setPositiveButton(
            Droid.translate("CLOSE"), 
            new DialogInterface.OnClickListener()
            {
                public void onClick(DialogInterface dialog, int which)
                {
                    // Here we clear all messages.
                    clearMessages();
                }
            });
        dialog.show();
    }
    
    public static class Interpreter
    {
        Context cx;
        Scriptable scope;
        
        public Interpreter()
        {
            // Creates and enters a Context. The Context stores information
            // about the execution environment of a script.
            cx = Context.enter();
            cx.setOptimizationLevel(-1);
            
            // Initialize the standard objects (Object, Function, etc.)
            // This must be done before scripts can be executed. Returns
            // a scope object that we use in later calls.
            scope = cx.initStandardObjects();
        }
        
        public Interpreter setActivity(Activity activity)
        {
            // Set the global JavaScript variable Activity.
            ScriptableObject.putProperty(scope, "Activity", Context.javaToJS(activity, scope));
            return this;
        }
        
        public void exit()
        {
            Context.exit();
        }

        public Object eval(final String code) throws Throwable
        {
            //ContextFactory.enterContext(cx);
            return cx.evaluateString(scope, code, "eval:", 1, null);
        }
        
        public Object callJsFunction(String funName, Object... args) throws Throwable
        {
            Object fun = scope.get(funName, scope);
            if (fun instanceof Function) 
            {
                Log.i("DroidScript", "Calling JsFun " + funName);
                Function f = (Function) fun;
                Object result = f.call(cx, scope, scope, args);
                return Context.toString(result);
            }
            else
            {
                Log.i("DroidScript", "Could not find JsFun " + funName);
                return null;
            }
        }
    }
    
    /**
     * List of log entries.
     */
    public static class MessageLog
    {
        Collection<String> entries = new ConcurrentLinkedQueue<String>();
        
        public Collection<String> getMessages()
        {
            return entries;
        }
        
        public String getMessagesAsString()
        {
            if (0 == entries.size()) 
            {
                return Droid.translate("NO_MESSAGES_TO_DISPLAY");
            }
            
            String messages = "";
            
            for (String s : getMessages())
            {
                messages = s + "\n" + messages;
            }
            
            return messages;
        }
        
        public int getNumberOfMessages()
        {
            return entries.size();
        }
        
        public void add(String message)
        {
            android.util.Log.i("DroidScript", "Adding message: " + message);
            entries.add(message);
        }
        
        public void clear()
        {
            entries.clear();
        }
    }
}
