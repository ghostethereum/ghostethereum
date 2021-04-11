import React, {InputHTMLAttributes, ReactElement} from "react";
import "./input.scss";
import classNames from "classnames";

type Props = {
    label?: string;
    errorMessage?: string;
} & InputHTMLAttributes<HTMLInputElement>;

export default function Input(props: Props): ReactElement {
    const {
        label,
        errorMessage,
        className,
        ...inputProps
    } = props;

    return (
        <div className={classNames("input-group", className)}>
            { label && <div className="input-group__label">{label}</div> }
            <input
                {...inputProps}
            />
            { errorMessage && <small className="error-message">{errorMessage}</small> }
        </div>
    )
}