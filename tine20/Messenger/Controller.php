<?php

class Messenger_Controller extends Tinebase_Controller_Event
{
    /**
     * holds the instance of the singleton
     *
     * @var Messenger_Controller
     */
    private static $_instance = NULL;

    /**
     * constructor (get current user)
     */
    private function __construct()
    {
    }
    
    /**
     * don't clone. Use the singleton.
     *
     */
    private function __clone() 
    {        
    }
    
    /**
     * the singleton pattern
     *
     * @return Felamimail_Controller
     */
    public static function getInstance() 
    {
        if (self::$_instance === NULL) {
            self::$_instance = new Messenger_Controller;
        }
        
        return self::$_instance;
    }
    
    /**
     *
     * @return JSON_Array
     */
    public function getLocalServerInfo($_login)
    {
        return array(
            'ip' => $_SERVER['SERVER_ADDR']
        );
    }
    
    /**
     *
     * @return JSON_Array
     */
    public function getEmoticons($_chatID)
    {
        $emoticons_path = '/images/messenger/emoticons';
        $path = dirname(__FILE__) . '/..' . $emoticons_path;
        $xml = file_get_contents($path . '/emoticons.xml');
        $emoticons_translations = new SimpleXMLElement($xml);
        
        $emoticons = array();
        $archives = new DirectoryIterator($path);
        foreach ($archives as $archive)
        {
            if ($archive->isFile() && $archive->getExtension() == 'png')
            {
                $name = $archive->getBasename('.' . $archive->getExtension());
                $text = $emoticons_translations->xpath("//emoticon[@file='" . $name . "']");
                $text = (string)$text[0]->string[0];
                $emoticons[] = array(
                    'name' => $name,
                    'file' => $emoticons_path . '/' . $archive->getBasename(),
                    'text' => $text
                );
            }
        }
        
        return array(
            'chatID'    => $_chatID,
            'emoticons' => $emoticons
        );
    }
    
}