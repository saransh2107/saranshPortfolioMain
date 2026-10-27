import { Fragment } from 'react'

/** Renders **bold** segments from résumé copy. */
export default function Rich({ text, strong }: { text: string; strong?: React.CSSProperties }) {
  return <>{text.split('**').map((part, i) => i % 2 ? <strong key={i} style={strong}>{part}</strong> : <Fragment key={i}>{part}</Fragment>)}</>
}
