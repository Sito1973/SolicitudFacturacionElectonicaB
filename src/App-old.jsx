import React, { useState } from 'react';
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
  Loader2
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
  
  // URLs de webhooks
  const WEBHOOK_URL = import.meta.env.VITE_WEBHOOK_URL || 'https://n8niass.cocinandosonrisas.co/webhook/factura-electronic-Bandidos';
  const CONSULT_WEBHOOK_URL = 'https://n8niass.cocinandosonrisas.co/webhook/consultar_adquiriente_dian';
  
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
        const data = await response.json();
        
        // Actualizar campos con la respuesta
        setFormData(prev => ({
          ...prev,
          razonSocial: data.razonSocial || data.nombre || '',
          email: data.email || data.correo || ''
        }));
        
        setIsConsulted(true);
      } else {
        throw new Error('No se encontraron datos');
      }
    } catch (error) {
      console.error('Error:', error);
      setConsultError(true);
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
        setShowSuccess(true);
        setFormData({
          numeroMesa: '',
          razonSocial: '',
          email: '',
          tipoDocumento: '',
          numeroDocumento: '',
          telefono: ''
        });
        setPhoneError(false);
        
        setTimeout(() => {
          setShowSuccess(false);
        }, 5000);
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
              />
            </div>
          </div>

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
                placeholder="Ingrese la razón social"
                autoComplete="organization"
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
            <div className="input-container">
              <CreditCard className="input-icon" />
              <input 
                type="text" 
                id="numeroDocumento" 
                name="numeroDocumento" 
                value={formData.numeroDocumento}
                onChange={handleInputChange}
                required
                placeholder="Ingrese el número del documento"
                maxLength="15"
                autoComplete="off"
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