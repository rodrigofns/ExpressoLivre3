<?php

class Webconference_Controller_BigBlueButton
{
    protected $_backend;
    
    
    /**
     * the constructor
     *
     * don't use the constructor. use the singleton 
     */
    private function __construct() {        
//        $this->_applicationName = 'Webconference';
          $this->_backend = new Webconference_Backend_BigBlueButtonApi();
//        $this->_currentAccount = Tinebase_Core::getUser();   
    }
    
    /**
     * holds the instance of the singleton
     *
     * @var Webconference_Controller_ExampleRecord
     */
    private static $_instance = NULL;
    
    /**
     * the singleton pattern
     *
     * @return Webconference_Controller_ExampleRecord
     */
    public static function getInstance() 
    {
        if (self::$_instance === NULL) {
            self::$_instance = new Webconference_Controller_BigBlueButton();
        }
        
        return self::$_instance;
    } 
    
    private function _createRoomName()
    {
        return Tinebase_Core::getUser()->accountLoginName;
    }
    
    /**
	*This method creates a meeting
	*
	*@param username
	*@param roomName -- the unique meeting identifier used to store the meeting in the bigbluebutton server
	*@param welcomeString -- the welcome message to be displayed when a user logs in to the meeting
	*@param mPW -- the moderator password of the meeting
	*@param aPW -- the attendee password of the meeting
	*@param SALT -- the security salt of the bigbluebutton server
	*@param URL -- the url of the bigbluebutton server
	*@param logoutURL -- the url the user should be redirected to when they logout of bigbluebutton
	*
     
     */
    private function _createRoom($username, $roomName, $welcomeString, $mPW, $aPW, $salt, $url, $logoutUrl )
    {
        $ret = $this->_backend->createMeetingArray($username, $roomName,  $welcomeString, $mPW, $aPW, $salt, $url, $logoutUrl );
                
        if(!$ret)
        {
            throw  new Tinebase_Exception_NotFound('Pau geral, servidor nao respondeu.');
        }
	$ret = (object)$ret;
	if($ret->returncode == 'FAILED')
        {
            throw  new Tinebase_Exception_NotFound("Erro ({$ret->messageKey}): {$ret->message}");
        }
/*		
	else if($ret->returncode == 'SUCCESS' && $ret->messageKey == 'duplicateWarning')
        {
            throw  new Tinebase_Exception_Duplicate("Já existe uma sala chamada \"{$ret->meetingID}\", escolha outro nome.");
        }
*/        
        return $this->_joinRoom($roomName, $username, $mPW, $salt, $url);
        
        
        
    }
   
    
    private function _joinRoom($roomName, $username, $pw, $salt, $url)
    {
        return $this->_backend->joinURL($roomName, $username, $pw, $salt, $url);
    }
    
    private function _getBigBlueButtonConfig()
    {
        return Webconference_Controller_WebconferenceConfig::getInstance()->loadWebconferenceConfig();
    }
    
    public function createRoom()
    {
        $config = $this->_getBigBlueButtonConfig();
        $config = (object) $config;
        
        $salt = $config->salt;
        $url = $config->url;
        $mPW = 'serpromod';
        $aPW = 'serpro';
        $logoutUrl = 'http://localhost';
        
        return $this->_createRoom(
                Tinebase_Core::getUser()->accountFullName, 
                $this->_createRoomName(), 
                'Welcome to the Webconference', 
                $mPW, 
                $aPW, 
                $salt, 
                $url, 
                $logoutUrl
                );
    }
    
    
    
    
    
    /**
     * generates a randomstrings of given length
     *
     * @param int $_length
     */
    private function _getRandomString($_length)
    {
        $chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        
        $randomString = '';
        for ($i=0; $i<(int)$_length; $i++) {
            $randomString .= $chars[mt_rand(1, strlen($chars)) -1];
        }
        
        return $randomString;
    }
}
