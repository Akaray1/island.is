import { Injectable } from '@nestjs/common'
import type { User } from '@island.is/auth-nest-tools'
import { CourtCases, State } from '../models/courtCases.model'
import { getSubpoena } from './helpers/mockData'
import { CourtCase } from '../models/courtCase.model'
import { Subpoena } from '../models/subpoena.model'
import { Lawyers } from '../models/lawyers.model'
import { DefenseChoice } from '../models/defenseChoice.model'
import { PostDefenseChoiceInput } from '../dto/postDefenseChoiceInput.model'
import { PostSubpoenaAcknowledgedInput } from '../dto/postSubpeonaAcknowledgedInput.model'
import { SubpoenaAcknowledged } from '../models/subpoenaAcknowledged.model'
import { Locale } from 'locale'
import {
  CaseResponse,
  CasesResponse,
  Defender,
  JudicialSystemSPClientService,
  SubpoenaResponse,
} from '@island.is/clients/judicial-system-sp'

interface CaseResponseTemp {
  id: string
  caseNumber: string
  type: string
  state: State
}

interface SingleCaseResponseTemp {
  data: {
    caseNumber: string
    groups: {
      label: string
      items: {
        label: string
        value: string
        linkType?: string | undefined
      }[]
    }[]
  }
}
@Injectable()
export class LawAndOrderService {
  constructor(private api: JudicialSystemSPClientService) {}

  async getCourtCases(user: User, locale: Locale) {
    const cases: Array<CasesResponse> | undefined = await this.api.getCases(
      user,
      locale,
    )
    const list: CourtCases = { items: [] }
    const randomBoolean = Math.random() < 0.75

    cases?.map((x: CasesResponse) => {
      list.items?.push({
        id: x.id,
        acknowledged: randomBoolean,
        caseNumber: x.caseNumber,
        caseNumberTitle: x.caseNumber,
        state: x.state,
        type: x.type,
      })
    })

    return list
  }

  async getCourtCase(user: User, id: string, locale: Locale) {
    const singleCase = await this.api.getCase(id, user, locale)
    const randomBoolean = Math.random() < 0.75
    let data: CourtCase = {}

    data = {
      data: {
        id: singleCase?.caseId ?? id,
        acknowledged: randomBoolean,
        caseNumber: singleCase?.data.caseNumber,
        caseNumberTitle: singleCase?.data.caseNumber,
        groups: singleCase?.data.groups,
      },
      actions: undefined,
      texts: undefined,
    }

    return data
  }

  async getSubpoena(user: User, id: string, locale: Locale) {
    const subpoena: SubpoenaResponse | undefined = await this.api.getSubpoena(
      id,
      user,
      locale,
    )
    const mockAnswer = getSubpoena(id).data
    let data: Subpoena = {}

    data = {
      data: {
        id: subpoena?.caseId ?? id,
        acknowledged: undefined,
        chosenDefender: subpoena?.defenderInfo.defenderName,
        defenderChoice: subpoena?.defenderInfo.defenderChoice,
        displayClaim: subpoena?.acceptCompensationClaim,
        groups: mockAnswer?.data.groups,
      },
      actions: mockAnswer?.actions,
      texts: mockAnswer?.texts,
    }

    return data
  }

  async getLawyers(user: User, locale: Locale) {
    const answer: Array<Defender> | undefined = await this.api.getLawyers(
      user,
      locale,
    )
    const list: Lawyers = { items: [] }

    answer?.map((x) => {
      list.items?.push({
        name: x.name,
        nationalId: x.nationalId,
        practice: x.practice,
      })
    })

    return list
  }

  async isSubpoenaAcknowledged(user: User, id?: string) {
    //const answer = this.lawAndOrderApi.getTest(user)
    if (!id) return undefined
    const randomBoolean = Math.random() < 0.75

    return randomBoolean
  }

  async postDefenseChoice(user: User, input: PostDefenseChoiceInput) {
    if (!input) return null

    const res: DefenseChoice = {
      caseId: input.caseId,
      lawyersNationalId: input.lawyersNationalId,
      choice: input.choice,
    }

    return res
  }

  async postSubpoenaAcknowledged(
    user: User,
    input: PostSubpoenaAcknowledgedInput,
  ) {
    if (!input) return null

    const res: SubpoenaAcknowledged = {
      caseId: input.caseId,
      acknowledged: input.acknowledged,
    }

    return res
  }
}
