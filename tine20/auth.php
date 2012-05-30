#!/usr/bin/php
<?php

error_reporting(0);
$auth = new JabberAuth();
$auth->play(); // We simply start process !

class JabberAuth
{

    const SERVER = "http://10.200.237.159:5678/",
          AUTH_URL = 'ws.php';

    private $debug = true;                      /* Debug mode */
    private $debugfile = "/var/log/pipe-debug.log";  /* Debug output */
    private $logging = true;                      /* Do we log requests ? */
    private $logfile = "/var/log/pipe-log.log";   /* Log file ... */
    /*
     * For both debug and logging, ejabberd have to be able to write.
     */
    private $jabber_user;   /* This is the jabber user passed to the script. filled by $this->command() */
    private $jabber_pass;   /* This is the jabber user password passed to the script. filled by $this->command() */
    private $jabber_server; /* This is the jabber server passed to the script. filled by $this->command(). Useful for VirtualHosts */
    private $data;          /* This is what SM component send to us. */
    private $dateformat = "M d H:i:s"; /* Check date() for string format. */
    private $command; /* This is the command sent ... */
    private $mysock;  /* MySQL connection ressource */
    private $stdin;   /* stdin file pointer */
    private $stdout;  /* stdout file pointer */

    public function __construct()
    {
        @define_syslog_variables();
        @openlog("pipe-auth", LOG_NDELAY, LOG_SYSLOG);

        if ($this->debug)
        {
            @error_reporting(E_ALL);
            @ini_set("log_errors", "1");
            @ini_set("error_log", $this->debugfile);
        }
        $this->logg("Starting pipe-auth ..."); // We notice that it's starting ...
        $this->openstd();
    }
    
    public function play()
    {
        do
        {
            $this->readstdin(); // get data
            $length = strlen($this->data); // compute data length
            if ($length > 0)
            { // for debug mainly ...
                $this->logg("GO: " . $this->data);
                $this->logg("data length is : " . $length);
            }
            $ret = $this->command(); // play with data !
            $this->logg("RE: " . $ret); // this is what WE send.
            $this->out($ret); // send what we reply.
            $this->data = NULL; // more clean. ...
        }
        while (true);
    }
    
    // Private methods

    private function stop()
    {
        $this->logg("Shutting down ..."); // Sorry, have to go ...
        closelog();
        $this->closestd(); // Simply close files
        exit(0); // and exit cleanly
    }

    private function openstd()
    {
        $this->stdout = @fopen("php://stdout", "w"); // We open STDOUT so we can read
        $this->stdin = @fopen("php://stdin", "r"); // and STDIN so we can talk !
    }

    private function readstdin()
    {
        $l = @fgets($this->stdin, 3); // We take the length of string
        $length = @unpack("n", $l); // ejabberd give us something to play with ...
        $len = $length["1"]; // and we now know how long to read.
        if ($len > 0)
        { // if not, we'll fill logfile ... and disk full is just funny once
            $this->logg("Reading $len bytes ... "); // We notice ...
            $data = @fgets($this->stdin, $len + 1);
            // $data = iconv("UTF-8", "ISO-8859-15", $data); // To be tested, not sure if still needed.
            $this->data = $data; // We set what we got.
            $this->logg("IN: " . $data);
        }
    }

    private function closestd()
    {
        @fclose($this->stdin); // We close everything ...
        @fclose($this->stdout);
    }

    private function out($message)
    {
        @fwrite($this->stdout, $message); // We reply ...
        $dump = @unpack("nn", $message);
        $dump = $dump["n"];
        $this->logg("OUT: " . $dump);
    }

    private function command()
    {
        $data = $this->splitcomm(); // This is an array, where each node is part of what SM sent to us :
        // 0 => the command,
        // and the others are arguments .. e.g. : user, server, password ...

        if (strlen($data[0]) > 0)
        {
            $this->logg("Command was : " . $data[0]);
        }
        switch ($data[0])
        {
            case "isuser": // this is the "isuser" command, used to check for user existance
                $this->jabber_user = $data[1];
                $parms = $data[1];  // only for logging purpose
                $return = $this->checkuser();
                break;

            case "auth": // check login, password
                $this->jabber_user = $data[1];
                $this->jabber_pass = $data[3];
                $parms = $data[1] . ":" . $data[2] . ":" . md5($data[3]); // only for logging purpose
                $return = $this->checkpass();
                break;

            case "setpass":
                $return = false; // We do not want jabber to be able to change password
                break;

            default:
                $this->stop(); // if it's not something known, we have to leave.
                // never had a problem with this using ejabberd, but might lead to problem ?
                break;
        }

        $return = ($return) ? 1 : 0;

        if (strlen($data[0]) > 0 && strlen($parms) > 0)
        {
            $this->logg("Command : " . $data[0] . ":" . $parms . " ==> " . $return . " ");
        }
        return @pack("nn", 2, $return);
    }

    // Authentication method => check where? Tine?
    private function checkpass()
    {
        $this->logg('Checking the password...');
        $this->logg('Before transforming: ' . $this->jabber_pass);
        $json = base64_decode($this->jabber_pass);
	$this->logg('JSON => ' . $json);
	$local_info = json_decode($json);
        $this->logg('JSON DECODE');
        $this->logg('---');
        $this->logg(var_export($local_info, true));
        $this->logg(var_export($local_info->pwd, true));
        $this->logg(var_export($local_info->ip, true));
        $this->logg('---');
        $server_info = $this->getServerInfo($local_info->pwd, $this->jabber_user);

        $this->logg('COMPARAÇÃO (local == remoto)...');
        $this->logg('    '.$local_info->ip . ' == ' . $server_info->ip);
        $this->logg('    '.$this->jabber_user . ' == ' . $server_info->login_name);
        $this->logg('FIM DA COMPARAÇÃO');
        
        return ($local_info->ip == $server_info->ip &&
                $this->jabber_user == $server_info->login_name);
    }

    // Check if user exists!
    private function checkuser()
    {
        return true;
    }

    private function getServerInfo($sid, $login)
    {
        $resource = curl_init();
        $get_url = curl_setopt($resource, CURLOPT_URL, self::SERVER . self::AUTH_URL);
        if (!$get_url)
            $this->logg('N&aacute;o capturou a URL: ' . self::SERVER . self::AUTH_URL);
        curl_setopt($resource, CURLOPT_HEADER, false);
        curl_setopt($resource, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($resource, CURLOPT_POST, true);
        curl_setopt($resource, CURLOPT_POSTFIELDS, array('SID' => $sid, 'LGN' => "$login%"));
        $raw_html = curl_exec($resource);
        $this->logg('RECUPERADO VIA CURL => '.$raw_html);
        curl_close($resource);

        return (empty($raw_html)) ? '{}' : json_decode($raw_html);
    }

    private function splitcomm() // simply split command and arugments into an array.
    {
        return explode(":", $this->data, 4);
    }

    private function logg($message) // pretty simple, using syslog.
    // some says it doesn't work ? perhaps, but AFAIR, it was working.
    {
        if ($this->logging)
        {
            @syslog(LOG_INFO, $message);
            file_put_contents($this->debugfile, $message . PHP_EOL, FILE_APPEND);
        }
    }

}
