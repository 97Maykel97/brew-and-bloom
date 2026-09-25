import { Check, LoaderCircle } from 'lucide-react';
import type { FormEvent } from 'react';

import {
	EVENT_LANGUAGE_LABELS,
	isEventDraftComplete,
	isEventLanguageComplete,
	type TAdminEventsCopy,
	type TEventDraft,
	type TEventLanguage,
	type TEventType,
} from '../lib/admin-events-config';

type TAdminEventFormProps = {
	activeLanguage: TEventLanguage;
	copy: TAdminEventsCopy;
	draft: TEventDraft;
	isEditing: boolean;
	isSaving: boolean;
	onDraftChange: (draft: TEventDraft) => void;
	onLanguageChange: (language: TEventLanguage) => void;
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

const LANGUAGES: TEventLanguage[] = ['ru', 'en', 'he'];
const INPUT_CLASS_NAME = 'h-11 rounded-xl border border-[#d8cabd] bg-white px-3 text-sm outline-none focus:border-[var(--accent)]';

export default function AdminEventForm({
	activeLanguage,
	copy,
	draft,
	isEditing,
	isSaving,
	onDraftChange,
	onLanguageChange,
	onSubmit,
}: TAdminEventFormProps) {
	const titleKey = `title_${activeLanguage}` as const;
	const descriptionKey = `description_${activeLanguage}` as const;

	return (
		<form className='mt-5 rounded-2xl bg-[#f2e7db] p-4 sm:p-5' onSubmit={onSubmit}>
			<div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
				<EventInput label={copy.date}><input className={INPUT_CLASS_NAME} onChange={event => onDraftChange({ ...draft, event_date: event.target.value })} required type='date' value={draft.event_date} /></EventInput>
				<EventInput label={copy.start}><input className={INPUT_CLASS_NAME} onChange={event => onDraftChange({ ...draft, start_time: event.target.value })} required type='time' value={draft.start_time} /></EventInput>
				<EventInput label={copy.end}><input className={INPUT_CLASS_NAME} onChange={event => onDraftChange({ ...draft, end_time: event.target.value })} required type='time' value={draft.end_time} /></EventInput>
				<EventInput label={copy.type}>
					<select className={`${INPUT_CLASS_NAME} cursor-pointer`} onChange={event => onDraftChange({ ...draft, event_type: event.target.value as TEventType })} value={draft.event_type}>
						{(Object.keys(copy.types) as TEventType[]).map(type => <option key={type} value={type}>{copy.types[type]}</option>)}
					</select>
				</EventInput>
			</div>

			<p className='mt-5 text-xs text-[var(--muted)]'>{copy.translationsHint}</p>
			<div className='mt-2 flex flex-wrap items-center gap-2'>
				<span className='me-1 text-xs font-medium text-[var(--muted)]'>{copy.language}</span>
				{LANGUAGES.map(language => {
					const isComplete = isEventLanguageComplete(draft, language);
					return (
						<button className={`inline-flex h-9 min-w-14 cursor-pointer items-center justify-center gap-1.5 rounded-full px-3 text-xs font-bold transition ${activeLanguage === language ? 'bg-[var(--accent)] text-white' : 'bg-white text-[var(--muted)]'}`} key={language} onClick={() => onLanguageChange(language)} type='button'>
							{EVENT_LANGUAGE_LABELS[language]}
							<span aria-hidden='true' className={`h-1.5 w-1.5 rounded-full ${isComplete ? 'bg-[#75a267]' : 'bg-[#d39a66]'}`} />
						</button>
					);
				})}
			</div>

			<div className='mt-3 grid gap-3'>
				<EventInput label={`${copy.titleField} · ${EVENT_LANGUAGE_LABELS[activeLanguage]}`}>
					<input className={INPUT_CLASS_NAME} dir={activeLanguage === 'he' ? 'rtl' : 'ltr'} maxLength={160} onChange={event => onDraftChange({ ...draft, [titleKey]: event.target.value })} required value={draft[titleKey]} />
				</EventInput>
				<EventInput label={`${copy.description} · ${EVENT_LANGUAGE_LABELS[activeLanguage]}`}>
					<textarea className='min-h-24 resize-y rounded-xl border border-[#d8cabd] bg-white px-3 py-3 text-sm outline-none focus:border-[var(--accent)]' dir={activeLanguage === 'he' ? 'rtl' : 'ltr'} maxLength={500} onChange={event => onDraftChange({ ...draft, [descriptionKey]: event.target.value })} required value={draft[descriptionKey]} />
				</EventInput>
			</div>

			<div className='mt-4 flex flex-wrap items-center justify-between gap-3'>
				<label className='inline-flex cursor-pointer items-center gap-2 text-sm font-medium'>
					<input checked={draft.is_published} className='h-4 w-4 accent-[var(--accent)]' onChange={event => onDraftChange({ ...draft, is_published: event.target.checked })} type='checkbox' />
					{copy.published}
				</label>
				<button className='inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-[#63805a] px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50' disabled={isSaving || !isEventDraftComplete(draft)} type='submit'>
					{isSaving ? <LoaderCircle className='animate-spin' size={16} /> : <Check size={16} />}
					{isEditing ? copy.save : copy.create}
				</button>
			</div>
		</form>
	);
}

function EventInput({ children, label }: { children: React.ReactNode; label: string }) {
	return <label className='grid gap-1.5 text-xs font-medium text-[var(--muted)]'>{label}{children}</label>;
}
