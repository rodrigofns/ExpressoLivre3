<?php

/**
 * Tine 2.0
 *
 * @package     Expresso
 * @subpackage  Security
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Antonio Carlos da Silva <antonio-carlos.silva@serpro.gov.br>
 * @author      Mario Cesar Kolling <mario.kolling@serpro.gov.br>
 * @copyright   Copyright (c) 2009-2013 Serpro (http://www.serpro.gov.br)
 * @todo        parse authorityInfoAccess, caissuer ans ocsp
 * @todo        parse authorityKeyIdentifier
 * @todo        phpdoc of all methods
 * 
 */

class Expresso_Security_Certificate_X509
{
    
    protected $certificate;
    
    protected $serialNumber = null;
    protected $version = null;
    protected $subject = null;
    protected $cn = null;
    protected $issuer = null;
    protected $issuerCn = null;
    protected $hash = null;
    protected $validFrom = null;
    protected $validTo = null;
    protected $canSign = false;
    protected $canEncrypt = false;
    protected $email = null;
    protected $ca = false;
    protected $authorityKeyIdentifier = null;
    protected $crlDistributionPoints = null;
    protected $authorityInfoAccess = null;
    
    public function __construct($certificate)
    {
        $this->certificate = $certificate;
        $c = openssl_x509_parse($certificate);
        
        // define certificate properties
        $this->serialNumber = $c['serialNumber'];
        $this->version = $c['version'];
        $this->subject = $c['subject'];
        $this->cn = $c['subject']['CN'];
        $this->issuer = $c['issuer'];
        $this->issuerCn = $c['issuer']['CN'];
        $this->hash = $c['hash'];
        $this->validFrom = new Tinebase_DateTime($c['validFrom_time_t']);
        $this->validTo = new Tinebase_DateTime($c['validTo_time_t']);
        $this->_parsePurpose($c['purposes']);
        $this->_parseExtensions($c['extensions']);
        
    }
    
    protected function _parseExtensions($extensions)
    {
        foreach ($extensions as $extension => $value)
        {
            $matches = array();
            switch ($extension)
            {
                case 'subjectAltName':
                    if (preg_match('/email:(\b[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b)/i', $value, $matches))
                    {
                        $this->email = $matches[1];
                    }
                    break;
                case 'basicConstraints' :
                    if (preg_match('/\bCA:(FALSE|TRUE)\b/', $value, $matches))
                    {
                        $this->ca = $matches[1] == 'TRUE' ? TRUE : FALSE;
                    }
                    break;
                case 'crlDistributionPoints' :
                    $lines = explode(chr(0x0A), trim($value));
                    foreach ($lines as &$line)
                    {
                        preg_match('/URI:/', $line, $matches);
                        $line = preg_replace('/URI:/', '', $line);
                    }
                    $this->crlDistributionPoints = $lines;
                    break;
                
//                case 'authorityKeyIdentifier' :
//                    if (preg_match('/\bkeyid:(\b([A-F0-9]{2}:)+[[A-F0-9]{2}]\b)/', $value, $matches))
//                    {
//                        $tmp = '';
//                    }
//                    break;
//                 // TODO: ocsp
//                case 'authorityInfoAccess' :
//                    if (preg_match('/\bCA Issuers - URI:(http(?:s)?\:\/\/[a-zA-Z0-9\-]+(?:\.[a-zA-Z0-9\-]+)*\.[a-zA-Z]{2,6}(?:\/?|(?:\/[\w\-]+)*)(?:\/?|\/\w+\.[a-zA-Z]{2,4}(?:\?[\w]+\=[\w\-]+)?)?(?:\&[\w]+\=[\w\-]+)*\b)/', $value, $matches))
//                    {
//                        $tmp = '';
//                    }
//                    break;
            }
        }
    }
    
    protected function _parsePurpose($purposes)
    {
        foreach ($purposes as $purpose)
        {
            switch ($purpose[2])
            {
                case 'smimesign' :
                    $this->canSign = $purpose[0] == 1 ? true : false;
                    break;
                case 'smimeencrypt' :
                    $this->canEncrypt = $purpose[0] == 1 ? true : false;
                    break;
            }
        }
    }
    
    public static function xBase128($ab,$q,$flag)
    {
        $abc = $ab;
        if( $q > 127 )
        {
            $abc = self::xBase128($abc, floor($q / 128), 0 );
        }
        $q = $q % 128;
        if( $flag)
        {
            $abc[] = $q;
        }
        else
        {
            $abc[] = 0x80 | $q;
        }
        return $abc;
    }
    
    public static function oid2Hex($oid)
    {
        $abBinary = array();
        $parts = explode('.',$oid);
        $n = 0;
        $b = 0;
        for($n = 0; $n < count($parts); $n++)
        {
            if($n==0)
            {
                $b = 40 * $parts[$n];
            }
            elseif($n==1)
            {
                $b +=  $parts[$n];
                $abBinary[] = $b;
            }
            else
            {
                $abBinary = self::xBase128($abBinary, $parts[$n], 1 );
            }
        }
        $value =chr(0x06) . chr(count($abBinary));
        foreach($abBinary as $item)
        {
            $value .= chr($item);
        }
        return $value;
    }
    
    /**
     * Transform cert from PEM format to DER
     *
     * @param string Certificate PEM format
     * @return string Certificate DER format
     */
    static public function pem2Der($pemCertificate)
    {
        $aux = explode(chr(0x0A),$pemCertificate);
        $derCertificate = '';
        foreach ($aux as $i)
        {
            if($i != '')
            {
                if(substr($i, 0, 5) !== '-----')
                {
                    $derCertificate .= $i;
                }
            }
        }
        return base64_decode($derCertificate);
    }
    
    public function getSerialNumber() {
        return $this->serialNumber;
    }

    public function getVersion() {
        return $this->version;
    }

    public function getSubject() {
        return $this->subject;
    }

    public function getCn() {
        return $this->cn;
    }

    public function getIssuer() {
        return $this->issuer;
    }

    public function getIssuerCn() {
        return $this->issuerCn;
    }

    public function getHash() {
        return $this->hash;
    }

    public function getValidFrom() {
        return $this->validFrom;
    }

    public function getValidTo() {
        return $this->validTo;
    }

    public function isCanSign() {
        return $this->canSign;
    }

    public function isCanEncrypt() {
        return $this->canEncrypt;
    }

    public function getEmail() {
        return $this->email;
    }

    public function isCA() {
        return $this->ca;
    }

    public function getAuthorityKeyIdentifier() {
        return $this->authorityKeyIdentifier;
    }

    public function getCrlDistributionPoints() {
        return $this->crlDistributionPoints;
    }

    public function getAuthorityInfoAccess() {
        return $this->authorityInfoAccess;
    }
    
}