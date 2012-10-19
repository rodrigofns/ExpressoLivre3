@N4F45C1 @javascript
Feature:Permitir envio e leitura de mensagens com flag de importante
    Como um usuário qualquer do sistema
    Eu posso enviar um e-mail marcado como importante
    Quando na edição de uma mensagem de email, selecionar a opção de "Marcar como Importante" 

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


    @CTV3-170 @CTV3-174 @javascript
    Scenario: Criar e enviar mensagem marcada como Importante
        #Enviar as mensagens
        Given I click once in xpath element "//div/table/tbody/tr/td/table/tbody/tr[2]/td[2]/em/button"
        And I wait 4 seconds or until named element "content='Compor mensagem'" is present
        And I wait 3 second or until xpath element "//div[2]/div[2]/div/input" is present
        And I wait 3 second or until xpath element "//div/div[3]/div/input" is present
        When I fill xpath "//div[2]/div[2]/div/input" with "cesar.vianna@serpro.gov.br"
        And I click once in xpath element "//div/div[3]/div/input"
        And I fill xpath "//div/div[3]/div/input" with "MesagemImportante"
        And I fill message body with "Mensagem de Texto"
        And I click once in xpath element "//button[contains(@class,'emblems_emblemImportant')]"
        And I click once in xpath element "//div[2]/div/div/div/div/div/div/div/div/div/div/div/table/tbody/tr/td/table/tbody/tr/td/div/div[2]/div/div/div/div/table/tbody/tr/td/table/tbody/tr[2]/td[2]/em/button"
        Then I wait 10 seconds or until named element "content='Transferindo Mensagem...'" is not present
        And I click once in xpath element "//button[contains(@class,'x-tbar-loading')]"
        And I wait 10 seconds or until xpath element "//div[contains(@class,'importance_high') and descendant::div[contains(text(),'MesagemImportante')]]" is present