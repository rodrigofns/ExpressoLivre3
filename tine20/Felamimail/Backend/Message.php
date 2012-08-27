<?php
/**
 * Tine 2.0
 *
 * @package     Felamimail
 * @subpackage  Backend
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cassiano Dal Pizzol <cassiano.dalpizzol@serpro.gov.br>
 * @author      Bruno Costa Vieira <bruno.vieira-costa@serpro.gov.br>
 * @copyright   Copyright (c) 2009-2013 Serpro (http://www.serpro.gov.br)
 *
 */

/**
 * backend class for Felamimail messages
 *
 * @package     Felamimail
 */
class Felamimail_Backend_Message
{
    /**
     * holds the instance of the singleton
     *
     * @var Felamimail_Controller_Cache_Folder
     */
    private static $_instance = NULL;

    private function construct()
    {
    }

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
     * @return Felamimail_Backend_Cache_Imap_Message or Felamimail_Backend_Cache_Sql_Message
     */
    public static function getInstance()
    {
        if (self::$_instance === NULL)
        {
            $adapter = Tinebase_Core::getConfig()->messagecache;
            $adapter = (empty($adapter))?'sql':$adapter;
            $classname = 'Felamimail_Backend_Cache_' . ucfirst($adapter) . '_Message';
            self::$_instance = new $classname;
        }
        return self::$_instance;
    }
}