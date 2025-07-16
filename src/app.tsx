import { useState, useRef, useEffect } from "react"

import { Setting } from "./types"
import { ComponentVariable } from "./components/variable"
import { ComponentHeader } from "./components/header"
import { ComponentTimeline } from "./components/timeline"
import { ComponentModal } from "./components/modal"
import {
  //htmlToPng,
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
} from "./utils"
import "./app.css"

const defaultSetting: Setting = {
  itemList: [],
  termList: [],
  categoryList: [],
  tagList: [],
  colorList: [],
  lankList: [],
  startYear: 1983,
  endYear: 2025,
  omitEmptyYears: false,
  currentLank: 2,
  lankNote: "1=有名作品のみ, 2=個性派作品含む, 3=全件表示",
  visibleController: true,
  scrollbarWidth: 0,
  scrollOffset: 0,
}

export default function App() {
  const [setting, setSetting] = useState<Setting>(defaultSetting)
  const [activeTimeline, setActiveTimeline] = useState(false)
  const [activeModal, setActiveModal] = useState<string | null>(null)
  //const [imageData, setImageData] = useState<string | null>(null)
  //const timelineRef = useRef<HTMLDivElement>(null)

  /*const runGenerate = async () => {
    if (!timelineRef.current) return
    setActiveModal("generate")

    setTimeout(async () => {
      const png = await htmlToPng(timelineRef.current)
      setImageData(png)
    }, 300)
  }*/
  const runInfo = () => {
    setActiveModal("info")
  }
  const runSetting = () => {
    setActiveModal("setting")
  }
  const closeModal = () => {
    //setImageData(null)
    setActiveModal(null)
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

  const uploadItems = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        startYear,
        endYear,
        currentLank,
        lankNote: "",
      })
    }
    reader.readAsText(file)
  }

  const uploadTerms = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  useEffect(() => {
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
      const headerHeight = getCssVarPx("--pj-header-height")
      const timelineOffset = getCssVarPx("--pj-timeline-offset")
      const scrollOffset = headerHeight + timelineOffset

      changeSetting({
        itemList,
        termList,
        lankList,
        categoryList,
        tagList,
        colorList,
        startYear,
        endYear,
        scrollbarWidth,
        scrollOffset,
      })
      setActiveTimeline(true)
    }
    setup()
  }, [])
  return (
    <div className="app">
      <ComponentVariable setting={setting} />
      <div className="app-main">
        <ComponentHeader
          //runGenerate={runGenerate}
          runInfo={runInfo}
          runSetting={runSetting}
        />
        <ComponentTimeline
          setting={setting}
          activeTimeline={activeTimeline}
          //ref={timelineRef}
        />
      </div>
      <ComponentModal
        activeModal={activeModal}
        closeModal={closeModal}
        //imageData={imageData}
        setting={setting}
        changeSetting={changeSetting}
        changeCurrentLank={changeCurrentLank}
        uploadItems={uploadItems}
        uploadTerms={uploadTerms}
      />
    </div>
  )
}
