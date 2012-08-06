<?php

use Behat\Behat\Context\ClosuredContextInterface,
    Behat\Behat\Context\TranslatedContextInterface,
    Behat\Behat\Context\BehatContext,
    Behat\Behat\Exception\PendingException;

use Behat\Gherkin\Node\PyStringNode,
    Behat\Gherkin\Node\TableNode;

class IMContext extends BehatContext
{
    
    public function __construct(FeatureContext $mainContext, array $parameters = array())
    {
        $this->mainContext = $mainContext;
        $this->xmpp = $parameters['XMPP'];
    }
    
    /**
     * @When /^I receive message "([^"]*)" from mock user$/
     */
    public function iReceiveMessageFromMockUser($msg)
    {
        $from = $this->getMockUser();
        $to = $this->mainContext->login . '@' . $this->xmpp['domain'];
        $from->sendMessage($to, $msg);
    }
    
    /**
     * @Given /^I wait (\d+) seconds to see mock user (status=available|status=unavailable)$/
     */
    public function iWaitToSeeMockUser($sec, $status)
    {
        $mockName = $this->xmpp['mock']['name'];
        $cont = 0;
        while ($cont < $sec)
        {
            sleep(1);
            $cont++;
            $el = $this->mainContext->getSession()->getPage()->find('named', array('content', "'$mockName'"));
            if (!empty($el) && $el->isVisible())
                return;
        }

        throw new \Exception("Não achou o usuário mock $mockName!");
    }
    
    /**
     * @When /^I double click in mock user$/
     */
    public function chooseMockUser()
    {        
        $mock = $jid = $this->xmpp['mock']['login'].'@'.$this->xmpp['domain'];        
        $script = "var node = Ext.getCmp('messenger-roster').getNodeById('$mock');
                   node.fireEvent('dblclick', node)";     
        $this->mainContext->getSession()->getDriver()->executeScript($script);        
        sleep(2);
    }
    
    /**
     * @When /^I see mock user chat$/
     */
    public function iSeeMockUserChat()
    {        
        $locator = $this->getMockUserChatID();
        $el = $this->mainContext->getSession()->getPage()->find('css', $locator);
        if (empty($el))
            throw new \Exception("Chat do usuário mock ($locator) não presente!");
    }

    /**
     * @When /^I press ENTER in "([^"]*)"$/
     */
    public function iTypeEnterIn($element)
    {
        $el = $this->mainContext->getSession()->getPage()->find('css', $element);
        if (empty($el))
            throw new \Exception('Tecla não suportada!');
        $el->keyPress(13);
        sleep(2); // Wait to send message to mock user
    }

    /**
     * @Then /^mock user should receive "([^"]*)"$/
     */
    public function theMockUserShouldReceive($messageSent)
    {
        $to = $this->getMockUser();
        $to->receiveMessage();
        sleep(2); // wait to receive message
        if ($to->getReceivedMessage() != $messageSent)
        {
            $error = "Mensagens diferentes:\n".
                     "\tEnviada: $messageSent\n".
                     "\tRecebida: ".$to->getReceivedMessage();
            throw new \Exception($error);
        }
    }    
    
    private function getMockUser()
    {
        $jid = $this->xmpp['mock']['login'].'@'.$this->xmpp['domain'];
        $pwd = $this->xmpp['mock']['password'];
        return new XMPPMock($jid, $pwd);
    }
    
    private function getMockUserChatID()
    {        
        return '#messenger-chat-' .
               str_replace('.', '-', $this->xmpp['mock']['login']) . '_' .
               str_replace('.', '-', $this->xmpp['domain']);
    }
    
    /**
    * @Given /^I conect XMPP mock$/
    */
    public function iConectXmppMock()
    {
        $conect = $this->getMockUser();
        $conect->changeStatus("available");
        
    }
    
}