@N1F1
Feature: Permitir autenticação utilizando usuário e senha
  Como um usuário do sistema
  Eu posso acessar o sistema
  Quando eu me autenticar

  Background:
    Given I am on "/"
    And I wait 10 seconds or until named element "field='locale'" is present
    And I click once in xpath element "//img[contains(@class,'x-form-trigger')]"
    And I wait 2 seconds or until css element ".x-combo-list-item" is present
    And I choose "português Brasil [pt_BR]" from ".x-combo-list-item"
    And I wait 10 seconds or until named element "field='username'" is present
    And I wait 1 second or until css element "#password" is present
    And I wait 1 second or until css element ".x-btn-text" is present

  @N1F1C1 @javascript
  Scenario: Autenticação e Autorização de Usuários Válidos
    When I fill in "username" with "cesar"
    And I fill in "password" with "senha"
    And I click once in xpath element "//button"
    Then I wait 10 seconds or until named element "content='teste, Teste'" is present

  @N1F1C2 @javascript
  Scenario: Autenticação e Autorização de Usuários Inválidos
    When I fill in "username" with "invalido"
    And I fill in "password" with "abcdef"
    And I click once in xpath element "//button"
    Then I wait 10 seconds or until named element "content='Seu usuário e/ou senha estão incorretos'" is present

  @N1F1C3 @javascript
  Scenario: Autenticação e Autorização de Usuários Válidos com senha errada
    When I fill in "username" with "teste"
    And I fill in "password" with "abcdef"
    And I click once in xpath element "//button"
    Then I wait 10 seconds or until named element "content='Seu usuário e/ou senha estão incorretos'" is present