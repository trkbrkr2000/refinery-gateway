import { Violation } from '../../services/validator.service'

export class DualSaveValidator {
  constructor(private standards: any) {}

  async validate(filePath: string, content: string): Promise<{ violations: Violation[] }> {
    const violations: Violation[] = []

    // Check TypeScript/Python files that might save document data
    if (!filePath.endsWith('.ts') && !filePath.endsWith('.py')) {
      return { violations }
    }

    // Skip if not dealing with document/analysis operations
    const isDocumentRelated = content.includes('document') || content.includes('analysis') || content.includes('extraction')
    if (!isDocumentRelated) {
      return { violations }
    }

    const standard = this.standards.standards.backend.dualSave

    // Check for saves to collections
    const hasDocumentExtractionsSave =
      content.includes('document_extractions') &&
      (content.includes('.update') || content.includes('.save') || content.includes('.insert'))

    const hasAnalysisResultsSave =
      content.includes('analysis_results') &&
      (content.includes('.update') || content.includes('.save') || content.includes('.insert'))

    // If saving to one collection, must save to both
    if ((hasDocumentExtractionsSave || hasAnalysisResultsSave) && !(hasDocumentExtractionsSave && hasAnalysisResultsSave)) {
      const missingSave = hasDocumentExtractionsSave ? 'analysis_results' : 'document_extractions'

      violations.push({
        standardId: standard.id,
        severity: standard.severity,
        file: filePath,
        message: `Document data saved to one collection but not both. Missing save to '${missingSave}'. ${standard.rationale}`,
        fix: filePath.endsWith('.py')
          ? `Add save to ${missingSave} collection:\n\nself.db.${missingSave}.update_one(\n    {"documentId": document_id},\n    {"$set": ${missingSave}_data},\n    upsert=True\n)`
          : `Add save to ${missingSave} collection:\n\nawait this.${missingSave}Model.updateOne(\n  { documentId },\n  ${missingSave}Data,\n  { upsert: true }\n)`
      })
    }

    return { violations }
  }
}
