import { useState } from 'react';
import { Pencil, Plus, Trash2, Users } from 'lucide-react';
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
import { mentorLoads } from '@/store/selectors';
import type { Mentor, MentorStatus } from '@/store/types';

interface Draft {
  firstName: string;
  lastName: string;
  email: string;
  organization: string;
  title: string;
  expertise: string;
  bio: string;
  yearsExperience: string;
  maxStartups: string;
  status: MentorStatus;
}

const BLANK: Draft = {
  firstName: '',
  lastName: '',
  email: '',
  organization: '',
  title: '',
  expertise: '',
  bio: '',
  yearsExperience: '5',
  maxStartups: '3',
  status: 'ACTIVE',
};

function toDraft(mentor: Mentor): Draft {
  return {
    firstName: mentor.firstName,
    lastName: mentor.lastName,
    email: mentor.email,
    organization: mentor.organization,
    title: mentor.title,
    expertise: mentor.expertise.join(', '),
    bio: mentor.bio,
    yearsExperience: String(mentor.yearsExperience),
    maxStartups: String(mentor.maxStartups),
    status: mentor.status,
  };
}

export default function AdminMentorsPage() {
  const { state, dispatch } = useStore();
  const [editing, setEditing] = useState<Mentor | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<Draft>(BLANK);

  const loads = mentorLoads(state);
  const valid =
    draft.firstName.trim() && draft.lastName.trim() && draft.email.trim();

  function openCreate() {
    setDraft(BLANK);
    setCreating(true);
    setEditing(null);
  }

  function openEdit(mentor: Mentor) {
    setDraft(toDraft(mentor));
    setEditing(mentor);
    setCreating(false);
  }

  function save() {
    const shared = {
      firstName: draft.firstName.trim(),
      lastName: draft.lastName.trim(),
      email: draft.email.trim(),
      organization: draft.organization.trim(),
      title: draft.title.trim(),
      expertise: draft.expertise
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      bio: draft.bio.trim(),
      yearsExperience: Number(draft.yearsExperience) || 0,
      maxStartups: Number(draft.maxStartups) || 1,
      status: draft.status,
    };

    if (editing) {
      dispatch({ type: 'MENTOR_UPDATE', mentorId: editing.id, patch: shared });
    } else {
      dispatch({ type: 'MENTOR_CREATE', draft: shared });
    }
    setEditing(null);
    setCreating(false);
  }

  function remove(mentor: Mentor, assignedCount: number) {
    const warning =
      assignedCount > 0
        ? `${mentor.firstName} ${mentor.lastName} is mentoring ${assignedCount} startup${assignedCount === 1 ? '' : 's'}. Removing them will leave ${assignedCount === 1 ? 'it' : 'them'} unassigned. Continue?`
        : `Remove ${mentor.firstName} ${mentor.lastName} from the mentor directory?`;
    if (!window.confirm(warning)) return;
    dispatch({ type: 'MENTOR_DELETE', mentorId: mentor.id });
  }

  return (
    <>
      <PageHeader
        title="Mentor Directory"
        subtitle="Add, edit and retire mentors. Capacity here is what the assignment screen enforces."
        actions={
          <Button onClick={openCreate}>
            <Plus className="mr-1.5 h-4 w-4" /> Add mentor
          </Button>
        }
      />

      {loads.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No mentors yet"
          message="Add a mentor to start assigning them to startups."
          action={
            <Button onClick={openCreate}>
              <Plus className="mr-1.5 h-4 w-4" /> Add mentor
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {loads.map(({ mentor, startups, atCapacity }) => (
            <article
              key={mentor.id}
              className="rounded-xl border border-white/8 bg-white/[0.03] p-5"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/50 to-pink-500/50 text-xs font-bold text-white">
                  {mentor.avatarSeed}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-bold text-white">
                      {mentor.firstName} {mentor.lastName}
                    </h3>
                    <StatusBadge status={mentor.status} />
                  </div>
                  <p className="text-[11px] text-white/45">
                    {mentor.title} · {mentor.organization}
                  </p>
                  <p className="text-[10px] text-white/30">
                    {mentor.email} · {mentor.yearsExperience} yrs
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openEdit(mentor)}
                    aria-label="Edit mentor"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => remove(mentor, startups.length)}
                    aria-label="Remove mentor"
                    className="text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <p className="mt-3 text-[11px] leading-relaxed text-white/50">
                {mentor.bio}
              </p>

              <div className="mt-3 flex flex-wrap gap-1">
                {mentor.expertise.map((tag) => (
                  <span
                    key={tag}
                    className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-white/55"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-4 border-t border-white/5 pt-3">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider text-white/30">
                    Capacity
                  </span>
                  <span
                    className={`text-[11px] font-semibold ${atCapacity ? 'text-red-300' : 'text-emerald-300'}`}
                  >
                    {startups.length} / {mentor.maxStartups}
                  </span>
                </div>
                <ProgressBar
                  value={(startups.length / mentor.maxStartups) * 100}
                  overdue={atCapacity}
                />
                {startups.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {startups.map((s) => (
                      <span
                        key={s.id}
                        className="rounded border border-white/8 bg-white/5 px-1.5 py-0.5 text-[10px] text-white/60"
                      >
                        {s.name}
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
        title={editing ? 'Edit mentor' : 'Add mentor'}
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
            <Button onClick={save} disabled={!valid}>
              {editing ? 'Save changes' : 'Add mentor'}
            </Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First name" required>
            <TextField
              value={draft.firstName}
              onChange={(v) => setDraft({ ...draft, firstName: v })}
            />
          </Field>
          <Field label="Last name" required>
            <TextField
              value={draft.lastName}
              onChange={(v) => setDraft({ ...draft, lastName: v })}
            />
          </Field>
          <Field label="Email" required>
            <TextField
              value={draft.email}
              onChange={(v) => setDraft({ ...draft, email: v })}
            />
          </Field>
          <Field label="Organization">
            <TextField
              value={draft.organization}
              onChange={(v) => setDraft({ ...draft, organization: v })}
            />
          </Field>
          <Field label="Title">
            <TextField
              value={draft.title}
              onChange={(v) => setDraft({ ...draft, title: v })}
            />
          </Field>
          <Field label="Status">
            <SelectField<MentorStatus>
              value={draft.status}
              onChange={(v) => setDraft({ ...draft, status: v })}
              options={[
                { value: 'ACTIVE', label: 'Active' },
                { value: 'INACTIVE', label: 'Inactive' },
              ]}
            />
          </Field>
          <Field label="Years of experience">
            <TextField
              type="number"
              value={draft.yearsExperience}
              onChange={(v) => setDraft({ ...draft, yearsExperience: v })}
            />
          </Field>
          <Field label="Max startups" hint="Enforced on the assignment screen.">
            <TextField
              type="number"
              value={draft.maxStartups}
              onChange={(v) => setDraft({ ...draft, maxStartups: v })}
            />
          </Field>
          <Field
            label="Expertise"
            hint="Comma separated"
            className="sm:col-span-2"
          >
            <TextField
              value={draft.expertise}
              onChange={(v) => setDraft({ ...draft, expertise: v })}
              placeholder="Go-to-Market, Unit Economics, FinTech"
            />
          </Field>
          <Field label="Bio" className="sm:col-span-2">
            <TextAreaField
              value={draft.bio}
              onChange={(v) => setDraft({ ...draft, bio: v })}
              rows={4}
            />
          </Field>
        </div>
      </Modal>
    </>
  );
}
