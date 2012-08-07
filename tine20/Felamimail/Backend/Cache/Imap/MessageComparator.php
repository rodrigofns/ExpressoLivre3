<?php
/**
 * Tine 2.0
 *
 * @package     Felamimail
 * @subpackage  Backend
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cassiano Dal Pizzol <cassiano.dalpizzol@serpro.gov.br>
 * @author      Bruno Costa Vieira <bruno.vieira-costa@serpro.gov.br>
 * @author      Mario Cesar Kolling <mario.kolling@serpro.gov.br>
 * @copyright   Copyright (c) 2009-2013 Serpro (http://www.serpro.gov.br)
 *
 * @todo create an Account Map or reuse some Zend object
 */

final class Felamimail_Backend_Cache_Imap_MessageComparator
{
    protected $_pagination;
    protected $_accountMap;
    
    public function __construct(Tinebase_Model_Pagination $_pagination)
    {
        $this->_pagination = $_pagination;
        $this->_accountMap = array();
    }
    
    protected function compareStrings($str1, $str2)
    {
        $str1 = Felamimail_Message::convertText($str1);
        $str2 = Felamimail_Message::convertText($str2);
        return ($this->_pagination->dir == 'ASC') ? strcasecmp($str1, $str2) : strcasecmp($str2, $str1);
    }
    
    protected function compareIntegers($intval1, $intval2)
    {
        return ($this->_pagination->dir == 'ASC') ? $intval1 - $intval2 :  $intval2 - $intval1;
    }
    
    /**
     * Compare order of Felamimail_Model_Message acording to Tinebase_Model_Pagination
     * @param Felamimail_Model_Message $msg1
     * @param Felamimail_Model_Message $msg2
     * @return int 
     * 
     * @todo Convert int security value in Expresso_Smime to corresponding string type
     */
    public function compare($msg1, $msg2)
    {
        switch ($this->_pagination->sort)
        {
            case 'received' :
                $value1 = $msg1[$this->_pagination->sort];
                $value2 = $msg2[$this->_pagination->sort];
            case 'sent' :
                $value1 = isset($value1) ? $value1 : $msg1['header']['date'];
                $value2 = isset($value2) ? $value2 : $msg2['header']['date'];
                $value1 = Felamimail_Message::convertDate($value1);
                $value2 = Felamimail_Message::convertDate($value2);
                
                return $this->compareIntegers(intval($value1->format("U")), intval($value2->format("U")));
            
            case 'size' : // Integer
                
                return $this->compareIntegers($msg1[$this->_pagination->sort], $msg2[$this->_pagination->sort]);

//                    
//            case 'flags' :
//                
//                if (!empty($msg1->{$this->_pagination->sort}))
//                {
//                    sort($msg1->{$this->_pagination->sort});
//                }
//                
//                if (!empty($msg2->{$this->_pagination->sort}))
//                {
//                    sort($msg2->{$this->_pagination->sort});
//                }
//                
//                return $this->compareStrings(implode(',', $msg1->{$this->_pagination->sort}),
//                        implode(',', $msg2->{$this->_pagination->sort}));
//                    
            case 'folder_id' : // folder_ids
                
                $folders = array();
                foreach (array($msg1, $msg2) as $msg)
                {
                    $folder = Felamimail_Backend_Cache_Imap_Folder::decodeFolderUid($msg[$this->_pagination->sort]);

                    // Optimization! Only create the account object once for every sort operation.
                    $account = (array_key_exists($folder['accountId'], $this->_accountMap)) ?
                        $this->_accountMap[$folder['accountId']] :
                        ($this->_accountMap[$folder['accountId']] =
                                Felamimail_Controller_Account::getInstance()->get($folder['accountId']));

                    $folders[] = $account->name . '/' . $folder['globalName'];
                }

                list($folder1, $folder2) = $folders;
                return $this->compareStrings($folder1, $folder2);
                
            case 'sender' :
            case 'to' :    
            case 'from_name' :
            case 'from_email' :
                list($header,$field) = explode('_', $this->_pagination->sort);
                $field = empty($field) ? 'email' : $field;
                $value1 = Felamimail_Message::convertAddresses($msg1['header'][$header]);
                $value2 = Felamimail_Message::convertAddresses($msg2['header'][$header]);
                return $this->compareStrings((isset($value1[0]) && array_key_exists($field, $value1[0])) ? $value1[0][$field] : '',
                    (isset($value2[0]) && array_key_exists($field, $value2[0])) ? $value2[0][$field] : '');

            case 'subject' : // Strings
                return $this->compareStrings($msg1['header'][$this->_pagination->sort],
                        $msg2['header'][$this->_pagination->sort]);
            case 'id' :
                return $this->compareStrings($msg1[$this->_pagination->sort],
                        $msg2[$this->_pagination->sort]);
        }
    }
    
    
            
}