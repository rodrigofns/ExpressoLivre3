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
        return ($this->_pagination->dir == 'ASC') ? strcasecmp($str2, $str1) : strcasecmp($str1, $str2);
    }
    
    protected function compareIntegers($intval1, $intval2)
    {
        return ($this->_pagination->dir == 'ASC') ? $intval2 - $intval1 : $intval1 - $intval2;
    }
    
    /**
     *
     * @param Felamimail_Model_Message $msg1
     * @param Felamimail_Model_Message $msg2
     * @return int 
     * 
     * @todo Convert int security value in Expresso_Smime to corresponding string type
     */
    public function compare(Felamimail_Model_Message $msg1, Felamimail_Model_Message $msg2)
    {
        switch ($this->_pagination->sort)
        {
            case 'received' :
            case 'sent' : // DateTime
                
                $ts1 = intval($msg1->{$this->_pagination->sort}->format("U"));
                $ts2 = intval($msg2->{$this->_pagination->sort}->format("U"));
                return $this->compareIntegers($ts1, $ts2);
                
            case 'size' : // Integer
                
                return $this->compareIntegers($msg1->{$this->_pagination->sort}, $msg2->{$this->_pagination->sort});
                
            case 'to' : // array of e-mails
                
                return $this->compareStrings(implode(',', $msg1->{$this->_pagination->sort}),
                    implode(',', $msg2->{$this->_pagination->sort}));
                    
            case 'folder_id' : // folder_ids
                
                $folders = array();
                foreach (array($msg1, $msg2) as $msg)
                {
                    $folder = Felamimail_Backend_Cache_Imap_Folder::decodeFolderUid($msg->{$this->_pagination->sort});

                    // Optimization! Only create the account object once for every sort operation.
                    $account = (array_key_exists($folder['accountId'], $this->_accountMap)) ?
                        $this->_accountMap[$folder['accountId']] :
                        ($this->_accountMap[$folder['accountId']] =
                                Felamimail_Controller_Account::getInstance()->get($folder['accountId']));

                    $folders[] = $account->name . '/' . $folder['globalName'];
                }

                list($folder1, $folder2) = $folders;
                return $this->compareStrings($folder1, $folder2);
                
            default : // Strings
                
                return $this->compareStrings($msg1->{$this->_pagination->sort}, $msg2->{$this->_pagination->sort});
        }
    }
    
    
            
}