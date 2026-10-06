import { useState } from 'react';
import { IndianRupee, Package, Plus } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { Modal } from '@/components/shared/Modal';
import {
  Field,
  SelectField,
  TextAreaField,
  TextField,
} from '@/components/shared/FormField';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/StoreContext';
import {
  formatDate,
  formatINR,
  fundingForStartup,
  resourcesForStartup,
  startupForFounder,
} from '@/store/selectors';
import { RESOURCE_TYPES, type FundingCategory, type ResourceType } from '@/store/types';

const FUNDING_CATEGORIES: FundingCategory[] = [
  'Seed Grant',
  'Prototype Grant',
  'Working Capital',
  'Travel & Events',
  'Equipment',
];

export default function FounderFundingPage() {
  const { state, actor, dispatch } = useStore();
  const startup = startupForFounder(state, actor.id);

  const [fundingOpen, setFundingOpen] = useState(false);
  const [resourceOpen, setResourceOpen] = useState(false);

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<FundingCategory>('Seed Grant');
  const [purpose, setPurpose] = useState('');

  const [resourceType, setResourceType] = useState<ResourceType>('Lab Space');
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [quantity, setQuantity] = useState('1');

  if (!startup) {
    return (
      <>
        <PageHeader title="Funding & Resources" />
        <EmptyState title="No startup profile" />
      </>
    );
  }

  const funding = fundingForStartup(state, startup.id);
  const resources = resourcesForStartup(state, startup.id);

  const approvedTotal = funding
    .filter((f) => f.status === 'APPROVED')
    .reduce((sum, f) => sum + f.amount, 0);

  function submitFunding() {
    const value = Number(amount);
    if (!startup || !value || !purpose.trim()) return;
    dispatch({
      type: 'FUNDING_REQUEST_CREATE',
      startupId: startup.id,
      amount: value,
      category,
      purpose: purpose.trim(),
    });
    setAmount('');
    setPurpose('');
    setCategory('Seed Grant');
    setFundingOpen(false);
  }

  function submitResource() {
    if (!startup || !title.trim() || !details.trim()) return;
    dispatch({
      type: 'RESOURCE_REQUEST_CREATE',
      startupId: startup.id,
      resourceType,
      title: title.trim(),
      details: details.trim(),
      quantity: Number(quantity) || 1,
    });
    setTitle('');
    setDetails('');
    setQuantity('1');
    setResourceType('Lab Space');
    setResourceOpen(false);
  }

  return (
    <>
      <PageHeader
        title="Funding & Resources"
        subtitle="Raise requests with the incubation center and track their decisions."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Approved funding"
          value={formatINR(approvedTotal)}
          icon={IndianRupee}
          accent="emerald"
        />
        <StatCard
          label="Funding goal"
          value={formatINR(startup.fundingGoal)}
          icon={IndianRupee}
        />
        <StatCard
          label="Pending funding"
          value={funding.filter((f) => f.status === 'PENDING').length}
          accent="amber"
          icon={IndianRupee}
        />
        <StatCard
          label="Pending resources"
          value={resources.filter((r) => r.status === 'PENDING').length}
          accent="amber"
          icon={Package}
        />
      </div>

      <section className="rounded-xl border border-white/8 bg-white/[0.03] p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-white">Funding requests</h2>
          <Button size="sm" onClick={() => setFundingOpen(true)}>
            <Plus className="mr-1 h-3.5 w-3.5" /> New request
          </Button>
        </div>

        {funding.length === 0 ? (
          <EmptyState
            icon={IndianRupee}
            title="No funding requests"
            message="Raise a request and the incubation center will review it."
          />
        ) : (
          <ul className="space-y-2.5">
            {funding.map((request) => (
              <li
                key={request.id}
                className="rounded-lg border border-white/5 bg-white/[0.02] p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white">
                      {formatINR(request.amount)}
                      <span className="ml-2 text-[11px] font-normal text-white/40">
                        {request.category}
                      </span>
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-white/55">
                      {request.purpose}
                    </p>
                    <p className="mt-1.5 text-[10px] text-white/30">
                      Requested {formatDate(request.requestedAt)}
                      {request.decidedAt &&
                        ` · decided ${formatDate(request.decidedAt)} by ${request.decidedBy}`}
                    </p>
                    {request.note && (
                      <p className="mt-1.5 rounded border border-white/5 bg-white/[0.03] px-2.5 py-1.5 text-[11px] leading-relaxed text-white/55">
                        {request.note}
                      </p>
                    )}
                  </div>
                  <StatusBadge status={request.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-white/8 bg-white/[0.03] p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-white">Resource requests</h2>
          <Button size="sm" variant="outline" onClick={() => setResourceOpen(true)}>
            <Plus className="mr-1 h-3.5 w-3.5" /> New request
          </Button>
        </div>

        {resources.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No resource requests"
            message="Request lab space, cloud credits, legal advisory and more."
          />
        ) : (
          <ul className="space-y-2.5">
            {resources.map((request) => (
              <li
                key={request.id}
                className="rounded-lg border border-white/5 bg-white/[0.02] p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white">
                      {request.title}
                      <span className="ml-2 text-[11px] font-normal text-white/40">
                        {request.resourceType} · qty {request.quantity}
                      </span>
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-white/55">
                      {request.details}
                    </p>
                    <p className="mt-1.5 text-[10px] text-white/30">
                      Requested {formatDate(request.requestedAt)}
                      {request.decidedAt &&
                        ` · decided ${formatDate(request.decidedAt)} by ${request.decidedBy}`}
                    </p>
                    {request.note && (
                      <p className="mt-1.5 rounded border border-white/5 bg-white/[0.03] px-2.5 py-1.5 text-[11px] leading-relaxed text-white/55">
                        {request.note}
                      </p>
                    )}
                  </div>
                  <StatusBadge status={request.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Modal
        open={fundingOpen}
        onClose={() => setFundingOpen(false)}
        title="New funding request"
        description="This goes straight to the incubation center's funding queue."
        footer={
          <>
            <Button variant="ghost" onClick={() => setFundingOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={submitFunding}
              disabled={!Number(amount) || !purpose.trim()}
            >
              Submit request
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Amount (₹)" required>
            <TextField
              type="number"
              value={amount}
              onChange={setAmount}
              placeholder="400000"
            />
          </Field>
          <Field label="Category" required>
            <SelectField<FundingCategory>
              value={category}
              onChange={setCategory}
              options={FUNDING_CATEGORIES.map((c) => ({ value: c, label: c }))}
            />
          </Field>
          <Field label="What is it for?" required>
            <TextAreaField
              value={purpose}
              onChange={setPurpose}
              rows={4}
              placeholder="Be specific about what the money buys and over what period."
            />
          </Field>
        </div>
      </Modal>

      <Modal
        open={resourceOpen}
        onClose={() => setResourceOpen(false)}
        title="New resource request"
        description="Lab space, desks, cloud credits, advisory support and equipment."
        footer={
          <>
            <Button variant="ghost" onClick={() => setResourceOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={submitResource}
              disabled={!title.trim() || !details.trim()}
            >
              Submit request
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Resource type" required>
            <SelectField<ResourceType>
              value={resourceType}
              onChange={setResourceType}
              options={RESOURCE_TYPES.map((r) => ({ value: r, label: r }))}
            />
          </Field>
          <Field label="Title" required>
            <TextField
              value={title}
              onChange={setTitle}
              placeholder="Wet lab bench for cartridge testing"
            />
          </Field>
          <Field label="Details" required>
            <TextAreaField value={details} onChange={setDetails} rows={4} />
          </Field>
          <Field label="Quantity" required>
            <TextField
              type="number"
              value={quantity}
              onChange={setQuantity}
              className="max-w-24"
            />
          </Field>
        </div>
      </Modal>
    </>
  );
}
