#!/usr/bin/python
# -*- coding: utf-8 -*-

import os, popen2, fcntl, select, time, sys
from string import replace

# Lista com as urls das CRLs, e onde colocar(path) os arquivos obtidos ....
CRL_urls = []
Confs = {}

#Confs['CAs']          # Arquivo com cadeia dos certificados das CAs, para verificacao das CRLs.
#Confs['CRLs']            # path para a pasta onde as CRLs sao salvas
#Confs['arquivos_crls']   # path para o arquivo de configuracao contendo urls das crls e paths onde serao baixadas...
#Confs['log']             # Arquivo onde sera grada log de execucao da qtualizacao/verificacao das crls.
#Confs['lenMax']          # Tamanho maximo do arquivo de log de atualizacao das crls antes do rotate.....
#Confs['bkpNum']          # Numero de arquivos de log de atualizacao das crls mantidos pelo rotate....

BASE = os.path.realpath(__file__).split(os.sep + 'security')[0] # BASE igual a pasta inicial(raiz) 

Confs['CAs']            =   BASE + '/security/cas/todos.cer'
Confs['CRLs']           =   BASE + '/security/crls/'     # Tem de ter a barra no final
Confs['arquivos_crls']  =   BASE + '/security/crl_admin/crl_admin.conf'
Confs['log']            =   BASE + '/security/logs/arquivo_crls.log'
Confs['lenMax']         =   1048576 # 1MBytes = tamanho maximo do arquivo(em bytes) de log antes do rotate.....
Confs['bkpNum']         =   10  # Numero de arquivos de log mantidos pelo rotate....


def ler_conf():
    # Esta funcao le o arquivo passado como parametro e gera a lista CRL_urls.
    # O arquivo he esperado no formato:
    # url ( url = aponta onde buscar a crl,  uma por linha.
    e = open(Confs['arquivos_crls'])
    r = e.read()
    aux1 = r.split('\n')
    for linha in aux1:
        if linha[0:1] != '#':
            if linha.strip() != '':
                # Faz split com ';' para manter compatibilidade com arquivos formato antigo ...
                CRL_urls.append([linha.split(';')[0].strip(),Confs['CRLs']])
    return


theOutput = [] 

def fazlog(mL,dados):
    for i in dados:
        aux = i.split('\n')
        for x in aux:
            mL.info(x)

def makeNonBlocking(fd): 
    fl = fcntl.fcntl(fd, fcntl.F_GETFL)
    try:
        fcntl.fcntl(fd, fcntl.F_SETFL, fl | os.O_NDELAY)
    except AttributeError:
        fcntl.fcntl(fd, fcntl.F_SETFL, fl | fcntl.FNDELAY)
  
def ExeCmd(command): 
    theOutput = [] 
    child = popen2.Popen3(command, 1)      	# Captura a stdout e a stderr do comando... 
    child.tochild.close()                             	# Não estamos "falando(escrevendo para a stdin do comando) com o processo filho... 
    outfile = child.fromchild 
    outfd = outfile.fileno() 
    errfile = child.childerr 
    errfd = errfile.fileno() 
    makeNonBlocking(outfd)                          	# Não queremos um deadlock !!!!( Dica do Python Cookbook v1)
    makeNonBlocking(errfd) 
    outdata = errdata = '' 
    outeof = erreof = 0 
    while 1: 
        ready = select.select([outfd,errfd],[],[]) # Aguarda a entrada(saida do comando) 
        if outfd in ready[0]: 
           outchunk = outfile.read() 
           if outchunk == '': outeof = 1 
           outdata = outdata + outchunk 
        if errfd in ready[0]: 
           errchunk = errfile.read() 
           if errchunk == '': erreof = 1 
           errdata = errdata + errchunk 
        if outeof and erreof: break 
        select.select([],[],[],.1)                         	#Da um tempo para os buffers serem preenchidosl 
    err = child.wait() 
    #if err != 0: 
    #   raise RuntimeError, '%s failed w/ exit code %d\n%s' % (command, err, errdata) 
    theOutput.append(outdata) 
    theOutput.append(errdata) 
    return theOutput 


try:
    # A execucao da funcao a seguir carrega a lista das CRLs (CRL_urls) que devem ser processadas...
    ler_conf()
except:
    print 'Erro lendo arquivos de configuracao(ERR-02X)';
    sys.exit(1);

CAfile =  Confs['CAs']
CRLs = Confs['CRLs']
arquivo = Confs['arquivos_crls']
log = Confs['log']      # Deixe log = '' para saida da log na console .....
lenMax = int(Confs['lenMax']) # Tamanho maximo do arquivo de log para iniciar o rotate....
bkpNum = int(Confs['bkpNum']) # Numero de arquivos de log mantidos pelo rotate....

import logging
import logging.handlers

# Prepara para fazer a log das atualizacoes das crls ...
fm = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
mL = logging.getLogger('ML')
mL.setLevel(logging.DEBUG)
hd = logging.handlers.RotatingFileHandler(log, mode='a', maxBytes=lenMax, backupCount=bkpNum)
hd.setFormatter(fm)
mL.addHandler(hd)

if len(sys.argv) > 1:
    if os.path.isfile(sys.argv[1]):
        Confs['arquivos_crls'] = sys.argv[1]
    else:
        mL.critical('Erro lendo arquivo de configuracao' + sys.argv[1] + ': Nao localizado.\n')
        sys.exit(2)

mL.info('Processando arquivo de urls para obter crls: ' +Confs['arquivos_crls'] + ' .')

for crl in CRL_urls:
    arquivo = crl[1].strip() + os.path.split(crl[0])[1].strip()
    url = crl[0].strip()
    # Obtendo o arquivo com wget ...
    mL.info('Buscando a CRL: ' + url)
    saida_wget = ExeCmd("wget --timeout=10 --tries=1 " + url + " -O " + arquivo)
    # Abaixo estamos comandando a execucao "openssl crl" passando o arquivo crl .
    # O resultado esta em saida. Tem de ser 'verify OK' .
    if os.path.exists(arquivo) and os.path.getsize(arquivo) > 0:
        mL.info('Verificando ' + arquivo + '(' + str(os.path.getsize(arquivo)) + ' Bytes)')
        saida = ExeCmd('openssl crl -CAfile ' + CAfile + '  -in ' + arquivo + ' -inform DER -noout')
        # usa a funcao fazlog porque saida he um array.....
        fazlog(mL,saida)
        try:
            aux1 = replace(saida[1],'\n','')
            if not aux1 == 'verify OK':
                mL.critical('Erro verificando a CRL ' + arquivo + '\n')
                try:
                    os.remove(arquivo)
                except:
                    pass
                continue
            # A crl foi verificada e esta OK....
            # Atuaiza a data do arquivo...
            saida = ExeCmd('touch ' + arquivo)
            # Converte DER para PEM..
            mL.info('Convertendo ' + arquivo + ' para formato PEM em ' + arquivo + '.pem2')
            saida = ExeCmd('openssl crl -in ' + arquivo + ' -out ' + arquivo + '.pem2 -outform pem -inform der ')
            # Gera hash para link..
            mL.info('Gerando hash para ' + arquivo + '.pem2')
            saida1 = ExeCmd('openssl crl -hash -noout -in ' + arquivo + '.pem2')
            # Gera link..
            mL.info('Gerando link para ' + arquivo + '.pem2 ,usa o hash gerado como nome do link:' +  saida1[0].strip() + '.r0')
            saida = ExeCmd('ln -s ' + arquivo + '.pem2 ' + os.path.dirname(arquivo)+ os.sep + saida1[0].strip() + '.r0')
        except:
            mL.critical('Erro processando o status da verificacao da CRL ' + arquivo + '\n')
            try:
                os.remove(arquivo)
                os.remove(arquivo + '.pem2')
            except:
                pass
            continue
    else:
            # usa a funcao fazlog porque saida_wget he um array.....
            fazlog(mL,saida_wget)
            mL.critical('Nao foi possivel obter a CRL ' + url + '\n')
            try:
                os.remove(arquivo)
            except:
                pass