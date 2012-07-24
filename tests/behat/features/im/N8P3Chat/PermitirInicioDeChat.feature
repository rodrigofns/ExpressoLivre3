@N8P3F1
Feature: Permitir Inicio de Chat
  Permitir aos usuários iniciar uma sessão de chat 

  Background: # Autenticação
    Given I am on "/"
    And I wait 10 seconds or until named element "field='locale'" is present
    And I click in xpath element "//div/img"
    And I wait 2 seconds or until css element ".x-combo-list-item" is present
    And I choose "português Brasil [pt_BR]" from ".x-combo-list-item"
    And I wait 10 seconds or until css element "#username" is present
    And I wait 1 second or until css element "#password" is present
    And I wait 1 second or until css element "#ext-gen33" is present
    When I fill in "username" with "INSERIR AQUI O USUARIO"
    And I fill in "password" with "INSERIR AQUI A SENHA"
    And I press "ext-gen33"
    Then I wait 20 seconds or until named element "content='Eduardo Motta Vianna, Cesar'" is present

  @N1F1C1 @N8P3F1C1 @javascript
  Scenario: Iniciar Chat com Contato
    When I wait 20 seconds or until css element "#messenger" is present
    And I click once in xpath element "//*[@id='messenger']"
    And I wait 20 seconds or until named element "content='Expresso Messenger'" is present
    And I wait 20 seconds or until xpath element "//*/span[1][starts-with(child::text(), 'Rafael XYZ') and @status = 'Available']" is present
    And I click twice in xpath element "//*/span[1][starts-with(child::text(), 'Rafael XYZ') and @status = 'Available']"
    And I wait 10 seconds or until named element "content='Chat with Rafael XYZ (rafael.silva@sim.serpro.gov.br)'" is present
    And I fill xpath "//input[contains(@class, 'text-sender')]" with "poiuyt"
    And I press Enter in xpath element "//input[contains(@class, 'text-sender')]"
    And I wait 10 seconds or until xpath element "//div[contains(child::text(), 'poiuyt')]" is present
    Then I click once in 

@N8P3F1C2 @javascript
  Scenario: Iniciar Chat com Contato Offline
    When I wait 20 seconds or until css element "#messenger" is present
    And I click once in xpath element "//*[@id='messenger']"
    And I wait 20 seconds or until named element "content='Expresso Messenger'" is present
    And I wait 20 seconds or until xpath element "//*/span[1][starts-with(child::text(), 'Fredy') and @status = '[object Object]']" is present
    And I click twice in xpath element "//*/span[1][starts-with(child::text(), 'Fredy') and @status = '[object Object]']"
    Then I wait 10 seconds or until named element "content='Fredy is unavailable'" is present

