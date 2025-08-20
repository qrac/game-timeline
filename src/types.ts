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
  appOffset: number
  appSlide: number
  headerHeight: number
  isAppleMobile: boolean
}

export type UrlParams = {
  txt?: string
  cat?: string
  tag?: string
  start?: number
  end?: number
  omit?: boolean
  lank?: number
  full?: boolean
  today?: string
}
