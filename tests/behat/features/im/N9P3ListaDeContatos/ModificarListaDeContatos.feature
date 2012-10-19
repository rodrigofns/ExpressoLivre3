@N9P3F2
Feature: Modificar Lista de Contatos
  Como Um usuário do IM
  Eu posso Criar, Renomear e Excuir Grupos de Contatos
  E Eu posso Adicionar, Remover, Mover e Renomear um Contato
  E Eu posso Exibir Novo Status de Contato e Mudar Status

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

  @N9P3F2C1 @javascript
  Scenario: Criar um Grupo
   When I click once in css element "#messenger-menu-actions"
   And I wait 10 seconds or until css element "#messenger-group-mngt-add" is present
   And I click once in css element "#messenger-group-mngt-add"
   And I wait 10 seconds or until css element "#messenger-group-mngt-name" is present
   And I fill in "messenger-group-mngt-name" with "NovoGrupo"
   And I wait 10 seconds or until css element "#messenger-group-mngt-button" is present
   And I click once in css element "#messenger-group-mngt-button"
   Then I wait 10 seconds or until named element "content='Group created successfully!'" is present
   
  @N9P3F2C4 @javascript
  Scenario: Adicionar um Contato
     When I click once in css element "#messenger-menu-actions"
     And I wait 10 seconds or until css element "#messenger-contact-add" is present
     And I click once in css element "#messenger-contact-add"
     And I fill in "messenger-contact-add-jid" with "novocontato@simdev.sdr.serpro"
     And I fill in "messenger-contact-add-name" with "NovoContato"
     And I click once in css element "#messenger-contact-add-group"
     And I wait 10 seconds or until xpath element "//div[contains(child::text(), 'NovoGrupo')]" is present
     And I click once in xpath element "//div[contains(child::text(), 'NovoGrupo')]"
     And I click once in css element "#messenger-contact-add-button"
     Then I wait 10 seconds or until named element "content='Added successfuly!'" is present

   @N9P3F2C1-N9P3F2C4 @javascript
   Scenario: Adicionar um grupo e inserir um novo contato a ele
     When I click once in css element "#messenger-menu-actions"
     And I wait 10 seconds or until css element "#messenger-group-mngt-add" is present
     And I click once in css element "#messenger-group-mngt-add"
     And I wait 10 seconds or until css element "#messenger-group-mngt-name" is present
     And I fill in "messenger-group-mngt-name" with "NovoGrupo"
     And I wait 10 seconds or until css element "#messenger-group-mngt-button" is present
     And I click once in css element "#messenger-group-mngt-button"
     And I wait 10 seconds or until named element "content='Group created successfully!'" is present
     And I click once in css element "#messenger-menu-actions"
     And I wait 10 seconds or until css element "#messenger-contact-add" is present
     And I click once in css element "#messenger-contact-add"
     And I fill in "messenger-contact-add-jid" with "novocontato@simdev.sdr.serpro"
     And I fill in "messenger-contact-add-name" with "NovoContato"
     And I click once in css element "#messenger-contact-add-group"
     And I wait 10 seconds or until xpath element "//div[contains(child::text(), 'NovoGrupo')]" is present
     And I click once in xpath element "//div[contains(child::text(), 'NovoGrupo')]"
     And I click once in css element "#messenger-contact-add-button"
     Then I wait 10 seconds or until named element "content='Added successfuly!'" is present

   @N9P3F2C7 @javascript
   Scenario: Renomear um Grupo
     When I wait 20 seconds or until css element "#messenger" is present
     And I click once in xpath element "//*[@id='messenger']"
     And I wait 20 seconds or until xpath element "//span[contains(child::text(), 'NovoGrupo')]" is present
     And I press right click once in xpath element "//span[contains(child::text(), 'NovoGrupo')]"
     And I wait 20 seconds or until css element ".x-menu-item-text" is present
     And I choose "Renomear" from css element ".x-menu-item-text"
     And I wait 20 seconds or until css element "#messenger-group-rename" is present
     And I fill in "messenger-group-rename" with "GrupoRenomeado"
     And I press ENTER in "#messenger-group-rename"
     And I wait 20 seconds or until xpath element "//span[contains(child::text(), 'GrupoRenomeado')]" is present
     Then I wait 10 seconds or until named element "content='The group NovoGrupo was successfully renamed to GrupoRenomeado'" is present
   
    @N9P3F2C6 @javascript
    Scenario: Mover um Contato
     When I wait 20 seconds or until css element "#messenger" is present
     And I click once in xpath element "//*[@id='messenger']"
     And I wait 20 seconds or until xpath element "//span[contains(child::text(), 'Mover')]" is present
     And I press right click once in xpath element "//span[contains(child::text(), 'Mover')]"
     And I press right click once in xpath element "//span[contains(child::text(), 'Move to')]"
     And I choose "Move to" from css element ".x-menu-item-text"
     And I wait 20 seconds or until xpath element "//span[contains(child::text(), 'novo')]" is present
     And I choose "novo" from css element ".x-menu-item-text"
     And I wait 10 seconds
  
   @N9P3F2C3 @javascript
   Scenario: Excluir um Grupo
     When I wait 20 seconds or until css element "#messenger" is present
     And I click once in xpath element "//*[@id='messenger']"
     And I wait 20 seconds or until xpath element "//div[contains(@class,'GrupoRenomeado')]" is present     
     And I press right click once in xpath element "//div[contains(@class,'GrupoRenomeado')]"
     And I wait 20 seconds or until css element ".x-menu-item-text" is present
     And I choose "Remover" from css element ".x-menu-item-text"     
     And I wait 10 seconds or until xpath element "//button[contains(child::text(), 'Sim')]" is present
     And I click once in xpath element "//button[contains(child::text(), 'Sim')]"
     Then I wait 10 seconds or until named element "content='The group GrupoRenomeado was successfully removed!'" is present

