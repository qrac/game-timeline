import Papa from "papaparse"

import type { Item, Term, Color, SplitDate, ItemDate } from "./types"

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

export function getDateValue(year: number, month: number, day: number): string {
  return (
    `${year}-` +
    `${String(month).padStart(2, "0")}-` +
    `${String(day).padStart(2, "0")}`
  )
}

export function getSplitDate(date: Date): SplitDate {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const timestamp = date.getTime()
  const value = getDateValue(year, month, day)
  return { value, year, month, day, timestamp }
}

export function getItemDate(dateValue: string): ItemDate {
  const [yearStr, monthStr, dayStr] = dateValue.split("-")
  const year = Number(yearStr)
  const month = Number(monthStr) || 0
  const day = Number(dayStr) || 0
  const value = getDateValue(year, month, day)

  const hasMonth = month !== 0
  const hasDay = day !== 0

  const safeMonth = hasMonth ? month : 1
  const safeDay = hasDay ? day : 1
  const timestamp = new Date(year, safeMonth - 1, safeDay).getTime()

  return { value, year, month, day, timestamp, hasMonth, hasDay }
}

export function strToArray(str: string): string[] {
  if (!str) return []
  return str
    .split(",")
    .map((item) => item.trim())
    .filter((tag) => tag !== "")
}

export function csvToItemList(parsedCsv: { [key: string]: string }[]): Item[] {
  const showTargets = ["true", ""]
  const isShow = (show: string) => {
    return showTargets.includes(show?.trim().toLowerCase() || "")
  }
  return parsedCsv
    .map((row) => {
      const name = row.name?.trim() || ""
      const date = getItemDate(row.date.trim())
      const category = row.category?.trim() || ""
      const tags = strToArray(row.tags || "")
      const labels = strToArray(row.labels || "")
      const show = isShow(row.show)
      return { name, date, category, tags, labels, show }
    })
    .filter((item) => item.date.year && item.date.timestamp && item.show)
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

export function getTermIds(itemList: Item[], property: keyof Item): string[] {
  const values: string[] = []

  for (const item of itemList) {
    const value = item[property]

    if (typeof value === "string") {
      values.push(value)
    } else if (Array.isArray(value)) {
      values.push(...value)
    }
  }
  return [...new Set(values)].filter((id) => id !== "")
}

export function filterTermList(termIds: string[], termList: Term[]): Term[] {
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
    (a, b) => termListOrder.indexOf(a.id) - termListOrder.indexOf(b.id),
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
