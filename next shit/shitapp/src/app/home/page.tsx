"use client";
import { useEffect, useState } from 'react'
import Head from 'next/head'
import Header from '../components/Header'
import GameCard from './components/gamecard'
import { VideoGame } from './types'
import styles from './Home.module.css'
import ErrorCard, { ErrorInfo, triggerError, triggerErrorProp, triggerNetworkError } from '../components/errorCard';
import { info } from 'console';

export default function Home() {
  const [games, setGames] = useState<VideoGame[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [countdown, setCountdown] = useState({ h: '00', m: '00', s: '00' })

  const [showError, setShowError]= useState<boolean>(false)
  const [infoError, setInfoErro] = useState<ErrorInfo | null> (null)
  const t : triggerErrorProp = {
    setInfoError :setInfoErro,
    setShowError: setShowError
  }

  const API_URL = 'http://localhost:8080/videogames'
  const PURGE_DATE = new Date('2025-12-31T23:59:59')

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(API_URL)
        const data = await res.json()
        if (!res.ok) {
          triggerError(data, t, res.status)
          return
        }
        setGames(data)
      } catch (e) {
        triggerNetworkError(t)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime()
      const diff = PURGE_DATE.getTime() - now
      const h = Math.floor(diff / (1000 * 60 * 60))
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const s = Math.floor((diff % (1000 * 60)) / 1000)
      setCountdown({
        h: String(h).padStart(2, '0'),
        m: String(m).padStart(2, '0'),
        s: String(s).padStart(2, '0'),
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <Head>
        <title>Another Shitty Page — Games</title>
      </Head>


      <div className={styles.pageWrap}>
        <Header />

        <div className={styles.countdownBar}>
          <div className={styles.countdownContent}>
            <span className={styles.countdownLabel}>Hours until the next purge</span>
            <div className={styles.countdownDigits}>
              <span className={styles.digit}>{countdown.h}</span>:
              <span className={styles.digit}>{countdown.m}</span>:
              <span className={styles.digit}>{countdown.s}</span>
            </div>
          </div>
        </div>


        <main className={styles.main}>
          <section className={styles.grid}>
            {loading ? (
              <div className={styles.loading}>Loading...</div>
            ) : (
              games.map(game => <GameCard key={game.id} game={game} />)
            )}
          </section>
        </main>
        {showError && infoError && (
          <ErrorCard
            description={infoError.description}
            errorNumber={infoError.errorNumber}
            onClose={()=>{setShowError(false)}}></ErrorCard>
        )}
      </div>
    </>
  )
}