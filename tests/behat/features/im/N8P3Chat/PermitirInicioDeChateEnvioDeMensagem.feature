@N8P3F1 @N8P3F2
Feature: Permitir Inicio de Chat e Envio de Mensagem
  Como Um usuário do IM
  Eu posso enviar uma mensagem para um contato
  Quando eu criar, compor essa mensagem e confirmar o envio.

  Background: # Autenticação
    Given I am on "/"
    And I wait 10 seconds or until named element "field='locale'" is present
    And I click once in xpath element "//div/img"
    And I wait 2 seconds or until css element ".x-combo-list-item" is present
    And I choose "português Brasil [pt_BR]" from css element ".x-combo-list-item"
    And I wait 10 seconds or until css element "#username" is present
    And I wait 1 second or until css element "#password" is present
    And I wait 1 second or until css element "#ext-gen33" is present
    When I fill in "username" with "cesar"
    And I fill in "password" with "senha"
    And I press "ext-gen33"
    Then I wait 20 seconds or until named element "content='Vianna, Cesar'" is present
  
  @N8P3F1C1 @N8P3F2C1 @N8P3F2C2 @javascript
  Scenario: Iniciar Chat com Contato, Compor e Enviar Mensagem
    When I wait 20 seconds or until css element "#messenger" is present
    And I click once in xpath element "//*[@id='messenger']"
    And I wait 20 seconds or until named element "content='Expresso Messenger'" is present
    And I wait 20 seconds to see mock user
    And I wait 20 seconds or until xpath element "//*/span[1][starts-with(child::text(), 'Rafael') and @status = 'Available']" is present
    And I click twice in xpath element "//*/span[1][starts-with(child::text(), 'Rafael') and @status = 'Available']"
    And I wait 10 seconds or until named element "content='Chat with Rafael (rafael.silva@simdev.sdr.serpro)'" is present
    And I fill xpath "//input[contains(@class, 'text-sender')]" with "poiuyt"
    And I press Enter in xpath element "//input[contains(@class, 'text-sender')]"
    And I wait 10 seconds or until xpath element "//div[contains(child::text(), 'poiuyt')]" is present at this moment    
    Then I click once in css element "#messenger-chat-rafael-silva_simdev-sdr-serpro  .x-tool-close"

  @N8P3F1C2 @javascript
  Scenario: Iniciar Chat com Contato Offline
    When I wait 20 seconds or until css element "#messenger" is present
    And I click once in xpath element "//*[@id='messenger']"
    And I wait 20 seconds or until named element "content='Expresso Messenger'" is present
    And I wait 20 seconds or until xpath element "//*/span[starts-with(child::text(), 'Contato Off') and @status = 'Unavailable']" is present
    And I click twice in xpath element "//*/span[starts-with(child::text(), 'Contato Off') and @status = 'Unavailable']"
    Then I wait 10 seconds or until named element "content='Contato Off is unavailable'" is present

  @N8P3F2C3 @javascript
  Scenario: Contato está digitando
    When I wait 20 seconds or until css element "#messenger" is present
    And I click once in xpath element "//*[@id='messenger']"
    And I wait 20 seconds or until named element "content='Expresso Messenger'" is present
    And I wait 20 seconds or until xpath element "//*/span[1][starts-with(child::text(), 'Rafael') and @status = 'Available']" is present
    And I click twice in xpath element "//*/span[1][starts-with(child::text(), 'Rafael') and @status = 'Available']"
    And I wait 10 seconds or until named element "content='Chat with Rafael (rafael.silva@simdev.sdr.serpro)'" is present
    And I fill xpath "//input[contains(@class, 'text-sender')]" with "poiuyt"
    And I press Enter in xpath element "//input[contains(@class, 'text-sender')]"
    Then I wait 20 seconds or until xpath element "//div[contains(child::text(), 'is typing')]" is present at this moment  

  @N8P3F2C4 @javascript
  Scenario: Contato parou de digitar
    When I wait 20 seconds or until css element "#messenger" is present
    And I click once in xpath element "//*[@id='messenger']"
    And I wait 20 seconds or until named element "content='Expresso Messenger'" is present
    And I wait 20 seconds or until xpath element "//*/span[1][starts-with(child::text(), 'Rafael') and @status = 'Available']" is present
    And I click twice in xpath element "//*/span[1][starts-with(child::text(), 'Rafael') and @status = 'Available']"
    And I wait 10 seconds or until named element "content='Chat with Rafael (rafael.silva@simdev.sdr.serpro)'" is present
    And I fill xpath "//input[contains(@class, 'text-sender')]" with "poiuyt"
    And I press Enter in xpath element "//input[contains(@class, 'text-sender')]"
    Then I wait 20 seconds or until xpath element "//div[contains(child::text(), 'sttoped typing!')]" is present at this moment  

  @javascript
  Scenario: Envio de Mensagem
    Given I wait 3 seconds to see mock user status=available
    When I double click in mock user
    And I see mock user chat
    And I fill in css element ".messenger-chat-field" with "Enviando esta mensagem..."
    And I press ENTER in ".messenger-chat-field"
    Then mock user should receive "Enviando esta mensagem..."
    #And I click in css element "button.action_logOut"
    And I wait 3 seconds

  @javascript @envioIM
  Scenario: Envio de Mensagem
    Given I wait 10 seconds to see mock user
    When I double click in mock user
    And I see mock user chat
    And I fill in css element ".messenger-chat-field" with "Enviando esta mensagem..."
    And I press ENTER in ".messenger-chat-field"
    Then mock user should receive "Enviando esta mensagem..."
    #And I click once in css element "button.action_logOut"
    And I wait 3 seconds
