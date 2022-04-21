import React, { FC, Dispatch, useEffect, useContext, useCallback } from 'react';
import styles from '../../css/default.module.scss';
import Modal from 'react-modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { useFetch } from '../../hooks/useFetch';
import { Error } from '../default/Error';
import { PageContext, PageContextProps } from './PageContext';
import { PageForm, PageFormInputs } from './PageForm';

interface CreatePageModalProps {
    createPageModalIsOpen: boolean;
    setCreatePageModalIsOpen: Dispatch<boolean>;
}

export const CreatePageModal: FC<CreatePageModalProps> = ({ createPageModalIsOpen, setCreatePageModalIsOpen }) => {
    const {
        data: createdData,
        performFetch: fetchCreatePage,
        fetchError: createPageError,
        loading: loadingCreatePage,
    } = useFetch();
    const {
        pagesData: { pages, setPages },
    } = useContext<PageContextProps>(PageContext);

    const afterOpenModal = () => {
        // references are now sync'd and can be accessed.
        console.log('Modal opened');
    };

    const closeModal = () => {
        setCreatePageModalIsOpen(false);
    };

    const createPage = async (data: PageFormInputs) => {
        await fetchCreatePage(
            'http://localhost:8000/api/pages/',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            },
            updatePages
        );
        closeModal();
    };

    const updatePages = useCallback(
        (createdData: any) => {
            console.log('upd');
            const alreadyHasData = pages?.some((cur) => cur['id'] === createdData?.id);
            if (!createdData || !pages || alreadyHasData) return;
            // if (!createdData || !pages || pages.includes(createdData)) return; // pages.includes(createdData)) < compare ids instead
            console.log('setting pages... createdData: ', createdData, ', pages: ', pages);
            // test when deleting page after creating it
            setPages([createdData, ...pages]);
        },
        [pages, setPages]
    );

    useEffect(() => {
        updatePages(createdData);
    }, [updatePages, createdData]);

    return (
        <Modal
            isOpen={createPageModalIsOpen}
            onAfterOpen={afterOpenModal}
            onRequestClose={closeModal}
            className={styles.modal}
            contentLabel='Create page modal'
            portalClassName={styles.modalOverlayWrap} // cannot use overlayClassName
        >
            <button onClick={closeModal} className={styles.close}>
                <FontAwesomeIcon icon={faTimes} />
            </button>
            <div>
                <h2>Create Page</h2>
                <PageForm
                    loading={loadingCreatePage}
                    setDisplayModal={setCreatePageModalIsOpen}
                    submitFn={createPage}
                    submitBtnText='Create'
                />
                {createPageError && <Error msg={'Error creating page'} marginTop={true} />}
            </div>
        </Modal>
    );
};
