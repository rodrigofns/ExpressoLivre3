@N9P3F1
Feature: Exibir a lista de Contatos ou grupos
  Permitir aos usuários exibirem a lista de Contatos ou grupos

  Background: # Autenticação
    Given I am on "/"
    And I wait 10 seconds or until named element "field='locale'" is present
    And I click in xpath element "//div/img"
    And I wait 2 seconds or until css element ".x-combo-list-item" is present
    And I choose "português Brasil [pt_BR]" from ".x-combo-list-item"
    And I wait 10 seconds or until css element "#username" is present
    And I wait 1 second or until css element "#password" is present
    And I wait 1 second or until css element "#ext-gen33" is present
    When I fill in "username" with "teste"
    And I fill in "password" with "senha"
    And I press "ext-gen33"
    Then I wait 20 seconds or until named element "content='teste, Teste'" is present

  @N9P3F1C1 @javascript
  Scenario: Exibir a Lista de Grupos
    When I wait 20 seconds or until css element "#messenger" is present
    And I click once in xpath element "//*[@id='messenger']"
    And I wait 20 seconds or until named element "content='Expresso Messenger'" is present
    And I wait 2 seconds or until css element ".x-tree-ec-icon.x-tree-elbow-minus" is present

  @N9P3F1C2 @javascript
  Scenario: Exibir a Lista de Contatos
    When I wait 20 seconds or until css element "#messenger" is present
    And I click once in xpath element "//*[@id='messenger']"
    And I wait 20 seconds or until named element "content='Expresso Messenger'" is present
    And I wait 2 seconds or until css element ".x-tree-node-el.x-tree-node-leaf.x-unselectable.messenger-contact" is present