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
  getYearList,
} from "./utils"
import "./app.css"

const defaultOptions: Options = {
  startYear: 1983,
  endYear: 2025,
  omitEmptyYears: false,
}

export default function App() {
  const [itemList, setItemList] = useState<Item[]>([])
  const [termList, setTermList] = useState<Term[]>([])
  const [categoryList, setCategoryList] = useState<Term[]>([])
  const [tagList, setTagList] = useState<Term[]>([])
  const [colorList, setColorList] = useState<Color[]>([])
  const [options, setOptions] = useState<Options>(defaultOptions)
  const [scrollbarWidth, setScrollbarWidth] = useState(0)

  const [activeTimeline, setActiveTimeline] = useState(false)
  const [activeModal, setActiveModal] = useState<string | null>(null)

  //const [imageData, setImageData] = useState<string | null>(null)
  const timelineRef = useRef<HTMLDivElement>(null)

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

  const changeCategoryList = (newCategoryList: Term[]) => {
    setCategoryList(newCategoryList)
  }
  const changeTagList = (newTagList: Term[]) => {
    setTagList(newTagList)
  }
  const changeOptions = (newOptions: Partial<Options>) => {
    setOptions((prevOptions) => ({
      ...prevOptions,
      ...newOptions,
    }))
  }

  const openItems = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()

    reader.onload = (event) => {
      const itemsData = event.target?.result as string
      const parsedItems = parseCsv(itemsData)

      const newItemList = csvToItemList(parsedItems)
      const categoryIds = getTermIds(newItemList, "category")
      const tagIds = getTermIds(newItemList, "tags")
      const labelIds = getTermIds(newItemList, "labels")
      const tagLabelIds = [...new Set([...tagIds, ...labelIds])]

      const newCategoryList = resolveTermList(categoryIds, termList)
      const newTagList = resolveTermList(tagLabelIds, termList)
      const newColorList = getColorList(termList)

      const yearList = getYearList(newItemList)
      const startYear = Math.min(...yearList)
      const endYear = Math.max(...yearList)

      setItemList(newItemList)
      setCategoryList(newCategoryList)
      setTagList(newTagList)
      setColorList(newColorList)
      changeOptions({ startYear, endYear })
    }
    reader.readAsText(file)
  }

  const openTerms = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()

    reader.onload = (event) => {
      const termsData = event.target?.result as string
      const parsedTerms = parseCsv(termsData)

      const newTermList = csvToTermList(parsedTerms)
      const categoryIds = getTermIds(itemList, "category")
      const tagIds = getTermIds(itemList, "tags")
      const labelIds = getTermIds(itemList, "labels")
      const tagLabelIds = [...new Set([...tagIds, ...labelIds])]

      const newCategoryList = resolveTermList(categoryIds, newTermList)
      const newTagList = resolveTermList(tagLabelIds, newTermList)
      const newColorList = getColorList(newTermList)

      setTermList(newTermList)
      setCategoryList(newCategoryList)
      setTagList(newTagList)
      setColorList(newColorList)
    }
    reader.readAsText(file)
  }

  useEffect(() => {
    const setup = async () => {
      const itemsData = await fetchFile("/assets/items.csv")
      const termsData = await fetchFile("/assets/terms.csv")
      const parsedItems = parseCsv(itemsData)
      const parsedTerms = parseCsv(termsData)

      const defaultItemList = csvToItemList(parsedItems)
      const defaultTermList = csvToTermList(parsedTerms)
      const categoryIds = getTermIds(defaultItemList, "category")
      const tagIds = getTermIds(defaultItemList, "tags")
      const labelIds = getTermIds(defaultItemList, "labels")
      const tagLabelIds = [...new Set([...tagIds, ...labelIds])]
      const defaultCategoryList = resolveTermList(categoryIds, defaultTermList)
      const defaultTagList = resolveTermList(tagLabelIds, defaultTermList)
      const defaultColorList = getColorList(defaultTermList)

      const defaultYearList = getYearList(defaultItemList)
      const defaultStartYear = Math.min(...defaultYearList)
      const defaultEndYear = Math.max(...defaultYearList)

      setItemList(defaultItemList)
      setTermList(defaultTermList)
      setCategoryList(defaultCategoryList)
      setTagList(defaultTagList)
      setColorList(defaultColorList)

      changeOptions({
        startYear: defaultStartYear,
        endYear: defaultEndYear,
      })
      setScrollbarWidth(window.innerWidth - document.body.clientWidth)
      setActiveTimeline(true)
    }
    setup()
  }, [])
  return (
    <div className="app">
      <ComponentVariable
        colorList={colorList}
        scrollbarWidth={scrollbarWidth}
      />
      <div className="app-main">
        <ComponentHeader
          //runGenerate={runGenerate}
          runInfo={runInfo}
          runSetting={runSetting}
        />
        <ComponentTimeline
          itemList={itemList}
          categoryList={categoryList}
          tagList={tagList}
          options={options}
          activeTimeline={activeTimeline}
          ref={timelineRef}
        />
      </div>
      <ComponentModal
        activeModal={activeModal}
        closeModal={closeModal}
        itemList={itemList}
        categoryList={categoryList}
        tagList={tagList}
        options={options}
        //imageData={imageData}
        changeCategoryList={changeCategoryList}
        changeTagList={changeTagList}
        changeOptions={changeOptions}
        openItems={openItems}
        openTerms={openTerms}
      />
    </div>
  )
}
