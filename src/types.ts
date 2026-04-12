export type SplitDate = {
  value: string
  year: number
  month: number
  day: number
  timestamp: number
}

export type ItemDate = SplitDate & {
  hasMonth: boolean
  hasDay: boolean
}

export type Item = {
  name: string
  date: ItemDate
  category: string
  tags: string[]
  labels: string[]
  show: boolean
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
