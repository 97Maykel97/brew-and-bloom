'use client';

import { Clock3, Coffee, Music2, UsersRound } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { createClient } from '@/lib/supabase/client';
import Container from '../Container';
import styles from './HomeEvents.module.scss';

type TEventCopy = {
	id?: string;
	day: string;
	month: string;
	title: string;
	description: string;
	time: string;
	type?: TEventType;
};

type TEventType = 'coffee' | 'latte_art' | 'music' | 'community';

type TEventRow = {
	id: string;
	event_type: TEventType;
	title_ru: string;
	title_en: string;
	title_he: string;
	description_ru: string;
	description_en: string;
	description_he: string;
	event_date: string;
	start_time: string;
	end_time: string;
};

export type THomeEventsCopy = {
	eyebrow: string;
	title: string;
	description: string;
	viewAll: string;
	tasting: TEventCopy;
	latteArt: TEventCopy;
	acoustic: TEventCopy;
};

type THomeEventsProps = {
	copy: THomeEventsCopy;
	isRtl?: boolean;
	locale: string;
};

export default function HomeEvents({
	copy,
	isRtl = false,
	locale,
}: THomeEventsProps) {
	const [events, setEvents] = useState<TEventCopy[]>([
		{ ...copy.tasting, type: 'coffee' },
		{ ...copy.latteArt, type: 'latte_art' },
		{ ...copy.acoustic, type: 'music' },
	]);

	useEffect(() => {
		let isActive = true;
		const supabase = createClient();

		async function loadEvents() {
			const { data, error } = await supabase
				.from('events')
				.select('id, event_type, title_ru, title_en, title_he, description_ru, description_en, description_he, event_date, start_time, end_time')
				.eq('is_published', true)
				.gte('event_date', getTodayDate())
				.order('event_date', { ascending: true })
				.order('start_time', { ascending: true })
				.limit(3);

			if (!isActive || error) return;
			setEvents(((data as TEventRow[] | null) ?? []).map(event => mapEvent(event, locale)));
		}

		void loadEvents();
		const channel = supabase
			.channel(`public-home-events-${crypto.randomUUID()}`)
			.on(
				'postgres_changes',
				{ event: '*', schema: 'public', table: 'events' },
				() => void loadEvents(),
			)
			.subscribe();

		return () => {
			isActive = false;
			void supabase.removeChannel(channel);
		};
	}, [locale]);

	const featuredEvent = events[0];
	const secondaryEvents = events.slice(1);
	if (!featuredEvent) return null;

	return (
		<section
			id='events'
			className={styles.section}
			dir={isRtl ? 'rtl' : 'ltr'}
		>
			<Container>
				<header className={styles.heading}>
					<div>
						<p className={styles.eyebrow}>{copy.eyebrow}</p>
						<h2 className={styles.title}>{copy.title}</h2>
					</div>
					<div className={styles.introWrap}>
						<p className={styles.intro}>{copy.description}</p>
						<Link className={styles.viewAll} href={`/${locale}/events`}>{copy.viewAll}</Link>
					</div>
				</header>

				<div className={`${styles.grid} ${secondaryEvents.length === 0 ? styles.singleEvent : ''}`}>
					<FeaturedEvent event={featuredEvent} />
					{secondaryEvents.length > 0 ? (
						<div className={styles.secondaryEvents}>
							{secondaryEvents.map(event => (
								<CompactEvent event={event} key={event.id ?? event.title} />
							))}
						</div>
					) : null}
				</div>
			</Container>
		</section>
	);
}

function FeaturedEvent({ event }: { event: TEventCopy }) {
	const imageSource = event.type === 'music' || event.type === 'community'
		? '/event-cafe-evening.webp'
		: '/event-coffee-tasting.webp';

	return (
		<article className={styles.featuredCard}>
			<div className={styles.imageWrapper}>
				<Image
					alt={event.title}
					className={styles.image}
					fill
					sizes='(max-width: 767px) calc(100vw - 32px), 66vw'
					src={imageSource}
				/>
				<DateBadge event={event} />
			</div>
			<div className={styles.featuredContent}>
				<h3 className={styles.eventTitle}>{event.title}</h3>
				<p className={styles.eventDescription}>{event.description}</p>
				<EventTime time={event.time} />
			</div>
		</article>
	);
}

function CompactEvent({
	event,
}: {
	event: TEventCopy;
}) {
	const Icon = event.type === 'music' ? Music2 : event.type === 'community' ? UsersRound : Coffee;

	return (
		<article className={styles.compactCard}>
			<div className={styles.compactTop}>
				<DateBadge event={event} compact />
				<span className={styles.eventIcon} aria-hidden='true'>
					<Icon size={23} strokeWidth={1.5} />
				</span>
			</div>
			<div>
				<h3 className={styles.eventTitle}>{event.title}</h3>
				<p className={styles.eventDescription}>{event.description}</p>
			</div>
			<EventTime time={event.time} />
		</article>
	);
}

function DateBadge({
	event,
	compact = false,
}: {
	event: TEventCopy;
	compact?: boolean;
}) {
	return (
		<time
			className={`${styles.dateBadge} ${compact ? styles.compactDate : ''}`}
		>
			<strong>{event.day}</strong>
			<span>{event.month}</span>
		</time>
	);
}

function EventTime({ time }: { time: string }) {
	return (
		<p className={styles.time}>
			<Clock3 aria-hidden='true' size={16} strokeWidth={1.7} />
			<bdi>{time}</bdi>
		</p>
	);
}

function mapEvent(event: TEventRow, locale: string): TEventCopy {
	const supportedLocale = locale === 'he' || locale === 'en' ? locale : 'ru';
	const title = event[`title_${supportedLocale}`] || event.title_ru;
	const description = event[`description_${supportedLocale}`] || event.description_ru;
	const dateLocale = supportedLocale === 'ru' ? 'ru-RU' : supportedLocale === 'he' ? 'he-IL' : 'en-GB';
	const parts = new Intl.DateTimeFormat(dateLocale, {
		day: '2-digit',
		month: 'short',
		timeZone: 'Asia/Jerusalem',
	}).formatToParts(new Date(`${event.event_date}T12:00:00+03:00`));
	const value = (type: Intl.DateTimeFormatPartTypes) => parts.find(part => part.type === type)?.value ?? '';

	return {
		id: event.id,
		day: value('day'),
		month: value('month').replace('.', ''),
		title,
		description,
		time: `${event.start_time.slice(0, 5)}–${event.end_time.slice(0, 5)}`,
		type: event.event_type,
	};
}

function getTodayDate() {
	const parts = new Intl.DateTimeFormat('en-CA', {
		day: '2-digit',
		month: '2-digit',
		timeZone: 'Asia/Jerusalem',
		year: 'numeric',
	}).formatToParts(new Date());
	const value = (type: Intl.DateTimeFormatPartTypes) => parts.find(part => part.type === type)?.value ?? '';
	return `${value('year')}-${value('month')}-${value('day')}`;
}
