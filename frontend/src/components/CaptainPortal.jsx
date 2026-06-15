import React, { useState, useEffect } from 'react';
import WeatherHorizon from './WeatherHorizon';

export default function CaptainPortal({ captainId, logistics, onBackToLanding }) {
  const [manifest, setManifest] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Real-time weather condition report state
  const [conditions, setConditions] = useState({
    sea_state: 'calm',
    visibility: 'clear',
    rain: 'none',
    notes: ''
  });
  const [submittingConditions, setSubmittingConditions] = useState(false);
  const [conditionsMessage, setConditionsMessage] = useState(null);

  // Status submission state
  const [activeBookingId, setActiveBookingId] = useState(null);
  const [statusNotes, setStatusNotes] = useState('');
  const [submittingStatus, setSubmittingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const [lang, setLang] = useState('es'); // Default to Spanish as requested for local captains

  const t = {
    en: {
      bocasOperator: '🚤 Bocas Marine Operator',
      commandPortal: "Captain's Command Portal",
      exitDashboard: 'Exit Dashboard 🚪',
      weatherHorizon: 'Weather Horizon',
      liveAlerts: 'Live alerts synced with front desk',
      todaysManifest: "📋 Today's Manifest",
      syncData: '🔄 Sync Data',
      retrieving: 'Retrieving assigned trips...',
      noTours: 'No active tours assigned to you today.',
      reachOut: 'Reach out to the hotel front desk to get dispatch coordinates.',
      guestName: 'Guest Name',
      pickupDock: 'Pickup Dock',
      totalPax: 'Total Pax',
      persons: 'Persons',
      assigned: 'Assigned',
      confirmed: 'Confirmed',
      enRoute: 'En Route',
      delayed: 'Delayed',
      unsafeConditions: 'Unsafe Conditions',
      completed: 'Completed',
      notesLabel: 'Add Radio/Status Notes (Optional):',
      notesPlaceholder: "e.g., '10-minute delay due to rain' or 'Sea calm, departure set'",
      confirmTrip: 'Confirm Trip ✅',
      enRouteBtn: 'En Route 🚤',
      reportDelay: 'Report Delay 🕒',
      flagUnsafe: 'Flag Unsafe ⚠️',
      completeTour: 'Complete Tour 🏁',
      cancelUpdate: 'Cancel Update',
      updateRadioStatus: '📡 Update Radio Status / Dispatch Info',
      liveSafetyReport: '🚨 Live Safety / Sea Condition Report',
      liveSafetyDesc: 'Submit real-time reports from the channel to update hotel dispatches instantly.',
      seaSwellState: 'Sea Swell State',
      calm: 'Calm (0.0 - 0.5m) 🟢',
      moderate: 'Moderate (0.5 - 1.2m) 🟡',
      rough: 'Rough (1.2m+) 🔴',
      visibility: 'Visibility',
      clear: 'Excellent / Clear 🟢',
      modVisibility: 'Moderate / Haze 🟡',
      poorVisibility: 'Poor / Squall 🔴',
      precipitation: 'Precipitation',
      noneRain: 'Clear / Sunny 🟢',
      lightRain: 'Light Rain 🟡',
      heavyRain: 'Heavy Squall 🔴',
      waterNotes: 'On-the-Water Observational Notes',
      waterNotesPlaceholder: "e.g., 'Heavy rain squalls coming from the east. Advise indoor activities or postponing snorkeling routes until 2 PM.'",
      logSeaReport: 'Log Sea Condition Report 📡',
      broadcasting: 'Broadcasting Marine Report...',
      safetySuccess: 'Marine safety report logged and synchronized.',
      safetyError: 'Failed to submit marine report.',
      statusSuccess: 'Status successfully updated!',
      statusError: 'Failed to broadcast status update to hotel/guest.',
      failedRetrieve: 'Failed to retrieve manifest',
      apiOffline: 'Could not connect to backend server. Make sure the API is online.',
      failedUpdate: 'Failed to update status',
      failedSubmitConditions: 'Failed to submit conditions'
    },
    es: {
      bocasOperator: '🚤 Operador Marino de Bocas',
      commandPortal: 'Portal de Mando del Capitán',
      exitDashboard: 'Salir del Panel 🚪',
      weatherHorizon: 'Horizonte del Clima',
      liveAlerts: 'Alertas en vivo sincronizadas con recepción',
      todaysManifest: '📋 Manifiesto de Hoy',
      syncData: '🔄 Sincronizar Datos',
      retrieving: 'Recuperando viajes asignados...',
      noTours: 'No tienes tours activos asignados hoy.',
      reachOut: 'Comunícate con la recepción del hotel para obtener coordenadas de despacho.',
      guestName: 'Nombre del Huésped',
      pickupDock: 'Muelle de Embarque',
      totalPax: 'Pasajeros Totales',
      persons: 'Personas',
      assigned: 'Asignado',
      confirmed: 'Confirmado',
      enRoute: 'En Ruta',
      delayed: 'Demorado',
      unsafeConditions: 'Condiciones Inseguras',
      completed: 'Completado',
      notesLabel: 'Agregar notas de radio/estado (Opcional):',
      notesPlaceholder: "ej. 'Retraso de 10 min por lluvia' o 'Mar calmo, salida lista'",
      confirmTrip: 'Confirmar Viaje ✅',
      enRouteBtn: 'En Ruta 🚤',
      reportDelay: 'Reportar Retraso 🕒',
      flagUnsafe: 'Reportar Inseguro ⚠️',
      completeTour: 'Completar Tour 🏁',
      cancelUpdate: 'Cancelar Actualización',
      updateRadioStatus: '📡 Actualizar Estado de Radio / Despacho',
      liveSafetyReport: '🚨 Reporte de Seguridad y Clima Marino en Vivo',
      liveSafetyDesc: 'Envía reportes en tiempo real desde el canal para actualizar los despachos del hotel al instante.',
      seaSwellState: 'Estado de la Marea (Swell)',
      calm: 'Calmo (0.0 - 0.5m) 🟢',
      moderate: 'Moderado (0.5 - 1.2m) 🟡',
      rough: 'Agitado (1.2m+) 🔴',
      visibility: 'Visibilidad',
      clear: 'Excelente / Despejado 🟢',
      modVisibility: 'Moderada / Neblina 🟡',
      poorVisibility: 'Mala / Chubasco 🔴',
      precipitation: 'Precipitación',
      noneRain: 'Despejado / Soleado 🟢',
      lightRain: 'Lluvia Ligera 🟡',
      heavyRain: 'Chubasco Fuerte 🔴',
      waterNotes: 'Notas de Observación en el Agua',
      waterNotesPlaceholder: "ej. 'Fuertes chubascos del este. Recomendar actividades bajo techo o posponer snorkel hasta las 2 PM.'",
      logSeaReport: 'Registrar Reporte Marino 📡',
      broadcasting: 'Transmitiendo Reporte Marino...',
      safetySuccess: 'Reporte de seguridad marina registrado y sincronizado.',
      safetyError: 'Error al enviar reporte marino.',
      statusSuccess: '¡Estado actualizado exitosamente!',
      statusError: 'Error al transmitir actualización de estado al hotel/huésped.',
      failedRetrieve: 'Error al recuperar el manifiesto',
      apiOffline: 'No se pudo conectar al servidor backend. Asegúrese de que la API esté activa.',
      failedUpdate: 'Error al actualizar el estado',
      failedSubmitConditions: 'Error al enviar condiciones'
    }
  };

  const currentT = t[lang];

  // Fetch Manifest
  const fetchManifest = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/captain/manifest/${captainId}`);
      if (!res.ok) throw new Error(currentT.failedRetrieve);
      const data = await res.ok ? await res.json() : [];
      setManifest(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(currentT.apiOffline);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (captainId) {
      fetchManifest();
    }
  }, [captainId, lang]);

  // Submit Booking Status
  const handleUpdateStatus = async (bookingId, status) => {
    try {
      setSubmittingStatus(true);
      setStatusMessage(null);
      const res = await fetch('/api/captain/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: bookingId,
          status,
          notes: statusNotes
        })
      });
      if (!res.ok) throw new Error(currentT.failedUpdate);
      
      setStatusMessage({ type: 'success', text: `${currentT.statusSuccess} (${status.toUpperCase()})` });
      setStatusNotes('');
      setActiveBookingId(null);
      
      // Refresh manifest
      await fetchManifest();
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: currentT.statusError });
    } finally {
      setSubmittingStatus(false);
    }
  };

  // Submit Conditions Report
  const handleReportConditions = async (e) => {
    e.preventDefault();
    try {
      setSubmittingConditions(true);
      setConditionsMessage(null);
      const res = await fetch('/api/captain/report-conditions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          captain_id: captainId,
          ...conditions
        })
      });
      if (!res.ok) throw new Error(currentT.failedSubmitConditions);
      
      setConditionsMessage({ type: 'success', text: currentT.safetySuccess });
      setConditions(prev => ({ ...prev, notes: '' }));
    } catch (err) {
      console.error(err);
      setConditionsMessage({ type: 'error', text: currentT.safetyError });
    } finally {
      setSubmittingConditions(false);
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'confirmed': return '#22c55e'; // green
      case 'en-route': return '#0ea5e9'; // blue
      case 'delayed': return '#f59e0b'; // orange
      case 'unsafe-conditions': return '#ef4444'; // red
      case 'completed': return '#a855f7'; // purple
      default: return '#64748b'; // slate
    }
  };

  const getStatusBadgeText = (status) => {
    switch (status) {
      case 'assigned': return currentT.assigned;
      case 'confirmed': return currentT.confirmed;
      case 'en-route': return currentT.enRoute;
      case 'delayed': return currentT.delayed;
      case 'unsafe-conditions': return currentT.unsafeConditions;
      case 'completed': return currentT.completed;
      default: return status;
    }
  };

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '24px 16px',
      color: '#f8fafc',
      fontFamily: 'Outfit, Poppins, system-ui, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '28px'
      }}>
        <div>
          <span style={{
            textTransform: 'uppercase',
            fontSize: '12px',
            letterSpacing: '2px',
            color: '#3ecdc6',
            fontWeight: '600'
          }}>{currentT.bocasOperator}</span>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            margin: '4px 0 0 0',
            background: 'linear-gradient(135deg, #f8fafc 40%, #a5f3fc 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>{currentT.commandPortal}</h1>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Language Selector Dropdown */}
          <button 
            onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
            style={{
              background: 'linear-gradient(135deg, rgba(62, 205, 198, 0.15) 0%, rgba(62, 205, 198, 0.05) 100%)',
              border: '1px solid rgba(62, 205, 198, 0.25)',
              borderRadius: '12px',
              padding: '10px 14px',
              color: '#3ecdc6',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.2s'
            }}
          >
            {lang === 'en' ? '🇬🇧 EN' : '🇪🇸 ES'}
          </button>

          <button 
            onClick={onBackToLanding}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '10px 16px',
              color: '#f8fafc',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s',
              backdropFilter: 'blur(8px)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            }}
          >
            {currentT.exitDashboard}
          </button>
        </div>
      </div>

      {/* Weather Strip */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px'
        }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', margin: 0, color: '#94a3b8' }}>{currentT.weatherHorizon}</h3>
          <span style={{ fontSize: '12px', color: '#64748b' }}>{currentT.liveAlerts}</span>
        </div>
        <WeatherHorizon logistics={logistics} />
      </div>

      {/* Manifest Block */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>{currentT.todaysManifest}</h2>
          <button 
            onClick={fetchManifest}
            style={{
              background: 'none',
              border: 'none',
              color: '#3ecdc6',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {currentT.syncData}
          </button>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '12px',
            padding: '16px',
            color: '#fca5a5',
            fontSize: '14px',
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{
            textAlign: 'center',
            padding: '48px 0',
            color: '#64748b'
          }}>
            <span style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}>⛵</span>
            {currentT.retrieving}
          </div>
        ) : manifest.length === 0 ? (
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px border-dashed rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '48px 24px',
            textAlign: 'center',
            color: '#64748b'
          }}>
            <span style={{ fontSize: '32px', display: 'block', marginBottom: '12px' }}>🏖️</span>
            <p style={{ margin: 0, fontSize: '15px', color: '#94a3b8', fontWeight: '500' }}>{currentT.noTours}</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px' }}>{currentT.reachOut}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {manifest.map(({ booking, guest, tour }) => {
              const capStatus = booking.captain_status || 'assigned';
              const isActionsExpanded = activeBookingId === booking._id;

              return (
                <div 
                  key={booking._id}
                  style={{
                    background: 'rgba(10, 15, 26, 0.6)',
                    border: `1px solid ${isActionsExpanded ? 'var(--primary, #3ecdc6)' : 'rgba(255, 255, 255, 0.06)'}`,
                    borderRadius: '18px',
                    padding: '20px',
                    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2)',
                    backdropFilter: 'blur(16px)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  {/* Tour Info Header */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '14px',
                    flexWrap: 'wrap',
                    gap: '10px'
                  }}>
                    <div>
                      <span style={{
                        background: 'rgba(62, 205, 198, 0.08)',
                        color: 'var(--primary, #3ecdc6)',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {booking.slot?.toUpperCase() || 'TRIP'}
                      </span>
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: '700',
                        margin: '6px 0 2px 0',
                        color: '#f1f5f9'
                      }}>{tour?.name || 'Assigned Eco-Tour'}</h3>
                      <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                        📍 {tour?.location || 'Bocas del Toro'}
                      </p>
                    </div>

                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end'
                    }}>
                      <span style={{
                        background: `${getStatusBadgeColor(capStatus)}18`,
                        color: getStatusBadgeColor(capStatus),
                        border: `1px solid ${getStatusBadgeColor(capStatus)}30`,
                        padding: '6px 12px',
                        borderRadius: '10px',
                        fontSize: '12px',
                        fontWeight: '600',
                        textTransform: 'capitalize'
                      }}>
                        {getStatusBadgeText(capStatus)}
                      </span>
                    </div>
                  </div>

                  <hr style={{ border: 0, borderTop: '1px solid rgba(255, 255, 255, 0.05)', margin: '14px 0' }} />

                  {/* Guest pickup details */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: '12px',
                    marginBottom: '16px'
                  }}>
                    <div>
                      <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', display: 'block', marginBottom: '2px' }}>{currentT.guestName}</span>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0' }}>{guest?.name || 'Unregistered Guest'}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', display: 'block', marginBottom: '2px' }}>{currentT.pickupDock}</span>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#3ecdc6' }}>🚤 {guest?.hotel_name || 'Nayara Bocas'}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', display: 'block', marginBottom: '2px' }}>{currentT.totalPax}</span>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0' }}>👥 {booking.pax || 2} {currentT.persons}</span>
                    </div>
                  </div>

                  {/* Status update area */}
                  {isActionsExpanded ? (
                    <div style={{
                      background: 'rgba(0, 0, 0, 0.2)',
                      borderRadius: '14px',
                      padding: '16px',
                      marginTop: '16px',
                      border: '1px solid rgba(255, 255, 255, 0.04)'
                    }}>
                      <label style={{
                        display: 'block',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#94a3b8',
                        marginBottom: '8px'
                      }}>
                        {currentT.notesLabel}
                      </label>
                      <input 
                        type="text"
                        placeholder={currentT.notesPlaceholder}
                        value={statusNotes}
                        onChange={(e) => setStatusNotes(e.target.value)}
                        style={{
                          width: '100%',
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '8px',
                          padding: '10px 12px',
                          fontSize: '13px',
                          color: '#f8fafc',
                          marginBottom: '14px',
                          boxSizing: 'border-box'
                        }}
                      />

                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                        gap: '8px'
                      }}>
                        <button 
                          disabled={submittingStatus}
                          onClick={() => handleUpdateStatus(booking._id, 'confirmed')}
                          style={{
                            background: 'rgba(34, 197, 94, 0.08)',
                            color: '#22c55e',
                            border: '1px solid rgba(34, 197, 94, 0.2)',
                            borderRadius: '10px',
                            padding: '12px',
                            fontWeight: '600',
                            fontSize: '13px',
                            cursor: 'pointer',
                            minHeight: '48px'
                          }}
                        >
                          {currentT.confirmTrip}
                        </button>
                        <button 
                          disabled={submittingStatus}
                          onClick={() => handleUpdateStatus(booking._id, 'en-route')}
                          style={{
                            background: 'rgba(14, 165, 233, 0.08)',
                            color: '#0ea5e9',
                            border: '1px solid rgba(14, 165, 233, 0.2)',
                            borderRadius: '10px',
                            padding: '12px',
                            fontWeight: '600',
                            fontSize: '13px',
                            cursor: 'pointer',
                            minHeight: '48px'
                          }}
                        >
                          {currentT.enRouteBtn}
                        </button>
                        <button 
                          disabled={submittingStatus}
                          onClick={() => handleUpdateStatus(booking._id, 'delayed')}
                          style={{
                            background: 'rgba(245, 158, 11, 0.08)',
                            color: '#f59e0b',
                            border: '1px solid rgba(245, 158, 11, 0.2)',
                            borderRadius: '10px',
                            padding: '12px',
                            fontWeight: '600',
                            fontSize: '13px',
                            cursor: 'pointer',
                            minHeight: '48px'
                          }}
                        >
                          {currentT.reportDelay}
                        </button>
                        <button 
                          disabled={submittingStatus}
                          onClick={() => handleUpdateStatus(booking._id, 'unsafe-conditions')}
                          style={{
                            background: 'rgba(239, 108, 108, 0.08)',
                            color: '#ef4444',
                            border: '1px solid rgba(239, 108, 108, 0.2)',
                            borderRadius: '10px',
                            padding: '12px',
                            fontWeight: '600',
                            fontSize: '13px',
                            cursor: 'pointer',
                            minHeight: '48px'
                          }}
                        >
                          {currentT.flagUnsafe}
                        </button>
                        <button 
                          disabled={submittingStatus}
                          onClick={() => handleUpdateStatus(booking._id, 'completed')}
                          style={{
                            background: 'rgba(168, 85, 247, 0.08)',
                            color: '#a855f7',
                            border: '1px solid rgba(168, 85, 247, 0.2)',
                            borderRadius: '10px',
                            padding: '12px',
                            fontWeight: '600',
                            fontSize: '13px',
                            cursor: 'pointer',
                            gridColumn: '1 / -1',
                            minHeight: '48px'
                          }}
                        >
                          {currentT.completeTour}
                        </button>
                      </div>

                      <button 
                        onClick={() => setActiveBookingId(null)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#64748b',
                          fontSize: '12px',
                          fontWeight: '500',
                          width: '100%',
                          textAlign: 'center',
                          marginTop: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        {currentT.cancelUpdate}
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => {
                        setActiveBookingId(booking._id);
                        setStatusMessage(null);
                      }}
                      style={{
                        width: '100%',
                        background: 'linear-gradient(135deg, rgba(62, 205, 198, 0.15) 0%, rgba(62, 205, 198, 0.05) 100%)',
                        border: '1px solid rgba(62, 205, 198, 0.25)',
                        borderRadius: '12px',
                        padding: '12px',
                        color: 'var(--primary, #3ecdc6)',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        minHeight: '48px',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(62, 205, 198, 0.2) 0%, rgba(62, 205, 198, 0.08) 100%)';
                        e.currentTarget.style.borderColor = 'rgba(62, 205, 198, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(62, 205, 198, 0.15) 0%, rgba(62, 205, 198, 0.05) 100%)';
                        e.currentTarget.style.borderColor = 'rgba(62, 205, 198, 0.25)';
                      }}
                    >
                      {currentT.updateRadioStatus}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {statusMessage && (
          <div style={{
            background: statusMessage.type === 'success' ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)',
            border: `1px solid ${statusMessage.type === 'success' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
            borderRadius: '12px',
            padding: '14px',
            color: statusMessage.type === 'success' ? '#86efac' : '#fca5a5',
            fontSize: '14px',
            marginTop: '16px',
            textAlign: 'center'
          }}>
            {statusMessage.text}
          </div>
        )}
      </div>

      {/* Real-time Condition Report Form */}
      <div style={{
        background: 'rgba(10, 15, 26, 0.4)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '24px',
        padding: '24px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(20px)'
      }}>
        <div style={{ marginBottom: '18px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>{currentT.liveSafetyReport}</h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
            {currentT.liveSafetyDesc}
          </p>
        </div>

        <form onSubmit={handleReportConditions}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '16px',
            marginBottom: '18px'
          }}>
            {/* Sea State */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#94a3b8', marginBottom: '6px' }}>{currentT.seaSwellState}</label>
              <select 
                value={conditions.sea_state}
                onChange={(e) => setConditions(prev => ({ ...prev, sea_state: e.target.value }))}
                style={{
                  width: '100%',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  padding: '12px',
                  color: '#f8fafc',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              >
                <option value="calm">{currentT.calm}</option>
                <option value="moderate">{currentT.moderate}</option>
                <option value="rough">{currentT.rough}</option>
              </select>
            </div>

            {/* Visibility */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#94a3b8', marginBottom: '6px' }}>{currentT.visibility}</label>
              <select 
                value={conditions.visibility}
                onChange={(e) => setConditions(prev => ({ ...prev, visibility: e.target.value }))}
                style={{
                  width: '100%',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  padding: '12px',
                  color: '#f8fafc',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              >
                <option value="clear">{currentT.clear}</option>
                <option value="moderate">{currentT.modVisibility}</option>
                <option value="poor">{currentT.poorVisibility}</option>
              </select>
            </div>

            {/* Rain */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#94a3b8', marginBottom: '6px' }}>{currentT.precipitation}</label>
              <select 
                value={conditions.rain}
                onChange={(e) => setConditions(prev => ({ ...prev, rain: e.target.value }))}
                style={{
                  width: '100%',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  padding: '12px',
                  color: '#f8fafc',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              >
                <option value="none">{currentT.noneRain}</option>
                <option value="light">{currentT.lightRain}</option>
                <option value="heavy">{currentT.heavyRain}</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#94a3b8', marginBottom: '6px' }}>{currentT.waterNotes}</label>
            <textarea 
              rows="2"
              placeholder={currentT.waterNotesPlaceholder}
              value={conditions.notes}
              onChange={(e) => setConditions(prev => ({ ...prev, notes: e.target.value }))}
              style={{
                width: '100%',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                padding: '12px',
                color: '#f8fafc',
                fontSize: '13px',
                fontFamily: 'inherit',
                outline: 'none',
                resize: 'vertical',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button 
            type="submit"
            disabled={submittingConditions}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #3ecdc6 0%, #0fa5d3 100%)',
              border: 'none',
              borderRadius: '12px',
              padding: '14px',
              color: '#080c14',
              fontSize: '15px',
              fontWeight: '700',
              cursor: 'pointer',
              minHeight: '48px',
              transition: 'opacity 0.2s'
            }}
          >
            {submittingConditions ? currentT.broadcasting : currentT.logSeaReport}
          </button>
        </form>

        {conditionsMessage && (
          <div style={{
            background: conditionsMessage.type === 'success' ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)',
            border: `1px solid ${conditionsMessage.type === 'success' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
            borderRadius: '12px',
            padding: '14px',
            color: conditionsMessage.type === 'success' ? '#86efac' : '#fca5a5',
            fontSize: '14px',
            marginTop: '16px',
            textAlign: 'center'
          }}>
            {conditionsMessage.text}
          </div>
        )}
      </div>
    </div>
  );
}
