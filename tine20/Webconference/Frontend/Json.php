<?php

/**
 * Tine 2.0
 * @package     Webconference
 * @subpackage  Frontend
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Edgar de Lucca <edgar.lucca@serpro.gov.br>, Marcelo Teixeira <marcelo.teixeira@serpro.gov.br>
 * @copyright   Copyright (c) 2012 Metaways Infosystems GmbH (http://www.metaways.de)
 * 
 */

/**
 *
 * This class handles all Json requests for the Webconference application
 *
 * @package     Webconference
 * @subpackage  Frontend
 */
class Webconference_Frontend_Json extends Tinebase_Frontend_Json_Abstract {

    /**
     * the controller
     * 
     * @var Webconference_Controller_ExampleRecord
     */
    protected $_controller = NULL;

    /**
     * the constructor
     */
    public function __construct() {
        $this->_applicationName = 'Webconference';
        $this->_controller = Webconference_Controller_WebconferenceConfig::getInstance();
    }

    /**
     * Search for records matching given arguments
     *
     * @param  array $filter
     * @param  array $paging
     * @return array
     */
    public function searchWebconferenceConfig($filter, $paging) {
        return $this->_search($filter, $paging, $this->_controller, 'Webconference_Model_WebconferenceConfigFilter', TRUE);
    }
   
    /**
     * Return a single record
     *
     * @param   string $id
     * @return  array record data
     */
    public function getWebconferenceConfig($id) {
        return $this->_get($id, $this->_controller);
    }

    /**
     * creates/updates a record
     * 
     * @param  array $recordData
     * @return array created/updated record
     */
    public function saveWebconferenceConfig($recordData, $duplicateCheck = TRUE) {
        return $this->_save($recordData, Webconference_Controller_WebconferenceConfig::getInstance(), 'WebconferenceConfig', 'id', array($duplicateCheck));
    }

    /**
     * load Webconference configuration
     * 
     * @return array -- record data  
     */
    public function loadWebconferenceConfig() {
        return $this->_controller->loadWebconferenceConfig();
    }

    /**
     * deletes existing records Webconference configuration
     *  
     * @param  array  $ids 
     * @return string
     */
    public function deleteWebconferenceConfig($ids) {
        return $this->_delete($ids, $this->_controller);
    }

    /**
     * Get the Settings
     * 
     * @return array --settings 
     */
    public function getSettings() {
        $result = Webconference_Controller::getInstance()->getConfigSettings()->toArray();
        return $result;
    }

    /**
     * This method creates a new meeting
     * 
     * @return String -- URL of the meeting 
     */
    public function createRoom($title) {
        return Webconference_Controller_BigBlueButton::getInstance()->createRoom($title);
    }

    /**
     * Search meetings active on the server
     * 
     * @return
     * 	- Null if the server is unreachable
     * 	- If FAILED then returns an array containing a returncode, messageKey, message.
     * 	- If SUCCESS then returns an array of all the meetings. Each element in the array is an array containing a meetingID,
     *           moderatorPW, attendeePW, hasBeenForciblyEnded, running.
     */
    public function getMeetings() {
        return Webconference_Controller_BigBlueButton::getInstance()->getMeetings();
    }

    public function inviteUsersToJoin($users, $moderator, $roomId) 
    {
        return Webconference_Controller_BigBlueButton::getInstance()->inviteUsersToJoin($roomId, $users, $moderator);
    }
    
    
    public function inviteUsersToJoinToFelamimail($roomId, $moderator, $userName, $email)
    {
        return Webconference_Controller_BigBlueButton::getInstance()->inviteUsersToJoinToFelamimail($roomId, $moderator, $userName, $email);
    }   
    
    public function isMeetingActive($roomId, $url)
    {
        $translate = Tinebase_Translation::getTranslation('Webconference');
        
        $active = Webconference_Controller_BigBlueButton::getInstance()->isMeetingActive($roomId);
        if($active){
            return array(
                'active' => true,
                'message'=> ''
            );
        }
        else{
            $online = Webconference_Controller_BigBlueButton::getInstance()->checkUrl($url);
            if(!$online){
                return array(
                    'active' => false,
                    'message'=> $translate->_('The Webconference server is offline')
                );
            }
            else{
                return array(
                    'active' => false,
                    'message'=> $translate->_('The Webconference you are trying to join no longer exists')
                );
            }
        }
        return Webconference_Controller_BigBlueButton::getInstance()->checkUrl($url);
    } 

    /**
     * This method calls end meeting on the specified meeting in the bigbluebutton server.
     *
     * @param roomName -- the unique meeting identifier used to store the meeting in the bigbluebutton server
     * @param moderatorPassword -- the moderator password of the meeting
     * @return
     * 	- Null if the server is unreachable
     * 	- An array containing a returncode, messageKey, message.
     */
    public function endMeeting($roomName, $moderatorPassword = null) {
        return Webconference_Controller_BigBlueButton::getInstance()->endMeeting($roomName, $moderatorPassword);
    }
    /*
    public function endMeeting($roomId) {
        return Webconference_Controller_BigBlueButton::getInstance()->endMeeting($roomId);
    }    
    */
    
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
  /*  public function getUsers($roomId) {
        return Webconference_Controller_BigBlueButton::getInstance()->getUsers($roomId);
    }    
*/
    public function getUsers($roomName, $moderatorPassword = null) 
    {
        return Webconference_Controller_BigBlueButton::getInstance()->getUsers($roomName, $moderatorPassword);
    }
    
    public function getAccountId()
    {
        return Webconference_Controller_BigBlueButton::getInstance()->getRoom();
    }    
    
}
