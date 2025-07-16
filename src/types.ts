export type Item = {
  name: string
  year: number
  timestamp: number
  hasMonth: boolean
  hasDay: boolean
  category: string
  tags: string[]
  labels: string[]
  lank: number
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

export type Setting = {
  itemList: Item[]
  termList: Term[]
  lankList: number[]
  categoryList: Term[]
  tagList: Term[]
  colorList: Color[]
  startYear: number
  endYear: number
  omitEmptyYears: boolean
  currentLank: number
  lankNote: string
  visibleController: boolean
  scrollbarWidth: number
  scrollOffset: number
}
