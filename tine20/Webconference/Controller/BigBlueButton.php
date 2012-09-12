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

    /**
     * create room name
     * 
     * @return String room name 
     */
    private function _createRoomName() {
        $metings = $this->getMeetings();
        $user = Tinebase_Core::getUser()->accountLoginName;
        if ($metings) {
            foreach ($metings as $meting){
                $metingId = (String)$meting["meetingID"];
                $hasBeenForciblyEnded = (String)$meting["hasBeenForciblyEnded"];
                if ($hasBeenForciblyEnded == "true"){
                    continue;
                }
                if (strstr($metingId, $user)){
                    return $metingId;
                }
            }
        }
        return $user."_".time();
    }

    private function _joinUrl($roomName, $username, $mPW, $salt, $url) {
        return (object) array(
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
    private function _createRoom($username, $roomName, $welcomeString, $mPW, $aPW, $salt, $url, $logoutUrl) {
        $translation = Tinebase_Translation::getTranslation('Webconference');

        $ret = $this->_backend->createMeetingArray($username, $roomName, $welcomeString, $mPW, $aPW, $salt, $url, $logoutUrl);

        if (!$ret) {
            throw new Tinebase_Exception_NotFound($translation->_('ERROR (the webconference server is unreachable)'));
        }
        $ret = (object) $ret;
        if ($ret->returncode == 'FAILED') {
            throw new Tinebase_Exception_NotFound(sprintf($translation->_("ERROR (%s): %s"), $ret->messageKey, $ret->message));
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
    public function createRoom() {
        $translation = Tinebase_Translation::getTranslation('Webconference');

        $config = $this->_getBigBlueButtonConfig();
        $config = (object) $config;

        $salt = $config->salt;
        $url = $config->url;
        $mPW = MODERATOR_PW;
        $aPW = ATTENDEE_PW;
        $logoutUrl = $this->getLogoutUrl();
        $welcomeString = sprintf($translation->_("Welcome to the Webconference by %s"), Tinebase_Core::getUser()->accountFullName);
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
    public function joinRoom($roomName, $moderator, $userName = null) {
        $config = $this->_getBigBlueButtonConfig();
        $config = (object) $config;
        $salt = $config->salt;
        $url = $config->url;
        if (is_null($userName)) {
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
     * 	- Null if the server is unreachable
     * 	- If FAILED then returns an array containing a returncode, messageKey, message.
     * 	- If SUCCESS then returns an array of all the meetings. Each element in the array is an array containing a meetingID,
      moderatorPW, attendeePW, hasBeenForciblyEnded, running.
     */
    public function getMeetings() {
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
     * 	- Null if the server is unreachable
     * 	- An array containing a returncode, messageKey, message.
     */
    public function endMeeting($roomName, $moderatorPassword) {
        if ($moderatorPassword == null) {
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
     * 	- Null if the server is unreachable.
     * 	- If FAILED, returns an array containing a returncode, messageKey, message.
     * 	- If SUCCESS, returns an array of array containing the userID, fullName, role of each attendee
     */
    public function getUsers($roomName, $moderatorPassword) {
        if ($moderatorPassword == null) {
            $moderatorPassword = MODERATOR_PW;
        }
        $config = $this->_getBigBlueButtonConfig();
        $config = (object) $config;
        $salt = $config->salt;
        $url = $config->url;
        return $this->_backend->getUsersArray($roomName, $moderatorPassword, $url, $salt);
    }
    
    
    /*This method check the BigBlueButton server to see if the meeting is running (i.e. there is someone in the meeting)
    *
    *@param roomName -- the unique meeting identifier used to store the meeting in the bigbluebutton server
    *
    *@return A boolean of true if the meeting is running and false if it is not running
    */
    public function isMeetingActive($_roomName)
    {
        $config = $this->_getBigBlueButtonConfig();
        $config = (object) $config;
        $salt = $config->salt;
        $url = $config->url;
        return $this->_backend->getMeetingIsActive($_roomName, MODERATOR_PW, $url, $salt);
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

    public function inviteUsersToJoin($users, $moderator, $roomName) {
        $translate = Tinebase_Translation::getTranslation('Webconference');

        $fullUser = Tinebase_Core::getUser();
        $recipients = array();
        foreach ($users as $user) {
            $userName = $user[n_fn];

            $url = Webconference_Controller_BigBlueButton::getInstance()->joinRoom($roomName, $moderator, $userName)->bbbUrl->bbbUrl;
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

            $recipient = array(new Addressbook_Model_Contact($user));
            Tinebase_Notification::getInstance()->send($fullUser, $recipient, $subject, $messagePlain, $_messageHtml);
            array_push($recipients, $user);
        }
        return array('message' => $translate->_('Users invited successfully') . '!');
    }

    public function inviteUsersToJoinToFelamimail($roomName, $moderator, $userName, $email) {
        $translation = Tinebase_Translation::getTranslation('Webconference');
        $defaultEmailAccount = Tinebase_Core::getPreference("Felamimail")->{Felamimail_Preference::DEFAULTACCOUNT};
        $url = Webconference_Controller_BigBlueButton::getInstance()->joinRoom($roomName, $moderator, $userName)->bbbUrl->bbbUrl;
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

}
