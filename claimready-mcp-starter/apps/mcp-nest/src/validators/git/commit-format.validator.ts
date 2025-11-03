import { Violation } from '../../services/validator.service'

export class CommitFormatValidator {
  private standards: any

  constructor(standards: any) {
    this.standards = standards
  }

  async validate(filePath: string, content: string): Promise<{ violations: Violation[] }> {
    const violations: Violation[] = []
    const standard = this.standards.standards.git.commitMessages

    // For file-based validation, we can't check commit messages
    // This validator is primarily used by the pre-commit hook
    // which will check the actual commit message

    return { violations }
  }

  /**
   * Validate a commit message directly
   */
  validateMessage(message: string): { valid: boolean; violation?: Violation } {
    const standard = this.standards.standards.git.commitMessages

    // Remove footer if present (skipFooter is true per standards)
    const messageWithoutFooter = message.split('\n\n')[0]

    // Check minimum length
    if (messageWithoutFooter.trim().length < 10) {
      return {
        valid: false,
        violation: {
          standardId: standard.id,
          severity: standard.severity,
          file: 'commit-message',
          message: 'Commit message too short. Should be descriptive (minimum 10 characters).',
          fix: 'Use format: "verb + what + why" (e.g., "Add user profile page with authentication")',
        },
      }
    }

    // Check if it starts with a verb (common Git conventions)
    const verbs = [
      'add', 'update', 'fix', 'remove', 'delete', 'refactor', 'improve',
      'implement', 'create', 'modify', 'change', 'enhance', 'optimize',
      'merge', 'revert', 'bump', 'upgrade', 'downgrade', 'configure',
      'document', 'test', 'deploy', 'release', 'hotfix', 'chore',
    ]

    const firstWord = messageWithoutFooter.trim().split(/\s+/)[0].toLowerCase()

    // Check if message starts with a verb (case-insensitive)
    const startsWithVerb = verbs.some(verb => firstWord.startsWith(verb))

    if (!startsWithVerb) {
      return {
        valid: false,
        violation: {
          standardId: standard.id,
          severity: standard.severity,
          file: 'commit-message',
          message: `Commit message should start with a verb. Got: "${firstWord}"`,
          fix: `Start with a verb like: ${verbs.slice(0, 10).join(', ')}, etc.\nExample: "${standard.examples.correct}"`,
        },
      }
    }

    // Check for vague messages
    const vague = ['update', 'fix', 'change', 'modify']
    const secondWord = messageWithoutFooter.trim().split(/\s+/)[1]

    if (vague.includes(firstWord) && (!secondWord || secondWord.length < 3)) {
      return {
        valid: false,
        violation: {
          standardId: standard.id,
          severity: standard.severity,
          file: 'commit-message',
          message: 'Commit message is too vague. Describe WHAT you changed.',
          fix: `Be specific: "${firstWord} user authentication logic" instead of just "${firstWord}"\nExample: "${standard.examples.correct}"`,
        },
      }
    }

    return { valid: true }
  }
}