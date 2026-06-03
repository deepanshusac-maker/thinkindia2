import styles from "./loading.module.css";

export default function Loading() {
  return (
    <div className={styles.container}>
      <div className={styles.loaderWrapper}>
        {/* Ashoka Chakra-inspired concentric spinner */}
        <div className={styles.chakraOuter}>
          <div className={styles.chakraInner}>
            <div className={styles.spoke1} />
            <div className={styles.spoke2} />
            <div className={styles.spoke3} />
            <div className={styles.spoke4} />
          </div>
        </div>
        
        {/* Loading text with progressive character fade */}
        <div className={styles.loadingText}>
          <span>L</span>
          <span>o</span>
          <span>a</span>
          <span>d</span>
          <span>i</span>
          <span>n</span>
          <span>g</span>
        </div>
        
        {/* Subtitle */}
        <p className={styles.loadingSub}>Think India Bihar</p>
      </div>
    </div>
  );
}
