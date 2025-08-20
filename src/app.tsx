import { useState, useRef, useEffect } from "react"
import { clsx } from "clsx"

import { Setting, UrlParams, Image } from "./types"
import { ComponentVariable } from "./components/variable"
import { ComponentHeader } from "./components/header"
import { ComponentTimeline } from "./components/timeline"
import { ComponentModal } from "./components/modal"
import { ComponentInfo } from "./components/info"
import { ComponentBooth } from "./components/booth"
import { ComponentSetting } from "./components/setting"
import { ComponentToday } from "./components/today"
import { defaultSetting, headerHeight } from "./params"
import {
  fetchFile,
  parseCsv,
  getSplitDate,
  csvToItemList,
  csvToTermList,
  getTermIds,
  resolveTermList,
  getColorList,
  getLankList,
  getYearList,
  getCssVarPx,
  filterItemList,
  filterYearList,
  filterDateItemList,
  checkAppleMobile,
  settingToUrlParams,
  diffUrlParams,
  htmlToImage,
  mergeImages,
} from "./utils"
import "./app.css"

export default function App() {
  const [setting, setSetting] = useState<Setting>(defaultSetting)
  const [defaultUrlParams, setDefaultUrlParams] = useState<UrlParams>({})

  const [activeHeaderSearch, setActiveHeaderSearch] = useState(false)
  const headerSearchRef = useRef<HTMLInputElement>(null)

  const [activeContents, setActiveContents] = useState(false)
  const [activeModal, setActiveModal] = useState<string | null>(null)

  const [currentYear, setCurrentYear] = useState<number | null>(null)
  const [inputYear, setInputYear] = useState<number | "">(currentYear)

  const [activeBulk, setActiveBulk] = useState(false)
  const [bulkProgress, setBulkProgress] = useState<number>(0)
  const cancelRef = useRef(false)
  const [yearImages, setYearImages] = useState<{ [year: string]: Image }>({})
  const yearAreaRefs = useRef<Map<number, HTMLDivElement>>(new Map())
  const [mergedImage, setMergedImage] = useState<Image | null>(null)
  const [mergeYears, setMergeYears] = useState<number[]>([])

  const filteredItemList = filterItemList(setting)
  const filteredYearList = filterYearList(setting)

  const loadUrlParams = () => {
    const url = new URL(window.location.href)
    const sp = url.searchParams
    const params = {
      txt: sp.getAll("txt").join(",") || undefined,
      cat: sp.getAll("cat").join(",") || undefined,
      tag: sp.getAll("tag").join(",") || undefined,
      start: Number(sp.get("start")) || undefined,
      end: Number(sp.get("end")) || undefined,
      omit: sp.has("omit") ? true : undefined,
      lank: Number(sp.get("lank")) || undefined,
      full: sp.has("full") ? true : undefined,
      today: sp.get("today") || undefined,
    }
    let urlParams: UrlParams = {}
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        urlParams[key] = value
      }
    }
    return urlParams
  }

  const updateUrlParams = (
    mergedSetting: Setting,
    inlineModal?: string | null
  ) => {
    const url = new URL(window.location.href)
    const sp = url.searchParams
    const urlParams = settingToUrlParams(
      mergedSetting,
      inlineModal || inlineModal === null ? inlineModal : activeModal
    )
    const diff = diffUrlParams(defaultUrlParams, urlParams)

    for (const key of Object.keys(urlParams)) {
      sp.delete(key)
    }
    for (const [key, value] of Object.entries(diff)) {
      if (!value) continue

      const str = String(value)

      if (str.includes(",")) {
        const arr = str.split(",")
        for (const v of arr) sp.append(key, String(v))
        continue
      }
      sp.set(key, str)
    }
    window.history.replaceState({}, "", url.toString())
  }

  const changeHeaderSearch = () => {
    const { staticHeader } = setting
    const fixedHeaderHeight = staticHeader
      ? 0
      : activeHeaderSearch
      ? headerHeight.default
      : headerHeight.search
    setSetting((prev) => ({ ...prev, headerHeight: fixedHeaderHeight }))
    setActiveHeaderSearch((prev) => !prev)

    if (activeHeaderSearch) {
      headerSearchRef.current?.blur()
    } else {
      headerSearchRef.current?.focus()
    }
  }
  const changeSearchText = (text: string) => {
    setSetting((prev) => ({ ...prev, searchText: text }))
    updateUrlParams({ ...setting, searchText: text })
  }

  const openModal = (modalId: string) => {
    setActiveModal(modalId)
    if (modalId === "today") updateUrlParams(setting, "today")
  }
  const closeModal = () => {
    setActiveModal(null)
    if (activeModal === "today") updateUrlParams(setting, null)
  }

  const createBulkImage = async () => {
    cancelRef.current = false
    setActiveBulk(true)
    setBulkProgress(0)

    const missingYears = filteredYearList.filter((y) => !yearImages[y])
    const total = missingYears.length

    for (let i = 0; i < total; i++) {
      if (cancelRef.current) {
        break
      }
      const year = missingYears[i]
      const el = yearAreaRefs.current.get(year)
      if (!el) continue

      const png = await htmlToImage(el)
      if (png) {
        setYearImages((prev) => ({ ...prev, [year]: png }))
      }
      setBulkProgress(Math.round(((i + 1) / total) * 100))
      await new Promise((res) => setTimeout(res, 50))
    }
    setActiveBulk(false)
  }
  const deleteBulkImage = () => {
    setYearImages((prev) => {
      Object.values(prev).forEach((image) => {
        URL.revokeObjectURL(image.url)
      })
      return {}
    })
    setMergeYears([])
  }

  const createYearImage = async (year: number) => {
    const image = await htmlToImage(yearAreaRefs.current.get(year)!)
    setYearImages((prev) => ({ ...prev, [year]: image }))
  }
  const deleteYearImage = (year: number) => {
    setYearImages((prev) => {
      const newYearImages = { ...prev }
      const image = newYearImages[year]
      if (image) {
        URL.revokeObjectURL(image.url)
        delete newYearImages[year]
      }
      return newYearImages
    })
    setMergeYears((prev) => prev.filter((y) => y !== year))
  }

  const createMergedImage = async () => {
    const filteredImages = Object.entries(yearImages)
      .filter(([year]) => mergeYears.includes(Number(year)))
      .map(([_, image]) => image)
    const mergedImage = await mergeImages(filteredImages)
    setMergedImage(mergedImage)
  }
  const deleteMergedImage = () => {
    if (mergedImage) {
      URL.revokeObjectURL(mergedImage.url)
      setMergedImage(null)
    }
  }

  const toggleAllMergeYears = () => {
    if (mergeYears.length === Object.keys(yearImages).length) {
      setMergeYears([])
    } else {
      setMergeYears(Object.keys(yearImages).map(Number))
    }
  }
  const toggleMergeYear = (year: number) => {
    setMergeYears((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]
    )
  }

  const changeSetting = (
    newSetting: Partial<Setting>,
    ignoreUrlParams?: boolean
  ) => {
    setSetting((prevSetting) => ({
      ...prevSetting,
      ...newSetting,
    }))
    if (!ignoreUrlParams) {
      updateUrlParams({ ...setting, ...newSetting })
    }
  }

  const changeCurrentDate = (dateValue: string) => {
    const currentDate = getSplitDate(new Date(dateValue))
    changeSetting({ currentDate })
  }
  const resetCurrentDate = () => {
    const currentDate = getSplitDate(new Date())
    changeSetting({ currentDate })
  }

  const changeItems = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()

    reader.onload = (event) => {
      const { termList, currentDate } = setting
      const itemsData = event.target?.result as string
      const parsedItems = parseCsv(itemsData)

      const itemList = csvToItemList(parsedItems)
      const lankList = getLankList(itemList)
      const currentLank = lankList.at(-1)
      const categoryIds = getTermIds(itemList, "category", currentLank)
      const tagIds = getTermIds(itemList, "tags", currentLank)
      const labelIds = getTermIds(itemList, "labels", currentLank)
      const tagLabelIds = [...new Set([...tagIds, ...labelIds])]

      const categoryList = resolveTermList(categoryIds, termList)
      const tagList = resolveTermList(tagLabelIds, termList)
      const colorList = getColorList(termList)

      const yearList = getYearList(itemList)
      const startYear = Math.min(...yearList)
      const endYear = Math.max(...yearList)
      const todayItemCount = filterDateItemList(itemList, currentDate).filter(
        (item) => item.category !== "news"
      ).length

      changeSetting({
        itemList,
        lankList,
        categoryList,
        tagList,
        colorList,
        yearList,
        startYear,
        endYear,
        currentLank,
        hasLankNote: false,
        todayItemCount,
      })
    }
    reader.readAsText(file)
  }

  const changeTerms = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()

    reader.onload = (event) => {
      const { itemList } = setting
      const termsData = event.target?.result as string
      const parsedTerms = parseCsv(termsData)

      const termList = csvToTermList(parsedTerms)
      const categoryIds = getTermIds(itemList, "category")
      const tagIds = getTermIds(itemList, "tags")
      const labelIds = getTermIds(itemList, "labels")
      const tagLabelIds = [...new Set([...tagIds, ...labelIds])]

      const categoryList = resolveTermList(categoryIds, termList)
      const tagList = resolveTermList(tagLabelIds, termList)
      const colorList = getColorList(termList)

      changeSetting({
        termList,
        categoryList,
        tagList,
        colorList,
      })
    }
    reader.readAsText(file)
  }

  const setup = async () => {
    const timestamp = Date.now()

    const itemsData = await fetchFile(`/assets/items.csv?t=${timestamp}`)
    const termsData = await fetchFile(`/assets/terms.csv?t=${timestamp}`)
    const parsedItems = parseCsv(itemsData)
    const parsedTerms = parseCsv(termsData)

    const itemList = csvToItemList(parsedItems)
    const termList = csvToTermList(parsedTerms)
    const lankList = getLankList(itemList)
    const categoryIds = getTermIds(itemList, "category")
    const tagIds = getTermIds(itemList, "tags")
    const labelIds = getTermIds(itemList, "labels")
    const tagLabelIds = [...new Set([...tagIds, ...labelIds])]
    const categoryList = resolveTermList(categoryIds, termList)
    const tagList = resolveTermList(tagLabelIds, termList)
    const colorList = getColorList(termList)

    const yearList = getYearList(itemList)
    const startYear = Math.min(...yearList)
    const endYear = Math.max(...yearList)

    const todayDate = getSplitDate(new Date())
    const currentDate = todayDate
    const todayItemCount = filterDateItemList(itemList, todayDate).filter(
      (item) => item.category !== "news"
    ).length

    const scrollbarWidth = window.innerWidth - document.body.clientWidth
    const appOffset = getCssVarPx("--pj-app-offset")
    const isAppleMobile = checkAppleMobile()

    const appUrlParams = settingToUrlParams(setting)
    const urlParams = { ...appUrlParams, ...loadUrlParams() }
    const diff = diffUrlParams(appUrlParams, urlParams)

    let tempSetting: Partial<Setting> = {
      itemList,
      termList,
      lankList,
      categoryList,
      tagList,
      colorList,
      yearList,
      startYear: diff.start || startYear,
      endYear: diff.end || endYear,
      todayDate,
      currentDate,
      todayItemCount,
      scrollbarWidth,
      appOffset,
      isAppleMobile,
    }

    if (diff.txt) {
      tempSetting.searchText = diff.txt
    }
    if (diff.cat) {
      const cats = diff.cat.split(",").map((id) => id.trim())
      tempSetting.categoryList = categoryList.map((item) => ({
        ...item,
        filter: cats.includes(item.id),
      }))
    }
    if (diff.tag) {
      const tags = diff.tag.split(",").map((id) => id.trim())
      tempSetting.tagList = tagList.map((item) => ({
        ...item,
        filter: tags.includes(item.id),
      }))
    }
    if (diff.omit) {
      tempSetting.omitEmptyYears = diff.omit
    }
    if (diff.lank) {
      tempSetting.currentLank = diff.lank
    }
    if (diff.full) {
      tempSetting.fullOpenLabels = diff.full
    }
    if (diff.today && /^\d{4}-\d{2}-\d{2}$/.test(diff.today)) {
      const newCurrentDate = getSplitDate(new Date(diff.today))
      tempSetting.currentDate = newCurrentDate
      setActiveModal("today")
    }

    changeSetting(tempSetting, true)

    const hash = window.location.hash

    if (hash) {
      const target = document.getElementById(hash.replace("#", ""))
      if (target) {
        target.scrollIntoView({
          behavior: "auto",
          block: "start",
        })
      }
    }
    setDefaultUrlParams(appUrlParams)
    setActiveContents(true)

    setTimeout(() => {
      changeSetting({ appSlide: 0 }, true)
    }, 400)
  }

  useEffect(() => {
    setup()
  }, [])
  return (
    <div className="app">
      <ComponentVariable setting={setting} />
      <div className="app-stage">
        <ComponentHeader
          setting={setting}
          activeHeaderSearch={activeHeaderSearch}
          headerSearchRef={headerSearchRef}
          activeModal={activeModal}
          changeHeaderSearch={changeHeaderSearch}
          changeSearchText={changeSearchText}
          openModal={openModal}
        />
        <div className="app-contents">
          <div
            className={clsx(
              "app-contents-container",
              activeContents && "is-active"
            )}
          >
            <div className="app-contents-grid">
              <aside className="app-aside">
                <div className="app-aside-container">
                  <div className="app-aside-contents">
                    <ComponentInfo />
                  </div>
                </div>
              </aside>
              <div className="app-main">
                <div className="app-main-container">
                  <div className="app-main-contents">
                    <ComponentTimeline
                      setting={setting}
                      activeContents={activeContents}
                      currentYear={currentYear}
                      setCurrentYear={setCurrentYear}
                      inputYear={inputYear}
                      setInputYear={setInputYear}
                      yearAreaRefs={yearAreaRefs}
                      filteredItemList={filteredItemList}
                      filteredYearList={filteredYearList}
                      openModal={openModal}
                    />
                  </div>
                </div>
              </div>
              <aside className="app-aside">
                <div className="app-aside-container">
                  <div className="app-aside-contents">
                    <ComponentSetting
                      setting={setting}
                      activeHeaderSearch={activeHeaderSearch}
                      isMobileSidebar
                      changeSetting={changeSetting}
                      changeItems={changeItems}
                      changeTerms={changeTerms}
                    />
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>

      <ComponentModal
        isActive={activeModal === "info"}
        title="概要"
        closeModal={closeModal}
      >
        <ComponentInfo />
      </ComponentModal>

      <ComponentModal
        isActive={activeModal === "booth"}
        isMobileSidebar
        title="画像生成"
        closeModal={closeModal}
      >
        <ComponentBooth
          setting={setting}
          activeBulk={activeBulk}
          bulkProgress={bulkProgress}
          cancelRef={cancelRef}
          filteredYearList={filteredYearList}
          yearImages={yearImages}
          mergedImage={mergedImage}
          mergeYears={mergeYears}
          createBulkImage={createBulkImage}
          deleteBulkImage={deleteBulkImage}
          createYearImage={createYearImage}
          deleteYearImage={deleteYearImage}
          createMergedImage={createMergedImage}
          deleteMergedImage={deleteMergedImage}
          toggleAllMergeYears={toggleAllMergeYears}
          toggleMergeYear={toggleMergeYear}
        />
      </ComponentModal>

      <ComponentModal
        isActive={activeModal === "setting"}
        isMobileSidebar
        title="設定"
        closeModal={closeModal}
      >
        <ComponentSetting
          setting={setting}
          activeHeaderSearch={activeHeaderSearch}
          isMobileSidebar
          changeSetting={changeSetting}
          changeItems={changeItems}
          changeTerms={changeTerms}
        />
      </ComponentModal>

      <ComponentModal
        isActive={activeModal === "today"}
        isStaticHeight
        title="何の日？"
        closeModal={closeModal}
      >
        <ComponentToday
          setting={setting}
          changeCurrentDate={changeCurrentDate}
          resetCurrentDate={resetCurrentDate}
        />
      </ComponentModal>
    </div>
  )
}
