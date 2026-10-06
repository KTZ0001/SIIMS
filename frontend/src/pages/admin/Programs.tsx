import { useState } from 'react';
import { Boxes, Pencil, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { Modal } from '@/components/shared/Modal';
import { ProgressBar } from '@/components/shared/ProgressBar';
import {
  Field,
  SelectField,
  TextAreaField,
  TextField,
} from '@/components/shared/FormField';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/StoreContext';
import { formatDate, startupById } from '@/store/selectors';
import type { Program, ProgramStatus } from '@/store/types';

interface Draft {
  name: string;
  cohort: string;
  description: string;
  focusAreas: string;
  startDate: string;
  endDate: string;
  status: ProgramStatus;
  capacity: string;
}

function isoToInput(iso: string): string {
  return iso.slice(0, 10);
}

const BLANK: Draft = {
  name: '',
  cohort: '',
  description: '',
  focusAreas: '',
  startDate: isoToInput(new Date().toISOString()),
  endDate: isoToInput(new Date(Date.now() + 180 * 86_400_000).toISOString()),
  status: 'PLANNED',
  capacity: '10',
};

export default function AdminProgramsPage() {
  const { state, dispatch } = useStore();
  const [editing, setEditing] = useState<Program | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<Draft>(BLANK);

  function openCreate() {
    setDraft(BLANK);
    setCreating(true);
    setEditing(null);
  }

  function openEdit(program: Program) {
    setDraft({
      name: program.name,
      cohort: program.cohort,
      description: program.description,
      focusAreas: program.focusAreas.join(', '),
      startDate: isoToInput(program.startDate),
      endDate: isoToInput(program.endDate),
      status: program.status,
      capacity: String(program.capacity),
    });
    setEditing(program);
    setCreating(false);
  }

  function save() {
    const shared = {
      name: draft.name.trim(),
      cohort: draft.cohort.trim(),
      description: draft.description.trim(),
      focusAreas: draft.focusAreas
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      startDate: new Date(draft.startDate).toISOString(),
      endDate: new Date(draft.endDate).toISOString(),
      status: draft.status,
      capacity: Number(draft.capacity) || 1,
    };

    if (editing) {
      dispatch({
        type: 'PROGRAM_UPDATE',
        programId: editing.id,
        patch: shared,
      });
    } else {
      dispatch({ type: 'PROGRAM_CREATE', draft: shared });
    }
    setEditing(null);
    setCreating(false);
  }

  function remove(program: Program) {
    if (
      !window.confirm(
        `Delete "${program.name}"? Startups in it will be detached from the programme.`,
      )
    ) {
      return;
    }
    dispatch({ type: 'PROGRAM_DELETE', programId: program.id });
  }

  return (
    <>
      <PageHeader
        title="Incubation Programs"
        subtitle="Cohorts and tracks that accepted startups are placed into."
        actions={
          <Button onClick={openCreate}>
            <Plus className="mr-1.5 h-4 w-4" /> New program
          </Button>
        }
      />

      {state.programs.length === 0 ? (
        <EmptyState
          icon={Boxes}
          title="No programs yet"
          action={
            <Button onClick={openCreate}>
              <Plus className="mr-1.5 h-4 w-4" /> New program
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {state.programs.map((program) => (
            <article
              key={program.id}
              className="rounded-xl border border-white/8 bg-white/[0.03] p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-bold text-white">
                      {program.name}
                    </h3>
                    <StatusBadge status={program.status} />
                  </div>
                  <p className="text-[11px] text-white/40">
                    {formatDate(program.startDate)} —{' '}
                    {formatDate(program.endDate)}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openEdit(program)}
                    aria-label="Edit program"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => remove(program)}
                    aria-label="Delete program"
                    className="text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <p className="mt-2.5 text-[11px] leading-relaxed text-white/55">
                {program.description}
              </p>

              <div className="mt-3 flex flex-wrap gap-1">
                {program.focusAreas.map((area) => (
                  <span
                    key={area}
                    className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-white/55"
                  >
                    {area}
                  </span>
                ))}
              </div>

              <div className="mt-4 border-t border-white/5 pt-3">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider text-white/30">
                    Enrolment
                  </span>
                  <span className="text-[11px] font-semibold text-white/70">
                    {program.startupIds.length} / {program.capacity}
                  </span>
                </div>
                <ProgressBar
                  value={
                    (program.startupIds.length / Math.max(1, program.capacity)) *
                    100
                  }
                />
                {program.startupIds.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {program.startupIds.map((id) => (
                      <span
                        key={id}
                        className="rounded border border-white/8 bg-white/5 px-1.5 py-0.5 text-[10px] text-white/60"
                      >
                        {startupById(state, id)?.name ?? id}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal
        open={creating || editing !== null}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        size="lg"
        title={editing ? 'Edit program' : 'New program'}
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setCreating(false);
                setEditing(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={save} disabled={!draft.name.trim()}>
              {editing ? 'Save changes' : 'Create program'}
            </Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" required className="sm:col-span-2">
            <TextField
              value={draft.name}
              onChange={(v) => setDraft({ ...draft, name: v })}
              placeholder="Ignite Cohort 2027"
            />
          </Field>
          <Field label="Cohort label">
            <TextField
              value={draft.cohort}
              onChange={(v) => setDraft({ ...draft, cohort: v })}
              placeholder="Ignite / 2027"
            />
          </Field>
          <Field label="Status">
            <SelectField<ProgramStatus>
              value={draft.status}
              onChange={(v) => setDraft({ ...draft, status: v })}
              options={[
                { value: 'PLANNED', label: 'Planned' },
                { value: 'ACTIVE', label: 'Active' },
                { value: 'COMPLETED', label: 'Completed' },
              ]}
            />
          </Field>
          <Field label="Start date">
            <TextField
              type="date"
              value={draft.startDate}
              onChange={(v) => setDraft({ ...draft, startDate: v })}
            />
          </Field>
          <Field label="End date">
            <TextField
              type="date"
              value={draft.endDate}
              onChange={(v) => setDraft({ ...draft, endDate: v })}
            />
          </Field>
          <Field label="Capacity">
            <TextField
              type="number"
              value={draft.capacity}
              onChange={(v) => setDraft({ ...draft, capacity: v })}
            />
          </Field>
          <Field label="Focus areas" hint="Comma separated">
            <TextField
              value={draft.focusAreas}
              onChange={(v) => setDraft({ ...draft, focusAreas: v })}
              placeholder="HealthTech, AgriTech"
            />
          </Field>
          <Field label="Description" className="sm:col-span-2">
            <TextAreaField
              value={draft.description}
              onChange={(v) => setDraft({ ...draft, description: v })}
              rows={4}
            />
          </Field>
        </div>
      </Modal>
    </>
  );
}
