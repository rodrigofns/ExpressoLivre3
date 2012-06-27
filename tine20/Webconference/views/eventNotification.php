<?php

echo sprintf($this->translate->_('The user %s is inviting you to a Webconference'), $this->fullUser->accountFullName) . "\n";
echo sprintf($this->translate->_('Use the link below to access the webconference')) . ".\n\n";
echo $this->url;

