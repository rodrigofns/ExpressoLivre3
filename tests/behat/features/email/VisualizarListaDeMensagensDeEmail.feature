@N4F6C1 @javascript
Feature: Visualizar LISTA de MENSAGENS de e-mail
    Como um usuário do sistema
    Eu posso visualizar a lista de mensagens de email de uma pasta
    Quando selecionada a pasta de mensagens desejada

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

    @CTV3-69 @javascript
    Scenario: Visualizar primeira página da lista de mensagens com mais de uma página
    Given I wait 20 seconds or until xpath element "//div[contains(text(),'Mostrando registros 1 -')]" is present
    When I click once in xpath element ".//button[contains(@class,'x-tbar-page-next')]"
    Then I wait 20 seconds or until xpath element "//div[contains(text(),'Mostrando registros 51 -')]" is present
    And I click once in xpath element ".//button[contains(@class,'x-tbar-page-first')]"
    And I wait 20 seconds or until xpath element "//div[contains(text(),'Mostrando registros 1 -')]" is present
    And I wait 1 seconds or until xpath element ".//input[contains(@class,'x-form-num-field')]" has the value "1"    
