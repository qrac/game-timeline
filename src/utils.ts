import { toPng } from "html-to-image"
import Papa from "papaparse"

import type { Item, Term, Color, Setting } from "./types"

export async function htmlToPng(element: HTMLElement): Promise<string | null> {
  try {
    const clone = element.cloneNode(true) as HTMLElement

    const wrapper = document.createElement("div")
    wrapper.classList.add("timeline")
    wrapper.style.position = "fixed"
    wrapper.style.top = "0"
    wrapper.style.left = "0"
    wrapper.style.width = `${element.offsetWidth}px`
    wrapper.style.zIndex = "-1"
    wrapper.style.pointerEvents = "none"
    wrapper.style.opacity = "0"

    wrapper.appendChild(clone)
    document.body.appendChild(wrapper)

    const dataUrl = await toPng(clone, {
      cacheBust: true,
      pixelRatio: 2,
    })
    document.body.removeChild(wrapper)

    return dataUrl
  } catch (error) {
    console.error("html-to-image error:", error)
    return null
  }
}

export async function fetchFile(url: string): Promise<string> {
  try {
    const response = await fetch(url)
    const data = await response.text()
    return data
  } catch (error) {
    console.error("Error fetching file:", error)
    return ""
  }
}

export function parseCsv(csvString: string): { [key: string]: string }[] {
  const parsedCsv = Papa.parse(csvString, {
    header: true,
    skipEmptyLines: true,
  }).data as { [key: string]: string }[]

  if (!parsedCsv) {
    console.error("Failed to parse CSV file.")
    return []
  }
  if (!parsedCsv.length) {
    console.error("No data found in the CSV file.")
    return []
  }
  return parsedCsv
}

export function getCustomDate(date: string): {
  year: number
  timestamp: number
  hasMonth: boolean
  hasDay: boolean
} {
  const [yearStr, monthStr, dayStr] = date.split("-")
  const year = Number(yearStr)
  const month = Number(monthStr)
  const day = Number(dayStr)

  const hasMonth = month !== 0
  const hasDay = day !== 0

  const safeMonth = hasMonth ? month : 1
  const safeDay = hasDay ? day : 1
  const timestamp = new Date(year, safeMonth - 1, safeDay).getTime()

  return { year, timestamp, hasMonth, hasDay }
}

export function strToArray(str: string): string[] {
  if (!str) return []
  return str
    .split(",")
    .map((item) => item.trim())
    .filter((tag) => tag !== "")
}

export function csvToItemList(parsedCsv: { [key: string]: string }[]): Item[] {
  return parsedCsv
    .map((row) => {
      const name = row.name?.trim() || ""
      const { year, timestamp, hasMonth, hasDay } = getCustomDate(
        row.date.trim()
      )
      const category = row.category?.trim() || ""
      const tags = strToArray(row.tags || "")
      const labels = strToArray(row.labels || "")
      const lank = row.lank ? Math.max(1, Math.floor(Number(row.lank))) : 1

      return {
        name,
        year,
        timestamp,
        hasMonth,
        hasDay,
        category,
        tags,
        labels,
        lank,
      }
    })
    .filter((item) => item.year && item.timestamp)
}

export function csvToTermList(parsedCsv: { [key: string]: string }[]): Term[] {
  return parsedCsv
    .map((row) => {
      const id = row.id?.trim() || ""
      const name = row.name?.trim() || id || ""
      const label = row.label?.trim() || id || ""
      const color = row.color?.trim() || ""
      const filter = row.filter ? Boolean(row.filter) : false
      return { id, name, label, color, filter }
    })
    .filter((term) => term.id)
}

export function getTermIds(
  itemList: Item[],
  property: keyof Item,
  currentLank: number
): string[] {
  const filteredItemList = itemList.filter((item) => item.lank <= currentLank)

  const values: string[] = []

  for (const item of filteredItemList) {
    const value = item[property]

    if (typeof value === "string") {
      values.push(value)
    } else if (Array.isArray(value)) {
      values.push(...value)
    }
  }
  return [...new Set(values)].filter((id) => id !== "")
}

export function resolveTermList(termIds: string[], termList: Term[]): Term[] {
  const termMap = new Map(termList.map((term) => [term.id, term]))

  const resolvedTerms = termIds.map((id) => {
    const term = termMap.get(id)
    return term ?? { id, name: id, label: id, color: "", filter: false }
  })

  const termListOrder = termList.map((term) => term.id)

  const inTermList: Term[] = []
  const notInTermList: Term[] = []

  for (const term of resolvedTerms) {
    if (termListOrder.includes(term.id)) {
      inTermList.push(term)
    } else {
      notInTermList.push(term)
    }
  }

  inTermList.sort(
    (a, b) => termListOrder.indexOf(a.id) - termListOrder.indexOf(b.id)
  )
  return [...inTermList, ...notInTermList]
}

export function getColorList(termList: Term[]): Color[] {
  return termList
    .filter((term) => term.color)
    .map((term) => ({
      id: term.id,
      color: term.color,
    }))
    .filter((color) => color.id && color.color)
}

export function getLankList(itemList: Item[]): number[] {
  const lankSet = new Set(itemList.map((item) => item.lank))
  const lankList = Array.from(lankSet).sort((a, b) => a - b)
  return lankList.length > 0 ? lankList : [1]
}

export function getYearList(itemList: Item[]): number[] {
  return [...new Set(itemList.map((item) => item.year))].sort((a, b) => a - b)
}

export function getCssVarPx(name: string): number {
  const value = getComputedStyle(document.documentElement).getPropertyValue(
    name
  )
  return parseInt(value.trim().replace("px", ""), 10) || 0
}

export function filterItemList(setting: Setting): Item[] {
  const { itemList, categoryList, tagList, currentLank, searchText } = setting

  const lankedItemList = itemList.filter((item) => item.lank <= currentLank)

  const activeCategoryFilter = categoryList?.some((term) => term.filter)
  const activeTagFilter = tagList?.some((term) => term.filter)
  const activeTermFilter = activeCategoryFilter || activeTagFilter

  if (!activeTermFilter && !searchText) return lankedItemList

  const termFilteredItemList = lankedItemList.filter((item) => {
    const categoryMatched =
      !activeCategoryFilter ||
      categoryList.some((term) => term.id === item.category && term.filter)

    const tagMatched =
      !activeTagFilter ||
      item.tags.some((tag) =>
        tagList.some((term) => term.id === tag && term.filter)
      ) ||
      item.labels.some((tag) =>
        tagList.some((term) => term.id === tag && term.filter)
      )

    return categoryMatched && tagMatched
  })

  if (!searchText) return termFilteredItemList

  const keywords = searchText
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0)

  const searchedItemList = termFilteredItemList.filter((item) =>
    keywords.some((keyword) => item.name.includes(keyword))
  )

  return searchedItemList
}

export function filterYearList(setting: Setting): number[] {
  const { yearList, startYear, endYear, omitEmptyYears } = setting

  const itemStartYear = Math.min(...yearList)
  const itemEndYear = Math.max(...yearList)
  const maxStartYear = Math.max(startYear, itemStartYear)
  const minEndYear = Math.min(endYear, itemEndYear)

  if (omitEmptyYears) {
    return yearList.filter((year) => year >= maxStartYear && year <= minEndYear)
  } else {
    const count = minEndYear - maxStartYear + 1
    return Array.from({ length: count }, (_, i) => maxStartYear + i)
  }
}

export function scrollToY(targetY: number, duration: number = 500) {
  const startY = window.pageYOffset
  const distance = targetY - startY
  const startTime = performance.now()

  function easeInOutCubic(t: number) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
  }
  function step(currentTime: number) {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const ease = easeInOutCubic(progress)
    window.scrollTo(0, startY + distance * ease)
    if (progress < 1) {
      requestAnimationFrame(step)
    }
  }
  requestAnimationFrame(step)
}

export function checkAppleMobile(): boolean {
  const agent = navigator.userAgent.toLowerCase()
  const isPhone = /iphone|ipod/.test(agent)
  const isPad = /ipad|macintosh/.test(agent) && "ontouchend" in document
  return isPhone || isPad
}
