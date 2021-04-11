import React, {ButtonHTMLAttributes, ReactElement} from "react";
import classNames from "classnames";
import "./button.scss";

type Props = {
    className?: string;
    btnType?: 'primary' | 'secondary' | '';
} & ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button(props: Props): ReactElement {
    const {
        className,
        btnType = '',
        children,
        onClick,
        disabled,
        ...btnProps
    } = props;
    return (
        <button
            className={classNames('button', className, {
                'button--primary': btnType === 'primary',
                'button--secondary': btnType === 'secondary',
            })}
            onClick={!disabled ? onClick : undefined}
            disabled={disabled}
            {...btnProps}
        >
            {children}
        </button>
    )
}