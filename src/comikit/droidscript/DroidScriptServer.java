package comikit.droidscript;

import java.io.IOException;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.SocketException;
import java.net.URLDecoder;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.List;
import java.util.Locale;

import org.apache.http.Header;
import org.apache.http.HttpEntity;
import org.apache.http.HttpEntityEnclosingRequest;
import org.apache.http.HttpRequest;
import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.entity.ContentProducer;
import org.apache.http.entity.EntityTemplate;
import org.apache.http.impl.DefaultConnectionReuseStrategy;
import org.apache.http.impl.DefaultHttpResponseFactory;
import org.apache.http.impl.DefaultHttpServerConnection;
import org.apache.http.params.BasicHttpParams;
import org.apache.http.params.CoreConnectionPNames;
import org.apache.http.params.CoreProtocolPNames;
import org.apache.http.params.HttpParams;
import org.apache.http.protocol.BasicHttpContext;
import org.apache.http.protocol.BasicHttpProcessor;
import org.apache.http.protocol.HttpContext;
import org.apache.http.protocol.HttpRequestHandler;
import org.apache.http.protocol.HttpRequestHandlerRegistry;
import org.apache.http.protocol.HttpService;
import org.apache.http.protocol.ResponseConnControl;
import org.apache.http.protocol.ResponseContent;
import org.apache.http.protocol.ResponseDate;
import org.apache.http.protocol.ResponseServer;
import org.apache.http.util.EntityUtils;

import android.util.Log;

/**
 * Small http-server that accepts JavaScript PUT requests. 
 * Based on: http://hc.apache.org/
 * 
 * @author Mikael Kindborg
 * Email: mikael.kindborg@gmail.com
 * Blog: divineprogrammer@blogspot.com
 * Twitter: @divineprog
 * Copyright (c) Mikael Kindborg 2010
 * Source code license: MIT
 */
public class DroidScriptServer
{
    static boolean loggingIsOn = true;
    int port = 4042;
    HttpHandler httpHandler;
    ServerThread server;
    
    public interface IRequestHandler
    {
        String handle(String requestType, String uri, String data);
    }

    public static DroidScriptServer create()
    {
        return new DroidScriptServer();
    }

    public static void log(String s)
    {
        if (loggingIsOn)
        {
            Log.i("DroidScriptServer", s);
        }
    }

    public static void setLoggingIsOn(boolean isOn)
    {
        loggingIsOn = isOn;
    }

    private DroidScriptServer()
    {
        httpHandler = new HttpHandler();
    }
    
    public DroidScriptServer setPort(int thePort)
    {
        port = thePort;
        return this;
    }

    public DroidScriptServer setRequestHandler(IRequestHandler handler)
    {
        httpHandler.setHandler(handler);
        return this;
    }

    public DroidScriptServer startServer()
    {
        try
        {
            server = new ServerThread(port, httpHandler);
            new Thread(server).start();
        }
        catch (Exception e)
        {
            e.printStackTrace();
        }
        return this;
    }

    public DroidScriptServer stopServer()
    {
        server.exit();
        return this;
    }

    public static String[] getIpAddresses()
    {
        try 
        {
            List<String> ipaddresses = new ArrayList<String>();
            Enumeration<NetworkInterface> interfaces = NetworkInterface.getNetworkInterfaces(); 
            while (interfaces.hasMoreElements()) 
            {
                NetworkInterface interf = interfaces.nextElement();
                Enumeration<InetAddress> adresses = interf.getInetAddresses(); 
                while (adresses.hasMoreElements()) 
                {
                    InetAddress address = adresses.nextElement();
                    if (!address.isLoopbackAddress()) 
                    {
                        ipaddresses.add(address.getHostAddress().toString());
                    }
                }
            }
            
            if (0 < ipaddresses.size())
            {
                return ipaddresses.toArray(new String[1]);
            }
        } 
        catch (SocketException e) 
        {
            e.printStackTrace();
        }
        return null;
    }

    public static String getIpAddressesAsString()
    {
        String[] ipaddresses = getIpAddresses();
        if (null != ipaddresses) 
        {
            String addresses = "";
            boolean first = true;
            for (String ipaddress : ipaddresses) 
            {
                if (!first) 
                {
                    addresses = addresses + ", ";
                }
                addresses = addresses + ipaddress;
                first = false;
            }
            return addresses;
        }
        return "No ip-addresses found";
    }
    
    static class HttpHandler implements HttpRequestHandler
    {
        IRequestHandler handler;

        public HttpHandler()
        {
        }

        public HttpHandler setHandler(IRequestHandler handler)
        {
            this.handler = handler;
            return this;
        }

        public void handle(HttpRequest request, HttpResponse response, HttpContext context) throws IOException
        {
            log("Request line: " + request.getRequestLine());
            for (Header h : request.getAllHeaders())
            {
                log("Header: " + h.getName() + "=" + h.getValue());
            }

            String method = request.getRequestLine().getMethod().toUpperCase(Locale.ENGLISH);
            if (method.equals("OPTIONS"))
            {
                response.setStatusCode(HttpStatus.SC_OK);
                response.addHeader("Access-Control-Allow-Origin", "*");
                response.addHeader("Access-Control-Allow-Methods", "GET, PUT, OPTIONS");
                response.addHeader("Access-Control-Max-Age", "1728000");
                Header header = request.getFirstHeader("Access-Control-Request-Headers");
                if (null != header)
                {
                    response.addHeader("Access-Control-Allow-Headers", header.getValue());
                }
                
                log("Responding to OPTIONS");
                
                return;
            }

            if (method.equals("PUT"))
            {
                log("Start PUT");

                response.setStatusCode(HttpStatus.SC_OK);
                // response.setStatusCode(HttpStatus.SC_BAD_REQUEST);
                response.addHeader("Access-Control-Allow-Origin", "*");
                response.addHeader("Connection", "close");

                if (request instanceof HttpEntityEnclosingRequest)
                {
                    HttpEntity entity = ((HttpEntityEnclosingRequest) request).getEntity();
                    String content = EntityUtils.toString(entity, "UTF-8");
                    String result = handler.handle("PUT", request.getRequestLine().getUri(), content);
                    response.setEntity(createBody(result));
                }

                log("End PUT");

                return;
            }

            if (method.equals("GET"))
            {
                log("Start GET");

                response.setStatusCode(HttpStatus.SC_OK);
                response.addHeader("Access-Control-Allow-Origin", "*");
                response.addHeader("Connection", "close");

                String result = handler.handle(
                    "GET", 
                    URLDecoder.decode(request.getRequestLine().getUri(), "UTF-8"), 
                    "");

                response.setEntity(createBody(result));

                log("End GET");

                return;
            }
        }

        EntityTemplate createBody(final String text)
        {
            EntityTemplate body = new EntityTemplate(new ContentProducer()
            {
                public void writeTo(final OutputStream outstream) throws IOException
                {
                    OutputStreamWriter writer = new OutputStreamWriter(outstream, "UTF-8");
                    writer.write(text);
                    writer.flush();
                }
            });
            body.setContentType("text/html; charset=UTF-8");
            return body;
        }
    }

    static class ServerThread implements Runnable
    {
        int serverPort;
        HttpParams httpParams;
        HttpService httpService;
        ServerSocket serversocket = null;

        public ServerThread(int port, HttpRequestHandler requestHandler) throws IOException
        {
            serverPort = port;

            // Set HTTP parameters.
            httpParams = new BasicHttpParams()
                .setIntParameter(CoreConnectionPNames.SO_TIMEOUT, 5000)
                .setIntParameter(CoreConnectionPNames.SOCKET_BUFFER_SIZE, 8 * 1024)
                .setBooleanParameter(CoreConnectionPNames.STALE_CONNECTION_CHECK, false)
                .setBooleanParameter(CoreConnectionPNames.TCP_NODELAY, true)
                .setParameter(CoreProtocolPNames.ORIGIN_SERVER, "RhinoDroid/1.1");

            // Set up the HTTP protocol processor.
            BasicHttpProcessor httpProcessor = new BasicHttpProcessor();
            httpProcessor.addInterceptor(new ResponseDate());
            httpProcessor.addInterceptor(new ResponseServer());
            httpProcessor.addInterceptor(new ResponseContent());
            httpProcessor.addInterceptor(new ResponseConnControl());

            // Set up request handler.
            HttpRequestHandlerRegistry reqistry = new HttpRequestHandlerRegistry();
            reqistry.register("*", requestHandler);

            // Set up the HTTP service.
            httpService = new HttpService(httpProcessor, new DefaultConnectionReuseStrategy(),
                new DefaultHttpResponseFactory());
            httpService.setParams(httpParams);
            httpService.setHandlerResolver(reqistry);

            // Create server socket.
            serversocket = new ServerSocket(serverPort);
        }

        public void exit()
        {
            try
            {
                serversocket.close();
            }
            catch (IOException e)
            {
                e.printStackTrace();
            }
        }

        public void run()
        {
            Socket socket = null;
            DefaultHttpServerConnection connection = null;

            // TODO: Kolla hur detta aar gjort i webbservern i kodexemplet:
            // http://svn.apache.org/repos/asf/httpcomponents/httpcore/branches/4.0.x/httpcore/src/examples/org/apache/http/examples/ElementalHttpServer.java

            try
            {
                log("Listening on port " + serversocket.getLocalPort());

                while (!serversocket.isClosed() && !Thread.interrupted())
                {
                    log("Waiting for connection");

                    try
                    {
                        // Set up HTTP connection.
                        socket = serversocket.accept();
                        connection = new DefaultHttpServerConnection();
                        log("Incoming connection from " + socket.getInetAddress());
                        connection.bind(socket, httpParams);

                        while (!serversocket.isClosed() && connection.isOpen() && !Thread.interrupted())
                        {
                            httpService.handleRequest(connection, new BasicHttpContext(null));
                        }

                        log("Exit request handler loop");
                    }
                    catch (Exception e)
                    {
                        e.printStackTrace();
                        // throw e;
                    }
                    finally
                    {
                        log("Closing connection - about to");
                        if (null != connection)
                        {
                            log("Closing connection");
                            connection.close();
                        }
                    }
                }
            }
            catch (Exception e)
            {
                e.printStackTrace();
            }
            finally
            {
                try
                {
                    log("Closing server socket");
                    serversocket.close();
                }
                catch (IOException ignore)
                {
                    ignore.printStackTrace();
                }
            }

            log("Exit server thread");
        }
    }
}

//              
// });
// body.setContentType("text/html; charset=UTF-8");
// response.setEntity(body);

// String method =
// request.getRequestLine().getMethod().toUpperCase(Locale.ENGLISH);
// if (!method.equals("GET") && !method.equals("HEAD") &&
// !method.equals("POST")) {
// throw new MethodNotSupportedException(method + " method not supported");
// }
// String target = request.getRequestLine().getUri();
//
// if (request instanceof HttpEntityEnclosingRequest) {
// HttpEntity entity = ((HttpEntityEnclosingRequest) request).getEntity();
// byte[] entityContent = EntityUtils.toByteArray(entity);
// System.out.println("Incoming entity content (bytes): " +
// entityContent.length);
// }
//            
// final File file = new File(this.docRoot, URLDecoder.decode(target));
// if (!file.exists()) {
//
// response.setStatusCode(HttpStatus.SC_NOT_FOUND);
// EntityTemplate body = new EntityTemplate(new ContentProducer()
// {
// public void writeTo(final OutputStream outstream) throws IOException {
// OutputStreamWriter writer = new OutputStreamWriter(outstream, "UTF-8");
// writer.write("<html><body><h1>");
// writer.write("File ");
// writer.write(file.getPath());
// writer.write(" not found");
// writer.write("</h1></body></html>");
// writer.flush();
// }
// });
// body.setContentType("text/html; charset=UTF-8");
// response.setEntity(body);
// System.out.println("File " + file.getPath() + " not found");
//                
// } else if (!file.canRead() || file.isDirectory()) {
//                
// response.setStatusCode(HttpStatus.SC_FORBIDDEN);
// EntityTemplate body = new EntityTemplate(new ContentProducer() {
//                    
// public void writeTo(final OutputStream outstream) throws IOException {
// OutputStreamWriter writer = new OutputStreamWriter(outstream, "UTF-8");
// writer.write("<html><body><h1>");
// writer.write("Access denied");
// writer.write("</h1></body></html>");
// writer.flush();
// }
//                    
// });
// body.setContentType("text/html; charset=UTF-8");
// response.setEntity(body);
// System.out.println("Cannot read file " + file.getPath());
//                
// } else {
//                
// response.setStatusCode(HttpStatus.SC_OK);
// FileEntity body = new FileEntity(file, "text/html");
// response.setEntity(body);
//                
// }

// static class StreamWriter
// {
// public void write(OutputStream out, String data)
// {
// try
// {
// DataOutputStream stream = new DataOutputStream(out);
// stream.writeChars(data);
// stream.flush();
// }
// catch (Exception e)
// {
// e.printStackTrace();
// }
// }
// }

// static class ServerOld implements Runnable
// {
// Object theActivity;
// Evaluator theEvaluator;
//        
// public ServerOld(Object activity, Evaluator evaluator)
// {
// theActivity = activity;
// theEvaluator = evaluator;
// }
//        
// public void run()
// {
// boolean shutdown = false;
// while (!shutdown)
// {
// print("Welcome to JavaScript on Android!");
// try
// {
// //Evaluator theEvaluator = new Evaluator(theActivity);
// ServerSocket serversocket = new ServerSocket(4042);
//                    
// boolean restart = false;
// while (!restart)
// {
// print("Waiting for connection...");
// Socket socket = serversocket.accept();
// print("Connected!");
//                        
// // Read from socket
// InputStream in = socket.getInputStream();
// OutputStream out = socket.getOutputStream();
// HttpRequest request = new HttpRequest(in);
// request.parseHeader();
// String data = request.readContents();
//                        
// print("data: " + data);
//                        
// if (data.startsWith("restart"))
// {
// restart = true;
// socket.close();
// break;
// }
//                        
// if (data.startsWith("shutdown"))
// {
// restart = true;
// shutdown = true;
// socket.close();
// break;
// }
//                        
// // Evaluate
// Object result = theEvaluator.evalInUiThread(data);
// // Object result = new String("Android here!");
//                        
// // Send reply.
// PrintStream output = new PrintStream(out);
// output.print(result.toString());
// output.close();
// request.close();
// socket.close();
// } // while
//                    
// serversocket.close();
// theEvaluator.exit();
// }
// catch (Exception e)
// {
// e.printStackTrace();
// }
// } // while
// } // run
// } // class Server

