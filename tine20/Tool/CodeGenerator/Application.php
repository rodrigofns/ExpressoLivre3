<?php
/**
 * Application Generator
 *
 * @package     Tool
 * @subpackage  CodeGenerator
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Flávio Gomes da Silva Lisboa <flavio.lisboa@serpro.gov.br>
 * @copyright   Copyright (c) 2012 Metaways Infosystems GmbH (http://www.metaways.de)
 */
class Tool_CodeGenerator_Application implements Tool_CodeGenerator_Interface
{
	const APPLICATION_NAME = '[APPLICATION_NAME]'; 
	
	/**
	 * List of source and target files
	 * @var array
	 */
	private $_sourceAndTargets = array();
	
	/**
	 * List of files to be created
	 * @var array
	 */
	private $_folders = array(
					'Backend',
					'Controller',
					'css',
					'Frontend',
					'js',
					'translations',
					'Model',
					'Setup'
			);	
	
	private $recursiveSources = array(
			'translations'
			);
	
	private $_applicationFolder = null;
	
	private $_applicationName = null;
	
	private $_rootFolder = null;

	public function __construct()
	{
		$applicationName = self::APPLICATION_NAME;
		
		$this->_sourceAndTargets =  array(
				'Backend/ExampleRecord.php' => "Backend/{$applicationName}Record.php",
				'Controller/ExampleRecord.php' => "/Controller/{$applicationName}Record.php",
				'css/ExampleApplication.css' => "/Controller/{$applicationName}Record.php",
				'Frontend/Cli.php' => 'Frontend/Cli.php',
				'Frontend/Http.php' => 'Frontend/Http.php',
				'Frontend/Json.php' => 'Frontend/Json.php',
				'js/ExampleApplication.js' => "js/{$applicationName}Application.js",
				'js/ExampleRecordEditDialog.js' => "js/{$applicationName}RecordEditDialog.js",
				'js/ExampleRecordGridPanel.js' => "js/{$applicationName}RecordGridPanel.js",
				'js/Model.js' => "js/Model.js",
				'Model/ExampleRecord.php' => "Model/{$applicationName}Record.php",
				'Model/ExampleRecordFilter.php' => "Model/{$applicationName}RecordFilter.php",
				'Setup/Initialize.php' => 'Setup/Initialize.php',
				'Setup/setup.xml' => 'Setup/setup.xml',
				'translations' => 'translations',
				'Config.php' => 'Config.php',
				'Controller.php' => 'Controller.php',
				'ExampleApplication.jsb2' => $applicationName . '.jsb2',
				'Exception.php' => 'Exception.php'
				);

	}

	public function build(array $args)
	{
		try {
			$this->_applicationName = $args[0];				
				
			// creates application folder
			$this->_applicationFolder = $args[count($args)-1] . '/' . $args[0];
			
			$this->_rootFolder = $args[count($args)-1];
			
			$this->_createFolders();

			$this->_copyFiles();
			
		} catch (Exception $e) {
			echo $e->getMessage();
		}

	}
	
	/**
	 * Creates application folders
	 */
	private function _createFolders()
	{
		mkdir($this->_applicationFolder);
		
		foreach ($this->_folders as $folder)
		{
			mkdir($this->_applicationFolder . '/' . $folder);
		}		
	}	
	
	/**
	 * Copy template files to target folders
	 */
	private function _copyFiles()
	{
		$templateFolder = $this->_rootFolder . '/' . 'Tool/Application/templates';
		
		foreach($this->_sourceAndTargets as $source => $target)
		{
			$target = str_replace(self::APPLICATION_NAME, $this->_applicationName, $target);
		
			if (in_array($target, $this->recursiveSources))
			{
				$directory = scandir($templateFolder . '/' . $source);
				unset($directory[0]); // this directory
				unset($directory[1]); // parent directory
				foreach($directory as $file)
				{
					$sourcePath = $templateFolder . '/' . $source . '/' . $file;
					$targetPath = $this->_applicationFolder . '/' . $target . '/' . $file;
					$this->_copyFile($sourcePath, $targetPath);
				}
			}
			else
			{
				$sourcePath = $templateFolder . '/' . $source;
				$targetPath = $this->_applicationFolder . '/' . $target;
				$this->_copyFile($templateFolder . '/' . $source, $targetPath);
			}
		}		
	}
	
	/**
	 * Copy file $sourcePath to $targetPath 
	 * @param string $sourcePath
	 * @param string $targetPath
	 */
	private function _copyFile($sourcePath, $targetPath)
	{
		copy($sourcePath, $targetPath);
		$this->_changeFile($targetPath);		
	}
	
	/**
	 * Change content of copied files
	 * @param string $targetPath
	 */
	private function _changeFile($targetPath)
	{
		$content = file_get_contents($targetPath);		
		
		$content = str_replace('ExampleApplication', $this->_applicationName, $content);
		$content = str_replace('ExampleRecord', $this->_applicationName . 'Record', $content);
		
		file_put_contents($targetPath, $content);
	}
	
}

 
