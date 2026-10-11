// Testes obrigatórios do padrão de doações (DOACOES.md). Rode com: node --test tests
const test = require("node:test");
const assert = require("node:assert/strict");
const { DONATION, crc16, buildPixCode, parseAmount, donationCode } = require("../js/pix.js");
const qrcode = require("../vendor/qrcode-generator.js");

test("crc16 do vetor padrão", () => {
  assert.equal(crc16("123456789"), "29B1");
});

test("exemplo do Banco Central sai idêntico", () => {
  const code = buildPixCode({ key: "123e4567-e12b-12d1-a456-426655440000", receiverName: "Fulano de Tal", receiverCity: "BRASILIA" });
  assert.equal(code, "00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-4266554400005204000053039865802BR5913Fulano de Tal6008BRASILIA62070503***63041D3D");
});

test("valor digitado: vírgula e ponto são decimais, milhar é recusado", () => {
  assert.equal(parseAmount("15,50"), 15.5);
  assert.equal(parseAmount("15.50"), 15.5);
  assert.equal(parseAmount("15"), 15);
  assert.equal(parseAmount("5000"), 5000);
  for (const bad of ["1.500", "1,500", "abc", "", "0", "0,00", "5000,01", "5001", "-5", "10 reais", "1e3"]) {
    assert.equal(parseAmount(bad), null, `deveria recusar "${bad}"`);
  }
});

// Lê os campos id + tamanho + valor de volta, para conferir o que o banco vai enxergar
const parseFields = (code) => {
  const out = {};
  for (let i = 0; i < code.length;) {
    const id = code.slice(i, i + 2), size = Number(code.slice(i + 2, i + 4));
    out[id] = code.slice(i + 4, i + 4 + size);
    i += 4 + size;
  }
  return out;
};

test("código deste projeto: chave, nome, cidade, txid e CRC", () => {
  for (const amount of [undefined, 5, 15.5]) {
    const code = donationCode(amount);
    const fields = parseFields(code);
    assert.equal(parseFields(fields["26"])["01"], "35f6734f-2587-4139-8e9b-0ed7a4436a7a");
    assert.equal(fields["59"], "RICHARD ESLEY S OLIVEIRA");
    assert.equal(fields["60"], "BRASILIA");
    assert.equal(parseFields(fields["62"])["05"], "NIHONGOPOCKET");
    assert.equal(fields["54"], amount ? amount.toFixed(2) : undefined);
    assert.equal(fields["63"], crc16(code.slice(0, -4)));
  }
  assert.ok(DONATION.receiverName.length <= 25 && DONATION.receiverCity.length <= 15 && DONATION.txid.length <= 25);
});

test("o código cabe em um QR Code", () => {
  const qr = qrcode(0, "M");
  qr.addData(donationCode(5000));
  qr.make();
  assert.ok(qr.getModuleCount() >= 21);
});
