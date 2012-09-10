<?php

/**
 * Tine 2.0
 * @package     Webconference
 * @subpackage  Model
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Edgar de Lucca <edgar.lucca@serpro.gov.br>, Marcelo Teixeira <marcelo.teixeira@serpro.gov.br>
 * @copyright   Copyright (c) 2012 Metaways Infosystems GmbH (http://www.metaways.de)
 */
/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
class Webconference_Model_Invite extends Tinebase_Record_Abstract{

    
      /**
     * (non-PHPdoc)
     * @see Tinebase_Record_Abstract::_identifier
     */
    protected $_identifier = 'id';
    
    protected $_converter = NULL;
    
    /**
     * (non-PHPdoc)
     * @see Tinebase_Record_Abstract::_validators
     */
    protected $_validators = array(
        'id'                   => array('allowEmpty' => true,         ), 
        'url'                  => array('allowEmpty' => true          ),
        'roomName'             => array('allowEmpty' => true,         ),
        'moderator'            => array('allowEmpty' => true,         ), 
        'createdBy'            => array('allowEmpty' => true,         ),
        'to'                   => array('allowEmpty' => true,         )
        
    );
    
    
}