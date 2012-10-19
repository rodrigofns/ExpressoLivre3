@N9P3F1
Feature: Exibir a lista de Contatos ou grupos
  Permitir aos usuários exibirem a lista de Contatos ou grupos

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

  @N9P3F1C1 @javascript
  Scenario: Exibir a Lista de Grupos
    When I wait 20 seconds or until css element "#messenger" is present
    And I click once in xpath element "//*[@id='messenger']"
    And I wait 20 seconds or until named element "content='Expresso Messenger'" is present
    And I wait 20 seconds or until xpath element "//*[@id='ext-gen483']/div/li/div" is present

  @N9P3F1C2 @javascript
  Scenario: Exibir a Lista de Contatos
    When I wait 20 seconds or until css element "#messenger" is present
    And I click once in xpath element "//*[@id='messenger']"
    And I wait 20 seconds or until named element "content='Expresso Messenger'" is present
    And I wait 20 seconds or until xpath element "//*[@id='ext-gen483']/div/li/ul/li[1]/div" is present