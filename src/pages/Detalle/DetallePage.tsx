import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDatos } from '../../contexts/DatosContext';
import InfoTab from './Info/InfoTab';
import CierreTab from './Cierre/CierreTab';
import PdfTab from './Pdf/PdfTab';
import styles from './DetallePage.module.css';

type Tab = 'info' | 'cierre' | 'pdf';

export default function DetallePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { avisoElegido } = useDatos();
  const [activeTab, setActiveTab] = useState<Tab>('info');

  useEffect(() => {
    if (!avisoElegido) {
      navigate('/avisos', { replace: true });
    }
  }, [avisoElegido, navigate]);

  if (!avisoElegido) return null;

  const hasPdf = !!avisoElegido.pdf;
  const tabs: { key: Tab; label: string }[] = [
    { key: 'info', label: t('AVISOS.AVISO.DETALLE.INFO') }
  ];
  if (hasPdf) {
    tabs.push({ key: 'pdf', label: t('AVISOS.AVISO.DETALLE.PDF') });
  } else {
    tabs.push({ key: 'cierre', label: t('AVISOS.AVISO.DETALLE.FIRMAR') });
  }

  return (
    <div className={styles.page}>
      <div className={styles.tabBar}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`${styles.tabBtn} ${activeTab === tab.key ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className={styles.tabContent}>
        {activeTab === 'info' && <InfoTab />}
        {activeTab === 'cierre' && <CierreTab onComplete={() => navigate('/avisos')} />}
        {activeTab === 'pdf' && <PdfTab />}
      </div>
    </div>
  );
}
