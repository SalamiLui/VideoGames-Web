"use client"

import Link from 'next/link'
import { useEffect, useState } from 'react'
import styles from './Header.module.css'

interface HeaderProps {
  cartCount?: number
}

enum Role {
  slave = "slave",
  admin = "admin",
  root = 'root'

}

export default function Header() {
  const [username, setUsername] = useState<string | null>(null);
  const [userID, setUserID] = useState<number>();
  const [role, setRole] = useState<string>();

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
        setRole(data.claims.role)
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
     window.location.reload()
  }



  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <div className={styles.gift}>
          <img src="/images/jeff.gif" alt="gift" width={85} />
        </div>
        <div className={styles.titleWrap}>
          <h1 className={styles.siteTitle}
              onClick={() => {window.location.href = "/home"}}>Another Shitty Page</h1>
        </div>

        <nav className={styles.submenu}>
          {username ? (
            <div className={styles.userMenu}>
              <span className={styles.menuItem}>{username}</span>
              <div className={styles.dropdown}>
                <Link href={`/cart/${userID}`}><span className={styles.dropdownItem}>Cart</span></Link>
                <Link href={`/wishlist/${userID}`}><span className={styles.dropdownItem}>Wishlist</span></Link>
                <Link href={`/orders/${userID}`}><span className={styles.dropdownItem}>Orders</span></Link>
                <Link href={`/user/${userID}`}><span className={styles.dropdownItem}>Settings</span></Link>
                <span
                  className={styles.dropdownItem}
                  style={{cursor: 'pointer'}}
                  onClick={handleLogout}>
                  logout
                </span>
                {(role === Role.admin || role === Role.root)  && (
                    <span
                    className={styles.dropdownItem}
                    style={{cursor: 'pointer'}}
                    onClick={()=>window.location.href = "/admin"}
                    >
                      <img width={50} src="/images/jeff.gif" alt="jeff" />

                    </span>
                )}


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