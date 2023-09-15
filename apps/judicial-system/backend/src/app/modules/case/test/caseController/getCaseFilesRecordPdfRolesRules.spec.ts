import {
  assistantRule,
  judgeRule,
  prosecutorRule,
  registrarRule,
  prosecutorRepresentativeRule,
} from '../../../../guards'
import { CaseController } from '../../case.controller'

describe('CaseController - Get case files record pdf rules', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let rules: any[]

  beforeEach(() => {
    rules = Reflect.getMetadata(
      'roles-rules',
      CaseController.prototype.getCaseFilesRecordPdf,
    )
  })

  it('should give permission to five roles', () => {
    expect(rules).toHaveLength(5)
    expect(rules).toContain(prosecutorRule)
    expect(rules).toContain(prosecutorRepresentativeRule)
    expect(rules).toContain(judgeRule)
    expect(rules).toContain(registrarRule)
    expect(rules).toContain(assistantRule)
  })
})
