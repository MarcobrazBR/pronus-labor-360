import assert from "node:assert/strict";
import test from "node:test";
import {
  attachmentSecurityPolicies,
  automatedTestSuites,
  buildQualitySummary,
  esocialSstQueue,
  lgpdConsents,
  retentionPolicies,
  sensitiveAccessTrail,
} from "../../apps/api/src/modules/quality/quality.contracts.ts";

test("matriz de testes cobre todos os dominios criticos da prioridade 5", () => {
  const domains = new Set(automatedTestSuites.map((suite) => suite.domain));

  for (const domain of [
    "login",
    "permissions",
    "structural_registration",
    "spreadsheet_import",
    "psychosocial",
    "schedule",
    "clinical_record",
    "finance",
  ]) {
    assert.equal(domains.has(domain), true, `Dominio ausente: ${domain}`);
  }
});

test("politicas LGPD exigem retencao e consentimento para dados sensiveis", () => {
  assert.ok(retentionPolicies.some((policy) => policy.dataDomain.includes("Prontuario")));
  assert.ok(lgpdConsents.some((consent) => consent.purpose === "psychosocial_questionnaire"));
  assert.ok(sensitiveAccessTrail.some((event) => event.decision === "denied"));
});

test("politica de anexos mantem buckets sensiveis privados e com URL curta", () => {
  const clinicalPolicy = attachmentSecurityPolicies.find(
    (policy) => policy.bucketName === "clinical-records",
  );

  assert.ok(clinicalPolicy);
  assert.equal(clinicalPolicy.encryptionRequired, true);
  assert.equal(clinicalPolicy.signedUrlMinutes <= 15, true);
  assert.ok(clinicalPolicy.allowedMimeTypes.includes("audio/webm"));
});

test("fila eSocial SST prepara eventos sem envio real no MVP", () => {
  const eventTypes = new Set(esocialSstQueue.map((item) => item.eventType));

  for (const eventType of ["S-2210", "S-2220", "S-2240", "S-3000"]) {
    assert.equal(eventTypes.has(eventType), true, `Evento ausente: ${eventType}`);
  }

  assert.equal(
    esocialSstQueue.every((item) => item.futureSubmissionEnabled === false),
    true,
  );
  assert.equal(
    esocialSstQueue.some((item) => item.status === "blocked_by_missing_data"),
    true,
  );
});

test("resumo de qualidade consolida testes, LGPD, anexos e eSocial", () => {
  const summary = buildQualitySummary("2026-05-13T00:00:00.000Z");

  assert.equal(summary.generatedAt, "2026-05-13T00:00:00.000Z");
  assert.equal(summary.automatedTestCoverage.total, automatedTestSuites.length);
  assert.equal(summary.lgpdGovernance.retentionPolicies, retentionPolicies.length);
  assert.equal(summary.attachmentSecurity.encryptedBuckets, attachmentSecurityPolicies.length);
  assert.equal(summary.esocialSstQueue.futureSubmissionEnabled, false);
});
