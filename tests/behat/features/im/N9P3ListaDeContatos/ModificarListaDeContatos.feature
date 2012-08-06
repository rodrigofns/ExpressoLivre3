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
   And I fill in "messenger-contact-add-jid" with "novo@simdev.sdr.serpro"
   And I fill in "messenger-contact-add-name" with "Novo"
   And I click once in xpath element "//button[contains(child::text(), 'Add')]"