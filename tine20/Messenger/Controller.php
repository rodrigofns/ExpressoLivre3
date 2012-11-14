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
    
}