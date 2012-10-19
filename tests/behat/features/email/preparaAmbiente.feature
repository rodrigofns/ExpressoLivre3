Feature: cenários para a preparação do ambiente pars os testes

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

  @esvaziarLixeira @javascript
  Scenario: Apagar todas as mensagens da lixeira
    When If xpath element "//span[contains(child::text(), 'cesar.vianna@serpro.gov.br')]" don't is present, i click in xpath element "//span[contains(child::text(), 'Contas de Email')]"
    And If css element ".x-tree-ec-icon.x-tree-elbow-end-plus" is present, click this
    And I wait 3 seconds
    And If css element ".x-tree-ec-icon.x-tree-elbow-end-plus" is present, click this
    And I wait 10 seconds
    And I click once in xpath element "//span[contains(child::text(), 'Lixeira')]"        
    And I click once in xpath element "//em[contains(@class,'x-btn-arrow')]/button[contains(@class,'x-ux-pagingtb-main')]"
    And I wait 5 seconds or until xpath element "//span[contains(child::text(), 'Selecionar todas as')]" is present
    And I click once in xpath element "//span[contains(child::text(), 'Selecionar todas as')]"
    And I click once in xpath element "//button[contains(child::text(), 'Excluir')]"
    And I wait 5 seconds or until xpath element "//button[contains(child::text(), 'Sim')]" is present
    And I click once in xpath element "//button[contains(child::text(), 'Sim')]"
    And I click once in xpath element "//button[contains(@class,'x-tbar-loading')]"
    And I wait 10 seconds or until xpath element "//div[contains(child::text(), 'Nenhuma mensagem encontrada')]" is present

  @excluirMensagens @javascript
  Scenario Outline: Excluir as mensagens utilizadas nos testes
    #Pesquisar as mensagens
    Given If xpath element "//div[contains(@class,'x-panel tw-ftb-filterpanel') and not(contains (@class,'hide-display'))]" don't is present, i click in xpath element "//button[contains(text(),'Exibir detalhes')]"    
    And I wait 10 seconds or until xpath element "//table/tbody/tr[1]/td[6]/div/input" is present
    And I fill xpath "//table/tbody/tr[1]/td[6]/div/input" with <assunto>
    And I click once in xpath element "//button[contains(@class,'action_startFilter')]"
    And I wait 3 seconds
    #Remover as mensagens
    And I click once in xpath element "//em[contains(@class,'x-btn-arrow')]/button[contains(@class,'x-ux-pagingtb-main')]"
    And I wait 5 seconds or until xpath element "//span[contains(child::text(), 'Selecionar todas as')]" is present
    And I click once in xpath element "//span[contains(child::text(), 'Selecionar todas as')]"
    And I click once in xpath element "//button[contains(child::text(), 'Excluir')]"
    And I wait 5 seconds or until xpath element "//button[contains(child::text(), 'Sim')]" is present
    And I click once in xpath element "//button[contains(child::text(), 'Sim')]"

    Examples:
    |  assunto |
    |  "Pesquisa123"   |
    |  "NovaMensagem"   |
    |  "MensagemApenasComCc"   |
    |  "MensagemApenasComBcc"   |
    |  "MensagemSalvaComCampoPara"   |
    |  "MensagemSalvaComCampoBc"   |
    |  "MensagemSalvaComCampoBcc"   |
    |  "EnviarMensagensDaPastaDrafts"   |
    |  "ResponderMENSAGENS"   |
    |  "DestacarMensagem"   |
    |  "MesagemImportante"  |
    |  "ContatosDinamicos"  |