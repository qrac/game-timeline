import type { Color } from "../../types"

export function ComponentVariable({ colors }: { colors: Color[] }) {
  const colorCss = colors
    .map((color) => {
      return `.is-accent-${color.id} { --theme-pj-accent: ${color.color}; }`
    })
    .join("\n")
  return <>{colors.length > 0 && <style>{colorCss}</style>}</>
}
