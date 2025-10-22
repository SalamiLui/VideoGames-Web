
import Link from 'next/link'
import styles from '../Home.module.css'
import { VideoGame } from '../types'

interface GameCardProps {
  game: VideoGame
}

export default function GameCard({ game }: GameCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.cardMedia}>
        <img src={game.image_url || "/gameImages/oxide.jpeg"} alt={game.title} />
      </div>

      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{game.title}</h3>
        <div className={styles.cardMeta}>
          <span className={styles.price}>${game.price?.toFixed(2) ?? '0.00'}</span>
          <span className={styles.rating}>★ {game.rating ?? '0.0'}</span>
        </div>

        <div className={styles.cardActions}>
          <button className={styles.addBtn}>Add to Cart</button>
          <Link href={`/games/${game.id}`} className={styles.viewBtn}>View</Link>
        </div>
      </div>
    </div>
  )
}