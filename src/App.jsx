import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Phone, 
  Hash, 
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
import './App.css';

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
  
  // URLs de webhooks
  const WEBHOOK_URL = import.meta.env.VITE_WEBHOOK_URL || 'https://n8niass.cocinandosonrisas.co/webhook/factura-electronic-Bandidos';
  const CONSULT_WEBHOOK_URL = 'https://n8niass.cocinandosonrisas.co/webhook/consultar_adquiriente_dian';
  
  // Efecto para cargar el número de mesa desde la URL
  useEffect(() => {
    const urlParams = window.location.pathname.split('/');
    if (urlParams.length > 1 && urlParams[1] && !isNaN(urlParams[1])) {
      setFormData(prev => ({ ...prev, numeroMesa: urlParams[1] }));
      setMesaFromUrl(true);
    }
  }, []);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Si se cambia algún campo base, resetear la consulta
    if (name === 'tipoDocumento' || name === 'numeroDocumento') {
      setIsConsulted(false);
      setConsultError(false);
      // Limpiar campos dependientes
      setFormData(prev => ({ ...prev, razonSocial: '', email: '' }));
    }
    
    if (name === 'telefono') {
      const cleanValue = value.replace(/[^0-9]/g, '');
      setFormData(prev => ({ ...prev, [name]: cleanValue }));
      setPhoneError(cleanValue.length > 0 && cleanValue.length !== 10);
    } else if (name === 'numeroDocumento') {
      // Permitir números y algunas letras para documentos como pasaportes
      const cleanValue = value.replace(/[^0-9A-Za-z]/g, '');
      setFormData(prev => ({ ...prev, [name]: cleanValue }));
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tipoDocumento: formData.tipoDocumento,
          numeroDocumento: formData.numeroDocumento
        })
      });

      if (response.ok) {
        const dataArray = await response.json();
        
        // La respuesta es un array, tomamos el primer elemento
        if (dataArray && dataArray.length > 0) {
          const data = dataArray[0];
          
          // Verificar si la consulta fue exitosa
          if (data.success === false) {
            // Caso cuando el NIT no existe en la base de datos
            setShowNoDataDialog(true);
            setConsultError(false);
          } else if (data.success && 
                     data.ResponseDian && 
                     data.ResponseDian.GetAcquirerResponse && 
                     data.ResponseDian.GetAcquirerResponse.GetAcquirerResult &&
                     data.ResponseDian.GetAcquirerResponse.GetAcquirerResult.StatusCode === "200") {
            
            const result = data.ResponseDian.GetAcquirerResponse.GetAcquirerResult;
            
            // Actualizar campos con la respuesta
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
    
    // Validar que se haya consultado primero
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
    
    setLoading(true);
    
    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          numeroMesa: formData.numeroMesa,
          razonSocial: formData.razonSocial,
          email: formData.email,
          tipoDocumento: formData.tipoDocumento,
          tipoDocumentoTexto: tiposDocumento[formData.tipoDocumento],
          numeroDocumento: formData.numeroDocumento,
          telefono: formData.telefono,
          timestamp: new Date().toISOString()
        })
      });
      
      if (response.ok) {
        setShowCashierDialog(true);
        setFormData({
          numeroMesa: '',
          tipoDocumento: '',
          numeroDocumento: '',
          razonSocial: '',
          email: '',
          telefono: ''
        });
        setPhoneError(false);
        setIsConsulted(false);
      } else {
        throw new Error('Error en el servidor');
      }
    } catch (error) {
      console.error('Error:', error);
      setShowError(true);
      
      setTimeout(() => {
        setShowError(false);
      }, 5000);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container">
      <div className="header">
        <div className="logo-container">
          <img 
            src="/bandidos.png" 
            alt="Bandidos Logo" 
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = '<div class="default-logo"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg></div>';
            }} 
          />
        </div>
        <h1>
          <FileText className="header-icon" />
          Solicitud de Factura Electrónica
        </h1>
      </div>
      
      <div className="form-container">
        <form onSubmit={handleSubmit}>
          {/* PASO 1: Campos iniciales */}
          <div className="form-group">
            <div className="label-container">
              <Hash className="label-icon" />
              <label htmlFor="numeroMesa">
                Número de Mesa <span className="required">*</span>
              </label>
            </div>
            <div className="input-container">
              <Hash className="input-icon" />
              <input 
                type="text" 
                id="numeroMesa" 
                name="numeroMesa" 
                value={formData.numeroMesa}
                onChange={handleInputChange}
                required
                placeholder="Ingrese el número de mesa"
                autoComplete="off"
                disabled={mesaFromUrl}
                className={mesaFromUrl ? "readonly-input" : ""}
              />
            </div>
          </div>

          <div className="form-group">
            <div className="label-container">
              <User className="label-icon" />
              <label htmlFor="tipoDocumento">
                Tipo de Documento <span className="required">*</span>
              </label>
            </div>
            <div className="select-container">
              <User className="input-icon" />
              <select 
                id="tipoDocumento" 
                name="tipoDocumento" 
                value={formData.tipoDocumento}
                onChange={handleInputChange}
                required
                className="select-input"
              >
                <option value="">Seleccione tipo de documento</option>
                {Object.entries(tiposDocumento).map(([codigo, nombre]) => (
                  <option key={codigo} value={codigo}>
                    {nombre}
                  </option>
                ))}
              </select>
              <ChevronDown className="select-icon" />
            </div>
          </div>

          <div className="form-group">
            <div className="label-container">
              <CreditCard className="label-icon" />
              <label htmlFor="numeroDocumento">
                Número de Documento <span className="required">*</span>
              </label>
            </div>
            <div className="input-container" style={{position: 'relative'}}>
              <CreditCard className="input-icon" />
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
              />
              {showDocumentTooltip && (
                <div className="tooltip">
                  <Info className="tooltip-icon" />
                  <span>Ingrese el NIT sin el dígito de verificación. Ejemplo: 900123456 (no 900123456-7)</span>
                </div>
              )}
            </div>
          </div>

          {/* Botón Consultar */}
          <button 
            type="button" 
            className="consult-button" 
            onClick={handleConsult}
            disabled={consultLoading || !formData.tipoDocumento || !formData.numeroDocumento}
          >
            {consultLoading ? (
              <>
                <Loader2 className="button-icon animate-spin" />
                Consultando...
              </>
            ) : (
              <>
                <Search className="button-icon" />
                Consultar
              </>
            )}
          </button>

          {/* Mensaje de error de consulta */}
          {consultError && (
            <div className="message error-alert" style={{display: 'flex'}}>
              <AlertCircle className="message-icon" />
              {!isConsulted ? 'Debe consultar los datos antes de continuar' : 'Error al consultar. Verifique los datos ingresados.'}
            </div>
          )}

          {/* Modal de instrucción cuando no se encuentran datos */}
          {showNoDataDialog && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <Info className="modal-icon" />
                  <h3>NIT no encontrado</h3>
                  <button 
                    className="modal-close" 
                    onClick={() => setShowNoDataDialog(false)}
                  >
                    <X className="close-icon" />
                  </button>
                </div>
                <div className="modal-body">
                  <p>
                    No se encontraron datos para el documento ingresado. 
                    Por favor, verifique que haya ingresado <strong>únicamente el número del documento sin el dígito de verificación</strong>.
                  </p>
                  <p className="modal-example">
                    <strong>Ejemplo:</strong> Si su NIT es 900123456-7, ingrese solamente: <strong>900123456</strong>
                  </p>
                </div>
                <div className="modal-footer">
                  <button 
                    className="modal-button" 
                    onClick={() => setShowNoDataDialog(false)}
                  >
                    Entendido
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal de confirmación del cajero */}
          {showCashierDialog && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <UserCheck className="modal-icon" />
                  <h3>Solicitud Enviada</h3>
                  <button 
                    className="modal-close" 
                    onClick={() => setShowCashierDialog(false)}
                  >
                    <X className="close-icon" />
                  </button>
                </div>
                <div className="modal-body">
                  <p>
                    <strong>¡Perfecto!</strong> Su solicitud de factura electrónica ha sido enviada exitosamente.
                  </p>
                  
                  <div className="cashier-info">
                    <p><strong>✅ El cajero del restaurante ya ha recibido la información necesaria para elaborar su factura electrónica.</strong></p>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    className="modal-button" 
                    onClick={() => setShowCashierDialog(false)}
                  >
                    Entendido
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PASO 2: Campos que aparecen después de consultar */}
          {isConsulted && (
            <>
              <div className="form-group">
                <div className="label-container">
                  <Building2 className="label-icon" />
                  <label htmlFor="razonSocial">
                    Razón Social <span className="required">*</span>
                  </label>
                </div>
                <div className="input-container">
                  <Building2 className="input-icon" />
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
                    className="readonly-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="label-container">
                  <Mail className="label-icon" />
                  <label htmlFor="email">
                    Correo Electrónico <span className="required">*</span>
                  </label>
                </div>
                <div className="input-container">
                  <Mail className="input-icon" />
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="correo@empresa.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="label-container">
                  <Phone className="label-icon" />
                  <label htmlFor="telefono">
                    Teléfono <span className="required">*</span> (10 dígitos)
                  </label>
                </div>
                <div className="input-container">
                  <Phone className="input-icon" />
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
                  />
                </div>
                {phoneError && (
                  <div className="error-message">
                    <AlertCircle className="error-icon" />
                    El teléfono debe tener exactamente 10 dígitos
                  </div>
                )}
              </div>

              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? (
                  <>
                    <span className="loading"></span>
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="button-icon" />
                    Solicitar
                  </>
                )}
              </button>
            </>
          )}

          {showSuccess && (
            <div className="message success-message">
              <CheckCircle className="message-icon" />
              Solicitud enviada exitosamente
            </div>
          )}

          {showError && (
            <div className="message error-alert">
              <AlertCircle className="message-icon" />
              Error al enviar la solicitud. Por favor, intente nuevamente.
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default App;