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
	$room = Webconference_Controller_WebconferenceRoom::getInstance()->get($roomId);
	$config = Webconference_Controller_WebconferenceConfig::getInstance()->get($room->webconference_config_id);
	
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
		$password = MODERATOR_PW;
		$conferenceRole = self::MODERATOR;
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
	$record =  new Webconference_Model_WebconferenceRoomUser($data);
	Webconference_Controller_WebconferenceRoomUser::getInstance()->create($record);
	return $roomURL;
    }

    private function _getBigBlueButtonConfigBalance() {
	$data = Webconference_Controller_WebconferenceConfig::getInstance()->getAll();
	$quant = -1;
	$bbb = null;
	foreach ($data as $conf){
	    $meetings = (object) $this->_backend->getMeetingsArray($conf->url, $conf->salt);
	    if ($meetings->returncode == 'SUCCESS' || $meetings->messageKey == 'noMeetings'){
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
	    if ($perc < 1 || $perc < $quant){
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
        $translation = Tinebase_Translation::getTranslation('Webconference');
        $logoutUrl = $this->getLogoutUrl();
        $welcomeString = sprintf($translation->_("Welcome to the Webconference by %s"), Tinebase_Core::getUser()->accountFullName);
        $userName = Tinebase_Core::getUser()->accountFullName;       
	$userEmail = Tinebase_Core::getUser()->accountEmailAddress;
	$roomName = Tinebase_Core::getUser()->accountLoginName.'_'.time();
	
	$config = $this->_getBigBlueButtonConfigBalance();

	if ($config == null){
	    throw new Tinebase_Exception_NotFound($translation->_('ERROR (the webconference server is unreachable)'));
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

	$record =  new Webconference_Model_WebconferenceRoom($data);
	$roomRecord = Webconference_Controller_WebconferenceRoom::getInstance()->create($record);	
	
	$roomURL = $this->_joinURL($roomRecord->id, Tinebase_Core::getUser()->getId(), $userName, $userEmail, "OWNER");	
	return $roomURL;
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
	$room = Webconference_Controller_WebconferenceRoom::getInstance()->get($roomId);
        if ($moderator) {
            $role = "MODERATOR";
        } else {
            $role = "ATTENDEE";
        }
	$accountsId = $this->_getAccountId($userEmail);
	$bbbUrl = $this->_joinURL($roomId, $accountsId, $userName, $userEmail, $role);
 
	//Tinebase_Core::getSession()->webconferenceRoomName = $roomName;
        return (object) array(
                    bbbUrl => $bbbUrl,
                    roomName => $room->room_name,
		    roomId=>$room->id
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
        $servers =  Webconference_Controller_WebconferenceConfig::getInstance()->getAll();	
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
	$room = Webconference_Controller_WebconferenceRoom::getInstance()->get($roomId);
	$config = Webconference_Controller_WebconferenceConfig::getInstance()->get($room->webconference_config_id);
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
    public function getUsers($roomId) {
	$room = Webconference_Controller_WebconferenceRoom::getInstance()->get($roomId);
	$config = Webconference_Controller_WebconferenceConfig::getInstance()->get($room->webconference_config_id);
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
	$room = Webconference_Controller_WebconferenceRoom::getInstance()->get($roomId);
	$config = Webconference_Controller_WebconferenceConfig::getInstance()->get($room->webconference_config_id);
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

    public function inviteUsersToJoin($roomId, $users, $moderator) {
        $translate = Tinebase_Translation::getTranslation('Webconference');

        $fullUser = Tinebase_Core::getUser();
        $recipients = array();
        foreach ($users as $user) {
            //$userName = $user[n_fn];
	    
	    $addressbook = new Addressbook_Model_Contact($user);
	    $userEmail = $addressbook->getPreferedEmailAddress();
	    $userName = $addressbook->n_fn;
	    
	    $url = Webconference_Controller_BigBlueButton::getInstance()->joinRoom($roomId, $moderator, $userName, $userEmail)->bbbUrl->bbbUrl;
            $subject = $translate->_("Invite User To Join Webconference");
            $messagePlain = null;

            $_messageHtml = sprintf($translate->_("The user %s is inviting you to a Webconference"), Tinebase_Core::getUser()->accountFullName);
            $_messageHtml .= "<br/><br/>";
            $_messageHtml .= "<div>";
            $_messageHtml .= "<span class=\"$url\" />";
            $_messageHtml .= "<span class=\"tinebase-webconference-link\">";

            $_messageHtml .= $translate->_("Log in to Webconference");
            $_messageHtml .= "</span>";
            $_messageHtml .= "</div>";

            $recipient = array($addressbook);
            Tinebase_Notification::getInstance()->send($fullUser, $recipient, $subject, $messagePlain, $_messageHtml);
            array_push($recipients, $user);
        }
        return array('message' => $translate->_('Users invited successfully') . '!');
    }

    public function inviteUsersToJoinToFelamimail($roomId, $moderator, $userName, $email) {
        $translation = Tinebase_Translation::getTranslation('Webconference');
        $defaultEmailAccount = Tinebase_Core::getPreference("Felamimail")->{Felamimail_Preference::DEFAULTACCOUNT};
        $url = Webconference_Controller_BigBlueButton::getInstance()->joinRoom($roomId, $moderator, $userName, $email)->bbbUrl->bbbUrl;
        $accountFullName = Tinebase_Core::getUser()->accountFullName;
        $messageHtml = sprintf($translation->_("The user %s is inviting you to a Webconference"), $accountFullName);
        $messageHtml .= "<br/><br/>";
        $messageHtml .= "<div>";
        $messageHtml .= "<span class=\"$url\" />";
        $messageHtml .= "<span class=\"tinebase-webconference-link\">";

        $messageHtml .= $translation->_("Log in to Webconference");
        $messageHtml .= "</span>";
        $messageHtml .= "</div>";

        $recordData = Array("note" => null,
            "content_type" => "text/html",
            "account_id" => $defaultEmailAccount,
            "to" => Array($email),
            "cc" => Array(),
            "bcc" => Array(),
            "subject" => $translation->_("Invite User To Join Webconference"),
            "body" => $messageHtml,
            "attachments" => Array(),
            "from_email" => Tinebase_Core::getUser()->accountEmailAddress,
            "customfields" => Array()
        );

        $message = new Felamimail_Model_Message();
        $message->setFromArray($recordData);

        try {
            $result = Felamimail_Controller_Message_Send::getInstance()->sendMessage($message);
            $result = $this->_recordToJson($result);
        } catch (Zend_Mail_Protocol_Exception $zmpe) {
            Tinebase_Core::getLogger()->warn(__METHOD__ . '::' . __LINE__ . ' Could not send message: ' . $zmpe->getMessage());
            throw $zmpe;
        }
        return $result;
    }

    public function getLogoutUrl() {
        
//        $B = substr(__FILE__, 0, strrpos(__FILE__, '/'));
//        $A = substr($_SERVER['DOCUMENT_ROOT'], strrpos($_SERVER['DOCUMENT_ROOT'], $_SERVER['PHP_SELF']));
//        $C = substr($B, strlen($A));
//        $posconf = strlen($C) - $conflen - 1;
//        $D = substr($C, 1, $posconf);
//        $host = $_SERVER['SERVER_NAME'] . ':' . $_SERVER['SERVER_PORT'] . '/' . $D;
//        return 'http://'.$host . '/../views/logoutPage.html';
        

        $protocol =  (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? 'https' : 'http';
        $host = $_SERVER['HTTP_HOST'];
        $base = substr($_SERVER['REQUEST_URI'], 0, strrpos($_SERVER['REQUEST_URI'], '/'));
        return $protocol.'://'.$host.$base.'/Webconference/views/logoutPage.html';
        // $_SERVER["SERVER_NAME"] :shows the server name

    }
    
    public function getRoom(){
	$data = array("status"=>"E");
	$filter = new Webconference_Model_WebconferenceRoomFilter($data);
	$controller = Webconference_Controller_WebconferenceRoom::getInstance();
	return $rooms = $controller->search($filter, NULL, TRUE)->toArray();
	foreach ($rooms as $room) {
	    if ($this->isMeetingActive($room->id) == false){
		$room->status = "E";
		$controller->update($room);
	    }
	}
	return Webconference_Controller_WebconferenceRoom::getInstance()->search($filter)->toArray();
    }
}
