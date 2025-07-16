//import { toPng } from "html-to-image"
import Papa from "papaparse"

import type { Item, Term, Color } from "./types"

/*export async function htmlToPng(element: HTMLElement): Promise<string | null> {
  try {
    const originalPosition = element.style.position
    const originalLeft = element.style.left
    const originalTop = element.style.top

    element.style.position = "fixed"
    element.style.left = "0px"
    element.style.top = "0px"

    const dataUrl = await toPng(element, {
      cacheBust: true,
      //backgroundColor: "white",
      //pixelRatio: 2,
    })

    element.style.position = originalPosition
    element.style.left = originalLeft
    element.style.top = originalTop
    return dataUrl
  } catch (error) {
    console.error("html-to-image error:", error)
    return null
  }
}*/

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
      //const visible = row.visible ? Boolean(row.visible) : true

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

export function filterItemList(
  itemList: Item[],
  categoryList: Term[],
  tagList: Term[],
  currentLank: number
): Item[] {
  const lankedItemList = itemList.filter((item) => item.lank <= currentLank)

  const activeCategoryFilter = categoryList?.some((term) => term.filter)
  const activeTagFilter = tagList?.some((term) => term.filter)
  const activeFilter = activeCategoryFilter || activeTagFilter

  if (!activeFilter) return lankedItemList

  return lankedItemList.filter((item) => {
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
}

export function getYearListFromEdges(
  startYear: number,
  endYear: number
): number[] {
  const count = endYear - startYear + 1
  return Array.from({ length: count }, (_, i) => startYear + i)
}

export function filterYearList(
  yearList: number[],
  startYear: number,
  endYear: number
): number[] {
  return yearList.filter((year) => year >= startYear && year <= endYear)
}
