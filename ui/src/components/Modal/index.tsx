import React, {MouseEventHandler, ReactElement, ReactNode} from 'react';
import ReactDOM from 'react-dom';
import './modal.scss';


type Props = {
    className?: string;
    onClose: MouseEventHandler;
    children: ReactNode | ReactNode[];
}

export default function Modal(props: Props): ReactElement {
    const { className, onClose, children } = props;

    const modalRoot = document.querySelector('#modal-root');

    if (!modalRoot) return <></>;

    return ReactDOM.createPortal(
        <div className="modal__overlay" onClick={onClose}>
            <div className={`modal__wrapper ${className}`} onClick={e => e.stopPropagation()}>
                {children}
            </div>
        </div>,
        modalRoot,
    );
}
