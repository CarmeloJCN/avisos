import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCollectionSnapshot, addDocument, updateDocument, getDocument, getLastNumAviso, getTecnicoId } from '../../hooks/useFirestore';
import { useAuth } from '../../contexts/AuthContext';
import { AVISOS_CONSTANTS } from '../../lib/constants';
import type { Aviso, Cliente } from '../../types/models';
import AddClient from '../../components/AddClient';
import styles from './AddAvisoPage.module.css';

export default function AddAvisoPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { data: clientes } = useCollectionSnapshot<Cliente>('clientes', 'nombre');

  const isNew = id === 'new';

  const [cliente, setCliente] = useState('');
  const [numAviso, setNumAviso] = useState('');
  const [descripcionAviso, setDescripcionAviso] = useState('');
  const [fechaCita, setFechaCita] = useState('');
  const [touched, setTouched] = useState(false);
  const [existingAviso, setExistingAviso] = useState<Aviso | null>(null);
  const [showAddClientModal, setShowAddClientModal] = useState(false);

  useEffect(() => {
    const initNewAviso = async () => {
      await Promise.resolve(); // Defer state updates to microtask to avoid synchronous setState warning in effect
      const today = new Date().toISOString().slice(0, 16);
      setFechaCita(today);
      const lastNum = await getLastNumAviso();
      if (lastNum) {
        const parts = lastNum.split('-');
        const num = parseInt(parts[1], 10) + 1;
        setNumAviso(AVISOS_CONSTANTS.ENCABEZADO_AVISO + String(num).padStart(5, '0'));
      } else {
        setNumAviso(AVISOS_CONSTANTS.ENCABEZADO_AVISO + '0001');
      }
    };

    const loadExistingAviso = async () => {
      if (!id) return;
      await Promise.resolve(); // Defer state updates to microtask
      const aviso = await getDocument<Aviso>('avisos', id);
      if (aviso) {
        setExistingAviso(aviso);
        setCliente(aviso.cliente?.id || '');
        setNumAviso(aviso.numAviso);
        setDescripcionAviso(aviso.descripcionAviso);
        setFechaCita(aviso.fechaCita ? new Date(aviso.fechaCita).toISOString().slice(0, 16) : '');
      }
    };

    if (isNew) {
      initNewAviso();
    } else {
      loadExistingAviso();
    }
  }, [id, isNew]);

  const handleSubmit = async () => {
    setTouched(true);
    if (!cliente || !descripcionAviso) return;

    const clienteObj = clientes.find(c => c.id === cliente);
    if (!clienteObj) return;

    let tecnicoID = '';
    const stored = localStorage.getItem('tecnicoID');
    if (stored) {
      tecnicoID = JSON.parse(stored);
    } else if (user) {
      const id = await getTecnicoId(user.uid);
      if (id) {
        tecnicoID = id;
        localStorage.setItem('tecnicoID', JSON.stringify(id));
      }
    }

    const avisoData: Omit<Aviso, 'id'> = isNew ? {
      cliente: clienteObj,
      numAviso,
      descripcionAviso,
      intervencion: '',
      fechaEntrada: new Date(),
      fechaCita: fechaCita ? new Date(fechaCita) : null,
      fechaFin: null,
      inicioAviso: null,
      precio: '',
      tecnicoID,
      cerrado: false
    } : {
      ...existingAviso,
      cliente: clienteObj,
      numAviso,
      descripcionAviso,
      fechaCita: fechaCita ? new Date(fechaCita) : null,
    } as Omit<Aviso, 'id'>;

    if (isNew) {
      await addDocument('avisos', avisoData);
    } else if (id) {
      await updateDocument('avisos', id, avisoData);
    }
    navigate('/avisos');
  };

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <form className={styles.form} onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
          <h3 className={styles.title}>{t('AVISOS.AVISO.SUBTITLE')}</h3>
          <div className={`${styles.field} ${styles.fieldDisabled}`}>
            <label>{t('AVISOS.AVISO.TITLE')}</label>
            <input type="text" value={numAviso} disabled />
          </div>
          <div className={styles.field}>
            <label>{t('AVISOS.CLIENTES.CLIENTE')}</label>
            <div className={styles.selectRow}>
              <select value={cliente} onChange={e => setCliente(e.target.value)} onBlur={() => setTouched(true)}>
                <option value="">{t('AVISOS.COMUN.SELECCIONAR')}</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
              <button
                type="button"
                className={styles.addClientBtn}
                onClick={() => setShowAddClientModal(true)}
                title={t('AVISOS.CLIENTES.NEW_CLIENT')}
              >
                +
              </button>
            </div>
            {touched && !cliente && <small className="text-danger">{t('AVISOS.ERRORES.NO_CLIENTE')}</small>}
          </div>
          <div className={styles.field}>
            <label>{t('AVISOS.AVISO.FECHA_CITA')}</label>
            <input
              type="datetime-local"
              value={fechaCita}
              onChange={e => setFechaCita(e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label>{t('AVISOS.AVISO.DESCRIPCION')}</label>
            <textarea
              value={descripcionAviso}
              onChange={e => setDescripcionAviso(e.target.value)}
              onBlur={() => setTouched(true)}
            />
            {touched && !descripcionAviso && <small className="text-danger">{t('AVISOS.ERRORES.NO_DESCRIPTION')}</small>}
          </div>
        </form>
      </div>
      <div className={styles.footer}>
        <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => navigate('/avisos')}>
          {t('AVISOS.COMUN.CANCELAR')}
        </button>
        <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSubmit}>
          {t('AVISOS.COMUN.ACEPTAR')}
        </button>
      </div>

      {showAddClientModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAddClientModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <AddClient
              navigateOnComplete={false}
              onComplete={(newClientId) => {
                setShowAddClientModal(false);
                if (newClientId) {
                  setCliente(newClientId);
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
