<?php

use Behat\Behat\Context\ClosuredContextInterface,
    Behat\Behat\Context\TranslatedContextInterface,
    Behat\Behat\Context\BehatContext,
    Behat\Behat\Exception\PendingException,
    Behat\Behat\Context\Step\Given,
    Behat\Behat\Context\Step\When;

use Behat\Gherkin\Node\PyStringNode,
    Behat\Gherkin\Node\TableNode;


class FeatureContext extends Behat\MinkExtension\Context\MinkContext
{
    
    public function __construct(array $parameters ) {
        $this->useContext('email', new EmailContext($this));
        $this->useContext('chat', new ChatContext($this, $parameters));              
    }
    
    /**
    * @BeforeScenario
    */
    public function restartSession()
    {
        $this->getSession()->restart();
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
        sleep($sec);
    }

    /**
     * @Given /^I wait (\d+) seconds? or until ((xpath|css|named) element "[^"]*" is present( at this moment)?)$/
     */
    public function iWaitToSeeElement($sec, $e, $locator, $atthismoment = null)
    {   
        $cont = 0;
        while ($cont < $sec)
        {
            sleep(1);
            $cont++;
            $el = $this->getSession()->getPage()->find($e['selector'], $e['element']);
            /*
             * Verifica se o elemento procurado apareceu.
             */
            if (!empty($el) && $el->isVisible()){
                /*
                 * Verifica se o horário do evento apareceu na tela. Utilziado para verificar o horário do envio de mensagem do IM
                 */
                if (!(is_null($atthismoment))){
                    $element_hora = "//span[contains(child::text(), '".date ("H:i")."')]";                    
                    $el = $this->getSession()->getPage()->find($e['selector'], $element_hora);
                    if (!empty($el))
                        return;
                    else
                        throw new \Exception("Não achou o elemento $element_hora!");
                                                    
                }
                return;
            }
        }        
                
        throw new \Exception("Não achou o elemento ".$e['element']);
    }
    
   /**
    * @Given /^I wait (\d+) seconds? or until ((xpath|css|named) element "[^"]*" is not present)$/
    */
    public function iWaitSecondsOrUntilNamedElementIsNotPresent($sec, $e, $locator)
    {
        $cont = 0;
        while ($cont < $sec)
        {
            sleep(1);
            $cont++;
            $el = $this->getSession()->getPage()->find($e['selector'], $e['element']);
            /*
             * Verifica se o elemento procurado apareceu.
             */
            if (empty($el))
               return;            
        }        
        if  (empty($el))
            throw new \Exception("Não achou o elemento ".$e['element']);
        else
            throw new \Exception("Elemento ".$e['element']." continua presente após ".$sec." segundos.");
    }
    
    /**
    * @Given /^I( press right)? click (once|twice) in ((xpath|css|named) element "[^"]*")$/ 
    */
    
    public function iClickInElement($right=false, $quantity, $e)
    {
        $el = $this->getSession()->getPage()->find($e['selector'], $e['element']);
        if  (!empty($el)){        
            if ($quantity == 'once'){
                if ($right)
                $el->rightClick();
                else                
                    $el->click();
            }
            else
                $el->doubleClick();
        }
        else
            throw new \Exception("Não achou o elemento ".$e['element']);
    }
    
    /**
     * @Given /^I choose "([^"]*)" from ((xpath|css|named) element "[^"]*")$/
     */
    public function iChooseFrom($texto, $e)
    {        
        $valores = $this->getSession()->getPage()->findAll($e['selector'], $e['element']);
        foreach ($valores as $valor)            
            if ($texto == $valor->getHtml())
            {
                $valor->click();
                return;
            }
            var_dump ($valor->getHtml());
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
    * @When /^I fill in ((xpath|css|named) element "[^"]*") with "([^"]*)"$/
    */
    public function fillElement($e, $selector, $value)
    {
        $el = $this->getSession()->getPage()->find($e['selector'], $e['element']);
        if (!empty($el))
        {
            $el->setValue($value);
            return;
        }
        
        if ($selector == 'named')
            throw new \Exception("Elemento {$e['element'][1]} não existe!");
        else
            throw new \Exception("Elemento {$e['element']} não existe!");
    }
    
    
    /**
    * @Then /^I press Enter in ((xpath) element "[^"]*")$/
    */
    public function iPressEnterInXpath($e)
    {
        $el = $this->getSession()->getPage()->find($e['selector'], $e['element']);        
        $el->keyPress('13');
    }
    
    /**
    * @When /^I fill in (username|password) field "([^"]*)" with "([^"]*)"$/ 
    */
    public function iFillInWith($fieldType, $fieldName, $value)
    {
        if ($fieldType == 'username') $this->login = $value;
        if ($fieldType == 'password') $this->password = $value;
        $this->fillField($fieldName, $value);
    }
    
    /**
     * @Given /^If ((xpath|css|named) element "[^"]*") don\'t is present, i click in ((xpath|css|named) element "[^"]*")$/
     */           
    public function ifXpathElementDonTIsPresentIClickInXpathElement($e1, $e2, $e3, $e4)
    {
        $el = $this->getSession()->getPage()->find($e1['selector'], $e1['element']);           
        if ($el==NULL)
        {
            $el = $this->getSession()->getPage()->find($e3['selector'], $e3['element'])->click();            
        }
    }
    
    /**
     * @Given /^If ((xpath|css|named) element "[^"]*") is present, click this$/
     */
    public function ifElementIsPresentClickThis($e)
    {
        $el = $this->getSession()->getPage()->find($e['selector'], $e['element']);
        if (!empty($el))
        {
            $el = $this->getSession()->getPage()->find($e['selector'], $e['element'])->click();
        }
    }
    
    /**
    * @Given /^I wait (\d+) seconds or until xpath element "([^"]*)" has the value "([^"]*)"$/
    */
    public function iWaitSecondsOrUntilJsElementHasTheValue($sec, $element, $value)
    {
        $cont = 0;
        while ($cont < $sec)
        {
            sleep(1);
            $cont++;
            $el = $this->getSession()->getPage()->find('xpath', $element);
            $getValue = $el->getValue();
            //$getValue = $this->getSession()->getDriver()->getValue($element);
            
            /*
             * Verifica se o elemento procurado apareceu.
             */
            if (!empty($el)){
                if ($getValue != $value)
                    throw new \Exception("Valor do elemento diferente do informado. ".$getValue." <> ".$value);
                else                    
                    return;
            }            
        }        
                
        throw new \Exception("Não achou o elemento ".$element);
    }    
    
    /**
    * @Given /^I drag the xpath element "([^"]*)" to the "([^"]*)"$/
    */
    public function iDragTheXpathElementToThe($element, $destination)
    {
         $el = $this->getSession()->getPage()->find('xpath', $element);
         $destination = $this->getSession()->getPage()->find('xpath', $destination);
         $el->dragTo($destination);
    }


    
}

