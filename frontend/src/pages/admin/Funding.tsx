import { useState } from 'react';
import { Check, IndianRupee, X } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { Modal } from '@/components/shared/Modal';
import { Field, TextAreaField } from '@/components/shared/FormField';
import { useToast } from '@/components/shared/Toast';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/StoreContext';
import { formatDate, formatINR, startupById } from '@/store/selectors';
import type { FundingRequest, RequestStatus } from '@/store/types';

export default function AdminFundingPage() {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const [decision, setDecision] = useState<{
    request: FundingRequest;
    status: RequestStatus;
  } | null>(null);
  const [note, setNote] = useState('');

  const requests = [...state.fundingRequests].sort((a, b) => {
    if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
    if (b.status === 'PENDING' && a.status !== 'PENDING') return 1;
    return (
      new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
    );
  });

  const pending = requests.filter((r) => r.status === 'PENDING');
  const approvedTotal = requests
    .filter((r) => r.status === 'APPROVED')
    .reduce((sum, r) => sum + r.amount, 0);
  const requestedTotal = pending.reduce((sum, r) => sum + r.amount, 0);

  function confirm() {
    if (!decision) return;
    dispatch({
      type: 'FUNDING_DECIDE',
      requestId: decision.request.id,
      status: decision.status,
      note: note.trim() || null,
    });
    toast(
      decision.status === 'APPROVED'
        ? `${formatINR(decision.request.amount)} approved`
        : 'Request declined',
      decision.status === 'APPROVED'
        ? "Added to the startup's raised total."
        : 'The founder has been notified.',
      decision.status === 'APPROVED' ? 'success' : 'warning',
    );
    setDecision(null);
    setNote('');
  }

  return (
    <>
      <PageHeader
        title="Funding Management"
        subtitle="Approve or decline funding requests. Approvals are added to the startup's raised total immediately."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Pending requests"
          value={pending.length}
          accent={pending.length > 0 ? 'amber' : 'slate'}
          icon={IndianRupee}
        />
        <StatCard
          label="Pending value"
          value={formatINR(requestedTotal)}
          accent="amber"
          icon={IndianRupee}
        />
        <StatCard
          label="Approved to date"
          value={formatINR(approvedTotal)}
          accent="emerald"
          icon={IndianRupee}
        />
        <StatCard
          label="Total requests"
          value={requests.length}
          icon={IndianRupee}
        />
      </div>

      {requests.length === 0 ? (
        <EmptyState icon={IndianRupee} title="No funding requests" />
      ) : (
        <div className="space-y-2.5">
          {requests.map((request) => {
            const startup = startupById(state, request.startupId);
            return (
              <article
                key={request.id}
                className={`rounded-xl border p-5 ${
                  request.status === 'PENDING'
                    ? 'border-amber-500/20 bg-amber-500/[0.04]'
                    : 'border-white/8 bg-white/[0.03]'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-white">
                        {startup?.name ?? 'Unknown startup'}
                      </h3>
                      <span className="text-sm font-bold text-purple-200">
                        {formatINR(request.amount)}
                      </span>
                      <StatusBadge status={request.status} />
                      <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-white/50">
                        {request.category}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-white/60">
                      {request.purpose}
                    </p>
                    <p className="mt-1.5 text-[10px] text-white/30">
                      Requested {formatDate(request.requestedAt)}
                      {request.decidedAt &&
                        ` · decided ${formatDate(request.decidedAt)} by ${request.decidedBy}`}
                    </p>
                    {request.note && (
                      <p className="mt-2 rounded border border-white/5 bg-white/[0.03] px-2.5 py-1.5 text-[11px] leading-relaxed text-white/55">
                        {request.note}
                      </p>
                    )}
                  </div>

                  {request.status === 'PENDING' && (
                    <div className="flex shrink-0 gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          setDecision({ request, status: 'APPROVED' });
                          setNote('');
                        }}
                      >
                        <Check className="mr-1 h-3.5 w-3.5" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setDecision({ request, status: 'REJECTED' });
                          setNote('');
                        }}
                      >
                        <X className="mr-1 h-3.5 w-3.5" /> Decline
                      </Button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Modal
        open={decision !== null}
        onClose={() => setDecision(null)}
        title={
          decision
            ? `${decision.status === 'APPROVED' ? 'Approve' : 'Decline'} ${formatINR(decision.request.amount)}`
            : ''
        }
        description="The founder sees this note on their funding page."
        footer={
          <>
            <Button variant="ghost" onClick={() => setDecision(null)}>
              Cancel
            </Button>
            <Button
              variant={
                decision?.status === 'REJECTED' ? 'destructive' : 'default'
              }
              onClick={confirm}
            >
              Confirm
            </Button>
          </>
        }
      >
        <Field label="Note to founder" hint="Optional">
          <TextAreaField value={note} onChange={setNote} rows={4} />
        </Field>
      </Modal>
    </>
  );
}
