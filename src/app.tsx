import { useState, useRef, useEffect } from "react"

import { Setting, Image } from "./types"
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
  htmlToImage,
  mergeImages,
} from "./utils"
import "./app.css"

export default function App() {
  const [setting, setSetting] = useState<Setting>(defaultSetting)

  const [activeHeaderSearch, setActiveHeaderSearch] = useState(false)
  const headerSearchRef = useRef<HTMLInputElement>(null)

  const [activeTimeline, setActiveTimeline] = useState(false)
  const [activeModal, setActiveModal] = useState<string | null>(null)

  const [activeBulk, setActiveBulk] = useState(false)
  const [bulkProgress, setBulkProgress] = useState<number>(0)
  const cancelRef = useRef(false)
  const [yearImages, setYearImages] = useState<{ [year: string]: Image }>({})
  const yearAreaRefs = useRef<Map<number, HTMLDivElement>>(new Map())
  const [mergedImage, setMergedImage] = useState<Image | null>(null)
  const [mergeYears, setMergeYears] = useState<number[]>([])

  const filteredItemList = filterItemList(setting)
  const filteredYearList = filterYearList(setting)

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
  }

  const openModal = (modalId: string) => {
    setActiveModal(modalId)
  }
  const closeModal = () => {
    setActiveModal(null)
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
      const todayItemCount = filterDateItemList(itemList, currentDate).length

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

    const todayDate = getSplitDate(new Date())
    const currentDate = todayDate
    const todayItemCount = filterDateItemList(itemList, currentDate).length

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
      todayDate,
      currentDate,
      todayItemCount,
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
          yearAreaRefs={yearAreaRefs}
          filteredItemList={filteredItemList}
          filteredYearList={filteredYearList}
          openModal={openModal}
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
          changeCurrentLank={changeCurrentLank}
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
