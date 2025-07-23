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
  yearList: number[]
  startYear: number
  endYear: number
  omitEmptyYears: boolean
  currentLank: number
  lankNote: string
  searchText: string
  staticHeader: boolean
  hiddenController: boolean
  scrollbarWidth: number
  headerHeight: number
  timelineOffset: number
  isAppleMobile: boolean
}

export type Image = {
  url: string
  width: number
  height: number
  size: number
}
