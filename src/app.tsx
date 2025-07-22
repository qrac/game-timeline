import { useState, useRef, useEffect } from "react"

import { Setting } from "./types"
import { ComponentVariable } from "./components/variable"
import { ComponentHeader } from "./components/header"
import { ComponentTimeline } from "./components/timeline"
import { ComponentModal } from "./components/modal"
import { ComponentInfo } from "./components/info"
import { ComponentBooth } from "./components/booth"
import { ComponentSetting } from "./components/setting"
import {
  htmlToPng,
  fetchFile,
  parseCsv,
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
  checkAppleMobile,
} from "./utils"
import "./app.css"

const defaultSetting: Setting = {
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
  searchText: "",
  visibleController: true,
  scrollbarWidth: 0,
  headerHeight: 63,
  timelineOffset: 0,
  isAppleMobile: false,
}

export default function App() {
  const [setting, setSetting] = useState<Setting>(defaultSetting)

  const [activeHeaderSearch, setActiveHeaderSearch] = useState(false)
  const headerSearchRef = useRef<HTMLInputElement>(null)

  const [activeTimeline, setActiveTimeline] = useState(false)
  const [activeModal, setActiveModal] = useState<string | null>(null)

  const [activeBulk, setActiveBulk] = useState(false)
  const [bulkProgress, setBulkProgress] = useState<number>(0)
  const [yearImages, setYearImages] = useState<{ [year: string]: string }>({})
  const yearImageRefs = useRef<Map<number, HTMLDivElement>>(new Map())

  const filteredItemList = filterItemList(setting)
  const filteredYearList = filterYearList(setting)

  const changeHeaderSearch = () => {
    setActiveHeaderSearch((prev) => !prev)
    if (activeHeaderSearch) {
      headerSearchRef.current?.blur()
      setSetting((prev) => ({ ...prev, headerHeight: 63 }))
    } else {
      headerSearchRef.current?.focus()
      setSetting((prev) => ({ ...prev, headerHeight: 113 }))
    }
  }
  const changeSearchText = (text: string) => {
    setSetting((prev) => ({ ...prev, searchText: text }))
  }

  const openModal = (modalId: string) => {
    setActiveModal(modalId)
  }
  const closeModal = () => {
    setActiveModal(null)
  }

  const createBulkImage = async () => {
    setActiveBulk(true)
    setBulkProgress(0)

    const missingYears = filteredYearList.filter((year) => !yearImages[year])

    const total = missingYears.length
    const newYearImages: { [year: number]: string } = {}

    for (let i = 0; i < missingYears.length; i++) {
      const year = missingYears[i]
      const element = yearImageRefs.current.get(year)
      if (!element) continue

      const png = await htmlToPng(element)
      newYearImages[year] = png || ""

      setYearImages((prev) => ({ ...prev, [year]: png }))
      setBulkProgress(Math.round(((i + 1) / total) * 100))
    }
    setActiveBulk(false)
  }

  const createYearImage = async (year: number) => {
    const png = await htmlToPng(yearImageRefs.current.get(year)!)
    setYearImages((prev) => ({ ...prev, [year]: png }))
  }
  const deleteYearImage = (year: number) => {
    setYearImages((prev) => {
      const newScreenshots = { ...prev }
      delete newScreenshots[year]
      return newScreenshots
    })
  }

  const changeSetting = (newSetting: Partial<Setting>) => {
    setSetting((prevSetting) => ({
      ...prevSetting,
      ...newSetting,
    }))
  }

  const changeCurrentLank = (currentLank: number) => {
    const { itemList, termList } = setting

    const categoryIds = getTermIds(itemList, "category", currentLank)
    const tagIds = getTermIds(itemList, "tags", currentLank)
    const labelIds = getTermIds(itemList, "labels", currentLank)
    const tagLabelIds = [...new Set([...tagIds, ...labelIds])]

    const categoryList = resolveTermList(categoryIds, termList)
    const tagList = resolveTermList(tagLabelIds, termList)

    changeSetting({
      categoryList: categoryList,
      tagList: tagList,
      currentLank,
    })
  }

  const changeItems = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()

    reader.onload = (event) => {
      const { termList } = setting
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
        lankNote: "",
      })
    }
    reader.readAsText(file)
  }

  const changeTerms = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()

    reader.onload = (event) => {
      const { itemList, currentLank } = setting
      const termsData = event.target?.result as string
      const parsedTerms = parseCsv(termsData)

      const termList = csvToTermList(parsedTerms)
      const categoryIds = getTermIds(itemList, "category", currentLank)
      const tagIds = getTermIds(itemList, "tags", currentLank)
      const labelIds = getTermIds(itemList, "labels", currentLank)
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
    const { currentLank } = setting

    const itemsData = await fetchFile(`/assets/items.csv?t=${timestamp}`)
    const termsData = await fetchFile(`/assets/terms.csv?t=${timestamp}`)
    const parsedItems = parseCsv(itemsData)
    const parsedTerms = parseCsv(termsData)

    const itemList = csvToItemList(parsedItems)
    const termList = csvToTermList(parsedTerms)
    const lankList = getLankList(itemList)
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

    const scrollbarWidth = window.innerWidth - document.body.clientWidth
    const timelineOffset = getCssVarPx("--pj-timeline-offset")
    const isAppleMobile = checkAppleMobile()

    changeSetting({
      itemList,
      termList,
      lankList,
      categoryList,
      tagList,
      colorList,
      yearList,
      startYear,
      endYear,
      scrollbarWidth,
      timelineOffset,
      isAppleMobile,
    })
    setActiveTimeline(true)
  }

  useEffect(() => {
    setup()
  }, [])
  return (
    <div className="app">
      <ComponentVariable setting={setting} />
      <div className="app-main">
        <ComponentHeader
          setting={setting}
          activeHeaderSearch={activeHeaderSearch}
          headerSearchRef={headerSearchRef}
          activeModal={activeModal}
          changeHeaderSearch={changeHeaderSearch}
          changeSearchText={changeSearchText}
          openModal={openModal}
        />
        <ComponentTimeline
          setting={setting}
          activeTimeline={activeTimeline}
          yearImageRefs={yearImageRefs}
          filteredItemList={filteredItemList}
          filteredYearList={filteredYearList}
        />
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
          filteredYearList={filteredYearList}
          yearImages={yearImages}
          createBulkImage={createBulkImage}
          createYearImage={createYearImage}
          deleteYearImage={deleteYearImage}
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
          isMobileSidebar
          changeSetting={changeSetting}
          changeCurrentLank={changeCurrentLank}
          changeItems={changeItems}
          changeTerms={changeTerms}
        />
      </ComponentModal>
    </div>
  )
}
