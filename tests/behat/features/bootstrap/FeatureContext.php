<?php

use Behat\Behat\Context\ClosuredContextInterface,
    Behat\Behat\Context\TranslatedContextInterface,
    Behat\Behat\Context\BehatContext,
    Behat\Behat\Exception\PendingException;

use Behat\Gherkin\Node\PyStringNode,
    Behat\Gherkin\Node\TableNode;

class FeatureContext extends Behat\MinkExtension\Context\MinkContext
{
    
    public function __construct(array $parameters) {
        $this->useContext('email', new EmailContext($this));
    }
    
    /**
     * @Transform /(xpath|css|named) element "([^"]*)"/ 
     */
    public function getTipo($seletor, $elemento)
    {
        if ($seletor == 'named')
            $elemento = explode('=', $elemento);
        
        return array(
            'selector' => $seletor,
            'element'  => $elemento
        );
    }
    
    /**
     * @When /^I wait (\d+) seconds?$/
     */
    public function iWaitSeconds($sec)
    {
        $this->getSession()->wait($sec * 1000);
    }

    /**
     * @Given /^I wait (\d+) seconds? or until ((xpath|css|named) element "[^"]*") is present$/
     */
    public function iWaitToSeeElement($sec, $e)
    {
        $cont = 0;
        while ($cont < $sec)
        {
            sleep(1);
            $cont++;
            $el = $this->getSession()->getPage()->find($e['selector'], $e['element']);
            if (!empty($el) && $el->isVisible())
                return;
        }
                
        throw new \Exception("Não achou o elemento $e!");
    }
    
    /**
     * @Given /^I click in ((xpath|css|named) element "[^"]*")$/
     */
    public function iClickInCssElement($e)
    {
        $e = $this->getSession()->getPage()->find($e['selector'], $e['element']);
        $e->click();
    }
    
    
    /*
     * Classe "iClickInElement" é a mais nova e deverá substituir "iClickInCssElement"
     */
    
    /**
    * @Given /^I click (once|twice) in ((xpath|css|named) element "[^"]*")$/
    */
    public function iClickInElement($quantity, $e)
    {
        $el = $this->getSession()->getPage()->find($e['selector'], $e['element']);
        if ($quantity == 'once')
            $el->click();
        else
            $el->doubleClick();
    }
    
    
    /**
     * @Given /^I choose "([^"]*)" from "([^"]*)"$/
     */
    public function iChooseFrom($texto, $element)
    {
        $valores = $this->getSession()->getPage()->findAll('css', $element);
        foreach ($valores as $valor)
            if ($texto == $valor->getHtml())
            {
                $valor->click();
                return;
            }
            
        throw new \Exception("Não existe a opção $texto!");
    }
    
    /**
     * @When /^I fill xpath "([^"]*)" with "([^"]*)"$/
     */
    public function fillXPath($locator, $value)
    {
        $el = $this->getSession()->getPage()->find('xpath', $locator);
        if (!empty($el))
        {
            $el->setValue($value);
            return;
        }
        
        throw new \Exception("Elemento $locator não existe!");
    }
    
    /**
    * @Then /^I press Enter in ((xpath) element "[^"]*")$/
    */
    public function iPressEnterInXpath($e)
    {
        $el = $this->getSession()->getPage()->find($e['selector'], $e['element']);
        $el->keyPress('13');
    }

}
