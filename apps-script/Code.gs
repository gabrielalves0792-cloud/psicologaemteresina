/**
 * Google Apps Script - Recebe leads do site Maria Gerlane Psicóloga
 * Implantação: Extensões → Apps Script → Implantar → Novo implante → App da Web
 *   · Executar como: "Eu (gabriel@joinmind.com.br)"
 *   · Quem tem acesso: "Qualquer pessoa"
 * Após implantar, copie a URL e cole em js/main.js → APPS_SCRIPT_URL_AQUI
 */

var SHEET_ID    = '1BcQCZ1hjF4Qyd452G8v7_tsBYEGXWVWDNW2pJpM5-6U';
var SHEET_NAME  = 'Leads';
var NOTIFY_EMAIL = 'mariagerlanepsi@gmail.com';

function doPost(e) {
  try {
    var data   = JSON.parse(e.postData.contents);
    var sheet  = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Data/Hora', 'Nome', 'E-mail', 'WhatsApp', 'Modalidade', 'Mensagem', 'Origem']);
    }

    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.nome      || '',
      data.email     || '',
      data.whatsapp  || '',
      data.modalidade|| '',
      data.mensagem  || '',
      data.origem    || ''
    ]);

    notifyByEmail(data);

    return buildResponse({ success: true });
  } catch (err) {
    return buildResponse({ success: false, error: err.toString() });
  }
}

/* Envia uma cópia do lead por e-mail; falha aqui não deve derrubar o envio do formulário */
function notifyByEmail(data) {
  try {
    var assunto = 'Novo contato pelo site - ' + (data.nome || 'sem nome');
    var corpo =
      'Novo contato recebido pelo site:\n\n' +
      'Nome: '       + (data.nome       || '-') + '\n' +
      'E-mail: '     + (data.email      || '-') + '\n' +
      'WhatsApp: '   + (data.whatsapp   || '-') + '\n' +
      'Modalidade: ' + (data.modalidade || '-') + '\n' +
      'Mensagem: '   + (data.mensagem   || '-') + '\n' +
      'Origem: '     + (data.origem     || '-') + '\n' +
      'Data/Hora: '  + (data.timestamp  || new Date().toISOString());

    MailApp.sendEmail(NOTIFY_EMAIL, assunto, corpo);
  } catch (err) {
    // não interrompe o fluxo principal se o e-mail falhar
  }
}

function buildResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/* doGet apenas para confirmar que o script está no ar */
function doGet() {
  return buildResponse({ status: 'ok', script: 'Maria Gerlane Psicóloga - Leads' });
}
