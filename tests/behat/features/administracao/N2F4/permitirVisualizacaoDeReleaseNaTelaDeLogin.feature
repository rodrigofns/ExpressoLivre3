@N2F8C1
Feature: Permitir visualização de release na tela de login

  @N2F8C1CTV3-508 @javascript
  Scenario: Permitir visualização de release na tela de login
     Given I am on "/"
     When I wait 10 seconds or until css element "#about_button" is present
     And I click once in css element "#about_button"
     Then I should see "Versão: ExpressoV3"