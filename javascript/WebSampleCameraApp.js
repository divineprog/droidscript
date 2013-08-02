function onCreate(bubble)
{
    var WebView = Packages.android.webkit.WebView;

    var webview = new WebView(Activity);
    webview.getSettings().setJavaScriptEnabled(true);
    webview.addJavascriptInterface(Activity, "activity");
    Activity.setContentView(webview);    
    
    var content =
    """<html>
        <body>
            <script>
            function startCameraActivity() {
                var code = document.getElementById("CameraActivity").innerHTML;
                activity.eval(code); }
            </script>
            <h1>Camera Demo</h1>
            <input 
                type="button" 
                value="Launch Camera Demo" 
                onclick="startCameraActivity()">
            
            <div id="CameraActivity">
            var Camera = Packages.android.hardware.Camera;
            var SurfaceHolder = Packages.android.view.SurfaceHolder;
            var SurfaceView = Packages.android.view.SurfaceView;
            var Window = Packages.android.view.Window;

            function onCreate(bundle) 
            {
                Activity.requestWindowFeature(Window.FEATURE_NO_TITLE);
                var preview = createPreviewSurface();
                Activity.setContentView(preview.getSurfaceView());
            }

            function createPreviewSurface()
            {
                var camera = null;
                var surface = new SurfaceView(Activity);
                
                var object = {
                    
                    getSurfaceView : function() { 
                        return surface; },
                        
                    surfaceCreated : function(holder) {
                        camera = Camera.open();
                        try {
                            camera.setPreviewDisplay(holder); } 
                        catch (exception) {
                            camera.release();
                            camera = null; } },
                            
                    surfaceDestroyed : function(holder) {
                        camera.stopPreview();
                        camera.release();
                        camera = null; },
                        
                    surfaceChanged : function(holder, format, w, h) {
                        var parameters = camera.getParameters();
                        parameters.setPreviewSize(w, h);
                        camera.setParameters(parameters);
                        camera.startPreview(); }
                };
             
                var callback = createInstance(Packages.android.view.SurfaceHolder.Callback, object);
                surface.getHolder().addCallback(callback);
                surface.getHolder().setType(SurfaceHolder.SURFACE_TYPE_PUSH_BUFFERS);

                return object;
            }

            function createInstance(javaInterface, object)
            {
                // Convert a Java array to a JavaScript array
                function javaArrayToJsArray(javaArray)
                {
                    var jsArray = [];
                    for (i = 0; i < javaArray.length; ++i) {
                        jsArray[i] = javaArray[i];
                    }
                    return jsArray;
                }
                
                var lang = Packages.java.lang;
                var interfaces = lang.reflect.Array.newInstance(lang.Class, 1);
                interfaces[0] = javaInterface;
                var obj = lang.reflect.Proxy.newProxyInstance(
                    lang.ClassLoader.getSystemClassLoader(),
                    interfaces,
                    // Note, args is a Java array
                    function(proxy, method, args) {
                        // Convert Java array to JavaScript array
                        return object[method.getName()].apply(
                            null,
                            javaArrayToJsArray(args));
                    });
                return obj;
            }
            </div>
        </body>
    </html>""";
    
    webview.loadData(content, "text/html", "utf-8");
}