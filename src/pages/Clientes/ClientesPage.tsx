import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCollectionSnapshot, deleteDocument } from '../../hooks/useFirestore';
import { filterItems } from '../../lib/filter';
import { TrashIcon, PlusIcon, SearchIcon } from '../../components/ui/Icons';
import type { Cliente } from '../../types/models';
import styles from '../Avisos/AvisosPage.module.css';

export default function ClientesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: clientes } = useCollectionSnapshot<Cliente>('clientes', 'nombre');

  const [filterValue, setFilterValue] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Cliente | null>(null);

  const filtered = filterItems(clientes, filterValue, ['nombre', 'direccion', 'telefono']);

  const handleDelete = async () => {
    if (!deleteTarget || !deleteTarget.id) return;
    await deleteDocument('clientes', deleteTarget.id);
    setDeleteTarget(null);
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

      {filtered.length === 0 && (
        <div className={styles.empty}>{t('AVISOS.COMUN.NO_RESULTADOS')}</div>
      )}

      <ul className={styles.list}>
        {filtered.map(item => (
          <li key={item.id} className={styles.item}>
            <div className={styles.itemContent} onClick={() => navigate(`/cliente/${item.id}`)}>
              <div className={styles.itemName}>{item.nombre}</div>
              <div className={styles.itemAddress}>{item.direccion}</div>
            </div>
            <div className={styles.itemMeta} onClick={() => navigate(`/cliente/${item.id}`)}>
              {item.telefono?.[0] && (
                <div className={styles.itemDate}>{item.telefono[0]}</div>
              )}
            </div>
            <div className={styles.itemActions}>
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

      <button className={styles.fab} onClick={() => navigate('/cliente/new')} aria-label="+">
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
