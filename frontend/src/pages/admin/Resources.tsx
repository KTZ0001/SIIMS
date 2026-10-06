import { useState } from 'react';
import { Check, Package, X } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { Modal } from '@/components/shared/Modal';
import { Field, TextAreaField } from '@/components/shared/FormField';
import { useToast } from '@/components/shared/Toast';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/StoreContext';
import { formatDate, startupById } from '@/store/selectors';
import type { RequestStatus, ResourceRequest } from '@/store/types';

export default function AdminResourcesPage() {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const [decision, setDecision] = useState<{
    request: ResourceRequest;
    status: RequestStatus;
  } | null>(null);
  const [note, setNote] = useState('');

  const requests = [...state.resourceRequests].sort((a, b) => {
    if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
    if (b.status === 'PENDING' && a.status !== 'PENDING') return 1;
    return (
      new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
    );
  });

  const pending = requests.filter((r) => r.status === 'PENDING').length;
  const approved = requests.filter((r) => r.status === 'APPROVED').length;

  function confirm() {
    if (!decision) return;
    dispatch({
      type: 'RESOURCE_DECIDE',
      requestId: decision.request.id,
      status: decision.status,
      note: note.trim() || null,
    });
    toast(
      decision.status === 'APPROVED'
        ? `${decision.request.resourceType} approved`
        : 'Request declined',
      'The founder has been notified.',
      decision.status === 'APPROVED' ? 'success' : 'warning',
    );
    setDecision(null);
    setNote('');
  }

  return (
    <>
      <PageHeader
        title="Resource Approvals"
        subtitle="Lab space, desks, cloud credits, advisory support and equipment requested by portfolio startups."
      />

      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label="Pending"
          value={pending}
          accent={pending > 0 ? 'amber' : 'slate'}
          icon={Package}
        />
        <StatCard
          label="Approved"
          value={approved}
          accent="emerald"
          icon={Package}
        />
        <StatCard label="Total" value={requests.length} icon={Package} />
      </div>

      {requests.length === 0 ? (
        <EmptyState icon={Package} title="No resource requests" />
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
                        {request.title}
                      </h3>
                      <StatusBadge status={request.status} />
                      <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-white/50">
                        {request.resourceType} · qty {request.quantity}
                      </span>
                    </div>
                    <p className="text-[11px] text-white/40">
                      {startup?.name ?? 'Unknown startup'}
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-white/60">
                      {request.details}
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
            ? `${decision.status === 'APPROVED' ? 'Approve' : 'Decline'} — ${decision.request.title}`
            : ''
        }
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
