"use client"

import Link from 'next/link'
import { useEffect, useState } from 'react'
import styles from './Header.module.css'

interface HeaderProps {
  cartCount?: number
}

export default function Header() {
  const [username, setUsername] = useState<string | null>(null);
  const [userID, setUserID] = useState<number>();

  useEffect(() => {

    const checkToken = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

      const API_URL = "http://localhost:8081/verify";
      try {
        const res = await fetch(API_URL, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });
        if (!res.ok) {
            localStorage.removeItem("token");
            localStorage.removeItem("userID");
            setUsername(null);
            return;
        }
        const data = await res.json();
        if (!data.valid){
            localStorage.removeItem("token");
            localStorage.removeItem("userID");
            setUsername(null);
            return;
        }

        setUsername(data.claims.username);
        setUserID(data.claims.user_id)
        localStorage.setItem("userID", data.claims.user_id);
      }
      catch (error) {
        setUsername("hitler");
      }
    }


    checkToken()

  }, []);


  const handleLogout = () =>  {
     localStorage.removeItem("token")
     localStorage.removeItem("userID")
     setUsername(null)
  }



  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <div className={styles.gift}>
          <img src="/images/jeff.gif" alt="gift" width={85} />
        </div>
        <div className={styles.titleWrap}>
          <h1 className={styles.siteTitle}>Another Shitty Page</h1>
        </div>

        <nav className={styles.submenu}>
          {username ? (
            <div className={styles.userMenu}>
              <span className={styles.menuItem}>{username}</span>
              <div className={styles.dropdown}>
                <Link href={`/cart/${userID}`}><span className={styles.dropdownItem}>Cart</span></Link>
                <Link href={`/wishlist/${userID}`}><span className={styles.dropdownItem}>Wishlist</span></Link>
                <Link href={`/orders/${userID}`}><span className={styles.dropdownItem}>Orders</span></Link>
                <Link href="#"><span className={styles.dropdownItem}>Settings</span></Link>
                <span
                  className={styles.dropdownItem}
                  style={{cursor: 'pointer'}}
                  onClick={handleLogout}>
                  logout
                </span>

              </div>
            </div>
          ) : (
          <Link href="/login"><span className={styles.menuItem}>Login</span></Link>
          )}
        </nav>
      </div>
    </header>
  )
}