export type AssessmentErrorCode = 'FORBIDDEN' | 'NOT_FOUND' | 'INVALID' | 'CONFLICT';

export class AssessmentDomainError extends Error {
  constructor(public readonly code: AssessmentErrorCode, message: string) {
    super(message);
    this.name = 'AssessmentDomainError';
  }
}
