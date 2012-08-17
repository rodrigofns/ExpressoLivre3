<?php

require __DIR__."/../../vendor/jaxl/jaxl.php";

class XMPPMock
{
    
    private $connected, $in_msg;
    public $xmpp;
    
    public function __construct($jid, $pwd)
    {
        $this->in_msg = null;
        $this->connected = false;
        
        $this->xmpp = new JAXL(array(
            'jid'       => $jid . '/XMPPMock',
            'pass'      => $pwd,
            'log_level' => 0
        ));
    }
    
    public function sendMessage($to, $message)
    {
        $xmpp = $this->xmpp;
        $this->xmpp->add_cb('on_auth_success', function () use ($to, $message, $xmpp) {
            $xmpp->send_chat_msg($to, $message);
            $xmpp->send_end_stream();
            sleep(2); // Espera encerrar as conexões
        });

        $this->xmpp->start();
    }
    
    public function receiveMessage()
    {
        $that = $this;
        $this->xmpp->add_cb('on_auth_success', function () use ($that) {
            $that->xmpp->set_status('Available', 'available', 5);
            //sleep(2); // Wait to set status
        });
        
        $this->xmpp->add_cb('on_chat_message', function ($message) use ($that) {
            $msg = null;

            foreach ($message->childrens as $children)
            {
                if (!empty($children->text))
                {
                    $msg = $children->text;
                    break;
                }
            }
            
            $that->setReceivedMessage($msg);
            $that->xmpp->send_end_stream();
            sleep(2); // Espera encerrar as conexões
        });
        
        $this->xmpp->start();
        sleep(2);
    }
    
    public function setReceivedMessage($message)
    {
        $this->in_msg = $message;
    }
    
    public function getReceivedMessage()
    {
        return $this->in_msg;
    }
    
    public function changeStatus($status, $sec = 2 )
    {
        $that = $this;
        $this->xmpp->add_cb('on_auth_success', function () use ($status, $sec, $that) {
            $that->xmpp->set_status($status, $status, 1);
            sleep($sec);            
            $that->xmpp->send_end_stream();
        });
        
        $this->xmpp->start();
    }
    
}