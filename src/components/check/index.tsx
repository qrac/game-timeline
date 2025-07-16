import "./index.css"

export function ComponentCheck({
  checked,
  onChange,
  text,
}: {
  checked: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  text: string
}) {
  return (
    <label className="check">
      <input
        className="input"
        type="checkbox"
        checked={checked}
        onChange={onChange}
      />
      <span className="checkbox" />
      <span className="text">{text}</span>
    </label>
  )
}
