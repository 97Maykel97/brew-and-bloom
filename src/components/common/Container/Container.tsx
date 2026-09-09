import type { ReactNode } from 'react';
import styles from './Container.module.scss';

type TContainerProps = {
	children: ReactNode;
};

function Container({ children }: TContainerProps) {
	return <div className={styles.container}>{children}</div>;
}

export default Container;
