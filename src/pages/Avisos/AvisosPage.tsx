import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCollectionSnapshot, deleteDocument } from '../../hooks/useFirestore';
import { deletePdf } from '../../lib/storage';
import { filterItems, filterByEstado } from '../../lib/filter';
import { useDatos } from '../../contexts/DatosContext';
import { PencilIcon, TrashIcon, PlusIcon, SearchIcon } from '../../components/ui/Icons';
import type { Aviso } from '../../types/models';
import styles from './AvisosPage.module.css';

export default function AvisosPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setAvisoElegido } = useDatos();
  const { data: avisos } = useCollectionSnapshot<Aviso>('avisos', 'numAviso');

  const [filterValue, setFilterValue] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('activos');
  const [deleteTarget, setDeleteTarget] = useState<Aviso | null>(null);

  const filtered = filterByEstado(filterItems(avisos, filterValue, ['cliente.nombre', 'cliente.direccion', 'numAviso']), filtroEstado);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteDocument('avisos', deleteTarget.id!);
    if (deleteTarget.pdf) {
      await deletePdf(deleteTarget.numAviso);
    }
    setDeleteTarget(null);
  };

  const formatDate = (d: Date | string | null) => {
    if (!d) return '';
    const date = new Date(d);
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <>
      <div className={styles.searchWrapper}>
        <SearchIcon className={styles.searchIcon} size={18} />
        <input
          className={styles.searchBar}
          placeholder={t('AVISOS.COMUN.BUSCAR')}
          value={filterValue}
          onChange={e => setFilterValue(e.target.value)}
        />
      </div>
      
      <div className={styles.filterRow}>
        <span className={styles.filterLabel}>{t('AVISOS.FILTRO.TITLE')}:</span>
        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
          <option value="activos">{t('AVISOS.FILTRO.ACTIVOS')}</option>
          <option value="cerrados">{t('AVISOS.FILTRO.CERRADOS')}</option>
          <option value="todos">{t('AVISOS.FILTRO.TODOS')}</option>
        </select>
      </div>

      {filtered.length === 0 && (
        <div className={styles.empty}>{t('AVISOS.COMUN.NO_RESULTADOS')}</div>
      )}

      <ul className={styles.list}>
        {filtered.map(item => (
          <li key={item.id} className={styles.item}>
            <div className={styles.itemContent} onClick={() => {
              setAvisoElegido(item);
              navigate('/detalle');
            }}>
              <div className={styles.itemName}>{item.cliente?.nombre}</div>
              <div className={styles.itemAddress}>{item.cliente?.direccion}</div>
              <div className={styles.itemBadgeRow}>
                <span className={`${styles.badge} ${item.cerrado ? styles.badgeClosed : styles.badgeOpen}`}>
                  {item.cerrado ? t('AVISOS.FILTRO.CERRADOS') : t('AVISOS.FILTRO.ACTIVOS')}
                </span>
              </div>
            </div>
            <div className={styles.itemMeta} onClick={() => {
              setAvisoElegido(item);
              navigate('/detalle');
            }}>
              <div className={styles.itemAvisoNum}>{item.numAviso}</div>
              <div className={styles.itemDate}>{formatDate(item.fechaCita)}</div>
            </div>
            <div className={styles.itemActions}>
              {!item.cerrado && (
                <button
                  className={`${styles.actionBtn} ${styles.actionPrimary}`}
                  onClick={() => navigate(`/add-aviso/${item.id}`)}
                  title={t('AVISOS.COMUN.EDITAR')}
                >
                  <PencilIcon size={16} />
                </button>
              )}
              <button
                className={`${styles.actionBtn} ${styles.actionDanger}`}
                onClick={() => setDeleteTarget(item)}
                title={t('AVISOS.COMUN.BORRAR')}
              >
                <TrashIcon size={16} />
              </button>
            </div>
          </li>
        ))}
      </ul>

      <button className={styles.fab} onClick={() => navigate('/add-aviso/new')} aria-label="+">
        <PlusIcon size={24} />
      </button>

      {deleteTarget && (
        <div className={styles.modalOverlay} onClick={() => setDeleteTarget(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <p>{t('AVISOS.COMUN.BORRAR_MSG')}</p>
            <div className={styles.modalActions}>
              <button className={`${styles.modalBtn} ${styles.modalBtnPrimary}`} onClick={() => setDeleteTarget(null)}>
                {t('AVISOS.COMUN.NO')}
              </button>
              <button className={`${styles.modalBtn} ${styles.modalBtnDanger}`} onClick={handleDelete}>
                {t('AVISOS.COMUN.SI')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
