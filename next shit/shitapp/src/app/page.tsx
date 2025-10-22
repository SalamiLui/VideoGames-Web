import Image from "next/image";
import styles from './Home.module.css';

export default function Home() {
  return (
<div className={styles.wrap} role="main" aria-labelledby="notice-title">
    <header className={styles.headline} role="banner">
      <h1 id="notice-title">THIS DOMAIN IS SUBJECT TO AN ONGOING SEIZURE PROCEDURE</h1>
    </header>

    <section className={styles.panel} aria-label="Seizure details">
      <p className={styles.accusatory}>
        This domain is currently under review due to alleged violations involving
        illicit drug trafficking, child porn distribution and facilitation of
        terrorist activities. All materials formerly available at this address
        are now subject to examination by competent authorities.
        Continued access to this site is strongly discouraged.
      </p>

      <p className={styles.accusatory}>
        Individuals or entities associated with the operation of this domain may be
        subject to investigation and further legal proceedings. If you encounter any
        suspicious content or activity, you are advised to report it through the
        appropriate channels.
      </p>

      <div className={styles.imageRow} aria-label="Related images or evidence placeholders">
        <div id="img-1"> <Image src="/images/doj.png" alt="fbi" width={150} height={50}/></div>
        <div id="img-1"> <Image src="/images/fbi.png" alt="fbi" width={150} height={50}/></div>
        <div id="img-1"> <Image src="/images/dea.png" alt="fbi" width={150} height={50}/></div>
      </div>

      <div className={styles.imageWrap}>
        <a className={styles.mainButton} id="action-button" href="/home/" role="button" aria-label="Primary action">Redirect</a>
      </div>
    </section>
  </div>
  );
}
