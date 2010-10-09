package comikit.droidscript;

import java.io.IOException;
import java.io.Serializable;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.BufferedReader;

import org.mozilla.javascript.Context;
import org.mozilla.javascript.commonjs.module.provider.*;
import org.mozilla.javascript.ScriptRuntime;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.ScriptableObject;
import org.mozilla.javascript.commonjs.module.*;

import android.app.Activity;


public class DroidScriptAssetProvider implements ModuleScriptProvider, Serializable 
{
	private Activity activity;
	private Context context;
	
	DroidScriptAssetProvider(Activity a) 
	{
		activity = a;
	}
	
    public ModuleScript getModuleScript(Context context, String moduleId, Scriptable paths) throws Exception 
    {
		// activity.getAssets()
		try {
			InputStream stream = DroidScriptIO.create().openAssetFileInputStream(activity, moduleId + ".js");
			BufferedReader reader = new BufferedReader(new InputStreamReader(stream));
			//ModuleSource source = new ModuleSource(reader, null, moduleId, null);
	        return new ModuleScript( context.compileReader(reader, moduleId, 1, null), moduleId);	
		} 
		catch(Exception e) {
            throw e;
        }
	}
}