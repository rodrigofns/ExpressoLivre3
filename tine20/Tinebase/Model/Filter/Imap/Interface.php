<?php
/**
 * Tine 2.0
 * 
 * @package     Tinebase
 * @subpackage  Filter
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @copyright   Copyright (c) 2007-2011 Metaways Infosystems GmbH (http://www.metaways.de)
 * @author      Mário César Kolling <mario.kolling@serpro.gov.br>
 */

interface Tinebase_Model_Filter_Imap_Interface
{
    /**
     * get an imap search filter
     */
    public function getFilterImap();
}