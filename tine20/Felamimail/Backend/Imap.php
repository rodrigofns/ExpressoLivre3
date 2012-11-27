<?php
/**
 * Tine 2.0
 * 
 * @package     Felamimail
 * @subpackage  Backend
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Lars Kneschke <l.kneschke@metaways.de>
 * @copyright   Copyright (c) 2009-2011 Metaways Infosystems GmbH (http://www.metaways.de)
 * 
 */

/**
 * Felamimail IMAP backend
 *
 * @package     Felamimail
 * @subpackage  Backend
 */
class Felamimail_Backend_Imap extends Zend_Mail_Storage_Imap
{
    /**
     * protocol handler
     * @var null|Felamimail_Protocol_Imap
     */
    protected $_protocol;

    /**
     * wheter to use UID as message identifier
     *
     * @var bool
     */
    protected $_useUid;
    
    /**
     * create instance with parameters
     * Supported parameters are
     *   - user username
     *   - host hostname or ip address of IMAP server [optional, default = 'localhost']
     *   - password password for user 'username' [optional, default = '']
     *   - port port for IMAP server [optional, default = 110]
     *   - ssl 'SSL' or 'TLS' for secure sockets
     *   - folder select this folder [optional, default = 'INBOX']
     * 
     * @param  object $params mail reader specific parameters
     */
    public function __construct($params)
    {
        $this->_has['flags'] = true;

        $this->_messageClass = 'Felamimail_Message';
        $this->_useUid = true;
        
        $this->_protocol = new Felamimail_Protocol_Imap();
        
        if(!isset($params->port)) {
            $params->port = null;
        }
        if(!isset($params->ssl)) {
            $params->ssl = null;
        }
        
        $this->connectAndLogin($params);
        
        $folderToSelect = isset($params->folder) ? $params->folder : 'INBOX';
        try {
            $this->selectFolder($folderToSelect);
        } catch (Zend_Mail_Storage_Exception $zmse) {
            throw new Felamimail_Exception_IMAPFolderNotFound('Could not select ' . $folderToSelect . '(' . $zmse->getMessage() . ')');
        }
    }
    
    /**
     * login to imap server
     * 
     * @param object $_params
     * @return void
     * @throws Felamimail_Exception_IMAPInvalidCredentials, Felamimail_Exception_IMAPServiceUnavailable
     */
    public function connectAndLogin($_params)
    {
        $timeStartConnect = microtime(true);
        try {
            $this->_protocol->connect($_params->host, $_params->port, $_params->ssl);
        } catch (Exception $e) {
            throw new Felamimail_Exception_IMAPServiceUnavailable($e->getMessage());
        }
        $timeEndConnect = microtime(true);
        $connectTime = $timeEndConnect - $timeStartConnect;
        
        if (! $this->_protocol->login($_params->user, $_params->password)) {
            throw new Felamimail_Exception_IMAPInvalidCredentials('Cannot login, user or password wrong.');
        }
        $timeEndLogin = microtime(true);
        $loginTime = $timeEndLogin - $timeEndConnect;
        
        if (Tinebase_Core::isLogLevel(Zend_Log::DEBUG)) Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . ' CONNECT TIME: ' . $connectTime . ' seconds');
        if (Tinebase_Core::isLogLevel(Zend_Log::DEBUG)) Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . ' LOGIN TIME: ' . $loginTime . ' seconds');
    }    
    
    /**
     * select given folder
     * 
     * - overwritten to get results (UIDNEXT, UIDVALIDITY, ...)
     *
     * folder must be selectable!
     *
     * @param  Zend_Mail_Storage_Folder|string $globalName global name of folder or instance for subfolder
     * @return array with folder values
     * @throws Zend_Mail_Storage_Exception
     * @throws Zend_Mail_Protocol_Exception
     */
    public function selectFolder($globalName)
    {
        $this->_currentFolder = $globalName;
        if (!$result = $this->_protocol->select($this->_currentFolder)) {
            $this->_currentFolder = null;
            /**
             * @see Zend_Mail_Storage_Exception
             */
            require_once 'Zend/Mail/Storage/Exception.php';
            throw new Zend_Mail_Storage_Exception('cannot change folder, maybe it does not exist');
        }
        
        return $result;
    }
    
    /**
     * examine given folder
     * 
     * - overwritten to get results (UIDNEXT, UIDVALIDITY, ...)
     *
     * folder must be selectable!
     *
     * @param  Zend_Mail_Storage_Folder|string $globalName global name of folder or instance for subfolder
     * @return array with folder values
     * @throws Zend_Mail_Storage_Exception
     * @throws Zend_Mail_Protocol_Exception
     */
    public function examineFolder($globalName)
    {
        $this->_currentFolder = $globalName;
        if (!$result = $this->_protocol->examine($this->_currentFolder)) {
            $this->_currentFolder = null;
            /**
             * @see Zend_Mail_Storage_Exception
             */
            require_once 'Zend/Mail/Storage/Exception.php';
            throw new Zend_Mail_Storage_Exception('cannot change folder, maybe it does not exist');
        }
        
        return $result;
    }
    
    /**
     * get folder status
     * 
     * @param  Zend_Mail_Storage_Folder|string $globalName global name of folder or instance for subfolder
     * @return array with folder values
     */
    public function getFolderStatus($globalName)
    {
        $this->_currentFolder = $globalName;
        $result = $this->_protocol->getFolderStatus($this->_currentFolder);        
        return $result;
    }
    
    /**
     * create a new folder
     *
     * This method also creates parent folders if necessary. Some mail storages may restrict, which folder
     * may be used as parent or which chars may be used in the folder name
     *
     * @param  string                          $name         global name of folder, local name if $parentFolder is set
     * @param  string|Zend_Mail_Storage_Folder $parentFolder parent folder for new folder, else root folder is parent
     * @param  string                          
     * @return null
     * @throws Zend_Mail_Storage_Exception
     */
    public function createFolder($name, $parentFolder = null, $_delimiter = '/')
    {
        if ($parentFolder instanceof Zend_Mail_Storage_Folder) {
            $folder = $parentFolder->getGlobalName() . $_delimiter . $name;
        } else if ($parentFolder != null) {
            $folder = $parentFolder . $_delimiter . $name;
        } else {
            $folder = $name;
        }
        
        $translate = Tinebase_Translation::getTranslation('Felamimail');

        if (!$this->_protocol->create($folder)) {
            /**
             * @see Zend_Mail_Storage_Exception
             */
            require_once 'Zend/Mail/Storage/Exception.php';
            throw new Zend_Mail_Storage_Exception($translate->_('cannot create folder') . ' ' . $folder . ', ' . $translate->_('perhaps it already exists.'));
        }
    }
    
    /**
     * Fetch a message
     *
     * @param int $id number of message
     * @return Zend_Mail_Message
     * @throws Zend_Mail_Protocol_Exception
     */
    public function getMessage($id)
    {
        $data = $this->_protocol->fetch(array('FLAGS', 'RFC822.HEADER'), $id, null, $this->_useUid);
        $header = $this->_fixHeader($data['RFC822.HEADER'], $id, $spaces);

        $flags = array();
        foreach ($data['FLAGS'] as $flag) {
            $flags[] = isset(self::$_knownFlags[$flag]) ? self::$_knownFlags[$flag] : $flag;
        }

        return new $this->_messageClass(array('handler' => $this, 'id' => $id, 'headers' => $header, 'flags' => $flags, 'spaces' => $spaces));
    }
    
    /**
     * Get raw content of message or part
     *
     * @param  int               $id   number of message
     * @param  null|array|string $part path to part, TEXT for message content or null for headers and body (@see http://www.faqs.org/rfcs/rfc3501.html / 6.4.5.  FETCH Command)  
     * @param  boolean           $peek use BODY.PEEK to not set the seen flag
     * @return string raw content
     * @throws Felamimail_Exception_IMAPMessageNotFound
     * @throws Felamimail_Exception_IMAP
     */
    public function getRawContent($id, $part = 'TEXT', $peek = false)
    {
        if ($peek === false) {
            $item = 'BODY';
        } else {
            $item = 'BODY.PEEK';
        }
        
        $item = $item . "[$part]";
        
        try {
            $result = $this->_protocol->fetch($item, $id, null, $this->_useUid);
        } catch (Zend_Mail_Protocol_Exception $zmpe) {
            if ($zmpe->getMessage() == 'the single id was not found in response') {
                throw new Felamimail_Exception_IMAPMessageNotFound('Message with id ' . $id . ' not found on IMAP server.');
            } else {
                throw new Felamimail_Exception_IMAP($zmpe->getMessage());
            }
        }
        
        return $result;
    }
    
    /**
     * set flags for message
     *
     * NOTE: this method can't set the recent flag.
     *
     * @param  int   $id    number of message
     * @param  array $flags new flags for message
     * @throws Zend_Mail_Storage_Exception
     */
    public function setFlags($id, $flags)
    {
        if (!$this->_protocol->store($flags, $id, null, null, true, $this->_useUid)) {
            /**
             * @see Zend_Mail_Storage_Exception
             */
            require_once 'Zend/Mail/Storage/Exception.php';
            throw new Zend_Mail_Storage_Exception('cannot set flags, have you tried to set the recent flag or special chars?');
        }
    }
        
    /**
     * Get sorted messages through the Impa sort command
     * 
     * @param array $params
     * @param boolean $uid
     * @param boolean $descending
     * @param array $search
     * @param string $charset
     * @return array
     * 
     * @todo verify capabilities and throw an exception if server don't implement sort extension
     */
    public function sort(array $params, array $search = NULL, $charset = 'UTF-8')
    {
        $result = $this->_protocol->sort($params, $this->_useUid, $search, $charset);
        
        return $result;
    }
    
    /**
     * do a search request
     *
     * This method is currently marked as internal as the API might change and is not
     * safe if you don't take precautions.
     *
     * @return array message ids
     */
    public function search(array $params)
    {
        $result = $this->_protocol->search($params, $this->_useUid);
        
        return $result;
    }
    
    /**
     * add flags
     *
     * @param int $id
     * @param array $flags
     */
    public function addFlags($id, $flags)
    {
        if (!$this->_protocol->store($flags, $id, null, '+', true, $this->_useUid)) {
            /**
             * @see Zend_Mail_Storage_Exception
             */
            require_once 'Zend/Mail/Storage/Exception.php';
            throw new Zend_Mail_Storage_Exception('cannot set flags, have you tried to set the recent flag or special chars?');
        }
    }
    
    /**
     * clear flags
     *
     * @param int $id
     * @param array $flags
     */
    public function clearFlags($id, $flags)
    {
        if (!$this->_protocol->store($flags, $id, null, '-', true, $this->_useUid)) {
            /**
             * @see Zend_Mail_Storage_Exception
             */
            require_once 'Zend/Mail/Storage/Exception.php';
            throw new Zend_Mail_Storage_Exception('cannot set flags, have you tried to set the recent flag or special chars?');
        }
    }
    
    /**
     * get root folder or given folder
     *
     * @param  string $reference mailbox reference for list
     * @param  string $mailbox   mailbox name match with wildcards
     * @return Zend_Mail_Storage_Folder root or wanted folder
     * @throws Zend_Mail_Storage_Exception
     * @throws Zend_Mail_Protocol_Exception
     */
    public function getFolders($reference = '', $mailbox = '*')
    {
        $folders = $this->_protocol->listMailbox((string)$reference, $mailbox);
        if (!$folders) {
            throw new Zend_Mail_Storage_Exception('folder not found');
        }

        ksort($folders, SORT_STRING);
        
        $result = array();
        
        foreach ($folders as $globalName => $data) {
            $pos = strrpos($globalName, $data['delim']);
            if ($pos === false) {
                $localName = $globalName;
            } else {
                $localName = substr($globalName, $pos + 1);
            }
            $data['flags'] = array_map('strtolower', $data['flags']);
            if($data['flags']) {
                $selectable  = in_array('\\noselect', $data['flags']) ? false : true;
                $hasChildren = in_array('\\haschildren', $data['flags']) ? true : false;
            } else {
                $selectable = true;
                $hasChildren = true;
            }
            $folder = array(
                'localName'    => $localName,
                'globalName'   => $globalName,
                'delimiter'    => $data['delim'],
                'isSelectable' => $selectable,
                'hasChildren'  => $hasChildren
            );
            
            $result[$globalName] = $folder;
        }
        
        return $result;
    }
    
    /**
     * return uid for given message numbers
     *
     * @param int $from
     * @param int|null $to
     * @return array
     */
    public function getUid($from, $to = null)
    {
        $data = $this->_protocol->fetch('UID', $from, $to);
        
        if(!is_array($data)) {
            return array($from => $data);
        } else {
            return $data;
        }
    }
        
    /**
     * get messages summary
     *
     * @param int $from
     * @param int|null $to
     * @return array with $this->_messageClass (Felamimail_Message)
     */
    public function getSummary($from, $to = null, $_useUid = null, $_folderId = NULL)
    {
        $useUid = ($_useUid === null) ? $this->_useUid : (bool) $_useUid;
        $summary = $this->_protocol->fetch(array('UID', 'FLAGS', 'RFC822.HEADER', 'INTERNALDATE', 'RFC822.SIZE', 'BODYSTRUCTURE'), $from, $to, $useUid);
                
        // fetch returns a different structure when fetching one or multiple messages
        if($to === null && ctype_digit("$from")) {
            $summary = array(
                $from => $summary
            );
        }
        
        $messages = array();
        
        foreach($summary as $id => $data) {
            $header = $this->_fixHeader($data['RFC822.HEADER'], $id, $spaces);
            Zend_Mime_Decode::splitMessage($header, $header, $null);
            
            $structure = $this->parseStructure($data['BODYSTRUCTURE']);
            
            $flags = array();
            foreach ($data['FLAGS'] as $flag) {
                $flags[] = isset(self::$_knownFlags[$flag]) ? self::$_knownFlags[$flag] : $flag;
            }
    
            if($this->_useUid === true) {
                $key = $data['UID'];
            } else {
                $key = $id;
            }
            
            
            $messages[$key] = array(
                'header'    => $header,
                'flags'     => $flags,
                'received'  => $data['INTERNALDATE'],
                'size'      => $data['RFC822.SIZE'],
                'structure' => $structure,
                'uid'       => $data['UID']
            );
            
            if (!empty($_folderId))
            {
                $messages[$key]['folder_id'] = $_folderId;
            }
            
        }
        
        if($to === null && ctype_digit("$from")) {
            // only one message requested
            return $messages[$from];
        } else {
            // multiple messages requested
            return $messages;
        }
    }
    
    /**
     * get messages flags
     *
     * @param int $from
     * @param int|null $to
     * @return array of flags
     */
    public function getFlags($from, $to = null, $_useUid = null)
    {
        $useUid = ($_useUid === null) ? $this->_useUid : (bool) $_useUid;
        $summary = $this->_protocol->fetch(array('UID', 'FLAGS'), $from, $to, $useUid);
                
        // fetch returns a different structure when fetching one or multiple messages
        if($to === null && ctype_digit("$from")) {
            $summary = array(
                $from => $summary
            );
        }
        
        $messages = array();
        
        foreach($summary as $id => $data) {
            $flags = array();
            foreach ($data['FLAGS'] as $flag) {
                $flags[] = isset(self::$_knownFlags[$flag]) ? self::$_knownFlags[$flag] : $flag;
            }
    
            if($this->_useUid === true) {
                $key = $data['UID'];
            } else {
                $key = $id;
            }
            
            
            $messages[$key] = array(
                'flags'     => $flags,
                'uid'       => $data['UID']
            );
        }
        
        if($to === null && ctype_digit("$from")) {
            // only one message requested
            return $messages[$from];
        } else {
            // multiple messages requested
            return $messages;
        }
    }
    
    /**
     * parse message structure
     * 
     * @param array $_structure
     * @param integer $_partId
     * @return array structure
     */
    public function parseStructure($_structure, $_partId = null)
    {
        try {
            $structure = $this->_parsePartStructure($_structure, $_partId);
        } catch (Felamimail_Exception_IMAP $fei) {
            if (Tinebase_Core::isLogLevel(Zend_Log::WARN)) Tinebase_Core::getLogger()->warn(__METHOD__ . '::' . __LINE__ . ' Could not parse structure. Assuming text/plain default structure.');
            $structure = $this->_getBasicNonMultipartStructure($_partId);
        }
        
        if ($structure['partId'] === null && empty($structure['parts'])) {
            $structure['partId'] = 1;
        }
        
        return $structure;
    }
    
    /**
     * returns basic non multipart message structure
     * 
     * @param integer $_partId
     * @return array
     */
    protected function _getBasicNonMultipartStructure($_partId)
    {
        $structure = array(
            'partId'      => $_partId,
            'contentType' => Felamimail_Model_Message::CONTENT_TYPE_PLAIN,
            'type'        => 'text',
            'subType'     => 'plain',
            'parameters'  => array(),
            'id'          => null,
            'description' => null,
            'encoding'    => null,
            'size'        => null,
            'lines'       => null,
            'disposition' => null,
            'language'    => null,
            'location'    => null
        );
        
        return $structure;
    }
    
    /**
     * parse message part structure (this is called recursivly by _parseStructureMultiPart() and  _parseStructureNonMultiPart())
     * 
     * @param array $_structure
     * @param integer $_partId
     * @return array structure
     */
    protected function _parsePartStructure($_structure, $_partId)
    {
        if (is_array($_structure[0])) {
            $structure = $this->_parseStructureMultiPart($_structure, $_partId);
        } else {
            $structure = $this->_parseStructureNonMultiPart($_structure, $_partId);
        }
        
        return $structure;
    }
    
    /**
     * parse multipart message structure
     * 
     * @param array $_structure
     * @param integer $_partId
     */
    protected function _parseStructureMultiPart($_structure, $_partId)
    {
        $structure = array(
            'partId'      => $_partId,
            'contentType' => null,
            'type'        => null,
            'subType'     => null,
            'parts'       => array(),
            'parameters'  => array(),
            'disposition' => null,
            'language'    => null,
            'location'    => null
        );
        
        $index = 0;
        
        // all arrays until the first non array value are parts
        foreach ($_structure as $part) {
            if (!is_array($part)) {
                break;
            }
            $index++;
            
            $partId = ($_partId === null) ? $index : $_partId . '.' . $index;
            $structure['parts'][$partId] = $this->_parsePartStructure($part, $partId);
        }

        // content type
        $type    = 'multipart';
        $subType = strtolower($_structure[$index]);
        $structure['contentType'] = $type . '/' . $subType;
        $structure['type']        = $type;
        $structure['subType']     = $subType;
        $index++;
        
        // body parameters
        if(isset($_structure[$index]) && is_array($_structure[$index])) {
            $parameters = array();
            for($i=0; $i<count($_structure[$index]); $i++) {
                $key   = strtolower($_structure[$index][$i]);
                $value = $_structure[$index][++$i];
                $parameters[$key] = $this->_mimeDecodeHeader($value);
            }
            $structure['parameters'] = $parameters; 
        }
        $index++;
        
        // body disposition
        if (isset($_structure[$index]) && $_structure[$index] != 'NIL') {
            $structure['disposition']['type'] = $_structure[$index][0];
            
            if ($_structure[$index][1] != 'NIL') {
                $parameters = array();
                for($i=0; $i<count($_structure[$index][1]); $i++) {
                    if (is_array($_structure[$index][1]) && $_structure[$index][1][$i] != 'NIL') {
                        $key   = strtolower($_structure[$index][1][$i]);
                        $value = $_structure[$index][1][++$i];
                        $parameters[$key] = $this->_mimeDecodeHeader($value);
                    }
                }
                $structure['disposition']['parameters'] = $parameters;
            }
        }
        $index++;
        
        // body language
        if (isset($_structure[$index]) && $_structure[$index] != 'NIL') {
            $structure['language'] = $_structure[$index]; 
        }
        $index++;
        
        // body location
        if (isset($_structure[$index]) && $_structure[$index] != 'NIL') {
            $structure['location'] = strtolower($_structure[$index]); 
        }
        
        return $structure;
    }
    
    /**
     * parse non multipart message structure
     * 
     * @param array $_structure
     * @param integer $_partId
     * @return array
     * @throws Felamimail_Exception_IMAP
     */
    protected function _parseStructureNonMultiPart($_structure, $_partId)
    {
        if (is_array($_structure[0]) || is_array($_structure[1])) {
            if (Tinebase_Core::isLogLevel(Zend_Log::DEBUG)) Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . ' ' . print_r($_structure, TRUE));
            throw new Felamimail_Exception_IMAP('Invalid structure. String expected, got array.');
        }
        
        $structure = $this->_getBasicNonMultipartStructure($_partId);
        
        /** basic fields begin **/
        
        // contentType
        $type    = strtolower($_structure[0]);
        $subType = strtolower($_structure[1]);
        $structure['contentType'] = $type . '/' . $subType;
        $structure['type']        = $type;
        $structure['subType']     = $subType;
        
        // body parameters
        if(is_array($_structure[2])) {
            $parameters = array();
            for($i=0; $i<count($_structure[2]); $i++) {
                $key   = strtolower($_structure[2][$i]);
                $value = $_structure[2][++$i];
                $parameters[$key] = $this->_mimeDecodeHeader($value);
            }
            $structure['parameters'] = $parameters; 
        }
        
        // body id
        if($_structure[3] != 'NIL') {
            $structure['id'] = $_structure[3]; 
        }
        
        // body description
        if($_structure[4] != 'NIL') {
            $structure['description'] = $_structure[4]; 
        }
        
        // body encoding
        if($_structure[5] != 'NIL') {
            $structure['encoding'] = strtolower($_structure[5]); 
        }
        
        // body size
        if($_structure[6] != 'NIL') {
            $structure['size'] = strtolower($_structure[6]); 
        }
        
        /** basic fields end **/
        $index = 7;
        
        if($type == 'message' && $subType == 'rfc822') {
            $structure['messageEnvelop'] = $_structure[7];
            $structure['messageStructure'] = $this->_parsePartStructure($_structure[8], $_partId);
            $structure['messageLines'] = $_structure[9];
            
            // index of the first element containing extension data 
            $index = 10;
        } elseif($type == 'text') {
            if($_structure[7] != 'NIL') {
                $structure['lines'] = $_structure[7]; 
            }
            // index of the first element containing extension data 
            $index = 8;
        }
        
        // body md5
        if(array_key_exists($index, $_structure) && $_structure[$index] != 'NIL') {
            $structure['md5'] = strtolower($_structure[$index]); 
        }
        $index++;
        
        // body disposition
        if (array_key_exists($index, $_structure) && $_structure[$index] != 'NIL') {
            $structure['disposition']['type'] = $_structure[$index][0];
            
            if (isset($_structure[$index][1]) && $_structure[$index][1] != 'NIL' && is_array($_structure[$index][1])) {
                $parameters = array();
                for ($i=0; $i<count($_structure[$index][1]); $i++) {
                    $key = strtolower($_structure[$index][1][$i]);
                    $value = $_structure[$index][1][++$i];
                    $parameters[$key] = $this->_mimeDecodeHeader($value);
                }
                $structure['disposition']['parameters'] = $parameters;
            }
        }
        $index++;
        
        // body language
        if(array_key_exists($index, $_structure) && $_structure[$index] != 'NIL' && ! is_array($_structure[$index])) {
            $structure['language'] = strtolower($_structure[$index]); 
        }
        $index++;
        
        // body location
        if(array_key_exists($index, $_structure) && $_structure[$index] != 'NIL' && ! is_array($_structure[$index])) {
            $structure['location'] = strtolower($_structure[$index]); 
        }
        
        return $structure;
    }
    
    /**
     * validates that messageUid still exists on imap server 
     * @param $from
     * @param $to
     */
    public function messageUidExists($from, $to = null)
    {
        $result = $this->_protocol->fetch('UID', $from, $to, true);
        
        return $result;
    }
    
    /**
     * get uids by uid
     * 
     * @param int $from
     * @param int|null $to
     * @return array with uids
     */
    public function getUidbyUid($from, $to = null)
    {
        $result = $this->_protocol->fetch('UID', $from, $to, true);
        
        // @todo check if this is really needed
        // sanitize result, sometimes the fetch command can return wrong results :(
        if (is_numeric($from) && is_numeric($to)) {
            foreach ($result as $key => $value) {
                // check if out of bounds
                if ($value < min($to, $from) || $value > max($to, $from)) {
                    Tinebase_Core::getLogger()->notice(__METHOD__ . '::' . __LINE__ . ' Uid out of bounds detected: ' 
                        . $key . ' (' . min($to, $from) . ' - ' . max($to, $from) . ')');
                    unset($result[$key]);
                }
            }
        } else {
            // @todo perhaps we should do an array_intersect here as well
        }
        
        return array_values($result);
    }
    
    public function resolveMessageSequence($from, $to = null)
    {
        $result = $this->_protocol->fetch('UID', $from, $to, false);
        
        return $result;
    }
    
    public function resolveMessageUid($from, $to = null)
    {
        // we always need to ask for multiple values(array), because that's the only way to retrieve the message sequence 
        if ($to === null && !is_array($from)) {
            $from = (array) $from;
        }
        
        $result = $this->_protocol->fetch('UID', $from, $to, true);
        
        if (count($result) === 0) {
            throw new Zend_Mail_Protocol_Exception('the single id was not found in response');
        }
        
        if ($to === null && count($from) === 1) {
            return key($result);
        } else {
            return array_keys($result);
        }
    }
    
    /**
     * Remove a message from server. If you're doing that from a web enviroment
     * you should be careful and use a uniqueid as parameter if possible to
     * identify the message.
     *
     * @param   int $id number of message
     * @return  void
     * @throws  Felamimail_Exception_IMAP
     */
    public function removeMessage($id)
    {
        if (!$this->_protocol->store(array(Zend_Mail_Storage::FLAG_DELETED), $id, null, '+', true, $this->_useUid)) {
            throw new Felamimail_Exception_IMAP('cannot set deleted flag');
        }
        // TODO: expunge here or at close? we can handle an error here better and are more fail safe
        if (!$this->_protocol->expunge()) {
            throw new Felamimail_Exception_IMAP('message marked as deleted, but could not expunge');
        }
    }
    
    /**
     * copy an existing message
     *
     * @param  int|array                       $id     number of message(s)
     * @param  string|Zend_Mail_Storage_Folder $folder name or instance of targer folder
     * @return void
     * @throws Felamimail_Exception_IMAP
     */
    public function copyMessage($id, $folder)
    {
        if (!$this->_protocol->copy($folder, $id, null, $this->_useUid)) {
            throw new Felamimail_Exception_IMAP('Cannot copy message, does the target folder "' . $folder . '" exist? Or maybe you exceeded your Quota.');
        }
    }
    
    /**
     * get server capabilities and namespace
     *
     * @return array
     */
    public function getCapabilityAndNamespace()
    {
        $capabilities = $this->_protocol->capability();
        
        $result = array('capabilities' => $capabilities);
        if (in_array('NAMESPACE', $capabilities)) {
            if ($namespace = $this->_protocol->getNamespace()) {
                $result['namespace'] = $namespace;
            }
        }
        
        return $result;
    }
    
    /**
     * empty complete folder by setting \Deleted flag and expunge afterwards
     * 
     * @param string $globalName
     * @return void
     * @throws Zend_Mail_Storage_Exception
     */
    public function emptyFolder($globalName)
    {
        $this->selectFolder($globalName);
        if (! $this->_protocol->store(array(Zend_Mail_Storage::FLAG_DELETED), 1, INF, null, true)) {
            /**
             * @see Zend_Mail_Storage_Exception
             */
            require_once 'Zend/Mail/Storage/Exception.php';
            throw new Zend_Mail_Storage_Exception('cannot set \Deleted flags');
        }
        $this->_protocol->expunge();
    }
    
    /**
     * remove all messages marked as deleted
     * 
     * @param string $globalName
     * @return void
     * @throws Zend_Mail_Storage_Exception
     */
    public function expunge($globalName)
    {
        $this->selectFolder($globalName);
        $this->_protocol->expunge();
    }
    
    protected function _mimeDecodeHeader($_header)
    {
        $result = iconv_mime_decode($_header, ICONV_MIME_DECODE_CONTINUE_ON_ERROR);
        
        return $result;
    }
    
    /**
     * get header (remove spaces if needed)
     * NOTE: this fixes a bug in Zend_Mime_Decode: headers with leading spaces are not parsed correctly, 
     *  we remove the spaces here to make it work again.
     * 
     * @param string $_header
     * @param string $_messageId
     * @param int $_leadingSpaces
     * @return string
     */
    protected function _fixHeader($_header, $_messageId, &$_leadingSpaces = 0)
    {
        // check for valid header at first line (this is done again in Zend_Mime_Decode)
        $firstline = strtok($_header, "\n");
        if (preg_match('/^([\s]+)[^:]+:/', $firstline, $matches)) {
            // replace all spaces before headers
            Tinebase_Core::getLogger()->notice(__METHOD__ . '::' . __LINE__ . ' No headers found. Removing leading spaces from headers for message ' . $_messageId . '.');
            $_leadingSpaces = strlen($matches[1]);
            $result = preg_replace("/^[\s]{1," . $_leadingSpaces . "}/m", "", $_header);
        } else {
            $_leadingSpaces = 0;
            $result = $_header;
        }
        
        return $result;
    }
    
    /**
     * get quota for mailbox
     * 
     * @param string $_mailbox
     * @return array quota info
     */
    public function getQuota($_mailbox)
    {
        return $this->_protocol->getQuotaRoot($_mailbox);
    }
    
     /**
     * get folder Acls
     * 
     * @param  Zend_Mail_Storage_Folder|string $globalName global name of folder or instance for subfolder
     * @return array with folder values
     */
    public function getFolderAcls($_globalName)
    {
        $this->_currentFolder = $_globalName;
        $result = $this->_protocol->getFolderAcls($this->_currentFolder);        
        return $result;
    }
    
     /**
     * get folder Acls
     * 
     * @param  Zend_Mail_Storage_Folder|string $globalName global name of folder or instance for subfolder
     * @return array with folder values
     */
    public function getUsersWithSendAsAcl($_folders)
    {
        $result = $this->_protocol->getUsersWithSendAsAcl($_folders);        
        return $result;
    }
    
    
    public function setFolderAcls($globalName,$acls)
    {
        $this->_currentFolder = $globalName;
        $result = $this->_protocol->setFolderAcls($this->_currentFolder,$acls);        
        return $result;
    }
    
    
}

