<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

class Webconference_Model_Invite {
    
    private $url;
    private $roomName;
    private $moderator;
    private $createdBy;
    private $to;
    
    function __construct($url, $roomName, $moderator, $createdBy, $to) {
        $this->url = $url;
        $this->roomName = $roomName;
        $this->moderator = $moderator;
        $this->createdBy = $createdBy;
        $this->to = $to;
    }
    
    public function getUrl() {
        return $this->url;
    }

    public function setUrl($url) {
        $this->url = $url;
    }

    public function getRoomName() {
        return $this->roomName;
    }

    public function setRoomName($roomName) {
        $this->roomName = $roomName;
    }

    public function getModerator() {
        return $this->moderator;
    }

    public function setModerator($moderator) {
        $this->moderator = $moderator;
    }

    public function getCreatedBy() {
        return $this->createdBy;
    }

    public function setCreatedBy($createdBy) {
        $this->createdBy = $createdBy;
    }

    public function getTo() {
        return $this->to;
    }

    public function setTo($to) {
        $this->to = $to;
    }


    
    
    
}
?>
