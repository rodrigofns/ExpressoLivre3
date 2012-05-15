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
        $pdo = new PDO('mysql:host=localhost;dbname=expresso', 'root', '12345');
        $sql = "SELECT sessionid, ip
                FROM tine20_access_log
                WHERE login_name = :login and
                      date(li) = date(now()) and lo is null";
        $st = $pdo->prepare($sql);
        $st->bindParam(':login', $_login, PDO::PARAM_STR);
        $st->execute();
        $user_session = $st->fetch(PDO::FETCH_OBJ);
        
        return array(
            'pwd' => $user_session->sessionid,
            'ip'  => $user_session->ip
        );
    }
    
}