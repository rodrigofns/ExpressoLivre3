@N1F1C1
Feature: Autenticação e Autorização de Usuários
  Como um usuário do sistema 
  Eu posso acessar o sistema
  Quando o usuário solicita acesso ao sistema (acessando à tela inicial). 

  Background:
    Given I am on "/"
    And I wait 10 seconds or until named element "field='locale'" is present
    And I click once in xpath element "//div/img"
    And I wait 2 seconds or until css element ".x-combo-list-item" is present
    And I choose "português Brasil [pt_BR]" from css element ".x-combo-list-item"
    And I wait 10 seconds or until css element "#username" is present
    And I wait 1 second or until css element "#password" is present
    And I wait 1 second or until xpath element "//button[contains(text(),'Login')]" is present

  @CTV3-0
  Scenario: Data Table
    Given I am on "/"

  @CTV3-1 @javascript
  Scenario: Autenticação e Autorização de Usuários Válidos
    When I fill in "username" with "81487819072"
    And I fill in "password" with "serpro"
    And I click once in xpath element "//button"
    Then I wait 10 seconds or until named element "content='Vianna, Cesar'" is present

  @CTV3-44 @javascript
  Scenario: Logar no sistema com login vazio
    When I fill in "username" with ""
    And I fill in "password" with "serpro"
    And I click once in xpath element "//button"
    Then I wait 10 seconds or until named element "content='Por favor, corrija os erros detectados.'" is present
    And I wait 10 seconds or until xpath element "//input[@id='username' and contains(@class,'invalid')]" is present

  @CTV3-45 @javascript
  Scenario: Logar no sistema com senha vazia
    When I fill in "username" with "81487819072"
    And I fill in "password" with ""
    And I click once in xpath element "//button"
    Then I wait 10 seconds or until named element "content='Seu usuário e/ou senha estão incorretos'" is present

  @CTV3-43 @javascript
  Scenario: Logar no sistema com senha incorreta
    When I fill in "username" with "81487819072"
    And I fill in "password" with "abcdef"
    And I click once in xpath element "//button"
    Then I wait 10 seconds or until named element "content='Seu usuário e/ou senha estão incorretos'" is present

  @CTV3-41 @javascript
  Scenario: Logar no sistema com login incorreto
    When I fill in "username" with "99999999999"
    And I fill in "password" with "serpro"
    And I click once in xpath element "//button"
    Then I wait 10 seconds or until named element "content='Seu usuário e/ou senha estão incorretos'" is present

  @CTV3-47 @javascript
  Scenario: Logar no sistema com senha usando caracteres em branco
    When I fill in "username" with "81487819072"
    And I fill in "password" with " "
    And I click once in xpath element "//button"
    Then I wait 10 seconds or until named element "content='Seu usuário e/ou senha estão incorretos'" is present

  @CTV3-46 @javascript
  Scenario: Logar no sistema com login usando caracteres em branco
    When I fill in "username" with " "
    And I fill in "password" with "serpro"
    And I click once in xpath element "//button"
    Then I wait 10 seconds or until named element "content='Por favor, corrija os erros detectados.'" is present
    And I wait 10 seconds or until xpath element "//input[@id='username' and contains(@class,'invalid')]" is present

  @CTV3-48 @javascript
  Scenario: Logar no sistema com login usando caracteres especiais
    When I fill in "username" with "#9@9&,!9.á;9"
    And I fill in "password" with "serpro"
    And I click once in xpath element "//button"
    Then I wait 10 seconds or until named element "content='Seu usuário e/ou senha estão incorretos'" is present

  @CTV3-511 @javascript
  Scenario: Logar no sistem com login ou senha incorreto e verificar exibição do CAPTCHA
    When I fill in "username" with "81487819072"
    And I fill in "password" with "abcdef"
    And I click once in xpath element "//button"
    Then I wait 10 seconds or until named element "content='Seu usuário e/ou senha estão incorretos'" is present
    And I click once in xpath element "//button[contains(text(),'OK')]"
    And I wait 3 seconds or until css element "#security_code" is present
    And I wait 1 seconds or until css element "#imgCaptcha" is present

