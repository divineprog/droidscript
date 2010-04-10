package comikit.droidscript;

import android.content.Intent;
import android.os.Bundle;

/**
 * Main activity for the DroidScript application.
 * 
 * @author Mikael Kindborg
 * Email: mikael.kindborg@gmail.com
 * Blog: divineprogrammer@blogspot.com
 * Twitter: @divineprog
 * Copyright (c) Mikael Kindborg 2010
 * Source code license: MIT
 */
public class DroidScriptApp extends DroidScriptActivity
{ 
    @Override
    public void onCreate(Bundle savedInstanceState)
    {
        installApplicationFiles();
        
        Intent intent = getIntent();
        if (null != intent)
        {
            intent.putExtra("ScriptName", "droidscript/DroidScriptApp.js");
        }
        
        super.onCreate(savedInstanceState);
    }
    
    /**
     * Use GitHub files for now.
     */
    public String[][] applicationFiles() 
    {
        String urlBase = "http://github.com/divineprog/droidscript/raw/master/";
        return new String[][]
        {
            { "droidscript/DroidScriptApp.js", urlBase + "javascript/DroidScriptApp.js" },
            { "droidscript/DroidScriptServer.js", urlBase + "javascript/DroidScriptServer.js" },
            { "droidscript/Hello.js", urlBase + "javascript/Hello.js" },
            { "droidscript/Toast.js", urlBase + "javascript/Toast.js" },
            { "droidscript/Colors.js", urlBase + "javascript/Colors.js" },
            { "droidscript/Paint.js", urlBase + "javascript/Paint.js" }
        };
    }
    
    /**
     * Install files external to the core application if they are not 
     * already installed.
     */
    public void installApplicationFiles()
    {
        try
        {
            String droidScriptDirectory = "droidscript";
            
            DroidScriptFileHandler handler = DroidScriptFileHandler.create(); 
            
            // Create the droidscript directory if it does not exist.
            if (!handler.externalStorageFileExists(droidScriptDirectory))
            {
                handler.externalStorageCreateDirectory(droidScriptDirectory);
            }
            
            for (String[] entry : applicationFiles())
            {
                if (!handler.externalStorageFileExists(entry[0])) 
                {
                    handler.installFile(entry[0], entry[1]);   
                }
            }
        } 
        catch (Exception e)
        {
            reportError(e);
        }
    }
    
    /**
     * Reinstall (overwrite) external application files.
     * This will overwrite user modifications to these files.
     */
    public void reinstallApplicationFiles()
    {
        try
        {
            DroidScriptFileHandler handler = DroidScriptFileHandler.create();
            for (String[] entry : applicationFiles())
            {
                handler.installFile(entry[0], entry[1]);
            }
        } 
        catch (Exception e)
        {
            reportError(e);
        }
    }
}
