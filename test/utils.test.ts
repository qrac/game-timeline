import { describe, it, expect } from "vitest"
import { getCustomDate } from "../src/utils"

describe("getCustomDate", () => {
  it("日付ありの場合: 1996-06-23", () => {
    const result = getCustomDate("1996-06-23")
    expect(result.year).toBe(1996)
    expect(result.hasDay).toBe(true)

    const expectedDate = new Date(1996, 5, 23)
    expect(result.timestamp).toBe(expectedDate.getTime())
  })

  it("日付なし（00）の場合: 1996-06-00", () => {
    const result = getCustomDate("1996-06-00")
    expect(result.year).toBe(1996)
    expect(result.hasDay).toBe(false)

    const expectedDate = new Date(1996, 5, 1)
    expect(result.timestamp).toBe(expectedDate.getTime())
  })

  it("日付が1日の場合: 2020-01-01", () => {
    const result = getCustomDate("2020-01-01")
    expect(result.year).toBe(2020)
    expect(result.hasDay).toBe(true)

    const expectedDate = new Date(2020, 0, 1)
    expect(result.timestamp).toBe(expectedDate.getTime())
  })

  it("日付が00でうるう年: 2000-02-00", () => {
    const result = getCustomDate("2000-02-00")
    expect(result.year).toBe(2000)
    expect(result.hasDay).toBe(false)

    const expectedDate = new Date(2000, 1, 1)
    expect(result.timestamp).toBe(expectedDate.getTime())
  })
})
