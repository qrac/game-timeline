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

export type Image = {
  url: string
  width: number
  height: number
  size: number
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
  hasLankNote: boolean
  fullOpenLabels: boolean
  todayDate: SplitDate
  currentDate: SplitDate
  todayItemCount: number
  searchText: string
  staticHeader: boolean
  hiddenController: boolean
  scrollbarWidth: number
  headerHeight: number
  timelineOffset: number
  isAppleMobile: boolean
}
