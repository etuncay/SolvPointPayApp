export {
  validateConditionDsl,
  validateFraudConditionDsl,
  evaluateConditionDsl,
  type DslValidationResult,
} from './parser';
export {
  RISK_SCORE_SCOPES,
  SCOPE_VARIABLES,
  FRAUD_SCOPE_VARIABLES,
  type RiskScoreScope,
  type FraudDslScope,
  isAllowedIdentifier,
  isAllowedFraudIdentifier,
} from './variables';
export {
  FRAUD_ENTITIES,
  FRAUD_ENTITY_ATTRS,
  FRAUD_FUNCTIONS,
  FRAUD_TEXT_OPS,
  FRAUD_REFERENCE_LISTS,
  validateEntityRef,
  fraudEntityHint,
  type FraudEntity,
  type FraudAttrSpec,
} from './fraud-entities';
