import React, {MouseEventHandler, ReactElement, ReactNode, ReactNodeArray} from 'react';
import ReactDOM from 'react-dom';
import './modal.scss';
import Icon from "../Icon";


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

type HeaderProps = {
    onClose: () => void;
    children: ReactNode;
}

export function ModalHeader(props: HeaderProps): ReactElement {
    return (
        <div className="modal__header">
            <div className="modal__header__title">
                {props.children}
            </div>
            <div className="modal__header__content">
                <Icon
                    fa="fas fa-times"
                    size={1.25}
                    onClick={props.onClose}
                />
            </div>
        </div>
    );
}

type ContentProps = {
    children: ReactNode | ReactNodeArray;
}

export function ModalContent(props: ContentProps): ReactElement {
    return (
        <div className="modal__content">
            {props.children}
        </div>
    );
}

type FooterProps = {
    children: ReactNode | ReactNodeArray;
}

export function ModalFooter(props: ContentProps): ReactElement {
    return (
        <div className="modal__footer">
            {props.children}
        </div>
    );
}