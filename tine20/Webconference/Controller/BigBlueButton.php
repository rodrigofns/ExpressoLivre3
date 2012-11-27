<?php

/**
 * Controller for webconference
 * @package     Webconference
 * @subpackage  Controller
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Edgar de Lucca <edgar.lucca@serpro.gov.br>, Marcelo Teixeira <marcelo.teixeira@serpro.gov.br>
 * @copyright   Copyright (c) 2012 Metaways Infosystems GmbH (http://www.metaways.de)
 * 
 */
define('MODERATOR_PW', 'moderatorpw');
define('ATTENDEE_PW', 'attendeepw');

class Webconference_Controller_BigBlueButton {

    protected $_backend;
    
    const MODERATOR = "M";
    const ATTENDEE = "A";
    const OWNER = "O";

    /**
     * the constructor
     *
     * don't use the constructor. use the singleton 
     */
    private function __construct() {
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
    public static function getInstance() {
        if (self::$_instance === NULL) {
            self::$_instance = new Webconference_Controller_BigBlueButton();
        }
        return self::$_instance;
    }
    
    private function _joinURL($roomId, $accountsId, $userName, $userEmail, $role){	
	$room = Webconference_Controller_Room::getInstance()->get($roomId);
	$config = Webconference_Controller_Config::getInstance()->get($room->webconference_config_id);
	
	switch ($role){
	    case "OWNER":
		$password = MODERATOR_PW;
		$conferenceRole = self::OWNER;
		break;
	    case "MODERATOR":
		$password = MODERATOR_PW;
		$conferenceRole = self::MODERATOR;
		break;
	    case "ATTENDEE":
		$password = ATTENDEE_PW;
		$conferenceRole = self::ATTENDEE;
		break;
	}
	
	$roomURL = $this->_backend->joinURL($room->room_name, $userName, $password, $config->salt, $config->url);
	
	// save data table webconference_room_user
	$data = array("webconference_room_id" => $roomId,
		      "accounts_id" => $accountsId,
                      "user_email" => $userEmail,
		      "user_name" => $userName,
		      "room_url" => $roomURL,
                      "conference_role" => $conferenceRole,
		      "call_date" => time() );
	$record =  new Webconference_Model_RoomUser($data);
	Webconference_Controller_RoomUser::getInstance()->create($record);
	return $roomURL;
    }

    private function _getBigBlueButtonConfigBalance() {
	$data = Webconference_Controller_Config::getInstance()->getAll();
	$quant = 1;
	$bbb = null;
	foreach ($data as $conf){
	    $meetings = (object) $this->_backend->getMeetingsArray($conf->url, $conf->salt);
	    if ($meetings->returncode == 'SUCCESS' && $meetings->messageKey == 'noMeetings'){
		return $conf;
	    }   
	    $meetingsId = array();
	    if ($meetings) {
		foreach ($meetings as $meeting){
		    $meetingId = (String)$meeting["meetingID"];
		    $hasBeenForciblyEnded = (String)$meeting["hasBeenForciblyEnded"];
		    if ($hasBeenForciblyEnded == "true"){
			continue;
		    }
		    array_push($meetingsId, $meetingId);
		}
	    }
	    $perc = ( count($meetingsId) / $conf->limit_room);
	    if ($perc < 1 && $perc < $quant){
		$quant = $perc;
		$bbb = $conf;
	    }
	}
        return $bbb;
    }    
    

    /**
     * This method creates a new meeting
     * 
     * @return String -- URL of the meeting
     */
    public function createRoom($title) {
	$userName = Tinebase_Core::getUser()->accountFullName; 
	
        if ((!isset($title)) || (trim($title) == ""))
	{
	    $title = $userName . date(" H:i:s d/m/Y");
	}

	$translation = Tinebase_Translation::getTranslation('Webconference');
        $logoutUrl = $this->getLogoutUrl();
        $welcomeString = sprintf($translation->_("Welcome to the Webconference %s by %s"), $title, Tinebase_Core::getUser()->accountFullName);      
	$userEmail = Tinebase_Core::getUser()->accountEmailAddress;
	$roomName = Tinebase_Core::getUser()->accountLoginName.'_'.time();
		
	$config = $this->_getBigBlueButtonConfigBalance();

	if ($config == null){
	    throw new Tinebase_Exception_NotFound($translation->_('ERROR (no webconference server available or the room limit has been reached)'));
	}

	$ret = $this->_backend->createMeetingArray($userName, $roomName, $welcomeString, MODERATOR_PW, ATTENDEE_PW, $config->salt, $config->url, $logoutUrl);
	if (!$ret) {
            throw new Tinebase_Exception_NotFound($translation->_('ERROR (the webconference server is unreachable)'));
        }
        $ret = (object) $ret;
        if ($ret->returncode == 'FAILED') {
            throw new Tinebase_Exception_NotFound(sprintf($translation->_("ERROR (%s): %s"), $ret->messageKey, $ret->message));
        }
	// save data table webconference_room
	$data = array("title" => $title,
		      "room_name" => $roomName,
                      "create_date" => time(),
		      "status" => "A",
		      "webconference_config_id" => $config->id );

	$record =  new Webconference_Model_Room($data);
	$roomRecord = Webconference_Controller_Room::getInstance()->create($record);	
	
	$roomURL = $this->_joinURL($roomRecord->id, Tinebase_Core::getUser()->getId(), $userName, $userEmail, "OWNER");	
	
	return (object) array(
                    bbbUrl => $roomURL,
                    roomName => $roomName,
		    roomId=>$roomRecord->id
        );
    }

    private function _getAccountId($_email){
	try{
	    return Tinebase_User::getInstance()->getUserByProperty('accountEmailAddress', $_email)->accountId;
	} catch (Exception $e){
	    return null;
	}
    }     
    
    /**
     * Join the room meeting
     * 
     * @param String $roomName -- the meeting identifier used to store the meeting in the bigbluebutton server
     * @param String $username -- the user name.
     * @param Boolean $moderator -- is moderator in meeting
     * @return String -- URL of the meeting
     */
    public function joinRoom($roomId, $moderator, $userName, $userEmail) {
	$room = Webconference_Controller_Room::getInstance()->get($roomId);
        if ($moderator) {
            $role = "MODERATOR";
        } else {
            $role = "ATTENDEE";
        }
	$accountsId = $this->_getAccountId($userEmail);
	$bbbUrl = $this->_joinURL($roomId, $accountsId, $userName, $userEmail, $role);
 
	//Tinebase_Core::getSession()->RoomName = $roomName;
        return (object) array(
                    bbbUrl => $bbbUrl,
                    roomName => $room->room_name,
		    roomId=>$room->id,
		    roomTitle =>$room->title
        );
    }

    /**
     * This method calls getMeetings on the bigbluebutton server, then calls getMeetingInfo for each meeting and concatenates the result.
     *
     * @return
     * 	- Null if the server is unreachable
     * 	- If FAILED then returns an array containing a returncode, messageKey, message.
     * 	- If SUCCESS then returns an array of all the meetings. Each element in the array is an array containing a meetingID,
      moderatorPW, attendeePW, hasBeenForciblyEnded, running.
     */
    public function getMeetings() {
        $servers =  Webconference_Controller_Config::getInstance()->getAll();	
	$data = array();
	foreach ($servers as $server){
	    try {
		$dataTemp = $this->_backend->getMeetingsArray($server->url, $server->salt);
	    } catch (Exception $exc) {
		$dataTemp = array("ERROR"=>$exc->getMessage());
	    }
	    array_push($data, array($server->url=>$dataTemp));
	}
        return $data;
    }

    //------------------------------------------------Other Methods------------------------------------
    /**
     * This method calls end meeting on the specified meeting in the bigbluebutton server.
     *
     * @param roomName -- the unique meeting identifier used to store the meeting in the bigbluebutton server
     * @param moderatorPassword -- the moderator password of the meeting
     * @return
     * 	- Null if the server is unreachable
     * 	- An array containing a returncode, messageKey, message.
     */
    public function endMeeting($roomId) {
	$room = Webconference_Controller_Room::getInstance()->get($roomId);
	$config = Webconference_Controller_Config::getInstance()->get($room->webconference_config_id);
        return $this->_backend->endMeeting($room->room_name, MODERATOR_PW, $config->url, $config->salt);
    }

    /**
     * This method returns an array of the attendees in the specified meeting.
     *
     * @param roomName -- the unique meeting identifier used to store the meeting in the bigbluebutton server
     * @param moderatorPassword -- the moderator password of the meeting
     * @return
     * 	- Null if the server is unreachable.
     * 	- If FAILED, returns an array containing a returncode, messageKey, message.
     * 	- If SUCCESS, returns an array of array containing the userID, fullName, role of each attendee
     */
    public function getRoomUsers($roomId) {
	$room = Webconference_Controller_Room::getInstance()->get($roomId);
	$config = Webconference_Controller_Config::getInstance()->get($room->webconference_config_id);
        return $this->_backend->getUsersArray($room->room_name, MODERATOR_PW, $config->url, $config->salt);
    }
    
    
    /*This method check the BigBlueButton server to see if the meeting is running (i.e. there is someone in the meeting)
    *
    *@param roomName -- the unique meeting identifier used to store the meeting in the bigbluebutton server
    *
    *@return A boolean of true if the meeting is running and false if it is not running
    */
    public function isMeetingActive($roomId)
    {
	$room = null;
	try{
	    $room = Webconference_Controller_Room::getInstance()->get($roomId);
	}  catch (Tinebase_Exception_NotFound $e){
	    return false;
	}
	$config = Webconference_Controller_Config::getInstance()->get($room->webconference_config_id);
        return $this->_backend->getMeetingIsActive($room->room_name, MODERATOR_PW, $config->url, $config->salt);
    }

    /**
     * generates a randomstrings of given length
     * 
     * @param int $_length
     */
    public static function getRandomString($_length) {
        $chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $randomString = '';
        for ($i = 0; $i < (int) $_length; $i++) {
            $randomString .= $chars[mt_rand(1, strlen($chars)) - 1];
        }
        return $randomString;
    }

    /**
     * Checks if the url is online or not.
     * Used to check the webconference link before show the page to the user.
     *
     * @param string $url
     * @return array 
     * @todo Improve the way of checking the url
     */
    public function checkUrl($url) {
        $online = false;
        ini_set("default_socket_timeout", "05");
        set_time_limit(5);
        $f = fopen($url, "r");
        $r = fread($f, 1000);
        fclose($f);
        if (strlen($r) > 1)
            $online = true;

        return $online;
    }
    
    /**
     * send notification to a set of users
     * 
     * @param Array	$users
     * @param Boolean	$moderator
     * @param Boolean	$roomId
     * @return void
     */
    public function inviteUsersToJoin($users, $moderator, $roomId)
    {
        $translate = Tinebase_Translation::getTranslation('Webconference');
        try {
        
            
            $fullUser = Tinebase_Core::getUser();
            foreach ($users as $user) {
                
		$contact = new Addressbook_Model_Contact($user);
		$userEmail = $contact->getPreferedEmailAddress();
		$userName = $contact->n_fn;
		
                $room = Webconference_Controller_BigBlueButton::getInstance()->joinRoom($roomId, $moderator, $userName, $userEmail);
		
		
                //$webconfMail = new Webconference_Model_Invite($url, $roomName, $moderator, $fullUser, $userName); 
                $webconfMail = new Webconference_Model_Invite(
                        array(
                                'url'=>$room->bbbUrl, 
                                'roomId'=>$roomId, 
				'roomTitle'=>$room->roomTitle,
                                'moderator'=>$moderator,
                                'createdBy'=>$fullUser, 
                                'to'=>$userName
                            ),
                        true
                        ); 
		
                $messageSubject = $translate->_("Webconference Invite");

                $view = new Zend_View();
                $view->setScriptPath(dirname(__FILE__) . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'views');

                $view->translate    = $translate;
                //$view->timezone     = $timezone;

                $view->url        = $url;
                $view->fullUser   = $fullUser;

                $method = 'Webconference';
                $messageBody = $view->render('eventNotification.php');
                
                
                $mailPart           = new Zend_Mime_Part(serialize($webconfMail));
                $mailPart->charset  = 'UTF-8';
                $mailPart->type     = 'text/webconference; method=' . $method;
                $mailPart->encoding = Zend_Mime::ENCODING_QUOTEDPRINTABLE;
                
               
                $attachments = null;
                $sender = $fullUser;
                
                $result = Tinebase_Notification::getInstance()->send($sender, array($contact), $messageSubject, $messageBody, $mailPart, $attachments);
                
            }
        } catch (Exception $e) {
            Tinebase_Core::getLogger()->WARN(__METHOD__ . '::' . __LINE__ . " could not send notification :" . $e);
            return array(
                'message' => $e->getMessage(),
                'result' => $translate->_('An error has occured inviting users') 
                );
        }
        
        return array(
            'success'   => TRUE,
            'message' => $translate->_('Users invited successfully').'!'
            );
    }

    public function getLogoutUrl() {
        $protocol =  (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? 'https' : 'http';
        $host = $_SERVER['HTTP_HOST'];
        $base = substr($_SERVER['REQUEST_URI'], 0, strrpos($_SERVER['REQUEST_URI'], '/'));
        return $protocol.'://'.$host.$base.'/Webconference/views/logoutPage.html';
    }
    
    public function getRooms(){
	$this->_updateRoomStatus();
	
	$_accountId = Tinebase_Core::getUser()->getId();
	$webconference_Backend_Sql = new Webconference_Backend_Sql();
	
	$result = $webconference_Backend_Sql->getRooms($_accountId);
	
	return array(
            'results'       => $result,
            'totalcount'    => count($result)
        );
	
	
    }
    
    private function _updateRoomStatus(){
	$data = array("status"=>"A");
	$filter = new Webconference_Model_RoomFilter($data);
	$controller = Webconference_Controller_Room::getInstance();
	$rooms = $controller->search($filter, NULL, FALSE);
	foreach ($rooms as $room) {
	    if ($this->isMeetingActive($room->id) == false){
		$room->status = "E";
		$controller->update($room);
	    }
	}
    }
}
