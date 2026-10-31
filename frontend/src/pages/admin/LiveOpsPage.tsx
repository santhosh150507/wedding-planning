import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Send, 
  Radio, 
  Phone, 
  ShieldAlert, 
  ExternalLink, 
  RefreshCw,
  Sparkles,
  Flame,
  Check,
  X
} from 'lucide-react';
import { liveOpsApi, weddingApi } from '../../api/endpoints';
import { LiveOpsSummary, WeddingSummary } from '../../types';

export const LiveOpsPage: React.FC = () => {
  const [weddings, setWeddings] = useState<WeddingSummary[]>([]);
  const [selectedWeddingId, setSelectedWeddingId] = useState<string>('');
  const [summary, setSummary] = useState<LiveOpsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);

  // Issues state
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueTitle, setIssueTitle] = useState('');
  const [issueSeverity, setIssueSeverity] = useState('Medium');
  const [issueDescription, setIssueDescription] = useState('');

  // Generated vendor token link modal
  const [arrivalLinkData, setArrivalLinkData] = useState<{ link: string; vendorName: string } | null>(null);

  const wsRef = useRef<WebSocket | null>(null);

  const fetchWeddings = async () => {
    try {
      const wList = await weddingApi.list();
      setWeddings(wList);
      if (wList.length > 0) {
        const targetId = wList[0].id;
        setSelectedWeddingId(targetId);
        loadLiveOpsSummary(targetId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadLiveOpsSummary = async (wId: string) => {
    try {
      setLoading(true);
      const data = await liveOpsApi.getSummary(wId);
      setSummary(data);
    } catch (err) {
      console.error('Failed to load live ops summary', err);
    } finally {
      setLoading(false);
    }
  };

  // Setup WebSocket with fallback 10-second polling
  useEffect(() => {
    if (!selectedWeddingId) return;

    loadLiveOpsSummary(selectedWeddingId);

    // Try WebSocket connection
    try {
      const wsUrl = `ws://127.0.0.1:8000/api/v1/ws/live-ops/${selectedWeddingId}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setWsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type !== 'PONG') {
            // Live update triggered; refresh summary
            liveOpsApi.getSummary(selectedWeddingId).then(setSummary);
          }
        } catch (e) {}
      };

      ws.onclose = () => {
        setWsConnected(false);
      };
    } catch (e) {
      setWsConnected(false);
    }

    // 10-second polling fallback
    const interval = setInterval(() => {
      liveOpsApi.getSummary(selectedWeddingId).then(setSummary).catch(() => {});
    }, 10000);

    return () => {
      clearInterval(interval);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [selectedWeddingId]);

  useEffect(() => {
    fetchWeddings();
  }, []);

  const handleUpdateVendorStatus = async (checkinId: string, newStatus: string) => {
    if (!selectedWeddingId) return;
    try {
      await liveOpsApi.updateVendorStatus(selectedWeddingId, checkinId, { status: newStatus });
      loadLiveOpsSummary(selectedWeddingId);
    } catch (err) {
      alert('Failed to update vendor checkin status');
    }
  };

  const handleGenerateArrivalLink = async (checkinId: string, vendorName: string) => {
    if (!selectedWeddingId) return;
    try {
      const res = await liveOpsApi.createArrivalLink(selectedWeddingId, checkinId);
      setArrivalLinkData({
        link: `${window.location.origin}${res.arrival_link}`,
        vendorName
      });
    } catch (err) {
      alert('Failed to generate vendor arrival link');
    }
  };

  const handleTriggerLateCheck = async () => {
    if (!selectedWeddingId) return;
    try {
      const res = await liveOpsApi.triggerLateCheck(selectedWeddingId);
      alert(`1-Minute Late Detection Complete: ${res.vendors_flagged_late} suppliers flagged Late.`);
      loadLiveOpsSummary(selectedWeddingId);
    } catch (err) {
      alert('Failed to trigger late check');
    }
  };

  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWeddingId || !issueTitle) return;
    try {
      await liveOpsApi.createIssue(selectedWeddingId, {
        title: issueTitle,
        severity: issueSeverity,
        description: issueDescription
      });
      setShowIssueModal(false);
      setIssueTitle('');
      setIssueDescription('');
      loadLiveOpsSummary(selectedWeddingId);
    } catch (err) {
      alert('Failed to report issue');
    }
  };

  const handleResolveIssue = async (issueId: string) => {
    const notes = prompt('Enter resolution notes:');
    if (!notes || !selectedWeddingId) return;
    try {
      await liveOpsApi.resolveIssue(selectedWeddingId, issueId, notes);
      loadLiveOpsSummary(selectedWeddingId);
    } catch (err) {
      alert('Failed to resolve issue');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#EAE3D9]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-serif text-[#1A1F2C]">Day-of Live Operations Command</h1>
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              wsConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              <Radio className="w-3 h-3 animate-pulse" />
              <span>{wsConnected ? 'WebSocket Live' : '10s Polling'}</span>
            </span>
          </div>
          <p className="text-sm text-[#6B7280] mt-1 font-sans">
            Minute-by-minute timeline, automated 1-minute vendor late detection, and real-time emergency issue command.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleTriggerLateCheck}
            className="px-3 py-2 bg-[#FAF8F5] border border-[#EAE3D9] text-[#1A1F2C] rounded text-xs font-medium hover:bg-[#F4EFEA] flex items-center gap-1.5"
          >
            <Clock className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Run 1-Min Late Scanner</span>
          </button>
          <button
            onClick={() => setShowIssueModal(true)}
            className="px-3.5 py-2 bg-rose-700 text-white rounded text-xs font-medium hover:bg-rose-800 flex items-center gap-1.5 shadow-xs"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Log Emergency / Issue</span>
          </button>
        </div>
      </div>

      {/* Target Wedding Selector */}
      <div className="flex items-center gap-3 bg-white p-4 rounded-lg border border-[#EAE3D9] shadow-sm">
        <span className="text-xs text-[#6B7280]">Active Wedding:</span>
        <select
          value={selectedWeddingId}
          onChange={(e) => setSelectedWeddingId(e.target.value)}
          className="p-1.5 bg-[#FAF8F5] border border-[#EAE3D9] rounded font-serif text-sm font-medium text-[#1A1F2C]"
        >
          {weddings.map((w) => (
            <option key={w.id} value={w.id}>
              {w.wedding_number} – {w.couple_title} ({w.destination})
            </option>
          ))}
        </select>
      </div>

      {/* Stats Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center text-xs">
          <div className="p-4 bg-white rounded-lg border border-[#EAE3D9] shadow-2xs">
            <span className="text-xl font-serif font-bold text-[#1A1F2C] block">{summary.stats.total_vendors_expected}</span>
            <span className="text-[#6B7280]">Suppliers Expected</span>
          </div>
          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            <span className="text-xl font-serif font-bold text-emerald-800 block">{summary.stats.vendors_arrived}</span>
            <span className="text-emerald-700">Arrived On-Site</span>
          </div>
          <div className="p-4 bg-rose-50 rounded-lg border border-rose-200">
            <span className="text-xl font-serif font-bold text-rose-800 block">{summary.stats.vendors_late}</span>
            <span className="text-rose-700">Flagged LATE in RED</span>
          </div>
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <span className="text-xl font-serif font-bold text-amber-800 block">{summary.stats.open_issues}</span>
            <span className="text-amber-700">Open Incidents</span>
          </div>
          <div className="p-4 bg-white rounded-lg border border-[#EAE3D9] shadow-2xs">
            <span className="text-xl font-serif font-bold text-rose-700 block">{summary.stats.at_risk_items_count}</span>
            <span className="text-[#6B7280]">At-Risk Timeline Items</span>
          </div>
        </div>
      )}

      {/* Downstream At-Risk Alert Banner */}
      {summary && summary.at_risk_items.length > 0 && (
        <div className="p-4 bg-rose-50 border-2 border-rose-400 rounded-lg flex items-start gap-3 text-xs text-rose-950">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5 animate-bounce" />
          <div>
            <span className="font-bold text-sm text-rose-900 block mb-0.5">
              CRITICAL: Downstream Timeline Items At Risk from Late Suppliers!
            </span>
            <p className="text-rose-800 mb-2">
              The following ceremony milestones have delayed supplier dependencies and require immediate staff intervention:
            </p>
            <div className="flex flex-wrap gap-2">
              {summary.at_risk_items.map((item, i) => (
                <span key={i} className="px-2.5 py-1 bg-white border border-rose-300 rounded font-semibold text-rose-900">
                  ⚠️ {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Vendor Arrival Tracker & Live Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Vendor Arrival Tracker */}
        <div className="bg-white p-5 rounded-lg border border-[#EAE3D9] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#EAE3D9]">
            <div>
              <h2 className="text-base font-serif font-bold text-[#1A1F2C]">Supplier Arrival Tracker</h2>
              <p className="text-xs text-[#6B7280]">Grace period 15m; late suppliers flagged red automatically.</p>
            </div>
            <span className="text-xs font-mono text-[#C5A880]">Mobile Check-in Enabled</span>
          </div>

          <div className="space-y-3">
            {summary?.vendor_checkins.map((chk) => {
              const isLate = chk.status === 'Late';
              const isArrived = chk.status === 'Arrived';

              return (
                <div
                  key={chk.id}
                  className={`p-3.5 rounded-lg border transition-all space-y-2 text-xs ${
                    isLate
                      ? 'bg-rose-50 border-rose-400 text-rose-950 ring-1 ring-rose-300'
                      : isArrived
                      ? 'bg-emerald-50/50 border-emerald-300'
                      : 'bg-[#FAF8F5] border-[#EAE3D9]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-bold text-sm text-[#1A1F2C] block">{chk.business_name}</span>
                      <span className="text-[#6B7280]">{chk.category} • Contact: {chk.contact_person} ({chk.phone})</span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      isLate ? 'bg-rose-600 text-white animate-pulse' :
                      isArrived ? 'bg-emerald-100 text-emerald-800' :
                      'bg-stone-200 text-stone-700'
                    }`}>
                      {isLate ? '● LATE ARRIVAL' : chk.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#6B7280] pt-1 border-t border-[#EAE3D9]/60">
                    <span>Expected: {new Date(chk.expected_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                    {chk.arrived_time && (
                      <span className="text-emerald-700 font-semibold">
                        Arrived: {new Date(chk.arrived_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleUpdateVendorStatus(chk.id, 'Arrived')}
                      className="px-2.5 py-1 bg-emerald-700 text-white rounded text-[11px] font-medium hover:bg-emerald-800"
                    >
                      Mark Arrived
                    </button>
                    <button
                      onClick={() => handleUpdateVendorStatus(chk.id, 'Late')}
                      className="px-2.5 py-1 bg-rose-600 text-white rounded text-[11px] font-medium hover:bg-rose-700"
                    >
                      Flag Late
                    </button>
                    <button
                      onClick={() => handleGenerateArrivalLink(chk.id, chk.business_name)}
                      className="px-2.5 py-1 bg-white border border-[#EAE3D9] text-[#1A1F2C] rounded text-[11px] hover:bg-[#FAF8F5]"
                    >
                      Send "I've Arrived" Link
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Minute-by-Minute Live Timeline */}
        <div className="bg-white p-5 rounded-lg border border-[#EAE3D9] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#EAE3D9]">
            <div>
              <h2 className="text-base font-serif font-bold text-[#1A1F2C]">Minute-by-Minute Ceremony Itinerary</h2>
              <p className="text-xs text-[#6B7280]">Real-time operational choreography with staff responsibilities.</p>
            </div>
          </div>

          <div className="space-y-3">
            {summary?.timeline.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 rounded-lg border text-xs space-y-1.5 ${
                  item.is_at_risk
                    ? 'bg-rose-50 border-rose-300 ring-1 ring-rose-200'
                    : item.status === 'Completed'
                    ? 'bg-stone-50 border-[#EAE3D9] opacity-75'
                    : 'bg-[#FAF8F5] border-[#EAE3D9]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-white border border-[#EAE3D9] text-[#1A1F2C]">
                      {item.planned_time}
                    </span>
                    <span className="font-serif font-bold text-sm text-[#1A1F2C]">{item.activity_title}</span>
                  </div>
                  {item.is_at_risk ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white">
                      AT RISK
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F4EFEA] text-[#1A1F2C]">
                      {item.status}
                    </span>
                  )}
                </div>

                {item.description && <p className="text-[#6B7280] text-[11px]">{item.description}</p>}

                <div className="flex items-center justify-between text-[11px] text-[#4B5563] pt-1 border-t border-[#EAE3D9]/60">
                  <span>Coordinator: <strong className="text-[#1A1F2C]">{item.owner_name}</strong></span>
                  {item.vendor_name && <span className="text-[#C5A880]">Vendor: {item.vendor_name}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Emergency Issues Section */}
      <div className="bg-white p-5 rounded-lg border border-[#EAE3D9] shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#EAE3D9]">
          <h2 className="text-base font-serif font-bold text-[#1A1F2C]">Live On-Site Incidents & Emergency Log</h2>
          <span className="text-xs text-[#6B7280]">{summary?.issues.length} Issues Logged</span>
        </div>

        {summary?.issues.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#6B7280] bg-[#FAF8F5] rounded border border-[#EAE3D9]">
            ✓ All palace operations green. No open emergencies or incidents reported.
          </div>
        ) : (
          <div className="space-y-3">
            {summary?.issues.map((iss) => (
              <div
                key={iss.id}
                className={`p-4 rounded-lg border text-xs flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                  iss.severity === 'Emergency' ? 'bg-rose-50 border-rose-300' : 'bg-[#FAF8F5] border-[#EAE3D9]'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      iss.severity === 'Emergency' ? 'bg-rose-600 text-white' : 'bg-amber-100 text-amber-900'
                    }`}>
                      {iss.severity}
                    </span>
                    <span className="font-bold text-sm text-[#1A1F2C]">{iss.title}</span>
                  </div>
                  {iss.description && <p className="text-[#4B5563] text-[11px]">{iss.description}</p>}
                  <span className="text-[10px] text-[#6B7280] block">
                    Reported by {iss.assigned_to_name} at {new Date(iss.reported_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div>
                  {iss.status === 'Resolved' ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-xs">
                      <CheckCircle2 className="w-4 h-4" /> Resolved
                    </span>
                  ) : (
                    <button
                      onClick={() => handleResolveIssue(iss.id)}
                      className="px-3 py-1.5 bg-[#1A1F2C] text-[#FAF8F5] rounded text-xs hover:bg-[#2C3444] font-medium shadow-xs"
                    >
                      Resolve Incident
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Vendor Arrival Token Modal */}
      {arrivalLinkData && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg border border-[#EAE3D9] shadow-lg max-w-md w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#EAE3D9]">
              <h3 className="text-base font-serif font-bold text-[#1A1F2C]">Mobile Arrival Link</h3>
              <button onClick={() => setArrivalLinkData(null)}>
                <X className="w-4 h-4 text-[#6B7280]" />
              </button>
            </div>
            <p className="text-[#6B7280]">
              Send this single-use link to <strong>{arrivalLinkData.vendorName}</strong>. They can tap "I've Arrived" directly from their phone when at the security gate:
            </p>
            <div className="p-3 bg-[#FAF8F5] border border-[#EAE3D9] rounded font-mono text-[11px] break-all select-all">
              {arrivalLinkData.link}
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(arrivalLinkData.link);
                  alert('Arrival link copied to clipboard!');
                }}
                className="px-4 py-1.5 bg-[#1A1F2C] text-[#FAF8F5] rounded font-medium hover:bg-[#2C3444]"
              >
                Copy Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log Emergency Issue Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg border border-[#EAE3D9] shadow-lg max-w-md w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#EAE3D9]">
              <h3 className="text-base font-serif font-bold text-rose-900 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-rose-600" />
                <span>Log Live On-Site Incident</span>
              </h3>
              <button onClick={() => setShowIssueModal(false)}>
                <X className="w-4 h-4 text-[#6B7280]" />
              </button>
            </div>

            <form onSubmit={handleCreateIssue} className="space-y-3">
              <div>
                <label className="block text-[#6B7280] mb-1">Incident Headline</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Generator 2 trip at Mandap floral pavilion"
                  value={issueTitle}
                  onChange={(e) => setIssueTitle(e.target.value)}
                  className="w-full p-2 bg-[#FAF8F5] border border-[#EAE3D9] rounded text-[#1A1F2C]"
                />
              </div>

              <div>
                <label className="block text-[#6B7280] mb-1">Severity</label>
                <select
                  value={issueSeverity}
                  onChange={(e) => setIssueSeverity(e.target.value)}
                  className="w-full p-2 bg-[#FAF8F5] border border-[#EAE3D9] rounded text-[#1A1F2C]"
                >
                  <option value="Low">Low (Minor Delay)</option>
                  <option value="Medium">Medium (Attention Required)</option>
                  <option value="High">High (Immediate Action)</option>
                  <option value="Emergency">EMERGENCY (Ceremony At Risk)</option>
                </select>
              </div>

              <div>
                <label className="block text-[#6B7280] mb-1">Detailed Description</label>
                <textarea
                  rows={3}
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  placeholder="Provide context and staff dispatch details..."
                  className="w-full p-2 bg-[#FAF8F5] border border-[#EAE3D9] rounded text-[#1A1F2C]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="px-3 py-1.5 bg-[#F4EFEA] text-[#1A1F2C] rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-rose-700 text-white rounded font-medium hover:bg-rose-800"
                >
                  Broadcast Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

