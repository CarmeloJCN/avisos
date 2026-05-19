import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import styles from './LoginPage.module.css';
import type { FormEvent } from 'react';

const EMAIL_RE = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$/;

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState(() => localStorage.getItem('email') || '');
  const [password, setPassword] = useState('');
  const [recordar, setRecordar] = useState(!!localStorage.getItem('email'));
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const emailError = touched && email === '';
  const emailFormatError = touched && email !== '' && !EMAIL_RE.test(email);
  const passError = touched && password === '';
  const passLenError = touched && password !== '' && password.length < 5;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!email || !password) return;

    setLoading(true);
    setError('');
    try {
      await login(email, password);
      if (recordar) {
        localStorage.setItem('email', email);
      } else {
        localStorage.removeItem('email');
      }
      navigate('/avisos');
    } catch (err: unknown) {
      const errorWithCode = err as { code?: string };
      let msg = t('AVISOS.ERRORES.GENERIC');
      switch (errorWithCode.code) {
        case 'auth/wrong-password':
          msg = t('AVISOS.ERRORES.WRONG_PASS');
          break;
        case 'auth/user-not-found':
          msg = t('AVISOS.ERRORES.WRONG_USER');
          break;
        case 'auth/too-many-requests':
          msg = t('AVISOS.ERRORES.TOO_MANY_REQUEST');
          break;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>{t('AVISOS.LOGIN')}</div>
      <div className={styles.content}>
        <div className={styles.welcome}>
          <h3>{t('AVISOS.LOGIN.BIENVIENIDO')}</h3>
          <h5>{t('AVISOS.LOGIN.SUBTITLE')}</h5>
        </div>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.fieldGroup}>
            <div className={styles.field}>
              <input
                type="email"
                placeholder={t('AVISOS.COMUN.PLACE_EMAIL')}
                value={email}
                onChange={e => setEmail(e.target.value)}
                onBlur={() => setTouched(true)}
              />
            </div>
            <div className="text-danger">
              {emailError && <small>{t('AVISOS.ERRORES.OBLIGATORIO')}</small>}
              {emailFormatError && <small>{t('AVISOS.ERRORES.FORMATO_EMAIL')}</small>}
            </div>
          </div>
          <div className={styles.fieldGroup}>
            <div className={styles.field}>
              <input
                type="password"
                placeholder={t('AVISOS.COMUN.PLACE_PASS')}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onBlur={() => setTouched(true)}
              />
            </div>
            <div className="text-danger">
              {passError && <small>{t('AVISOS.ERRORES.OBLIGATORIO')}</small>}
              {passLenError && <small>{t('AVISOS.ERRORES.PASS_MIN_LENGTH')}</small>}
            </div>
          </div>
          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={recordar}
              onChange={e => setRecordar(e.target.checked)}
            />
            {t('AVISOS.LOGIN.RECORDAR')}
          </label>
          {error && <div className="text-danger" style={{ marginBottom: 8 }}>{error}</div>}
          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? t('AVISOS.COMUN.LOADING_MSG') : t('AVISOS.COMUN.ACEPTAR')}
          </button>
        </form>
      </div>
    </div>
  );
}
