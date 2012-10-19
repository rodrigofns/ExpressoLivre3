@N4P2F22C1 @javascript
Feature: Permitir mover mensagens na lista 

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
    #Envia mensagem
    And I click once in xpath element "//div/table/tbody/tr/td/table/tbody/tr[2]/td[2]/em/button"
    And I wait 4 seconds or until named element "content='Compor mensagem'" is present
    And I wait 1 second or until xpath element "//div[2]/div[2]/div/input" is present
    And I wait 1 second or until xpath element "//div/div[3]/div/input" is present
    And I fill xpath "//div[2]/div[2]/div/input" with "cesar.vianna@serpro.gov.br"
    And I click once in xpath element "//div/div[3]/div/input"
    And I fill xpath "//div/div[3]/div/input" with "Nova Mensagem"
    And I fill message body with "Mensagem de Texto"
    And I click once in xpath element "//div[2]/div/div/div/div/div/div/div/div/div/div/div/table/tbody/tr/td/table/tbody/tr/td/div/div[2]/div/div/div/div/table/tbody/tr/td/table/tbody/tr[2]/td[2]/em/button"
    And I wait 10 seconds or until named element "content='Transferindo Mensagem...'" is not present

    @arrastar @javascript
    Scenario: arrastar
    When I click once in xpath element "//button[contains(@class,'x-tbar-loading')]"
    And I wait 10 seconds or until xpath element "//div[contains(child::text(), 'Nova Mensagem')]" is present
    And If xpath element "//span[contains(child::text(), 'cesar.vianna@serpro.gov.br')]" don't is present, i click in xpath element "//span[contains(child::text(), 'Contas de Email')]"
    And If css element ".x-tree-ec-icon.x-tree-elbow-end-plus" is present, click this
    And I drag the xpath element "//div[contains(child::text(), 'Nova Mensagem')]" to the "//span[contains(child::text(), 'Lixeira')]"
    And I wait 10 seconds
    