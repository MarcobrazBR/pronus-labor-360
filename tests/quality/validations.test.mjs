import assert from "node:assert/strict";
import test from "node:test";
import { isValidCnpj, isValidCpf, onlyDigits } from "../../packages/validations/src/index.ts";

test("validacao de documentos remove mascara sem alterar os digitos", () => {
  assert.equal(onlyDigits("072.631.794-23"), "07263179423");
  assert.equal(onlyDigits("12.345.678/0001-95"), "12345678000195");
});

test("validacao de CPF aceita acessos demonstrativos atuais", () => {
  for (const cpf of [
    "111.222.333-96",
    "456.789.123-64",
    "654.987.321-55",
    "789.123.456-64",
    "072.631.794-23",
    "987.654.321-00",
  ]) {
    assert.equal(isValidCpf(cpf), true, `${cpf} deveria ser valido`);
  }
});

test("validacao de CPF rejeita documentos repetidos ou com digito errado", () => {
  assert.equal(isValidCpf("111.111.111-11"), false);
  assert.equal(isValidCpf("072.631.794-22"), false);
});

test("validacao de CNPJ aceita empresa demonstrativa e rejeita numeros invalidos", () => {
  assert.equal(isValidCnpj("12.345.678/0001-95"), true);
  assert.equal(isValidCnpj("00.000.000/0000-00"), false);
  assert.equal(isValidCnpj("12.345.678/0001-90"), false);
});
