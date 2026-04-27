import styles from './Ticker.module.css'

const ITEMS = [
  'Product Design', 'Engineering', 'Data Science', 'Marketing',
  'Remote-First',   'Finance',     'Sales',        'DevOps',
  'AI / ML',        'Legal',
]

export default function Ticker() {
  const doubled = [...ITEMS, ...ITEMS]
  return (
    <div className={styles.ticker}>
      <div className={styles.track}>
        {doubled.map((item, i) => (
          <>
            <span key={`dot-${i}`}  className={`${styles.item} ${styles.hi}`}>✦</span>
            <span key={`item-${i}`} className={styles.item}>{item}</span>
          </>
        ))}
      </div>
    </div>
  )
}
