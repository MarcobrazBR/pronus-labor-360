import { Injectable } from "@nestjs/common";
import {
  attachmentSecurityPolicies,
  automatedTestSuites,
  buildQualitySummary,
  esocialSstQueue,
  lgpdConsents,
  qualityReferenceSources,
  retentionPolicies,
  sensitiveAccessTrail,
} from "./quality.contracts";

@Injectable()
export class QualityService {
  getSummary() {
    return {
      ...buildQualitySummary(),
      referenceSources: qualityReferenceSources,
    };
  }

  listAutomatedTestSuites() {
    return automatedTestSuites;
  }

  getLgpdGovernance() {
    return {
      attachmentSecurityPolicies,
      consents: lgpdConsents,
      retentionPolicies,
      sensitiveAccessTrail,
    };
  }

  listESocialSstQueue() {
    return {
      events: esocialSstQueue,
      futureSubmissionEnabled: false,
      note: "Fila preparada para validacao futura de SST. O MVP nao envia eventos ao eSocial e nao gera recibos oficiais.",
      referenceSources: qualityReferenceSources,
    };
  }
}
