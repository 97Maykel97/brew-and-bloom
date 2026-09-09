import { Heart } from 'lucide-react';

import Container from '../Container';
import styles from './Hero.module.scss';

type THero = {
	eyebrow: string;
	title: string;
	subtitle: string;
	descr: string;
	buttonText: string;
	note: string;
};

type THeroProps = {
	hero: THero;
};

function Hero({ hero }: THeroProps) {
	const { eyebrow, title, subtitle, descr, buttonText, note } = hero;
	const noteLines = note.split('\n');
	const lastNoteLineIndex = noteLines.length - 1;

	return (
		<section className={styles.hero}>
			<Container>
				<p className={styles.eyebrow}>{eyebrow}</p>
				<h1 className={styles.title}>{title}</h1>
				<p className={styles.subtitle}>{subtitle}</p>
				<p className={styles.descr}>{descr}</p>
				<button type='button' className={styles.button}>
					{buttonText}
					<span aria-hidden='true'>&rarr;</span>
				</button>
				<p className={styles.note}>
					{noteLines.map((line, index) => (
						<span
							key={`${line}-${index}`}
							className={
								index === lastNoteLineIndex
									? styles.noteLastLine
									: styles.noteLine
							}
						>
							{index === lastNoteLineIndex && (
								<span className={styles.noteDecoration} aria-hidden='true' />
							)}
							{line}
							{index === lastNoteLineIndex && (
								<Heart
									aria-hidden='true'
									className={styles.noteHeart}
									size={32}
									strokeWidth={1.5}
								/>
							)}
						</span>
					))}
				</p>
			</Container>
			<div className={styles.steam} aria-hidden='true'>
				<span className={styles.steamWisp} />
				<span className={styles.steamWisp} />
				<span className={styles.steamWisp} />
				<span className={styles.steamWisp} />
				<span className={styles.steamWisp} />
			</div>
		</section>
	);
}

export default Hero;
