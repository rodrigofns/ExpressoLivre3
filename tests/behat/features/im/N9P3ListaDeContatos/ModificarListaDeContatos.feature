@N9P3F2
Feature: Modificar Lista de Contatos
  Como Um usuário do IM
  Eu posso Criar, Renomear e Excuir Grupos de Contatos
  E Eu posso Adicionar, Remover, Mover e Renomear um Contato
  E Eu posso Exibir Novo Status de Contato e Mudar Status

  Background: # Autenticação
    Given I am on "/"
    And I wait 10 seconds or until named element "field='locale'" is present
    And I click once in xpath element "//img[contains(@class,'x-form-trigger')]"
    And I wait 2 seconds or until css element ".x-combo-list-item" is present
    And I choose "português Brasil [pt_BR]" from ".x-combo-list-item"
    And I wait 10 seconds or until named element "field='username'" is present
    And I wait 1 second or until css element "#password" is present
    And I wait 1 second or until css element ".x-btn-text" is present
    When I fill in username field "username" with "cesar"
    And I fill in password field "password" with "senha"
    And I click once in xpath element "//button"
    Then I wait 10 seconds or until named element "content='teste, Teste'" is present

  @N9P3F2C1 @javascript
  Scenario: Criar um Grupo
   When I click once in css element "#messenger-menu-actions"
   And I wait 10 seconds or until css element "#messenger-group-mngt-add" is present
   And I click once in css element "#messenger-group-mngt-add"
   And I wait 10 seconds or until css element "#messenger-group-mngt-name" is present
   And I fill in "messenger-group-mngt-name" with "meugrupo"
   And I wait 10 seconds or until css element "#messenger-group-mngt-button" is present
   And I click once in css element "#messenger-group-mngt-button"
   Then I wait 10 seconds or until named element "content='Group created successfully!'" is present
   
  @N9P3F2C4 @javascript
  Scenario: Adicionar um Contato
   When I click once in css element "#messenger-menu-actions"
   And I wait 10 seconds or until css element "#messenger-contact-add" is present
   And I click once in css element "#messenger-contact-add"
   And I wait 3 seconds or until css element "#messenger-contact-add-jid" is present
   And I fill in "messenger-contact-add-jid" with "novo@simdev.sdr.serpro"
   And I fill in "messenger-contact-add-name" with "Novo"
   And I click once in xpath element "//button[contains(child::text(), 'Add')]"

   @N9P3F2C1-N9P3F2C4 @javascript
   Scenario: Adicionar um grupo e inserir um novo contato a ele
     When I click once in css element "#messenger-menu-actions"
     And I wait 10 seconds or until css element "#messenger-group-mngt-add" is present
     And I click once in css element "#messenger-group-mngt-add"
     And I wait 10 seconds or until css element "#messenger-group-mngt-name" is present
     And I fill in "messenger-group-mngt-name" with "meugrupo"
     And I wait 10 seconds or until css element "#messenger-group-mngt-button" is present
     And I click once in css element "#messenger-group-mngt-button"
     And I wait 10 seconds or until named element "content='Group created successfully!'" is present
     And I click once in css element "#messenger-menu-actions"
     And I wait 10 seconds or until css element "#messenger-contact-add" is present
     And I click once in css element "#messenger-contact-add"
     And I fill in "messenger-contact-add-jid" with "novo@simdev.sdr.serpro"
     And I fill in "messenger-contact-add-name" with "Novo"
     And I click once in css element "#messenger-contact-add-group"
     And I wait 10 seconds or until xpath element "//div[contains(child::text(), 'meugrupo')]" is present
     And I click once in xpath element "//div[contains(child::text(), 'meugrupo')]"
     And I click once in xpath element "//button[contains(child::text(), 'Adicionar')]"
     Then I wait 10 seconds or until named element "content='Added successfuly!'" is present

   @N9P3F2C3 @javascript
   Scenario: Excluir um Grupo
     When I wait 20 seconds or until css element "#messenger" is present
     And I click once in xpath element "//*[@id='messenger']"
     And I wait 20 seconds or until xpath element "//div[contains(@class,'meugrupo')]" is present     
     And I press right click once in xpath element "//div[contains(@class,'meugrupo')]"
     And I wait 20 seconds or until css element ".x-menu-item-text" is present
     And I choose "Remover" from ".x-menu-item-text"     
     And I wait 10 seconds or until xpath element "//button[contains(child::text(), 'Sim')]" is present
     And I click once in xpath element "//button[contains(child::text(), 'Sim')]"
     Then I wait 10 seconds or until named element "content='The group meugrupo was successfully removed!'" is present

   @N9P3F2C5 @javascript
   Scenario: Excluir um Contato
     When I wait 20 seconds or until css element "#messenger" is present
     And I click once in xpath element "//*[@id='messenger']"
     And I wait 20 seconds or until xpath element "//div[contains(@class,'novo@simdev.sdr.serpro')]" is present
     And I press right click once in xpath element "//div[contains(@class,'novo@simdev.sdr.serpro')]"
     And I wait 20 seconds or until css element ".x-menu-item-text" is present
     And I choose "Remover" from ".x-menu-item-text"
     And I wait 10 seconds or until xpath element "//button[contains(child::text(), 'Sim')]" is present
     And I click once in xpath element "//button[contains(child::text(), 'Sim')]"
     Then I wait 10 seconds or until named element "content='was successfully removed!'" is present

   @N9P3F2C7 @javascript
   Scenario: Renomear um Contato
     When I wait 20 seconds or until css element "#messenger" is present
     And I click once in xpath element "//*[@id='messenger']"
     And I wait 20 seconds or until xpath element "//div[contains(@class,'novo@simdev.sdr.serpro')]" is present
     And I press right click once in xpath element "//div[contains(@class,'novo@simdev.sdr.serpro')]"
     And I wait 20 seconds or until css element ".x-menu-item-text" is present
     And I choose "Renomear" from ".x-menu-item-text"
     And I wait 5 seconds or until css element "#messenger-contact-rename" is present
     And I fill in "messenger-contact-rename" with "Novo_alterado"
     And I press ENTER in "#messenger-contact-rename"
