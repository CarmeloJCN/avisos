import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDatos } from '../../../contexts/DatosContext';
import styles from './PdfTab.module.css';

export default function PdfTab() {
  const { t } = useTranslation();
  const { avisoElegido } = useDatos();
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!avisoElegido) return null;

  return (
    <div className={styles.content}>
      {online ? (
        <object className={styles.object} data={avisoElegido.pdf} type="application/pdf">
          <iframe src={avisoElegido.pdf} className={styles.object} title="PDF">
            <p>{t('AVISOS.PDF.P')} <a href={avisoElegido.pdf}>{t('AVISOS.PDF.A')}</a>.</p>
          </iframe>
        </object>
      ) : (
        <div className={styles.offline}>{t('AVISOS.PDF.NO_ONLINE')}</div>
      )}
    </div>
  );
}
