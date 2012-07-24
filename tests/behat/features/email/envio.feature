@N4F2 @googlechrome
Feature: Permitir que as mensagens sejam criadas
  Como um usuário qualquer do sistema
  Eu posso criar mensagem de e-mail
  Quando selecionar a opção de “Nova mensagem”

  Background: # Autenticação
    Given I am on "/"
    And I wait 10 seconds or until named element "field='locale'" is present
    And I click in xpath element "//div/img"
    And I wait 2 seconds or until css element ".x-combo-list-item" is present
    And I choose "português Brasil [pt_BR]" from ".x-combo-list-item"
    And I wait 10 seconds or until css element "#username" is present
    And I wait 1 second or until css element "#password" is present
    And I wait 1 second or until css element "#ext-gen33" is present
    When I fill in "username" with "INSERIR AQUI O USER"
    And I fill in "password" with "INSERIR AQUI A SENHA"
    And I press "ext-gen33"
    Then I wait 20 seconds or until named element "content='Lima Albuquerque, Marcio'" is present

  @N4F2C1 @javascript
  Scenario: Criar e-mail
    When I click in xpath element "//div/table/tbody/tr/td/table/tbody/tr[2]/td[2]/em/button"
    And I wait 4 seconds or until named element "content='Compor mensagem'" is present
    And I wait 1 second or until xpath element "//div[2]/div[2]/div/input" is present
    And I wait 1 second or until xpath element "//div/div[3]/div/input" is present
    Then I fill xpath "//div[2]/div[2]/div/input" with "marcio.albuquerque@serpro.gov.br"
    And I fill xpath "//div/div[3]/div/input" with "Teste de Envio"
    And I fill message body with "Mensagem de Texto"
    And I click in xpath element "//div[2]/div/div/div/div/div/div/div/div/div/div/div/table/tbody/tr/td/table/tbody/tr/td/div/div[2]/div/div/div/div/table/tbody/tr/td/table/tbody/tr[2]/td[2]/em/button"
