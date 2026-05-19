import { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDatos } from '../../../contexts/DatosContext';
import { updateDocument } from '../../../hooks/useFirestore';
import { uploadPdf } from '../../../lib/storage';
import styles from './CierreTab.module.css';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type { Options as DomToImageOptions } from 'dom-to-image';
import type { Aviso } from '../../../types/models';

interface Props {
  onComplete: () => void;
}

export default function CierreTab({ onComplete }: Props) {
  const { t } = useTranslation();
  const { avisoElegido } = useDatos();
  const aviso = avisoElegido!;

  const [intervencion, setIntervencion] = useState(aviso.intervencion || '');
  const [inicioAviso, setInicioAviso] = useState(
    aviso.inicioAviso ? new Date(aviso.inicioAviso).toISOString().slice(0, 16) : ''
  );
  const [precio, setPrecio] = useState(aviso.precio ? String(aviso.precio) : '');
  const [noFirma, setNoFirma] = useState(false);
  const [loading, setLoading] = useState(false);

  // Canvas signature state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [firmaDataUrl, setFirmaDataUrl] = useState<string>('');

  const getCtx = useCallback(() => {
    return canvasRef.current?.getContext('2d');
  }, []);

  useEffect(() => {
    // Restore offline signature from localStorage
    const stored = localStorage.getItem(aviso.numAviso);
    if (stored && canvasRef.current) {
      const img = new Image();
      img.onload = () => {
        const ctx = getCtx();
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          setFirmaDataUrl(canvasRef.current!.toDataURL('image/png', 0.5));
          setHasSignature(true);
        }
      };
      img.src = JSON.parse(stored);
    }
  }, [aviso.numAviso, getCtx]);

  const startDrawing = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (noFirma) return;
    const ctx = getCtx();
    if (!ctx) return;
    setIsDrawing(true);
    const rect = canvasRef.current!.getBoundingClientRect();
    const scaleX = rect.width ? (canvasRef.current!.width / rect.width) : 1;
    const scaleY = rect.height ? (canvasRef.current!.height / rect.height) : 1;
    ctx.beginPath();
    ctx.moveTo((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
  };

  const draw = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || noFirma) return;
    const ctx = getCtx();
    if (!ctx) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const scaleX = rect.width ? (canvasRef.current!.width / rect.width) : 1;
    const scaleY = rect.height ? (canvasRef.current!.height / rect.height) : 1;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'black';
    ctx.lineTo((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      if (canvasRef.current) {
        const dataUrl = canvasRef.current.toDataURL('image/png', 0.5);
        setFirmaDataUrl(dataUrl);
        setHasSignature(true);
      }
    }
  };

  const clearSignature = () => {
    const ctx = getCtx();
    if (!ctx) return;
    ctx.clearRect(0, 0, 350, 120);
    setFirmaDataUrl('');
    setHasSignature(false);
  };

  const handleAceptar = async () => {
    if (!intervencion) return;

    if (!noFirma && !hasSignature) {
      alert(t('AVISOS.ERRORES.FIRMA_NO_FIRMADO'));
      return;
    }

    setLoading(true);

    const now = new Date().toISOString();

    // Build update data
    const updateData: Partial<Aviso> = {
      intervencion,
      precio: parseFloat(precio) || '',
      inicioAviso: inicioAviso ? new Date(inicioAviso) : null,
      fechaFin: now,
      cerrado: true
    };

    if (navigator.onLine) {
      // Online: upload PDF
      updateData.cerrado = true;
      await updateDocument('avisos', aviso.id!, updateData);
      await generateAndUploadPdf();

      if (localStorage.getItem(aviso.numAviso)) {
        localStorage.removeItem(aviso.numAviso);
      }
    } else {
      // Offline: store signature in localStorage
      if (!noFirma) {
        localStorage.setItem(aviso.numAviso, JSON.stringify(firmaDataUrl));
      }
      await updateDocument('avisos', aviso.id!, updateData);
    }

    setLoading(false);
    onComplete();
  };

  const generateAndUploadPdf = async () => {
    const logo = new Image();
    logo.src = '/assets/icons/icon-512x512.png';
    await new Promise(resolve => { logo.onload = resolve; });

    // Create a hidden div for PDF rendering
    const pdfDiv = document.createElement('div');
    pdfDiv.style.cssText = 'width: 600px; padding: 24px; font-family: Arial, sans-serif; background: white; position: fixed; left: -9999px; top: 0;';
    pdfDiv.innerHTML = buildPdfHtml(logo);
    document.body.appendChild(pdfDiv);

    try {
      const domtoimage = await import('dom-to-image');
      const jsPDF = (await import('jspdf')).default;

      const dataUrl = await domtoimage.default.toPng(pdfDiv, { bgcolor: 'white', height: 842, width: 600 } as DomToImageOptions);
      const doc = new jsPDF('p', 'mm', 'a4');
      const imgHeight = 842 * 208 / 600;
      doc.addImage(dataUrl, 'PNG', 0, 0, 208, imgHeight);
      const blob = doc.output('blob');

      const pdfUrl = await uploadPdf(aviso.numAviso, blob);
      await updateDocument('avisos', aviso.id!, { pdf: pdfUrl });
    } finally {
      document.body.removeChild(pdfDiv);
    }
  };

  const buildPdfHtml = (logoImg: HTMLImageElement) => {
    const c = aviso.cliente;
    return `
      <div style="display: flex; justify-content: space-between;">
        <img src="${logoImg.src}" width="60" />
        <div>
          <div><strong>${t('AVISOS.CLIENTES.NOMBRE')}:</strong> ${c?.nombre}</div>
          <div><strong>${t('AVISOS.CLIENTES.DIRECCION')}:</strong> ${c?.direccion}</div>
          <div><strong>${t('AVISOS.CLIENTES.CIF_NIF')}:</strong> ${c?.cifNif}</div>
          <div><strong>${t('AVISOS.CLIENTES.EMAIL')}:</strong> ${c?.email}</div>
          <div><strong>${t('AVISOS.AVISO.DETALLE.INFO.TLFNO')}:</strong> ${c?.telefono?.join(', ')}</div>
        </div>
      </div>
      <hr />
      <div style="display: flex; justify-content: space-between;">
        <div><strong>${t('AVISOS.AVISO.DETALLE.CIERRE.HORA_INICIO')}:</strong> ${inicioAviso || ''}</div>
        <div><strong>${t('AVISOS.AVISO.DETALLE.CIERRE.FECHA_CIERRE')}:</strong> ${new Date().toLocaleDateString()}</div>
      </div>
      <hr />
      <div><strong>${t('AVISOS.AVISO.DETALLE.INFO.TITLE')}:</strong><br/>${aviso.descripcionAviso}</div>
      <div><strong>${t('AVISOS.AVISO.DETALLE.CIERRE.DATOS_INTER')}:</strong><br/>${intervencion}</div>
      <hr />
      <div style="display: flex; justify-content: space-between;">
        <div><strong>${t('AVISOS.AVISO.DETALLE.CIERRE.PRECIO')}:</strong> ${precio ? `${precio} EUR` : ''}</div>
        <div>
          <strong>${t('AVISOS.AVISO.DETALLE.CIERRE.FIRMADO')}:</strong><br/>
          ${!noFirma && firmaDataUrl ? `<img src="${firmaDataUrl}" width="150" />` : t('AVISOS.AVISO.DETALLE.CIERRE.NO_FIRMA')}
        </div>
      </div>
    `;
  };

  return (
    <>
      <div className={styles.content}>
        <div className={styles.center}>
          <div className={styles.avisoNum}>{t('AVISOS.AVISO.DETALLE.INFO.AVISO')} {aviso.numAviso}</div>
        </div>

        <div className={styles.sectionTitle}>{t('AVISOS.AVISO.DETALLE.CIERRE.DATOS_INTER')}</div>
        <div className={styles.box}>
          <div className={styles.field}>
            <label>{t('AVISOS.AVISO.DETALLE.CIERRE.PRECIO')}</label>
            <input type="number" value={precio} onChange={e => setPrecio(e.target.value)} maxLength={5} />
          </div>
          <div className={styles.field}>
            <label>{t('AVISOS.AVISO.DETALLE.CIERRE.HORA_INICIO')}</label>
            <input type="datetime-local" value={inicioAviso} onChange={e => setInicioAviso(e.target.value)} />
          </div>
          <div className={styles.field}>
            <label>{t('AVISOS.AVISO.DETALLE.CIERRE.INTERVENCION')}</label>
            <textarea value={intervencion} onChange={e => setIntervencion(e.target.value)} />
          </div>
        </div>

        <label className={styles.noFirma}>
          <input type="checkbox" checked={noFirma} onChange={() => { setNoFirma(!noFirma); clearSignature(); }} />
          {t('AVISOS.AVISO.DETALLE.CIERRE.NO_FIRMA')}
        </label>

        {!noFirma && (
          <div className={styles.firmaSection}>
            <div className={styles.firmaHeader}>
              <label>{t('AVISOS.AVISO.DETALLE.CIERRE.FIRMAR')}</label>
              <button className={styles.clearBtn} onClick={clearSignature}>
                {t('AVISOS.AVISO.DETALLE.CIERRE.BORRAR_FIRMA')}
              </button>
            </div>
            <canvas
              ref={canvasRef}
              className={styles.canvas}
              width={350}
              height={120}
              onPointerDown={startDrawing}
              onPointerMove={draw}
              onPointerUp={stopDrawing}
              onPointerLeave={stopDrawing}
              style={{ touchAction: 'none' }}
            />
          </div>
        )}
      </div>

      <div className={styles.footer}>
        <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={onComplete}>
          {t('AVISOS.COMUN.CANCELAR')}
        </button>
        <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleAceptar}>
          {t('AVISOS.COMUN.ACEPTAR')}
        </button>
      </div>

      {loading && (
        <div className={styles.loading}>
          <div className={styles.loadingBox}>{t('AVISOS.COMUN.LOADING_MSG')}</div>
        </div>
      )}
    </>
  );
}
