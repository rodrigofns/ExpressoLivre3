<?php

/**
 * Tine 2.0
 * @package     Webconference
 * @subpackage  Frontend
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Edgar de Lucca <edgar.lucca@serpro.gov.br>, Marcelo Teixeira <marcelo.teixeira@serpro.gov.br>
 * @copyright   Copyright (c) 2007-2010 Metaways Infosystems GmbH (http://www.metaways.de)
 * 
 */

/**
 *
 * This class handles all Json requests for the Webconference application
 *
 * @package     Webconference
 * @subpackage  Frontend
 */
class Webconference_Frontend_Json extends Tinebase_Frontend_Json_Abstract 
{
    /**
     * the controller
     * 
     * @var Webconference_Controller_ExampleRecord
     */
    protected $_controller = NULL;

    /**
     * the constructor
     */
    public function __construct() 
    {
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
    public function searchWebconferenceConfig($filter, $paging) 
    {
        return $this->_search($filter, $paging, $this->_controller, 'Webconference_Model_WebconferenceConfigFilter', TRUE);
    }

    /**
     * Return a single record
     *
     * @param   string $id
     * @return  array record data
     */
    public function getWebconferenceConfig($id) 
    {
        return $this->_get($id, $this->_controller);
    }

    /**
     * creates/updates a record
     * 
     * @param  array $recordData
     * @return array created/updated record
     */
    public function saveWebconferenceConfig($recordData) 
    {
        return $this->_controller->saveWebconferenceConfig($recordData);
    }

    /**
     * load Webconference configuration
     * 
     * @return array -- record data  
     */
    public function loadWebconferenceConfig() 
    {
        return $this->_controller->loadWebconferenceConfig();
    }

    /**
     * deletes existing records Webconference configuration
     *  
     * @param  array  $ids 
     * @return string
     */
    public function deleteWebconferenceConfig($ids) 
    {
        return $this->_delete($ids, $this->_controller);
    }

    /**
     * Get the Settings
     * 
     * @return array --settings 
     */
    public function getSettings() 
    {
        $result = Webconference_Controller::getInstance()->getConfigSettings()->toArray();
        return $result;
    }

    /**
     * This method creates a new meeting
     * 
     * @return String -- URL of the meeting 
     */
    public function createRoom() 
    {
        return Webconference_Controller_BigBlueButton::getInstance()->createRoom();
    }

    /**
     * Join the room meeting
     * Joins automatically a user to the meeting specified in the roomName parameter.
     * 
     * @param String $roomName
     * @param String $moderator
     * @return String -- URL of the meeting  
     */
    public function joinRoom($roomName, $moderator = false) 
    {
        return Webconference_Controller_BigBlueButton::getInstance()->joinRoom($roomName, $moderator);
    }

    /**
     * Search meetings active on the server
     * 
     * @return
     *	- Null if the server is unreachable
     *	- If FAILED then returns an array containing a returncode, messageKey, message.
     *	- If SUCCESS then returns an array of all the meetings. Each element in the array is an array containing a meetingID,
     *           moderatorPW, attendeePW, hasBeenForciblyEnded, running.
     */
    public function getMeetings() 
    {
        return Webconference_Controller_BigBlueButton::getInstance()->getMeetings();
    }

    /**
     * This method calls end meeting on the specified meeting in the bigbluebutton server.
     *
     * @param roomName -- the unique meeting identifier used to store the meeting in the bigbluebutton server
     * @param moderatorPassword -- the moderator password of the meeting
     * @return
     *	- Null if the server is unreachable
     * 	- An array containing a returncode, messageKey, message.
     */ 
    public function endMeeting($roomName, $moderatorPassword = null)
    {
        return Webconference_Controller_BigBlueButton::getInstance()->endMeeting($roomName, $moderatorPassword);
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
    public function getUsers($roomName, $moderatorPassword = null)
    {
        return Webconference_Controller_BigBlueButton::getInstance()->getUsers($roomName, $moderatorPassword);
    }
    
    public function getJoinInvites()
    {
        
        //if(hasInvitesToMe)
        //{
            return array(
                'type'=>'event',
                'name'=>'joinInvite',
                'data'=>'Successfully polled at: '. date('g:i:s a')
            );
//        }
//        else
//        {
//            return null;
//        }
        
    }
    public function inviteUsersToJoin($users, $moderator, $roomName)
    {
        $fullUser = Tinebase_Core::getUser();
        
        $url = Webconference_Controller_BigBlueButton::getInstance()->joinRoom($roomName, $moderator);
        throw new Tinebase_Exception($url);
        $url = $url->bbbUrl;
        


        $subject = "invite Users To Join";
        $messagePlain = null;
         $_messageHtml = "O " . Tinebase_Core::getUser()->accountFullName . ' está convidando você para uma webconferencia. <br/><br/> <a id="url:'. $url.' class="webconference-join-link"> Entrar na webconferencia  </a>'.$url;
        
        $recipients=array();
        foreach($users as $user){
            array_push($recipients, new Addressbook_Model_Contact($user));
            
        }
        
        
        Tinebase_Notification::getInstance()->send( $fullUser, $recipients, $subject, $messagePlain, $_messageHtml);
        //foreach user
        return array(
                'users'=>$recipients,
                'name'=>'joinInvite',
                'data'=>'Successfully polled at: '. date('g:i:s a')
            );
    }
    
    /**
     * Search for records matching given arguments
     *
     * @param  array $filter
     * @param  array $paging
     * @return array
     */
    /*    public function searchExampleRecords($filter, $paging)
      {
      return $this->_search($filter, $paging, $this->_controller, 'Webconference_Model_ExampleRecordFilter', TRUE);
      }
     */

    /**
     * Return a single record
     *
     * @param   string $id
     * @return  array record data
     */
    /*    public function getExampleRecord($id)
      {
      return $this->_get($id, $this->_controller);
      }
     */

    /**
     * creates/updates a record
     *
     * @param  array $recordData
     * @return array created/updated record
     */
    /*
      public function saveExampleRecord($recordData)
      {
      return $this->_save($recordData, $this->_controller, 'ExampleRecord');
      }
     */

    /**
     * deletes existing records
     *
     * @param  array  $ids 
     * @return string
     */
    /*
      public function deleteExampleRecords($ids)
      {
      return $this->_delete($ids, $this->_controller);
      }
     */

    /**
     * Returns registry data
     * 
     * @return array
     */
//    public function getRegistryData()
//    {   
//        $defaultContainerArray = Tinebase_Container::getInstance()->getDefaultContainer(Tinebase_Core::getUser()->getId(), $this->_applicationName)->toArray();
//        $defaultContainerArray['account_grants'] = Tinebase_Container::getInstance()->getGrantsOfAccount(Tinebase_Core::getUser(), $defaultContainerArray['id'])->toArray();
//    
//        return array(
//            'defaultContainer' => $defaultContainerArray
//        );
//    }
}
