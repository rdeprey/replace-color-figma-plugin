import * as React from 'react';
import styles from './LoadingIndicator.module.css';

export const LoadingIndicator = () => {
  return (
    <div className={styles.loadingIndicator}>
      <p>
        <strong>Replacing colors</strong>
      </p>
      <div className={styles.loadingIndicatorDots}>
        <div className={styles.loadingIndicatorDot}></div>
        <div className={styles.loadingIndicatorDot}></div>
        <div className={styles.loadingIndicatorDot}></div>
      </div>
    </div>
  );
};
