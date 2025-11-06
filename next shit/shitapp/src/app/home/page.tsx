"use client";
import { useEffect, useState } from 'react'
import Head from 'next/head'
import Header from '../components/Header'
import GameCard from './components/gamecard'
import { VideoGame } from './types'
import styles from './Home.module.css'
import ErrorCard, { ErrorInfo, triggerError, triggerErrorProp, triggerNetworkError } from '../components/errorCard';
import { Genre } from './types';
import { Platform } from './types';
import { Label } from './types';

export default function Home() {
  const [games, setGames] = useState<VideoGame[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [countdown, setCountdown] = useState({ h: '00', m: '00', s: '00' })

  const [platform, setPlatform] = useState("");
  const [genre, setGenre] = useState("");
  const [label, setLabel] = useState("");
  const [price, setPrice] = useState("")

  const [platformOptions, setPlatformOptions] = useState<Platform[]>([])
  const [genreOptions, setGenreOptions] = useState<Genre[]>([])
  const [labelOptions, setLabelOptions] = useState<Label[]>([])

  const [showError, setShowError]= useState<boolean>(false)
  const [infoError, setInfoErro] = useState<ErrorInfo | null> (null)
  const t : triggerErrorProp = {
    setInfoError :setInfoErro,
    setShowError: setShowError
  }

  const PURGE_DATE = new Date('2025-12-31T23:59:59')


  const getFilers = async () => {
    const API_URL = "http://localhost:8080/filters"
    try{
      const res = await fetch(API_URL)
      const data = await res.json()
      if (!res.ok){
        triggerError(data, t, res.status)
        return
      }
      setPlatformOptions(data.platforms)
      setGenreOptions(data.genres)
      setLabelOptions(data.labels)

    }
    catch{
      triggerNetworkError(t)
    }
  }

  useEffect(()=>{
    getFilers()
  },[])

  useEffect(() => {
    async function load() {

      const API_URL = 'http://localhost:8080/videogames'
      setLoading(true)
      const params = new URLSearchParams();
      if (platform) params.append("platform", platform);
      if (genre) params.append("genre", genre);
      if (label) params.append("label", label);
      if (price){
        const [min, max] = price.split('-')
        params.append("price_min", min)
        params.append("price_max", max)
      }



      try {
        const res = await fetch(API_URL + "?"+ params)
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
  }, [platform,genre,label, price])

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

        <div
          className="
            sticky top-[52px] z-20
            bg-black/60 backdrop-blur-sm
            border-b border-purple-900/20
            px-4 py-3
            flex justify-center gap-4
          "
        >
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="
              bg-neutral-900 text-gray-300 text-sm
              border border-neutral-700 rounded
              px-3 py-1.5 min-w-[120px]
              transition
              focus:outline-none focus:border-purple-500
              hover:border-purple-500 hover:shadow-[0_0_8px_rgba(150,0,255,0.35)]
            "
          >
            <option value="">All Platforms</option>
            {platformOptions.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
          </select>

          <select
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="
              bg-neutral-900 text-gray-300 text-sm
              border border-neutral-700 rounded
              px-3 py-1.5 min-w-[120px]
              transition
              focus:outline-none focus:border-purple-500
              hover:border-purple-500 hover:shadow-[0_0_8px_rgba(150,0,255,0.35)]
            "
          >
            <option value="">All Genres</option>
            {genreOptions.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
          </select>

          <select
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="
              bg-neutral-900 text-gray-300 text-sm
              border border-neutral-700 rounded
              px-3 py-1.5 min-w-[120px]
              transition
              focus:outline-none focus:border-purple-500
              hover:border-purple-500 hover:shadow-[0_0_8px_rgba(150,0,255,0.35)]
            "
          >
            <option value="">All Labels</option>
            {labelOptions.map(l => <option key={l.id} value={l.name}>{l.name}</option>)}
            </select>

             <select
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="
              bg-neutral-900 text-gray-300 text-sm
              border border-neutral-700 rounded
              px-3 py-1.5 min-w-[120px]
              transition
              focus:outline-none focus:border-purple-500
              hover:border-purple-500 hover:shadow-[0_0_8px_rgba(150,0,255,0.35)]
            "
          >
            <option value="">All Prices</option>
            <option value="0-20">$0 - $20</option>
            <option value="20-50">$20 - $50</option>
            <option value="50-100">$50 - $100</option>
            <option value="100-500">$100 - $500</option>
            <option value="500-">$500+</option>

          </select>
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