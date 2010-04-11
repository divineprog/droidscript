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
            function showToast(message) {
                activity.eval(
                    "var Toast = Packages.android.widget.Toast;" +
                    "Toast.makeText(Activity, '" + message + "', " +
                    "Toast.LENGTH_SHORT).show();"); }
            </script>
            <h1>Hello World</h1>
            <form>
                <input 
                    type="button" 
                    value="Take pill" 
                    onclick="showToast('You took the red pill!')">
            </form>
        </body>
    </html>""";
    
    webview.loadData(content, "text/html", "utf-8");
}
