import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Phone,
  Utensils,
  CreditCard,
  FileText,
  CheckCircle,
  AlertCircle,
  Send,
  Mail,
  User,
  ChevronDown,
  Search,
  Loader2,
  X,
  Info,
  UserCheck
} from 'lucide-react';

// Determina el logo priorizando el dominio, con fallback por puerto
const getLogoSrc = () => {
  try {
    const host = typeof window !== 'undefined' ? window.location.hostname.toLowerCase() : '';

    // Por dominio (mapeo explícito)
    if (host === 'facturacion.sumorestaurante.co') return '/logo-sumo.png';
    if (host === 'facturacion.lenosyparrilla.co') return '/Logolenos.png';
    if (host === 'facturacion.bandidos.co') return '/bandidos.png';

    // Fallback por puerto (útil en entornos de prueba)
    const proto = typeof window !== 'undefined' ? window.location.protocol : '';
    const rawPort = typeof window !== 'undefined' ? window.location.port : '';
    const port = rawPort || (proto === 'http:' ? '80' : proto === 'https:' ? '443' : '');

    if (port === '81') return '/logo-sumo.png';
    if (port === '83') return '/Logolenos.png';
    if (port === '82') return '/logo-82.png';
    return '/bandidos.png';
  } catch {
    return '/bandidos.png';
  }
};

const logoErrorHandler = (e) => {
  e.target.style.display = 'none';
  e.target.parentElement.innerHTML = '<div class="w-[60px] h-[60px] text-primary-400"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg></div>';
};

function App() {
  const tiposDocumento = {
    '11': 'Registro civil',
    '12': 'Tarjeta de identidad',
    '13': 'Cédula de ciudadanía',
    '21': 'Tarjeta de extranjería',
    '22': 'Cédula de extranjería',
    '31': 'NIT',
    '41': 'Pasaporte',
    '42': 'Documento de identificación extranjero',
    '47': 'PEP (Permiso Especial de Permanencia)',
    '48': 'PPT (Permiso Protección Temporal)',
    '50': 'NIT de otro país',
    '91': 'NUIP'
  };

  const [formData, setFormData] = useState({
    numeroMesa: '',
    mesaId: '',
    tipoDocumento: '',
    numeroDocumento: '',
    razonSocial: '',
    email: '',
    telefono: ''
  });

  const [loading, setLoading] = useState(false);
  const [consultLoading, setConsultLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [isConsulted, setIsConsulted] = useState(false);
  const [consultError, setConsultError] = useState(false);
  const [showNoDataDialog, setShowNoDataDialog] = useState(false);
  const [showCashierDialog, setShowCashierDialog] = useState(false);
  const [mesaFromUrl, setMesaFromUrl] = useState(false);
  const [showDocumentTooltip, setShowDocumentTooltip] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState('');
  const [showExpiredLinkDialog, setShowExpiredLinkDialog] = useState(false);
  const [isLinkValid, setIsLinkValid] = useState(true);

  // URLs de webhooks
  const WEBHOOK_URL = import.meta.env.VITE_WEBHOOK_URL || 'https://n8niass.cocinandosonrisas.co/webhook/factura-electronic-Bandidos';
  const CONSULT_WEBHOOK_URL = 'https://n8niass.cocinandosonrisas.co/webhook/consultar_adquiriente_dian';

  // Mapeo de tipos de documento a Odoo ID
  const getDocumentoIDOdoo = (tipoDocumento) => {
    if (tipoDocumento === '13') return 3;
    if (tipoDocumento === '31') return 6;
    if (tipoDocumento === '41') return 7;
    return null;
  };

  // Efecto para cargar el número de mesa y mesa_id desde la URL y validar timestamp
  useEffect(() => {
    const urlParams = window.location.pathname.split('/');
    const queryParams = new URLSearchParams(window.location.search);
    const timestamp = queryParams.get('ts');

    if (timestamp) {
      const linkTime = parseInt(timestamp) * 1000;
      const currentTime = Date.now();
      const tenMinutesInMs = 10 * 60 * 1000;

      if (currentTime - linkTime > tenMinutesInMs) {
        setIsLinkValid(false);
        setShowExpiredLinkDialog(true);
        return;
      }
    }

    if (urlParams.length > 1 && urlParams[1] && !isNaN(urlParams[1])) {
      setFormData(prev => ({
        ...prev,
        numeroMesa: urlParams[1],
        mesaId: urlParams[2] || ''
      }));
      setMesaFromUrl(true);
      setIsLinkValid(true);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'tipoDocumento' || name === 'numeroDocumento') {
      setIsConsulted(false);
      setConsultError(false);
      setEmailError(false);
      setEmailErrorMessage('');
      setFormData(prev => ({ ...prev, razonSocial: '', email: '' }));
    }

    if (name === 'telefono') {
      const cleanValue = value.replace(/[^0-9]/g, '');
      setFormData(prev => ({ ...prev, [name]: cleanValue }));
      setPhoneError(cleanValue.length > 0 && cleanValue.length !== 10);
    } else if (name === 'numeroDocumento') {
      const cleanValue = value.replace(/[^0-9A-Za-z]/g, '');
      setFormData(prev => ({ ...prev, [name]: cleanValue }));
    } else if (name === 'email') {
      let cleanValue = value.replace(/[,;]/g, '').replace(/\s+/g, ' ').trim();
      const hasSeparators = value.includes(',') || value.includes(';');
      const atCount = (cleanValue.match(/@/g) || []).length;

      setFormData(prev => ({ ...prev, [name]: cleanValue }));

      if (cleanValue.trim() !== '') {
        if (hasSeparators) {
          setEmailError(true);
          setEmailErrorMessage('Solo se permite un correo electrónico');
        } else if (atCount > 1) {
          setEmailError(true);
          setEmailErrorMessage('Solo se permite un correo electrónico');
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(cleanValue)) {
            setEmailError(true);
            setEmailErrorMessage('Ingrese un correo electrónico válido');
          } else {
            setEmailError(false);
            setEmailErrorMessage('');
          }
        }
      } else {
        setEmailError(false);
        setEmailErrorMessage('');
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleConsult = async () => {
    if (!formData.tipoDocumento || !formData.numeroDocumento) {
      setConsultError(true);
      return;
    }

    setConsultLoading(true);
    setConsultError(false);

    try {
      const response = await fetch(CONSULT_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipoDocumento: formData.tipoDocumento,
          numeroDocumento: formData.numeroDocumento
        })
      });

      if (response.ok) {
        const dataArray = await response.json();

        if (dataArray && dataArray.length > 0) {
          const data = dataArray[0];

          if (data.success === false) {
            setShowNoDataDialog(true);
            setConsultError(false);
          } else if (data.success &&
                     data.ResponseDian &&
                     data.ResponseDian.GetAcquirerResponse &&
                     data.ResponseDian.GetAcquirerResponse.GetAcquirerResult &&
                     data.ResponseDian.GetAcquirerResponse.GetAcquirerResult.StatusCode === "200") {

            const result = data.ResponseDian.GetAcquirerResponse.GetAcquirerResult;
            setFormData(prev => ({
              ...prev,
              razonSocial: result.ReceiverName || '',
              email: result.ReceiverEmail || ''
            }));
            setIsConsulted(true);
          } else {
            setShowNoDataDialog(true);
            setConsultError(false);
          }
        } else {
          setShowNoDataDialog(true);
          setConsultError(false);
        }
      } else {
        setShowNoDataDialog(true);
        setConsultError(false);
      }
    } catch (error) {
      console.error('Error:', error);
      setShowNoDataDialog(true);
      setConsultError(false);
    } finally {
      setConsultLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLinkValid) return;
    if (!isConsulted) {
      setConsultError(true);
      return;
    }

    setShowSuccess(false);
    setShowError(false);

    if (formData.telefono.length !== 10) {
      setPhoneError(true);
      return;
    }

    if (emailError) return;

    setLoading(true);

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numeroMesa: formData.numeroMesa,
          mesaId: formData.mesaId,
          razonSocial: formData.razonSocial,
          email: formData.email,
          tipoDocumento: formData.tipoDocumento,
          tipoDocumentoTexto: tiposDocumento[formData.tipoDocumento],
          numeroDocumento: formData.numeroDocumento,
          telefono: formData.telefono,
          documentoID_Odoo: getDocumentoIDOdoo(formData.tipoDocumento),
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        setShowCashierDialog(true);
        setFormData({
          numeroMesa: '',
          mesaId: '',
          tipoDocumento: '',
          numeroDocumento: '',
          razonSocial: '',
          email: '',
          telefono: ''
        });
        setPhoneError(false);
        setEmailError(false);
        setEmailErrorMessage('');
        setIsConsulted(false);
      } else {
        throw new Error('Error en el servidor');
      }
    } catch (error) {
      console.error('Error:', error);
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => (
    <>
      {/* ── Header ──────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-primary-700 to-primary-800 px-8 py-9 text-center relative max-sm:px-7 max-sm:py-7">
        <div className="w-[130px] h-[130px] mx-auto mb-5 rounded-full flex items-center justify-center overflow-hidden drop-shadow-[0_8px_16px_rgba(0,0,0,0.3)] ring-2 ring-white/10 max-sm:w-[110px] max-sm:h-[110px]">
          <img
            src={getLogoSrc()}
            alt="Logo"
            className="w-[105%] h-[105%] object-cover"
            onError={logoErrorHandler}
          />
        </div>
        <h1
          className="text-accent-400 text-[26px] font-bold flex items-center justify-center gap-2.5 max-sm:text-[22px]"
          style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.3)' }}
        >
          <FileText className="w-7 h-7 max-sm:w-6 max-sm:h-6" />
          Datos de tu Factura Electrónica
        </h1>
      </div>

      {/* ── Form ────────────────────────────────────────── */}
      <div className="px-8 py-10 max-sm:px-6 max-sm:py-8">
        <form onSubmit={handleSubmit} className="space-y-7">

          {/* Número de Mesa */}
          <div className="relative">
            <div className="flex items-center gap-2 mb-2.5">
              <Utensils className="w-[18px] h-[18px] text-primary-400" />
              <label htmlFor="numeroMesa" className="text-sm font-semibold text-neutral-400 tracking-wide">
                Número de Mesa <span className="text-primary-400 font-bold">*</span>
              </label>
            </div>
            <div className="relative flex items-center">
              <Utensils className="absolute left-4 w-5 h-5 text-primary-400/60 pointer-events-none z-10" />
              <input
                type="text"
                id="numeroMesa"
                name="numeroMesa"
                value={formData.numeroMesa}
                onChange={handleInputChange}
                required
                placeholder="Ingrese el número de mesa"
                autoComplete="off"
                disabled={mesaFromUrl || !isLinkValid}
                className={mesaFromUrl ? "glass-input-readonly" : "glass-input"}
              />
            </div>
          </div>

          {/* Tipo de Documento */}
          <div className="relative">
            <div className="flex items-center gap-2 mb-2.5">
              <User className="w-[18px] h-[18px] text-primary-400" />
              <label htmlFor="tipoDocumento" className="text-sm font-semibold text-neutral-400 tracking-wide">
                Tipo de Documento <span className="text-primary-400 font-bold">*</span>
              </label>
            </div>
            <div className="relative flex items-center">
              <User className="absolute left-4 w-5 h-5 text-primary-400/60 pointer-events-none z-10" />
              <select
                id="tipoDocumento"
                name="tipoDocumento"
                value={formData.tipoDocumento}
                onChange={handleInputChange}
                required
                className="glass-select"
                disabled={!isLinkValid}
              >
                <option value="" className="bg-neutral-800 text-neutral-400">Seleccione tipo de documento</option>
                {Object.entries(tiposDocumento).map(([codigo, nombre]) => (
                  <option key={codigo} value={codigo} className="bg-neutral-800 text-white">
                    {nombre}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 w-5 h-5 text-primary-400/60 pointer-events-none" />
            </div>
          </div>

          {/* Número de Documento */}
          <div className="relative">
            <div className="flex items-center gap-2 mb-2.5">
              <CreditCard className="w-[18px] h-[18px] text-primary-400" />
              <label htmlFor="numeroDocumento" className="text-sm font-semibold text-neutral-400 tracking-wide">
                Número de Documento <span className="text-primary-400 font-bold">*</span>
              </label>
            </div>
            <div className="relative flex items-center">
              <CreditCard className="absolute left-4 w-5 h-5 text-primary-400/60 pointer-events-none z-10" />
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                id="numeroDocumento"
                name="numeroDocumento"
                value={formData.numeroDocumento}
                onChange={handleInputChange}
                onFocus={() => setShowDocumentTooltip(true)}
                onBlur={() => setShowDocumentTooltip(false)}
                required
                placeholder="Ingrese el número del documento"
                maxLength="15"
                autoComplete="off"
                disabled={!isLinkValid}
                className="glass-input"
              />
              <AnimatePresence>
                {showDocumentTooltip && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 right-0 mt-2 glass-dark rounded-lg px-3 py-2 text-xs text-neutral-300 z-50 flex items-center gap-1.5"
                  >
                    <Info className="w-3.5 h-3.5 shrink-0 text-primary-400" />
                    <span>Ingrese el NIT sin el dígito de verificación. Ejemplo: 900123456 (no 900123456-7)</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Botón Consultar */}
          <div className="relative">
            <motion.button
              type="button"
              className="btn-secondary mt-2"
              onClick={handleConsult}
              disabled={consultLoading || !formData.tipoDocumento || !formData.numeroDocumento || !isLinkValid}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              {consultLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Consultando...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Consultar
                </>
              )}
            </motion.button>
          </div>

          {/* Error de consulta */}
          <AnimatePresence>
            {consultError && (
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="flex items-center justify-center gap-2.5 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium"
              >
                <AlertCircle className="w-5 h-5" />
                {!isConsulted ? 'Debe consultar los datos antes de continuar' : 'Error al consultar. Verifique los datos ingresados.'}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Campos post-consulta ─────────────────────── */}
          <AnimatePresence>
            {isConsulted && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="space-y-7"
              >
                {/* Razón Social */}
                <div className="relative">
                  <div className="flex items-center gap-2 mb-2.5">
                    <Building2 className="w-[18px] h-[18px] text-primary-400" />
                    <label htmlFor="razonSocial" className="text-sm font-semibold text-neutral-400 tracking-wide">
                      Razón Social <span className="text-primary-400 font-bold">*</span>
                    </label>
                  </div>
                  <div className="relative flex items-center">
                    <Building2 className="absolute left-4 w-5 h-5 text-primary-400/60 pointer-events-none z-10" />
                    <input
                      type="text"
                      id="razonSocial"
                      name="razonSocial"
                      value={formData.razonSocial}
                      onChange={handleInputChange}
                      required
                      placeholder="Razón social de la empresa"
                      autoComplete="organization"
                      readOnly
                      className="glass-input-readonly"
                      disabled={!isLinkValid}
                    />
                  </div>
                </div>

                {/* Correo Electrónico */}
                <div className="relative">
                  <div className="flex items-center gap-2 mb-2.5">
                    <Mail className="w-[18px] h-[18px] text-primary-400" />
                    <label htmlFor="email" className="text-sm font-semibold text-neutral-400 tracking-wide">
                      Correo Electrónico <span className="text-primary-400 font-bold">*</span>
                    </label>
                  </div>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-4 w-5 h-5 text-primary-400/60 pointer-events-none z-10" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="correo@empresa.com"
                      autoComplete="email"
                      disabled={!isLinkValid}
                      className="glass-input"
                    />
                  </div>
                  <AnimatePresence>
                    {emailError && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-1.5 mt-1.5 text-red-400 text-xs"
                      >
                        <AlertCircle className="w-3.5 h-3.5" />
                        {emailErrorMessage || 'Ingrese un correo electrónico válido'}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Teléfono */}
                <div className="relative">
                  <div className="flex items-center gap-2 mb-2.5">
                    <Phone className="w-[18px] h-[18px] text-primary-400" />
                    <label htmlFor="telefono" className="text-sm font-semibold text-neutral-400 tracking-wide">
                      Teléfono <span className="text-primary-400 font-bold">*</span> (10 dígitos)
                    </label>
                  </div>
                  <div className="relative flex items-center">
                    <Phone className="absolute left-4 w-5 h-5 text-primary-400/60 pointer-events-none z-10" />
                    <input
                      type="tel"
                      id="telefono"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      required
                      pattern="[0-9]{10}"
                      maxLength="10"
                      placeholder="3001234567"
                      autoComplete="tel"
                      disabled={!isLinkValid}
                      className="glass-input"
                    />
                  </div>
                  <AnimatePresence>
                    {phoneError && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-1.5 mt-1.5 text-red-400 text-xs"
                      >
                        <AlertCircle className="w-3.5 h-3.5" />
                        El teléfono debe tener exactamente 10 dígitos
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Botón Solicitar */}
                <motion.button
                  type="submit"
                  className="btn-primary"
                  disabled={loading || !isLinkValid}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Solicitar
                    </>
                  )}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mensajes de éxito/error */}
          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="flex items-center justify-center gap-2.5 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium"
              >
                <CheckCircle className="w-5 h-5" />
                Solicitud enviada exitosamente
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showError && (
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="flex items-center justify-center gap-2.5 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium"
              >
                <AlertCircle className="w-5 h-5" />
                Error al enviar la solicitud. Por favor, intente nuevamente.
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>
    </>
  );

  /* ── Modal: NIT no encontrado ─────────────────────────── */
  const renderNoDataModal = () => (
    <AnimatePresence>
      {showNoDataDialog && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-5"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="glass-effect rounded-2xl w-full max-w-[450px] max-sm:w-[95%] shadow-2xl shadow-black/40"
          >
            <div className="px-6 pt-6 flex items-center gap-3 relative max-sm:px-5 max-sm:pt-5">
              <Info className="w-6 h-6 text-primary-400" />
              <h3 className="text-lg font-bold text-white flex-1 max-sm:text-base">
                NIT no encontrado
              </h3>
              <button
                onClick={() => setShowNoDataDialog(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5 max-sm:px-5 max-sm:py-4">
              <p className="text-neutral-300 leading-relaxed text-sm mb-3">
                No se encontraron datos para el documento ingresado.
                Por favor, verifique que haya ingresado <strong className="text-white">únicamente el número del documento sin el dígito de verificación</strong>.
              </p>
              <div
                className="glass-dark rounded-xl p-4 border-l-4 mt-4"
                style={{ borderLeftColor: '#0d8ac5' }}
              >
                <p className="text-neutral-300 text-sm m-0">
                  <strong className="text-white">Ejemplo:</strong> Si su NIT es 900123456-7, ingrese solamente: <strong className="text-primary-400">900123456</strong>
                </p>
              </div>
            </div>

            <div className="px-6 pb-6 flex justify-center max-sm:px-5 max-sm:pb-5">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowNoDataDialog(false)}
                className="px-8 py-3 rounded-xl text-sm font-semibold uppercase tracking-wider bg-gradient-to-r from-primary-600 to-primary-500 text-white border border-primary-500/30 hover:shadow-lg hover:shadow-primary-500/20 transition-all"
              >
                Entendido
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  /* ── Modal: Solicitud Enviada ──────────────────────────── */
  const renderCashierModal = () => (
    <AnimatePresence>
      {showCashierDialog && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-5"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="glass-effect rounded-2xl w-full max-w-[450px] max-sm:w-[95%] shadow-2xl shadow-black/40"
          >
            <div className="px-6 pt-6 flex items-center gap-3 relative max-sm:px-5 max-sm:pt-5">
              <UserCheck className="w-6 h-6 text-green-400" />
              <h3 className="text-lg font-bold text-white flex-1 max-sm:text-base">
                Solicitud Enviada
              </h3>
              <button
                onClick={() => setShowCashierDialog(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5 max-sm:px-5 max-sm:py-4">
              <p className="text-neutral-300 leading-relaxed text-sm mb-4">
                <strong className="text-white">¡Perfecto!</strong> Su solicitud de factura electrónica ha sido enviada exitosamente.
              </p>
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-5 text-center">
                <p className="text-green-400 text-sm font-semibold m-0">
                  ✅ El cajero del restaurante ya ha recibido la información necesaria para elaborar su factura electrónica.
                </p>
              </div>
            </div>

            <div className="px-6 pb-6 flex justify-center max-sm:px-5 max-sm:pb-5">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowCashierDialog(false)}
                className="px-8 py-3 rounded-xl text-sm font-semibold uppercase tracking-wider bg-gradient-to-r from-primary-600 to-primary-500 text-white border border-primary-500/30 hover:shadow-lg hover:shadow-primary-500/20 transition-all"
              >
                Entendido
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  /* ── Modal: Enlace Expirado ────────────────────────────── */
  const renderExpiredModal = () => {
    if (!showExpiredLinkDialog) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-5"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-effect rounded-2xl w-full max-w-[450px] max-sm:w-[95%] shadow-2xl shadow-black/40"
        >
          <div className="px-6 pt-6 flex items-center gap-3 max-sm:px-5 max-sm:pt-5">
            <AlertCircle className="w-6 h-6 text-red-400" />
            <h3 className="text-lg font-bold text-red-400 max-sm:text-base">Enlace Expirado</h3>
          </div>

          <div className="px-6 py-5 max-sm:px-5 max-sm:py-4">
            <div className="w-[130px] h-[130px] mx-auto mb-5 rounded-full flex items-center justify-center overflow-hidden ring-2 ring-white/10 max-sm:w-[110px] max-sm:h-[110px]">
              <img
                src={getLogoSrc()}
                alt="Logo"
                className="w-[105%] h-[105%] object-cover"
                onError={logoErrorHandler}
              />
            </div>

            <p className="text-neutral-300 leading-relaxed text-sm mb-2">
              <strong className="text-white">¡Lo sentimos!</strong> Este enlace de facturación electrónica ha <strong className="text-red-400">expirado</strong>.
            </p>
            <p className="text-neutral-300 leading-relaxed text-sm mb-4">
              Los enlaces de facturación tienen una validez de <strong className="text-white">10 minutos</strong> por motivos de seguridad.
            </p>

            <div className="glass-dark rounded-xl p-4 text-center">
              <p className="text-neutral-400 text-sm m-0">
                <strong className="text-accent-400">💡 ¿Qué puedes hacer?</strong><br/>
                Solicita un nuevo enlace de facturación a tu mesero o en caja
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  /* ── Render principal ──────────────────────────────────── */
  if (!isLinkValid) {
    return (
      <div className="min-h-screen flex items-center justify-center p-5 relative">
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-primary-500/[0.06] rounded-full blur-[120px]" />
          <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-accent-500/[0.04] rounded-full blur-[100px]" />
        </div>
        {renderExpiredModal()}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-5 relative">
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-primary-500/[0.06] rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-accent-500/[0.04] rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="glass-effect rounded-2xl w-full max-w-[520px] overflow-hidden mx-auto"
      >
        {renderContent()}
      </motion.div>

      {renderNoDataModal()}
      {renderCashierModal()}
      {renderExpiredModal()}
    </div>
  );
}

export default App;
