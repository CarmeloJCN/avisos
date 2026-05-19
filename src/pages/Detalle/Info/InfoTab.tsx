import { useTranslation } from 'react-i18next';
import { useDatos } from '../../../contexts/DatosContext';
import styles from './InfoTab.module.css';

export default function InfoTab() {
  const { t } = useTranslation();
  const { avisoElegido } = useDatos();
  if (!avisoElegido) return null;

  const a = avisoElegido;

  const formatDate = (d: Date | string) => {
    if (!d) return '';
    const date = new Date(d);
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getFullYear()).slice(2)} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <div className={styles.content}>
      <div className={styles.center}>
        <div className={styles.avisoNum}>{t('AVISOS.AVISO.DETALLE.INFO.AVISO')} {a.numAviso}</div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>{t('AVISOS.AVISO.DETALLE.INFO.DATOS_CLIENTE')}</div>
        <div className={styles.box}>
          <div className={styles.row}>
            <span className={styles.label}>{t('AVISOS.CLIENTES.NOMBRE')}</span>
            <span className={styles.value}>{a.cliente?.nombre}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>{t('AVISOS.CLIENTES.CIF_NIF')}</span>
            <span className={styles.value}>{a.cliente?.cifNif}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>{t('AVISOS.CLIENTES.DIRECCION')}</span>
            <span className={styles.value}>{a.cliente?.direccion}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>{t('AVISOS.CLIENTES.EMAIL')}</span>
            <span className={styles.value}>{a.cliente?.email}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>{t('AVISOS.AVISO.DETALLE.INFO.TLFNO')}</span>
            <span className={styles.value}>{a.cliente?.telefono?.join(', ')}</span>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>{t('AVISOS.AVISO.DETALLE.INFO.DATOS_AVISO')}</div>
        <div className={styles.box}>
          <div className={styles.row}>
            <span className={styles.label}>{t('AVISOS.AVISO.DETALLE.INFO.FECHA_ENTRADA')}</span>
            <span className={styles.value}>{formatDate(a.fechaEntrada)}</span>
          </div>
          {a.fechaCita && (
            <div className={styles.row}>
              <span className={styles.label}>{t('AVISOS.AVISO.FECHA_CITA')}</span>
              <span className={styles.value}>{formatDate(a.fechaCita)}</span>
            </div>
          )}
          <div className={styles.sectionTitle} style={{ marginTop: 8 }}>{t('AVISOS.AVISO.DESCRIPCION')}</div>
          <div className={styles.desc}>{a.descripcionAviso}</div>
        </div>
      </div>
    </div>
  );
}
