<?php
/**
 * Tine 2.0
 *
 * @package     Tinebase
 * @subpackage  View
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @copyright   Copyright (c) 2007-2012 Metaways Infosystems GmbH (http://www.metaways.de)
 * @author      Flávio Gomes da Silva Lisboa <flavio.lisboa@serpro.gov.br>
 */

/**
 * View Class
 *
 * @package     Tinebase
 * @subpackage  View
 */
class Tinebase_View
{
	public static function getJSConfig()
	{
		$extJS     = 'ext-all.css';
		$pathTheme = 'tine20/resources/css/tine20.css';
		if(isset(Tinebase_Core::getConfig()->themes->default))
		{
			$numDefaultTheme = Tinebase_Core::getConfig()->themes->default;
			//seted the expressso array and the name of the cookie of the theme in the config AND
			if ((isset(Tinebase_Core::getConfig()->themes->cookieTheme)) &&
					(!empty(Tinebase_Core::getConfig()->themes->cookieTheme)) &&
					(isset($_COOKIE[Tinebase_Core::getConfig()->themes->cookieTheme])))//the cookie of the theme is seted
			{
				$numDefaultTheme = $_COOKIE[Tinebase_Core::getConfig()->themes->cookieTheme];
			}
			//the theme seted in the cookie exists in the config
			if (isset(Tinebase_Core::getConfig()->themes->themelist->get($numDefaultTheme)->path))
			{
				$pathTheme = Tinebase_Core::getConfig()->themes->themelist->get($numDefaultTheme)->path;
				if ((!isset(Tinebase_Core::getConfig()->themes->themelist->get($numDefaultTheme)->useBlueAsBase)) ||
						(Tinebase_Core::getConfig()->themes->themelist->get($numDefaultTheme)->useBlueAsBase == 0))
				{
					$extJS = 'ext-all-notheme.css';
				}
			}
		}
		
		$output =  '<link rel="stylesheet" type="text/css" href="library/ExtJS/resources/css/'.$extJS.'" />';
		$output .=  '<link rel="stylesheet" type="text/css" href="themes/'.$pathTheme.'/resources/css/'.$pathTheme.'.css" />';
		$output .= "\n";
		return $output;
	}


}
