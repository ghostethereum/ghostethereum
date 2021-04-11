import React, {OptionHTMLAttributes, ReactElement, SelectHTMLAttributes} from "react";
import "./dropdown.scss";

type Props = {
    options: OptionProps[];
    label?: string;
    errorMessage?: string;
} & SelectHTMLAttributes<HTMLSelectElement>;

type OptionProps = {
    text: string;
} & OptionHTMLAttributes<HTMLOptionElement>;

export default function Dropdown(props: Props): ReactElement {
    const {
        options,
        label,
        errorMessage,
        ...selectProps
    } = props;

    return (
        <div className="dropdown-group">
            { label && <div className="input-group__label">{label}</div> }
            <select
                className="dropdown"
                {...selectProps}
            >
                {options.map(({ value, text }) => {
                    return (
                        <option value={value}>
                            {text}
                        </option>
                    )
                })}
            </select>
            { errorMessage && <small className="error-message">{errorMessage}</small> }
        </div>

    )
}