import React, {ReactElement, useEffect, useRef} from "react";
const Jazzicon = require("@metamask/jazzicon");
import classNames from "classnames";
import "./identicon.scss";

type Props = {
    account: string;
    diameter?: number;
    className?: string;
}

export default function Identicon(props: Props): ReactElement {
    const ref = useRef<HTMLDivElement>(null);
    const {
        diameter = 100,
        account,
    } = props;

    useEffect(() => {
        if (ref.current) {
            ref.current.innerHTML = Jazzicon(diameter, account).outerHTML;
        }
    }, [ref, props.account]);

    return (
        <div
            className={classNames('identicon', props.className)}
            style={{
                width: `${diameter}px`,
                height: `${diameter}px`,
            }}
            ref={ref}
        />
    )
}