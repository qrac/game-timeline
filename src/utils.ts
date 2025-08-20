import { toBlob } from "html-to-image"
import Papa from "papaparse"

import type {
  SplitDate,
  ItemDate,
  Item,
  Term,
  Color,
  Image,
  Setting,
  UrlParams,
} from "./types"

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
  return parsedCsv
    .map((row) => {
      const name = row.name?.trim() || ""
      const date = getItemDate(row.date.trim())
      const category = row.category?.trim() || ""
      const tags = strToArray(row.tags || "")
      const labels = strToArray(row.labels || "")
      const lank = row.lank ? Math.max(1, Math.floor(Number(row.lank))) : 1
      return { name, date, category, tags, labels, lank }
    })
    .filter((item) => item.date.year && item.date.timestamp)
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
  currentLank?: number
): string[] {
  const filteredItemList = currentLank
    ? itemList.filter((item) => item.lank <= currentLank)
    : itemList

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
  return [...new Set(itemList.map((item) => item.date.year))].sort(
    (a, b) => a - b
  )
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
    keywords.some((keyword) =>
      item.name.toLowerCase().includes(keyword.toLowerCase())
    )
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

export function filterDateItemList(itemList: Item[], date: SplitDate): Item[] {
  return itemList.filter((item) => {
    return item.date.month === date.month && item.date.day === date.day
  })
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

export function settingToUrlParams(
  setting: Setting,
  activeModal?: string | null
): UrlParams {
  const {
    categoryList,
    tagList,
    startYear,
    endYear,
    currentDate,
    omitEmptyYears,
    currentLank,
    fullOpenLabels,
    searchText,
  } = setting
  return {
    txt: searchText
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .join(","),
    cat: categoryList
      .filter((term) => term.filter)
      .map((term) => term.id)
      .join(","),
    tag: tagList
      .filter((term) => term.filter)
      .map((term) => term.id)
      .join(","),
    start: startYear,
    end: endYear,
    omit: omitEmptyYears,
    lank: currentLank,
    full: fullOpenLabels,
    today: activeModal === "today" ? currentDate.value : undefined,
  }
}

export function diffUrlParams(obj1: UrlParams, obj2: UrlParams): UrlParams {
  let diff = {}

  for (const key of Object.keys({ ...obj1, ...obj2 }) as (keyof UrlParams)[]) {
    if (obj1[key] !== obj2[key]) {
      diff[key] = obj2[key]
    }
  }
  return diff
}

export async function htmlToImage(
  element: HTMLElement,
  pixelRatio?: number
): Promise<Image | null> {
  try {
    const ratio = pixelRatio ?? (window.devicePixelRatio >= 2 ? 2 : 1)

    const clone = element.cloneNode(true) as HTMLElement
    const wrapper = document.createElement("div")
    wrapper.classList.add("timeline")
    wrapper.style.position = "fixed"
    wrapper.style.top = "0"
    wrapper.style.left = "0"
    wrapper.style.width = `${element.offsetWidth}px`
    wrapper.style.pointerEvents = "none"
    wrapper.style.opacity = "0"
    wrapper.appendChild(clone)
    document.body.appendChild(wrapper)

    const blob = await toBlob(clone, {
      cacheBust: true,
      pixelRatio: ratio,
    })
    document.body.removeChild(wrapper)
    if (!blob) return null

    const size = blob.size
    const bitmap = await createImageBitmap(blob)
    const width = bitmap.width
    const height = bitmap.height
    bitmap.close()

    const url = URL.createObjectURL(blob)
    return { url, width, height, size }
  } catch {
    return null
  }
}

export function formatSize(bytes: number): string {
  if (bytes < 1_000_000) {
    const kb = Math.round(bytes / 1_000)
    return `${kb.toLocaleString()} KB`
  } else if (bytes < 1_000_000_000) {
    const mb = Math.round(bytes / 1_000_000)
    return `${mb.toLocaleString()} MB`
  } else {
    const gb = Math.round(bytes / 1_000_000_000)
    return `${gb.toLocaleString()} GB`
  }
}

export async function mergeImages(images: Image[]): Promise<Image | null> {
  try {
    if (images.length === 0) return null

    const loaded: HTMLImageElement[] = []
    for (const { url } of images) {
      const img = new Image()
      img.src = url
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = () => reject(new Error(`failed to load ${url}`))
      })
      loaded.push(img)
    }

    const width = Math.max(...loaded.map((img) => img.naturalWidth))
    const height = loaded.reduce((sum, img) => sum + img.naturalHeight, 0)

    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext("2d")
    if (!ctx) return null

    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, width, height)

    let y = 0
    for (const img of loaded) {
      ctx.drawImage(img, 0, y, img.naturalWidth, img.naturalHeight)
      y += img.naturalHeight
    }

    const blob = await new Promise<Blob | null>((res) =>
      canvas.toBlob(res, "image/png")
    )
    if (!blob) return null

    const mergedUrl = URL.createObjectURL(blob)
    const size = blob.size

    return { url: mergedUrl, width, height, size }
  } catch {
    return null
  }
}
