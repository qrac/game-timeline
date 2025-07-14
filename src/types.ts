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

export type Options = {
  itemList: Item[]
  termList: Term[]
  categoryList: Term[]
  tagList: Term[]
  colorList: Color[]
  startYear: number
  endYear: number
  omitEmptyYears: boolean
  visibleLank: number
}
