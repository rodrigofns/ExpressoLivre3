<?php
/**
 * Calendar Event Notifications
 * 
 * @package     Calendar
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2009 Metaways Infosystems GmbH (http://www.metaways.de)
 */

/**
 * Webconference Event Notifications
 *
 * @package     Webconference
 */
 class Webconference_Controller_EventNotifications
 {
     
    /**
     * @var Calendar_Controller_EventNotifications
     */
    private static $_instance = NULL;
    
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
     * @return Calendar_Controller_EventNotifications
     */
    public static function getInstance() 
    {
        if (self::$_instance === NULL) {
            self::$_instance = new Webconference_Controller_EventNotifications();
        }
        
        return self::$_instance;
    }
    
    /**
     * constructor
     * 
     */
    private function __construct()
    {
        
    }
   
    /**
     * send notification to a single attender
     * 
     * @param Webconference_Model_Event       $_event
     * @param Tinebase_Model_FullAccount      $_updater
     * @return void
     */
    public function sendNotificationToAttender($users, $moderator, $roomName)
    {
        $translate = Tinebase_Translation::getTranslation('Webconference');
        try {
        /*        
            // find organizer account
            if ($_event->organizer && $_event->resolveOrganizer()->account_id) {
                $organizer = Tinebase_User::getInstance()->getFullUserById($_event->resolveOrganizer()->account_id);
            } else {
                // use creator as organizer
                $organizer = Tinebase_User::getInstance()->getFullUserById($_event->created_by);
            }
            
            // get prefered language, timezone and notification level
            $prefUser = $_attender->getUserAccountId();
            $locale = Tinebase_Translation::getLocale(Tinebase_Core::getPreference()->getValueForUser(Tinebase_Preference::LOCALE, $prefUser ? $prefUser : $organizer->getId()));
            $timezone = Tinebase_Core::getPreference()->getValueForUser(Tinebase_Preference::TIMEZONE, $prefUser ? $prefUser : $organizer->getId());
            
//            $translate = Tinebase_Translation::getTranslation('Calendar', $locale);

            
            // get date strings
            $startDateString = Tinebase_Translation::dateToStringInTzAndLocaleFormat($_event->dtstart, $timezone, $locale);
            $endDateString = Tinebase_Translation::dateToStringInTzAndLocaleFormat($_event->dtend, $timezone, $locale);
            $messageSubject = sprintf($translate->_('Attendee changes for event "%1$s" at %2$s' ), $_event->summary, $startDateString);
            
          */  
            
            $fullUser = Tinebase_Core::getUser();
            foreach ($users as $user) {
                
                $userName = $user[n_fn];

                $url = Webconference_Controller_BigBlueButton::getInstance()->joinRoom($roomName, $moderator, $userName)->bbbUrl->bbbUrl;

                //$webconfMail = new Webconference_Model_Invite($url, $roomName, $moderator, $fullUser, $userName); 
                $webconfMail = new Webconference_Model_Invite(
                        array(
                                'url'=>$url, 
                                'roomName'=>$roomName, 
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

                $contact = new Addressbook_Model_Contact($user);
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
        
        return array('message' => $translate->_('Inviting users successfully!'));
    }
 }
