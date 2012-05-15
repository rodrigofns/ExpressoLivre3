<?php

/**
 * Controller for webconference
 * @package     Webconference
 * @subpackage  Controller
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Edgar de Lucca <edgar.lucca@serpro.gov.br>, Marcelo Teixeira <marcelo.teixeira@serpro.gov.br>
 * @copyright   Copyright (c) 2007-2010 Metaways Infosystems GmbH (http://www.metaways.de)
 * 
 */
define('MODERATOR_PW', 'moderatorpw');
define('ATTENDEE_PW', 'attendeepw');

class Webconference_Controller_BigBlueButton 
{

    protected $_backend;

    /**
     * the constructor
     *
     * don't use the constructor. use the singleton 
     */
    private function __construct() 
    {
        $this->_backend = new Webconference_Backend_BigBlueButtonApi();
    }

    /**
     * holds the instance of the singleton
     * 
     * @var Webconference_Controller_BigBlueButton
     */
    private static $_instance = NULL;

    /**
     * the singleton pattern
     * 
     * @return Webconference_Controller_BigBlueButton
     */
    public static function getInstance() 
    {
        if (self::$_instance === NULL) 
        {
            self::$_instance = new Webconference_Controller_BigBlueButton();
        }
        return self::$_instance;
    }

    /**
     * create room name
     * 
     * @return String room name 
     */
    private function _createRoomName() {
        return Tinebase_Core::getUser()->accountLoginName;
    }
    
    private function _joinUrl($roomName, $username, $mPW, $salt, $url)
    {
        return (object)array(
            bbbUrl => $this->_backend->joinURL($roomName, $username, $mPW, $salt, $url),
            roomName => $roomName
        );
    }

    /**
     * This method creates a meeting
     * 
     * @param username
     * @param roomName -- the unique meeting identifier used to store the meeting in the bigbluebutton server
     * @param welcomeString -- the welcome message to be displayed when a user logs in to the meeting
     * @param mPW -- the moderator password of the meeting
     * @param aPW -- the attendee password of the meeting
     * @param SALT -- the security salt of the bigbluebutton server
     * @param URL -- the url of the bigbluebutton server
     * @param logoutURL -- the url the user should be redirected to when they logout of bigbluebutton
     * @return String -- URL of the meeting
     */
    private function _createRoom($username, $roomName, $welcomeString, $mPW, $aPW, $salt, $url, $logoutUrl) 
    {
        $ret = $this->_backend->createMeetingArray($username, $roomName, $welcomeString, $mPW, $aPW, $salt, $url, $logoutUrl);

        if (!$ret) 
        {
            throw new Tinebase_Exception_NotFound('ERROR (the big blue button server is unreachable)');
        }
        $ret = (object) $ret;
        if ($ret->returncode == 'FAILED') {
            throw new Tinebase_Exception_NotFound("Error ({$ret->messageKey}): {$ret->message}");
        }
        return $this->_joinURL($roomName, $username, $mPW, $salt, $url);
    }

    private function _getBigBlueButtonConfig() {
        return Webconference_Controller_WebconferenceConfig::getInstance()->loadWebconferenceConfig();
    }

    /**
     * This method creates a new meeting
     * 
     * @return String -- URL of the meeting
     */
    public function createRoom() 
    {
        $config = $this->_getBigBlueButtonConfig();
        $config = (object) $config;

        $salt = $config->salt;
        $url = $config->url;
        $mPW = MODERATOR_PW;
        $aPW = ATTENDEE_PW;
        $logoutUrl = 'http://localhost';
        $welcomeString = 'Welcome to the Webconference by ' . Tinebase_Core::getUser()->accountFullName;
        $username = Tinebase_Core::getUser()->accountFullName;
        $roomName = $this->_createRoomName();
        
        return $this->_createRoom($username, $roomName, $welcomeString, $mPW, $aPW, $salt, $url, $logoutUrl);
    }

    /**
     * Join the room meeting
     * 
     * @param String $roomName -- the meeting identifier used to store the meeting in the bigbluebutton server
     * @param String $username -- the user name.
     * @param Boolean $moderator -- is moderator in meeting
     * @return String -- URL of the meeting
     */
    public function joinRoom($roomName, $moderator, $userName = null) 
    {
        $config = $this->_getBigBlueButtonConfig();
        $config = (object) $config;
        $salt = $config->salt;
        $url = $config->url;
        if (is_null($userName))
        {
            $userName = Tinebase_Core::getUser()->accountFullName;
        }
        if ($moderator) {
            $pw = MODERATOR_PW;
        } else {
            $pw = ATTENDEE_PW;
        }
        //Tinebase_Core::getSession()->webconferenceRoomName = $roomName;
        return (object) array(
            bbbUrl => $this->_joinURL($roomName, $userName, $pw, $salt, $url),
            roomName => $roomName
        );
    }

    /**
     * This method calls getMeetings on the bigbluebutton server, then calls getMeetingInfo for each meeting and concatenates the result.
     *
     * @return
     *	- Null if the server is unreachable
     *	- If FAILED then returns an array containing a returncode, messageKey, message.
     *	- If SUCCESS then returns an array of all the meetings. Each element in the array is an array containing a meetingID,
                moderatorPW, attendeePW, hasBeenForciblyEnded, running.
     */
    public function getMeetings() 
    {
        $config = $this->_getBigBlueButtonConfig();
        $config = (object) $config;
        $salt = $config->salt;
        $url = $config->url;
        return $this->_backend->getMeetingsArray($url, $salt);
    }
    
    //------------------------------------------------Other Methods------------------------------------
    /**
     * This method calls end meeting on the specified meeting in the bigbluebutton server.
     *
     * @param roomName -- the unique meeting identifier used to store the meeting in the bigbluebutton server
     * @param moderatorPassword -- the moderator password of the meeting
     * @return
     *	- Null if the server is unreachable
     * 	- An array containing a returncode, messageKey, message.
     */    
    public function endMeeting($roomName, $moderatorPassword)
    {
        if ($moderatorPassword == null)
        {
            $moderatorPassword = MODERATOR_PW;
        }
        $config = $this->_getBigBlueButtonConfig();
        $config = (object) $config;
        $salt = $config->salt;
        $url = $config->url; 
        return $this->_backend->endMeeting($roomName, $moderatorPassword, $url, $salt);  
    }
    
    /**
     * This method returns an array of the attendees in the specified meeting.
     *
     * @param roomName -- the unique meeting identifier used to store the meeting in the bigbluebutton server
     * @param moderatorPassword -- the moderator password of the meeting
     * @return
     *	- Null if the server is unreachable.
     *	- If FAILED, returns an array containing a returncode, messageKey, message.
     *	- If SUCCESS, returns an array of array containing the userID, fullName, role of each attendee
     */    
    public function getUsers($roomName, $moderatorPassword)
    {
        if ($moderatorPassword == null)
        {
            $moderatorPassword = MODERATOR_PW;
        }
        $config = $this->_getBigBlueButtonConfig();
        $config = (object) $config;
        $salt = $config->salt;
        $url = $config->url;        
        return $this->_backend->getUsersArray($roomName, $moderatorPassword, $url, $salt);
    }
    
    /**
     * generates a randomstrings of given length
     * 
     * @param int $_length
     */
    public static function getRandomString($_length) 
    {
        $chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $randomString = '';
        for ($i = 0; $i < (int) $_length; $i++) 
        {
            $randomString .= $chars[mt_rand(1, strlen($chars)) - 1];
        }
        return $randomString;
    }

}
