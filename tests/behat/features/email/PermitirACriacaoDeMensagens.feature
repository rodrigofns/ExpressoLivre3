@N4F2C1 @javascript
Feature: Criar MENSAGENS
  Como um usuário qualquer do sistema
  Eu posso criar mensagem de e-mail
  Quando selecionar a opção de “NovaMensagem”

  Background: # Autenticação
    Given I am on "/"
    And I wait 10 seconds or until named element "field='locale'" is present
    And I click once in xpath element "//div/img"
    And I wait 2 seconds or until css element ".x-combo-list-item" is present
    And I choose "português Brasil [pt_BR]" from css element ".x-combo-list-item"
    And I wait 10 seconds or until css element "#username" is present
    And I wait 1 second or until css element "#password" is present
    And I wait 1 second or until xpath element "//button[contains(text(),'Login')]" is present
    When I fill in "username" with "81487819072"
    And I fill in "password" with "serpro"
    And I click once in xpath element "//button[contains(text(),'Login')]"
    Then I wait 20 seconds or until named element "content='Vianna, Cesar'" is present
    # Verifica se a aba do Felamimail está ativa, senão estiver alterna para o módulo de email.
    And If xpath element "//li[(contains(@id,'Felamimail')) and (contains(@class,'x-tab-strip-active'))]" don't is present, i click in xpath element "//li[contains(@class,'tine-mainscreen-apptabspanel-menu-tabel')]/a[@class='x-tab-strip-close']"
    And If xpath element "//li[(contains(@id,'Felamimail')) and (contains(@class,'x-tab-strip-active'))]" don't is present, i click in xpath element "//span[@class='x-menu-item-text' and (contains(text(),'Email'))]"



  @CTV3-8 @N4F5C1CTV3-31 @javascript
  Scenario: Criar e-mail apenas com Para e Enviar mensagens
    When I click once in xpath element "//div/table/tbody/tr/td/table/tbody/tr[2]/td[2]/em/button"
    And I wait 4 seconds or until named element "content='Compor mensagem'" is present
    And I wait 1 second or until xpath element "//div[2]/div[2]/div/input" is present
    And I wait 1 second or until xpath element "//div/div[3]/div/input" is present
    Then I fill xpath "//div[2]/div[2]/div/input" with "cesar.vianna@serpro.gov.br"
    And I click once in xpath element "//div/div[3]/div/input"
    And I fill xpath "//div/div[3]/div/input" with "NovaMensagem"
    And I fill message body with "Mensagem de Texto"
    And I click once in xpath element "//div[2]/div/div/div/div/div/div/div/div/div/div/div/table/tbody/tr/td/table/tbody/tr/td/div/div[2]/div/div/div/div/table/tbody/tr/td/table/tbody/tr[2]/td[2]/em/button"
    And I wait 10 seconds or until named element "content='Transferindo Mensagem...'" is not present
    
  @CTV3-11 @N4F5C1CTV3-31 @javascript
  Scenario: Criar Mensagem apenas com Cc e Enviar mensagens
    When I click once in xpath element "//div/table/tbody/tr/td/table/tbody/tr[2]/td[2]/em/button"
    And I wait 4 seconds or until named element "content='Compor mensagem'" is present
    And I wait 1 second or until xpath element "//div[2]/div[2]/div/input" is present
    And I wait 1 second or until xpath element "//div/div[3]/div/input" is present
    Then I fill xpath "//div[2]/div[2]/div/input" with "cesar.vianna@serpro.gov.br"
    And I click once in xpath element "//div/table/tbody/tr/td/div/div/div/div"    
    And I wait 10 second or until xpath element "//div[contains(child::text(), 'Cc:')]" is present
    And I click once in xpath element "//div[contains(child::text(), 'Cc:')]"        
    And I click once in xpath element "//input[@name='subject']"
    And I fill xpath "//input[@name='subject']" with "MensagemApenasComCc"
    And I fill message body with "Mensagem de Texto"
    And I click once in xpath element "//div[2]/div/div/div/div/div/div/div/div/div/div/div/table/tbody/tr/td/table/tbody/tr/td/div/div[2]/div/div/div/div/table/tbody/tr/td/table/tbody/tr[2]/td[2]/em/button"
    Then I wait 10 seconds or until named element "content='Transferindo Mensagem...'" is not present

  @CTV3-12 @N4F5C1CTV3-31 @javascript
  Scenario: Criar Mensagem apenas com Bcc e Enviar mensagens
    When I click once in xpath element "//div/table/tbody/tr/td/table/tbody/tr[2]/td[2]/em/button"
    And I wait 4 seconds or until named element "content='Compor mensagem'" is present
    And I wait 1 second or until xpath element "//div[2]/div[2]/div/input" is present
    And I wait 1 second or until xpath element "//div/div[3]/div/input" is present
    Then I fill xpath "//div[2]/div[2]/div/input" with "cesar.vianna@serpro.gov.br"
    And I click once in xpath element "//div/table/tbody/tr/td/div/div/div/div"    
    And I wait 10 second or until xpath element "//div[contains(child::text(), 'Bcc:')]" is present
    And I click once in xpath element "//div[contains(child::text(), 'Bcc:')]"        
    And I click once in xpath element "//input[@name='subject']"
    And I fill xpath "//input[@name='subject']" with "MensagemApenasComBcc"
    And I fill message body with "Mensagem de Texto"
    And I click once in xpath element "//div[2]/div/div/div/div/div/div/div/div/div/div/div/table/tbody/tr/td/table/tbody/tr/td/div/div[2]/div/div/div/div/table/tbody/tr/td/table/tbody/tr[2]/td[2]/em/button"
    Then I wait 10 seconds or until named element "content='Transferindo Mensagem...'" is not present

  #INCOMPLETO!!
  #@CTV3-13 @N4F5C1CTV3-31 @javascript
  Scenario: Criar Mensagem com todos os tipos de destinatários
    When I click once in xpath element "//div/table/tbody/tr/td/table/tbody/tr[2]/td[2]/em/button"
    And I wait 4 seconds or until named element "content='Compor mensagem'" is present
    And I wait 1 second or until xpath element "//div[2]/div[2]/div/input" is present
    And I wait 1 second or until xpath element "//div/div[3]/div/input" is present
    And I fill xpath "//div[2]/div[2]/div/input" with "cesar.vianna@serpro.gov.br"
    And I click once in xpath element "//div/table/tbody/tr/td/div/div/div/div"
    And I click once in xpath element "//div/table/tbody/tr/td/div/div/div/div"
    And I wait 10 second or until xpath element "//div[contains(child::text(), 'Bcc:')]" is present
    And I click once in xpath element "//div[contains(child::text(), 'Bcc:')]"        
    And I click once in xpath element "//input[@name='subject']"
    And I fill xpath "//input[@name='subject']" with "Mensagem apenas com Bcc"
    And I fill message body with "Mensagem de Texto"
    And I click once in xpath element "//div[2]/div/div/div/div/div/div/div/div/div/div/div/table/tbody/tr/td/table/tbody/tr/td/div/div[2]/div/div/div/div/table/tbody/tr/td/table/tbody/tr[2]/td[2]/em/button"
    Then I wait 10 seconds or until named element "content='Transferindo Mensagem...'" is not present

  @CTV3-49 @javascript
  Scenario: Salvar MENSAGENS em edição apenas com o campo "Para"
    When I click once in xpath element "//div/table/tbody/tr/td/table/tbody/tr[2]/td[2]/em/button"
    And I wait 4 seconds or until named element "content='Compor mensagem'" is present
    And I wait 1 second or until xpath element "//div[2]/div[2]/div/input" is present
    And I wait 1 second or until xpath element "//div/div[3]/div/input" is present
    And I fill xpath "//div[2]/div[2]/div/input" with "cesar.vianna@serpro.gov.br"
    And I click once in xpath element "//div/div[3]/div/input"
    And I fill xpath "//div/div[3]/div/input" with "MensagemSalvaComCampoPara"
    And I fill message body with "Mensagem de Texto"
    And I click once in xpath element "//button[contains(@class,'action_saveAsDraft')]"
    Then If xpath element "//span[contains(child::text(), 'cesar.vianna@serpro.gov.br')]" don't is present, i click in xpath element "//span[contains(child::text(), 'Contas de Email')]"
    And If css element ".x-tree-ec-icon.x-tree-elbow-end-plus" is present, click this    
    And If css element ".x-tree-ec-icon.x-tree-elbow-end-plus" is present, click this    
    And I click once in xpath element "//span[contains(child::text(), 'Rascunhos')]"
    And I click once in xpath element "//button[contains(@class,'x-tbar-loading')]"
    And I wait 5 seconds or until xpath element "//div[contains(child::text(), 'MensagemSalvaComCampoPara')]" is present


  @CTV3-52 @javascript
  Scenario: Salvar MENSAGENS em edição apenas com o campo "Bc"
    When I click once in xpath element "//div/table/tbody/tr/td/table/tbody/tr[2]/td[2]/em/button"
    And I wait 4 seconds or until named element "content='Compor mensagem'" is present
    And I wait 1 second or until xpath element "//div[2]/div[2]/div/input" is present
    And I wait 1 second or until xpath element "//div/div[3]/div/input" is present
    Then I fill xpath "//div[2]/div[2]/div/input" with "cesar.vianna@serpro.gov.br"
    And I click once in xpath element "//div/table/tbody/tr/td/div/div/div/div"        
    And I wait 10 second or until xpath element "//div[contains(child::text(), 'Cc:')]" is present
    And I click once in xpath element "//div[contains(child::text(), 'Cc:')]"        
    And I click once in xpath element "//input[@name='subject']"
    And I fill xpath "//input[@name='subject']" with "MensagemSalvaComCampoBc"
    And I fill message body with "Mensagem de Texto"
    And I click once in xpath element "//button[contains(@class,'action_saveAsDraft')]"
    Then If xpath element "//span[contains(child::text(), 'cesar.vianna@serpro.gov.br')]" don't is present, i click in xpath element "//span[contains(child::text(), 'Contas de Email')]"
    And If css element ".x-tree-ec-icon.x-tree-elbow-end-plus" is present, click this    
    And If css element ".x-tree-ec-icon.x-tree-elbow-end-plus" is present, click this    
    And I click once in xpath element "//span[contains(child::text(), 'Rascunhos')]"
    And I click once in xpath element "//button[contains(@class,'x-tbar-loading')]"
    And I wait 5 seconds or until xpath element "//div[contains(child::text(), 'MensagemSalvaComCampoBc')]" is present

  @CTV3-51 @javascript
  Scenario: Salvar MENSAGENS em edição apenas com o campo "Bcc"
    When I click once in xpath element "//div/table/tbody/tr/td/table/tbody/tr[2]/td[2]/em/button"
    And I wait 4 seconds or until named element "content='Compor mensagem'" is present
    And I wait 1 second or until xpath element "//div[2]/div[2]/div/input" is present
    And I wait 1 second or until xpath element "//div/div[3]/div/input" is present
    Then I fill xpath "//div[2]/div[2]/div/input" with "cesar.vianna@serpro.gov.br"
    And I click once in xpath element "//div/table/tbody/tr/td/div/div/div/div"    
    And I wait 10 second or until xpath element "//div[contains(child::text(), 'Bcc:')]" is present
    And I click once in xpath element "//div[contains(child::text(), 'Bcc:')]"        
    And I click once in xpath element "//input[@name='subject']"
    And I fill xpath "//input[@name='subject']" with "MMensagemSalvaComCampoBcc"
    And I fill message body with "Mensagem de Texto"
    And I click once in xpath element "//button[contains(@class,'action_saveAsDraft')]"
    Then If xpath element "//span[contains(child::text(), 'cesar.vianna@serpro.gov.br')]" don't is present, i click in xpath element "//span[contains(child::text(), 'Contas de Email')]"
    And If css element ".x-tree-ec-icon.x-tree-elbow-end-plus" is present, click this    
    And If css element ".x-tree-ec-icon.x-tree-elbow-end-plus" is present, click this    
    And I click once in xpath element "//span[contains(child::text(), 'Rascunhos')]"
    And I click once in xpath element "//button[contains(@class,'x-tbar-loading')]"
    And I wait 5 seconds or until xpath element "//div[contains(child::text(), 'MensagemSalvaComCampoBcc')]" is present

  @CTV3-7 @javascript
  Scenario: Enviar Mensagens da pasta "Drafts"
    When I wait 10 seconds or until xpath element "//button[text()='Compor']" is present
    And I click once in xpath element "//button[text()='Compor']"
    And I wait 4 seconds or until named element "content='Compor mensagem'" is present
    And I wait 1 second or until xpath element "//div[2]/div[2]/div/input" is present
    And I wait 1 second or until xpath element "//div/div[3]/div/input" is present
    And I fill xpath "//div[2]/div[2]/div/input" with "cesar.vianna@serpro.gov.br"
    And I click once in xpath element "//div/div[3]/div/input"
    And I fill xpath "//div/div[3]/div/input" with "EnviarMensagensDaPastaDrafts"
    And I fill message body with "Mensagem de Texto"
    And I click once in xpath element "//button[contains(@class,'action_saveAsDraft')]"
    Then If xpath element "//span[contains(child::text(), 'cesar.vianna@serpro.gov.br')]" don't is present, i click in xpath element "//span[contains(child::text(), 'Contas de Email')]"
    And If css element ".x-tree-ec-icon.x-tree-elbow-end-plus" is present, click this 
    And I wait 10 seconds or until xpath element "//span[contains(child::text(), 'Rascunhos')]" is present
    And I click once in xpath element "//span[contains(child::text(), 'Rascunhos')]"
    And I click once in xpath element "//button[contains(@class,'x-tbar-loading')]"
    And I wait 15 seconds or until xpath element "//div[contains(@class,'x-grid3-col-subject') and contains(child::text(), 'EnviarMensagensDaPastaDrafts')]" is present
    And I click once in xpath element "//div[contains(@class,'x-grid3-col-subject') and contains(child::text(), 'EnviarMensagensDaPastaDrafts')]"
    And I click twice in xpath element "//div[contains(@class,'x-grid3-col-subject') and contains(child::text(), 'EnviarMensagensDaPastaDrafts')]"
    And I wait 10 seconds or until xpath element "//button[contains(text(),'Enviar')]" is present
    And I click once in xpath element "//button[contains(text(),'Enviar')]"
    And I wait 10 seconds or until named element "content='Transferindo Mensagem...'" is not present
    And I wait 20 seconds or until xpath element "//div[contains(@class,'x-grid3-col-subject') and contains(child::text(), 'EnviarMensagensDaPastaDrafts')]" is not present

