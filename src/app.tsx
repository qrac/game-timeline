import { useState, useRef, useEffect } from "react"

import { Item, Term, Color, Options } from "./types"
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
} from "./utils"
import "./app.css"

const defaultOptions: Options = {
  itemList: [],
  termList: [],
  categoryList: [],
  tagList: [],
  colorList: [],
  lankList: [1],
  startYear: 1983,
  endYear: 2025,
  omitEmptyYears: false,
  visibleLank: 1,
}

export default function App() {
  const [options, setOptions] = useState<Options>(defaultOptions)
  const [scrollbarWidth, setScrollbarWidth] = useState(0)
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

  const changeOptions = (newOptions: Partial<Options>) => {
    setOptions((prevOptions) => ({
      ...prevOptions,
      ...newOptions,
    }))
  }
  const changeVisibleLank = (visibleLank: number) => {
    const { itemList, termList } = options

    const categoryIds = getTermIds(itemList, "category", visibleLank)
    const tagIds = getTermIds(itemList, "tags", visibleLank)
    const labelIds = getTermIds(itemList, "labels", visibleLank)
    const tagLabelIds = [...new Set([...tagIds, ...labelIds])]

    const categoryList = resolveTermList(categoryIds, termList)
    const tagList = resolveTermList(tagLabelIds, termList)

    changeOptions({
      categoryList: categoryList,
      tagList: tagList,
      visibleLank,
    })
  }

  const uploadItems = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()

    reader.onload = (event) => {
      const { termList } = options
      const itemsData = event.target?.result as string
      const parsedItems = parseCsv(itemsData)

      const itemList = csvToItemList(parsedItems)
      const lankList = getLankList(itemList)
      const visibleLank = lankList[0]
      const categoryIds = getTermIds(itemList, "category", visibleLank)
      const tagIds = getTermIds(itemList, "tags", visibleLank)
      const labelIds = getTermIds(itemList, "labels", visibleLank)
      const tagLabelIds = [...new Set([...tagIds, ...labelIds])]

      const categoryList = resolveTermList(categoryIds, termList)
      const tagList = resolveTermList(tagLabelIds, termList)
      const colorList = getColorList(termList)

      const yearList = getYearList(itemList)
      const startYear = Math.min(...yearList)
      const endYear = Math.max(...yearList)

      changeOptions({
        itemList,
        lankList,
        categoryList,
        tagList,
        colorList,
        startYear,
        endYear,
        visibleLank,
      })
    }
    reader.readAsText(file)
  }

  const uploadTerms = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()

    reader.onload = (event) => {
      const { itemList, visibleLank } = options
      const termsData = event.target?.result as string
      const parsedTerms = parseCsv(termsData)

      const termList = csvToTermList(parsedTerms)
      const categoryIds = getTermIds(itemList, "category", visibleLank)
      const tagIds = getTermIds(itemList, "tags", visibleLank)
      const labelIds = getTermIds(itemList, "labels", visibleLank)
      const tagLabelIds = [...new Set([...tagIds, ...labelIds])]

      const categoryList = resolveTermList(categoryIds, termList)
      const tagList = resolveTermList(tagLabelIds, termList)
      const colorList = getColorList(termList)

      changeOptions({
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

      const itemsData = await fetchFile(`/assets/items.csv?t=${timestamp}`)
      const termsData = await fetchFile(`/assets/terms.csv?t=${timestamp}`)
      const parsedItems = parseCsv(itemsData)
      const parsedTerms = parseCsv(termsData)

      const itemList = csvToItemList(parsedItems)
      const termList = csvToTermList(parsedTerms)
      const lankList = getLankList(itemList)
      const visibleLank = lankList[0]
      const categoryIds = getTermIds(itemList, "category", visibleLank)
      const tagIds = getTermIds(itemList, "tags", visibleLank)
      const labelIds = getTermIds(itemList, "labels", visibleLank)
      const tagLabelIds = [...new Set([...tagIds, ...labelIds])]
      const categoryList = resolveTermList(categoryIds, termList)
      const tagList = resolveTermList(tagLabelIds, termList)
      const colorList = getColorList(termList)

      const yearList = getYearList(itemList)
      const startYear = Math.min(...yearList)
      const endYear = Math.max(...yearList)

      changeOptions({
        itemList,
        termList,
        lankList,
        categoryList,
        tagList,
        colorList,
        startYear,
        endYear,
        visibleLank,
      })
      setScrollbarWidth(window.innerWidth - document.body.clientWidth)
      setActiveTimeline(true)
    }
    setup()
  }, [])
  return (
    <div className="app">
      <ComponentVariable options={options} scrollbarWidth={scrollbarWidth} />
      <div className="app-main">
        <ComponentHeader
          //runGenerate={runGenerate}
          runInfo={runInfo}
          runSetting={runSetting}
        />
        <ComponentTimeline
          options={options}
          activeTimeline={activeTimeline}
          //ref={timelineRef}
        />
      </div>
      <ComponentModal
        activeModal={activeModal}
        closeModal={closeModal}
        //imageData={imageData}
        options={options}
        changeOptions={changeOptions}
        changeVisibleLank={changeVisibleLank}
        uploadItems={uploadItems}
        uploadTerms={uploadTerms}
      />
    </div>
  )
}
