package comikit.droidscript;

import java.util.HashMap;
import java.util.Map;

/**
 * Central place to store info.
 * 
 * @author Mikael Kindborg
 * Email: mikael.kindborg@gmail.com
 * Blog: divineprogrammer@blogspot.com
 * Twitter: @divineprog
 * Copyright (c) Mikael Kindborg 2010
 * Source code license: MIT
 */
public class Droid
{
    public static LanguageDictionary Dictionary = new LanguageDictionary();
    
    public static String translate(String key)
    {
        return Dictionary.get(key);
    }
    
    /**
     * Dictionary for translations.
     */
    public static class LanguageDictionary
    {
        Map<String, Map<String, String>> dictionary;
        String currentLanguage = "EN";
        
        public void setCurrentLanguage(String languageCode)
        {
            currentLanguage = languageCode;
        }
          
        /**
         * This should be moved to an external downloadable file.
         * I don't want to hard-code translations into the app,
         * they should be updatable over the internet. This will
         * make it possible to add languages without redistribute
         * the Java application.
         */
        public void createDictionary() 
        {
             dictionary = new HashMap<String, Map<String, String>>();
             
             addTranslations(
                 "EN", // Language code
                 "OK", "Ok",
                 "UPDATE", "Update",
                 "OPEN", "Open",
                 "CLOSE", "Close",
                 "CANCEL", "Cancel",
                 "MESSAGES", "Messages",
                 "NO_MESSAGES_TO_DISPLAY", "No messages to display",
                 "EVALUATE", "Evaluate",
                 "RUN", "Run",
                 "RUN_AS_ACTIVITY", "Run Activity",
                 "OPEN_SCRIPT", "Open script",
                 "START_SERVER", "Start server",
                 "STOP_SERVER", "Stop server",
                 "SHOW_MESSAGES", "Messages",
                 "UPDATE_APP_SCRIPTS", "Update",
                 "THIS_WILL_OVERWRITE_ALL_APP_SCRIPTS", "This will overwrite all application scripts!",
                 "ENTER_FILE_OR_URL", "Enter file or url:",
                 "UPDATE_APP_SCRIPTS_DONE", "Update complete!",
                 "UPDATE_APP_SCRIPTS_DONE_RESTART", "Restart the application to make changes take effect",
                 "QUIT_APP", "Quit",
                 "CLOSE", "Close",
                 "BE_KIND", "Be kind",
                 "BE_KIND_MESSAGE", "Be a kind person"
             );
        }
        
        public String get(String key)
        {
            if (null == dictionary)
            {
                createDictionary();
            }
            
            String value = dictionary.get(currentLanguage).get(key);
            if (null == value)
            {
                return key;
            }
            return value;
        }
    
        public void addTranslations(String languageCode, String... keyValuePairs) 
        {
            if (null == dictionary.get(languageCode))
            {
                dictionary.put(languageCode, new HashMap<String, String>());
            }
            
            for (int i = 0; i < keyValuePairs.length; i += 2)
            {
                dictionary.get(languageCode).put(keyValuePairs[i], keyValuePairs[i + 1]);
            }
        }
    }
}
