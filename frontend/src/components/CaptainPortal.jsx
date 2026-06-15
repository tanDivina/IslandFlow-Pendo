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

  // Fetch Manifest
  const fetchManifest = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/captain/manifest/${captainId}`);
      if (!res.ok) throw new Error('Failed to retrieve manifest');
      const data = await res.ok ? await res.json() : [];
      setManifest(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Could not connect to backend server. Make sure the API is online.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (captainId) {
      fetchManifest();
    }
  }, [captainId]);

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
      if (!res.ok) throw new Error('Failed to update status');
      
      setStatusMessage({ type: 'success', text: `Status successfully updated to ${status.toUpperCase()}!` });
      setStatusNotes('');
      setActiveBookingId(null);
      
      // Refresh manifest
      await fetchManifest();
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Failed to broadcast status update to hotel/guest.' });
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
      if (!res.ok) throw new Error('Failed to submit conditions');
      
      setConditionsMessage({ type: 'success', text: 'Marine safety report logged and synchronized.' });
      setConditions(prev => ({ ...prev, notes: '' }));
    } catch (err) {
      console.error(err);
      setConditionsMessage({ type: 'error', text: 'Failed to submit marine report.' });
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
          }}>🚤 Bocas Marine Operator</span>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            margin: '4px 0 0 0',
            background: 'linear-gradient(135deg, #f8fafc 40%, #a5f3fc 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>Captain's Command Portal</h1>
        </div>
        
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
          Exit Dashboard 🚪
        </button>
      </div>

      {/* Weather Strip */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px'
        }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', margin: 0, color: '#94a3b8' }}>Weather Horizon</h3>
          <span style={{ fontSize: '12px', color: '#64748b' }}>Live alerts synced with front desk</span>
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
          <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>📋 Today's Manifest</h2>
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
            🔄 Sync Data
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
            Retrieving assigned trips...
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
            <p style={{ margin: 0, fontSize: '15px', color: '#94a3b8', fontWeight: '500' }}>No active tours assigned to you today.</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px' }}>Reach out to the hotel front desk to get dispatch coordinates.</p>
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
                        {capStatus === 'assigned' ? 'Assigned' : capStatus.replace('-', ' ')}
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
                      <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', display: 'block', marginBottom: '2px' }}>Guest Name</span>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0' }}>{guest?.name || 'Unregistered Guest'}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', display: 'block', marginBottom: '2px' }}>Pickup Dock</span>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#3ecdc6' }}>🚤 {guest?.hotel_name || 'Nayara Bocas'}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', display: 'block', marginBottom: '2px' }}>Total Pax</span>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0' }}>👥 {booking.pax || 2} Persons</span>
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
                        Add Radio/Status Notes (Optional):
                      </label>
                      <input 
                        type="text"
                        placeholder="e.g., '10-minute delay due to rain' or 'Sea calm, departure set'"
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
                          Confirm Trip ✅
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
                          En Route 🚤
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
                          Report Delay 🕒
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
                          Flag Unsafe ⚠️
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
                          Complete Tour 🏁
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
                        Cancel Update
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
                      📡 Update Radio Status / Dispatch Info
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
          <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>🚨 Live Safety / Sea Condition Report</h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
            Submit real-time reports from the channel to update hotel dispatches instantly.
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
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#94a3b8', marginBottom: '6px' }}>Sea Swell State</label>
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
                <option value="calm">Calm (0.0 - 0.5m) 🟢</option>
                <option value="moderate">Moderate (0.5 - 1.2m) 🟡</option>
                <option value="rough">Rough (1.2m+) 🔴</option>
              </select>
            </div>

            {/* Visibility */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#94a3b8', marginBottom: '6px' }}>Visibility</label>
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
                <option value="clear">Excellent / Clear 🟢</option>
                <option value="moderate">Moderate / Haze 🟡</option>
                <option value="poor">Poor / Squall 🔴</option>
              </select>
            </div>

            {/* Rain */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#94a3b8', marginBottom: '6px' }}>Precipitation</label>
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
                <option value="none">Clear / Sunny 🟢</option>
                <option value="light">Light Rain 🟡</option>
                <option value="heavy">Heavy Squall 🔴</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#94a3b8', marginBottom: '6px' }}>On-the-Water Observational Notes</label>
            <textarea 
              rows="2"
              placeholder="e.g., 'Heavy rain squalls coming from the east. Advise indoor activities or postponing snorkeling routes until 2 PM.'"
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
            {submittingConditions ? 'Broadcasting Marine Report...' : 'Log Sea Condition Report 📡'}
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
