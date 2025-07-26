import type { Setting } from "./types"

export const headerHeight = {
  default: 63,
  search: 113,
  static: 0,
}

export const maxMergedHeight = 8000

export const defaultSetting: Setting = {
  itemList: [],
  termList: [],
  categoryList: [],
  tagList: [],
  colorList: [],
  lankList: [],
  yearList: [],
  startYear: 1983,
  endYear: 2025,
  omitEmptyYears: false,
  currentLank: 2,
  lankNote: "1=有名作品のみ, 2=個性派作品含む, 3=全件表示",
  todayDate: {
    value: "",
    year: 0,
    month: 0,
    day: 0,
    timestamp: 0,
  },
  currentDate: {
    value: "",
    year: 0,
    month: 0,
    day: 0,
    timestamp: 0,
  },
  todayItemCount: 0,
  searchText: "",
  staticHeader: false,
  hiddenController: false,
  scrollbarWidth: 0,
  headerHeight: headerHeight.default,
  timelineOffset: 0,
  isAppleMobile: false,
}
