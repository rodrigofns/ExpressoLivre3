<?php

echo sprintf($this->translate->_('The user %1$s is inviting you to a webconference'), $this->fullUser->accountFullName) . ".\n";
echo sprintf($this->translate->_('Use the link below to access the webconference')) . ".\n\n";
echo $this->url;

