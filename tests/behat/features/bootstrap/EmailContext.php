<?php 

use Behat\Behat\Context\ClosuredContextInterface,
    Behat\Behat\Context\TranslatedContextInterface,
    Behat\Behat\Context\BehatContext,
    Behat\Behat\Exception\PendingException;

use Behat\Gherkin\Node\PyStringNode,
    Behat\Gherkin\Node\TableNode;

class EmailContext extends BehatContext
{
    
    public function __construct(FeatureContext $mainContext)
    {
        $this->mainContext = $mainContext;
    }
    
    /**
     * @Given /^I switch to iframe "([^"]*)"$/
     */
    public function iSwitchToIframe($iframeID)
    {
        $this->mainContext->getSession()->switchToIFrame($iframeID);
    }
    
    /**
     * @Given /^I switch back to main page$/
     */
    public function iSwitchBackToMainPage()
    {
        $this->mainContext->getSession()->switchToIFrame();
    }
    
    /**
     * @When /^I fill message body with "([^"]*)"$/
     */
    public function iFillMsgBody($value)
    {        
        $script = "document.getElementsByTagName('iframe')[0].contentDocument.getElementsByTagName('body')[0].innerHTML = '$value'";
        $this->mainContext->getSession()->getDriver()->executeScript($script);
    }
    
}