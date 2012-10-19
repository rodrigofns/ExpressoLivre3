@N2F4C1
Feature: Permitir visualização de release através da opção sobre
    Como Usuário do sistema
    Eu posso Visualizar a versão em uso
    Quando Selecionada a guia lateral do logo Expresso

  Background:
    Given I am on "/"
    And I wait 10 seconds or until named element "field='locale'" is present
    And I click once in xpath element "//div/img"
    And I wait 2 seconds or until css element ".x-combo-list-item" is present
    And I choose "português Brasil [pt_BR]" from css element ".x-combo-list-item"
    And I wait 10 seconds or until css element "#username" is present
    And I wait 1 second or until css element "#password" is present
    And I wait 1 second or until xpath element "//button[contains(text(),'Login')]" is present

  @N2F4C1CTV3-507 @javascript
  Scenario: Permitir visualização de release através da opção sobre
    When I fill in "username" with "81487819072"
    And I fill in "password" with "serpro"
    And I click once in xpath element "//button"
    And I wait 10 seconds or until xpath element "//li[contains(@class,'tine-mainscreen-apptabspanel-menu-tabel')]/a[@class='x-tab-strip-close']" is present
    And I click once in xpath element "//li[contains(@class,'tine-mainscreen-apptabspanel-menu-tabel')]/a[@class='x-tab-strip-close']"
    And I wait 3 seconds or until xpath element "//span[contains(text(),'Sobre Expresso 3.0')]" is present
    And I click once in xpath element "//span[contains(text(),'Sobre Expresso 3.0')]"
    Then I wait 3 seconds or until xpath element "//div[contains(text(),'Versão: ExpressoV3')]" is present

