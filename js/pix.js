// Gera o "Pix Copia e Cola" (BR Code estático, padrão EMV do Banco Central).
// O código é só um texto montado a partir da chave: não há servidor nem intermediário,
// e por isso o app não fica sabendo se alguém pagou.
// Padrão comum a todos os projetos do autor: veja DOACOES.md na pasta de projetos.
(function (root) {
  "use strict";

  // Só o `txid` muda de um projeto para outro.
  const DONATION = {
    pixKey: "35f6734f-2587-4139-8e9b-0ed7a4436a7a",
    // Nome exibido no app do banco, conferido por quem doa.
    receiverFullName: "Richard Esley Silva Oliveira",
    // Nome no código Pix: o padrão aceita até 25 caracteres, sem acentos.
    receiverName: "RICHARD ESLEY S OLIVEIRA",
    receiverCity: "BRASILIA",
    // Aparece no extrato do recebedor e identifica de qual projeto veio a doação.
    txid: "NIHONGOPOCKET",
    suggestedAmounts: [5, 10, 20],
    maxAmount: 5000,
    contactEmail: "richardesleyso@gmail.com",
  };

  const field = (id, value) => `${id}${String(value.length).padStart(2, "0")}${value}`;

  const plain = (text, maxLength) => text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^A-Za-z0-9 ]/g, "")
    .trim()
    .slice(0, maxLength);

  // CRC16-CCITT (polinômio 0x1021, valor inicial 0xFFFF), exigido no campo 63.
  function crc16(text) {
    let crc = 0xffff;
    for (const char of text) {
      crc ^= char.charCodeAt(0) << 8;
      for (let bit = 0; bit < 8; bit += 1) {
        crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
      }
    }
    return crc.toString(16).toUpperCase().padStart(4, "0");
  }

  function buildPixCode({ key, receiverName, receiverCity, txid, amount }) {
    const hasAmount = typeof amount === "number" && Number.isFinite(amount) && amount > 0;
    const payload = [
      field("00", "01"),
      field("26", field("00", "br.gov.bcb.pix") + field("01", key.trim())),
      field("52", "0000"),
      field("53", "986"),
      hasAmount ? field("54", amount.toFixed(2)) : "",
      field("58", "BR"),
      field("59", plain(receiverName, 25)),
      field("60", plain(receiverCity, 15)),
      field("62", field("05", (txid || "").replace(/[^A-Za-z0-9]/g, "").slice(0, 25) || "***")),
      "6304",
    ].join("");
    return payload + crc16(payload);
  }

  // Vírgula ou ponto valem como decimal ("15,50" ou "15.50"). Separador de milhar não é aceito,
  // para "1.500" nunca ser lido como um valor diferente do que a pessoa quis digitar.
  function parseAmount(text) {
    const match = /^(\d{1,5})(?:[.,](\d{1,2}))?$/.exec(String(text).trim());
    if (!match) return null;
    const value = Number(`${match[1]}.${match[2] || "0"}`);
    return value > 0 && value <= DONATION.maxAmount ? value : null;
  }

  const donationCode = (amount) => buildPixCode({
    key: DONATION.pixKey,
    receiverName: DONATION.receiverName,
    receiverCity: DONATION.receiverCity,
    txid: DONATION.txid,
    amount: amount || undefined,
  });

  const api = { DONATION, crc16, buildPixCode, parseAmount, donationCode };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.Pix = api;
})(typeof self !== "undefined" ? self : this);
