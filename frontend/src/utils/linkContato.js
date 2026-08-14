// Monta o link do wa.me a partir de qualquer formato de telefone que venha
// do Pipedrive ((11) 98126-4155, 21 986640688, 11963208233...) - so limpa
// pra digitos e garante o DDI 55 na frente.
export function linkWhatsApp(telefone) {
  if (!telefone) return null;
  const digitos = telefone.replace(/\D/g, "");
  if (!digitos) return null;
  // numero brasileiro sem DDI tem 10 ou 11 digitos (DDD + numero). Checar
  // o tamanho em vez de so olhar se comeca com "55" - DDD 55 e Rio Grande
  // do Sul de verdade, ia confundir um telefone gaucho com o DDI.
  const comDDI = digitos.length <= 11 ? `55${digitos}` : digitos;
  return `https://wa.me/${comDDI}`;
}

// Telefone/e-mail as vezes vem com mais de um valor no mesmo campo, ex:
// "(11) 3062-2768/ (35) 99945-7568" - separa em varios pra virar um botao
// por contato, em vez de um link so quebrado.
export function dividirContatos(valor) {
  if (!valor) return [];
  return valor
    .split(/[/,;]+/)
    .map((v) => v.trim())
    .filter(Boolean);
}

// Mesma normalizacao do WhatsApp, mas pro protocolo tel: (botao "Ligar").
export function linkTelefone(telefone) {
  if (!telefone) return null;
  const digitos = telefone.replace(/\D/g, "");
  if (!digitos) return null;
  const comDDI = digitos.length <= 11 ? `55${digitos}` : digitos;
  return `tel:+${comDDI}`;
}

// Em vez de mailto: (que depende do cliente de e-mail padrao do SO, e
// costuma abrir o Outlook em vez do webmail da WTG), abre direto a tela de
// composicao do webmail com o destinatario ja preenchido no "Para".
export function linkEmailWebmail(email) {
  if (!email) return null;
  return `https://webmail.wtgseguros.com.br/?_task=mail&_action=compose&_to=${encodeURIComponent(email)}`;
}
