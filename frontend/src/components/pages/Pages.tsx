/* Note: components for the /pages page, not general components for all pages */

import React, { Dispatch, FC, ReactNode, useContext, useState } from 'react';
import styles from '../../css/pages/pages.module.scss';
import { Loading, Section, Error } from '../Default';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faPencilAlt, faPlusSquare, faTrash } from '@fortawesome/free-solid-svg-icons';
import { formatDate, formatTime } from '../../utils/HelperFunctions';
import { FetchDataFn } from '../../hooks/useFetch';
import { DeletePageModal } from './DeletePageModal';
import { PageContext, PageContextProps } from './PageContext';
import { CreatePageModal } from './CreatePageModal';
import { EditPageModal } from './EditPageModal';

export interface WebPage {
    last_edited: string;
    date_created: string;
    id: number;
    notes: string;
    slug: string;
    title: string;
    type: string;
}

interface CurrentPageData {
    fetchPage: FetchDataFn;
    fetchPageError: boolean;
}

interface SidebarProps {
    currentPageData: CurrentPageData;
}

export const Sidebar: FC<SidebarProps> = ({ currentPageData }) => {
    const [expanded, setExpanded] = useState<boolean>(window.innerWidth >= 768);
    const [deleteHovered, setDeleteHovered] = useState<boolean>(false);
    const classes = `${styles.sidebar} ${expanded ? styles.expanded : styles.contracted}`;

    return (
        <div className={classes}>
            <h1>Pages</h1>
            <SidebarList deleteHovered={deleteHovered} currentPageData={currentPageData} />
            <Buttons expanded={expanded} setExpanded={setExpanded} setDeleteHovered={setDeleteHovered} />
        </div>
    );
};

interface SidebarListProps {
    deleteHovered: boolean;
    currentPageData: CurrentPageData;
}

const SidebarList: FC<SidebarListProps> = ({ deleteHovered, currentPageData }) => {
    const { fetchPage } = currentPageData;
    const { pages, currentPage } = useContext<PageContextProps>(PageContext);

    return (
        <ul>
            {pages?.map((page: WebPage) => {
                const isCurrentPage = page?.id === currentPage?.id;
                const classes = `${isCurrentPage ? styles.current : ''} ${
                    isCurrentPage && deleteHovered ? styles.deleteHovered : ''
                }`;

                return (
                    <li
                        key={page.id}
                        className={classes}
                        onClick={() => {
                            if (isCurrentPage) return;
                            fetchPage(`http://localhost:8000/api/pages/${page.id}`);
                        }}
                    >
                        <p>{page.title}</p>
                        <div className={styles.iconContainer}>
                            <FontAwesomeIcon icon={faTrash} />
                        </div>
                    </li>
                );
            })}
        </ul>
    );
};

interface ButtonsProps {
    expanded: boolean;
    setExpanded: Dispatch<boolean>;
    setDeleteHovered: Dispatch<boolean>;
}

const Buttons: FC<ButtonsProps> = ({ expanded, setExpanded, setDeleteHovered }) => {
    const [createPageModalIsOpen, setCreatePageModalIsOpen] = useState<boolean>(false);
    const [editPageModalIsOpen, setEditPageModalIsOpen] = useState<boolean>(false);
    const [deletePageModalIsOpen, setDeletePageModalIsOpen] = useState<boolean>(false);

    return (
        <div className={`${styles.buttonsContainer} ${expanded ? styles.minimised : ''}`}>
            <FontAwesomeIcon icon={faPlusSquare} onClick={() => setCreatePageModalIsOpen(true)} />
            <FontAwesomeIcon icon={faPencilAlt} onClick={() => setEditPageModalIsOpen(true)} />
            <FontAwesomeIcon
                icon={faTrash}
                className={`${styles.expandedOnly} ${styles.binIcon}`}
                onMouseEnter={() => setDeleteHovered(true)}
                onMouseLeave={() => setDeleteHovered(false)}
                onClick={() => setDeletePageModalIsOpen(true)}
            />
            <FontAwesomeIcon
                icon={expanded ? faChevronLeft : faChevronRight}
                onClick={() => setExpanded(!expanded)}
                className={styles.expandIcon}
            />
            <CreatePageModal
                createPageModalIsOpen={createPageModalIsOpen}
                setCreatePageModalIsOpen={setCreatePageModalIsOpen}
            />
            <EditPageModal editPageModalIsOpen={editPageModalIsOpen} setEditPageModalIsOpen={setEditPageModalIsOpen} />
            <DeletePageModal
                deletePageModalIsOpen={deletePageModalIsOpen}
                setDeletePageModalIsOpen={setDeletePageModalIsOpen}
            />
        </div>
    );
};

interface PageDetailsProps {
    page: WebPage | null;
    fetchPageError: boolean;
    loadingCurrentPage: boolean;
}

export const PageDetails: FC<PageDetailsProps> = ({ page, fetchPageError, loadingCurrentPage }) => {
    const DetailsWrap: FC<{
        children: ReactNode;
    }> = ({ children }) => <Section clsOuter={styles.pageDetailsOuter}>{children}</Section>;

    if (fetchPageError) {
        return (
            <DetailsWrap>
                <Error msg={'Error fetching page'} />
            </DetailsWrap>
        );
    }

    if (loadingCurrentPage) {
        return (
            <DetailsWrap>
                <Loading />
            </DetailsWrap>
        );
    }

    if (!page?.id) {
        // if api returns {detail: 'Not found.'}
        return (
            <DetailsWrap>
                <Error msg={'Page not found'} />
            </DetailsWrap>
        );
    }

    return (
        <DetailsWrap>
            <p>Title: {page.title}</p>
            <p>Slug: {page.slug}</p>
            <p>Type: {page.type}</p>
            <p>Notes: {page.notes}</p>
            <p>Date Created: {formatDate(page.date_created)}</p>
            <p>Last Edited: {page.last_edited}</p>
            <p>Last Edited Time: {formatTime(page.last_edited)}</p>
        </DetailsWrap>
    );
};
