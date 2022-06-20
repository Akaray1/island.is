import { hasDateChanged, toggleInArray } from './formHelper'

describe('toggleInArray', () => {
  it.each`
    values
    ${undefined}
    ${null}
    ${[]}
  `("should return values=['test'] when values=$values", ({ values }) => {
    const item = 'test'

    const res = toggleInArray(values, item)

    expect(res).toEqual([item])
  })

  it.each`
    values
    ${['removeMe']}
    ${['keepMe', 'removeMe']}
    ${['removeMe', 'keepMe']}
    ${['keepMe', 'removeMe', 'keepMe2']}
  `('should remove item if already in values array', ({ values }) => {
    const item = 'removeMe'

    const res = toggleInArray(values, item)

    expect(res.includes(item)).toEqual(false)
  })

  it.each`
    values
    ${['keepMe']}
    ${['keepMe', 'keepMe2']}
    ${['keepMe', 'keepMe2']}
  `('should add item without removing other items', ({ values }) => {
    const item = 'addMe'

    const res = toggleInArray(values, item)

    expect(res.includes(item)).toEqual(true)
  })
})

describe('hasDateChanged', () => {
  it('should return false when dates are equal', () => {
    const currentDate = '2020-10-24T13:37:00Z'
    expect(hasDateChanged(currentDate, new Date('2020-10-24T13:37:00Z'))).toBe(
      false,
    )
  })

  it('should return true when current date is undefined', () => {
    const currentDate = undefined
    expect(hasDateChanged(currentDate, new Date('2020-10-24T13:37:00Z'))).toBe(
      true,
    )
  })

  it('should return true when current date is null', () => {
    const currentDate = null
    expect(hasDateChanged(currentDate, new Date('2020-10-24T13:37:00Z'))).toBe(
      true,
    )
  })

  it('should return if true when dates are not equal', () => {
    const currentDate = '2020-10-24T13:36:00Z'
    expect(hasDateChanged(currentDate, new Date('2020-10-24T13:37:00Z'))).toBe(
      true,
    )
  })
})
