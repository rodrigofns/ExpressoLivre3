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
 */

final class Felamimail_Backend_Cache_Imap_MessageComparator
{
    protected $_pagination;
    
    public function __construct(Tinebase_Model_Pagination $_pagination)
    {
        $this->_pagination = $_pagination;
    }
    
    protected function compareByReceived($msg1, $msg2)
    {
        
    }
    
    protected function compareByString($msg1, $msg2)
    {
        return ($this->_pagination->dir == 'ASC') ?
            -1 * strcasecmp($msg1['header'][$this->_pagination->sort], $msg2['header'][$this->_pagination->sort]) :
            strcasecmp($msg1['header'][$this->_pagination->sort], $msg2['header'][$this->_pagination->sort]);
    }

    public function compare($msg1, $msg2)
    {
        switch ($this->_pagination->sort)
        {
            case 'received' :
                return $this->compareByReceived($msg1, $msg2);
            default :
                return $this->compareByString($msg1, $msg2);
        }
    }
    
    
            
}