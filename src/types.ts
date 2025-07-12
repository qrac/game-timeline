export type Item = {
  name: string
  year: number
  timestamp: number
  hasMonth: boolean
  hasDay: boolean
  category: string
  tags: string[]
  labels: string[]
  visible: boolean
}

export type Term = {
  id: string
  name: string
  label: string
  color: string
  filter: boolean
}

export type Color = {
  id: string
  color: string
}

export type Options = {
  startYear: number
  endYear: number
  omitEmptyYears: boolean
}
