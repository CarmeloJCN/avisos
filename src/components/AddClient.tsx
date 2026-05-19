import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { addDocument, updateDocument, getDocument } from '../hooks/useFirestore';
import type { Cliente } from '../types/models';
import styles from '../pages/AddAviso/AddAvisoPage.module.css';

interface Props {
  onComplete?: (newClientId?: string) => void;
  navigateOnComplete?: boolean;
}

const EMAIL_RE = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$/;
const CIF_NIF_RE = /([a-z]|[A-Z]|[0-9])[0-9]{7}([a-z]|[A-Z]|[0-9])/;

export default function AddClient({ onComplete, navigateOnComplete = true }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'new';

  const [nombre, setNombre] = useState('');
  const [direccion, setDireccion] = useState('');
  const [cifNif, setCifNif] = useState('');
  const [email, setEmail] = useState('');
  const [telefonos, setTelefonos] = useState(['']);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    const loadCliente = async (clienteId: string) => {
      const c = await getDocument<Cliente>('clientes', clienteId);
      if (c) {
        setNombre(c.nombre);
        setDireccion(c.direccion);
        setCifNif(c.cifNif || '');
        setEmail(c.email || '');
        setTelefonos(c.telefono?.length ? c.telefono : ['']);
      }
    };

    if (!isNew && id) {
      loadCliente(id);
    }
  }, [id, isNew]);

  const addTelefono = () => {
    if (telefonos.length < 2) {
      setTelefonos([...telefonos, '']);
    }
  };

  const removeTelefono = (index: number) => {
    setTelefonos(telefonos.filter((_, i) => i !== index));
  };

  const updateTelefono = (index: number, value: string) => {
    const updated = [...telefonos];
    updated[index] = value;
    setTelefonos(updated);
  };

  const handleSubmit = async () => {
    setTouched(true);
    if (!nombre || !direccion) return;

    const data: Cliente = {
      nombre,
      direccion,
      cifNif: cifNif || '',
      email: email || '',
      telefono: telefonos.filter(t => t.trim())
    };

    let newId = id;
    if (isNew) {
      const docRef = await addDocument('clientes', data);
      newId = docRef.id;
    } else if (id) {
      await updateDocument('clientes', id, data);
    }
    if (onComplete) {
      onComplete(newId);
    }
    if (navigateOnComplete) {
      navigate('/clientes');
    }
  };

  return (
    <div className={styles.content}>
      <div className={styles.form}>
        <h3 className={styles.title}>
          {isNew ? t('AVISOS.CLIENTES.SUBTITLE') : t('AVISOS.CLIENTES.CLIENTE')}
        </h3>

        <div className={styles.field}>
          <label>{t('AVISOS.CLIENTES.NOMBRE')}</label>
          <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} onBlur={() => setTouched(true)} />
          {touched && !nombre && <small className="text-danger">{t('AVISOS.ERRORES.OBLIGATORIO')}</small>}
        </div>

        <div className={styles.field}>
          <label>{t('AVISOS.CLIENTES.DIRECCION')}</label>
          <input type="text" value={direccion} onChange={e => setDireccion(e.target.value)} onBlur={() => setTouched(true)} />
          {touched && !direccion && <small className="text-danger">{t('AVISOS.ERRORES.OBLIGATORIO')}</small>}
        </div>

        <div className={styles.field}>
          <label>{t('AVISOS.CLIENTES.CIF_NIF')}</label>
          <input type="text" value={cifNif} onChange={e => setCifNif(e.target.value)} placeholder="12345678X | X12345678" maxLength={9} />
          {touched && cifNif && !CIF_NIF_RE.test(cifNif) && <small className="text-danger">{t('AVISOS.ERRORES.FORMATO_CIF_NIF')}</small>}
        </div>

        <div className={styles.field}>
          <label>{t('AVISOS.CLIENTES.EMAIL')}</label>
          <input type="text" value={email} onChange={e => setEmail(e.target.value)} placeholder={t('AVISOS.COMUN.PLACE_EMAIL')} />
          {touched && email && !EMAIL_RE.test(email) && <small className="text-danger">{t('AVISOS.ERRORES.FORMATO_EMAIL')}</small>}
        </div>

        {telefonos.map((tel, i) => (
          <div key={i} className={styles.field}>
            <label>{t('AVISOS.CLIENTES.TELEFONO', { num: i + 1 })}</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="tel" value={tel} onChange={e => updateTelefono(i, e.target.value)} style={{ flex: 1 }} />
              {i > 0 && (
                <button
                  onClick={() => removeTelefono(i)}
                  style={{
                    background: 'var(--danger)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    padding: '10px 16px',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}
                  aria-label="-"
                >
                  -
                </button>
              )}
              {i + 1 === telefonos.length && i < 1 && (
                <button
                  onClick={addTelefono}
                  style={{
                    background: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    padding: '10px 16px',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}
                  aria-label="+"
                >
                  +
                </button>
              )}
            </div>
          </div>
        ))}

        <div className={styles.footer} style={{ marginTop: 24, padding: '16px 0 0 0', borderTop: '1.5px solid var(--light-shade)' }}>
          <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => onComplete ? onComplete() : navigate('/clientes')}>
            {t('AVISOS.COMUN.CANCELAR')}
          </button>
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSubmit}>
            {t('AVISOS.COMUN.ACEPTAR')}
          </button>
        </div>
      </div>
    </div>
  );
}
