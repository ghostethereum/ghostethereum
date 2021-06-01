import React from "react";

export default function Spinner(props: { width?: number; height?: number}) {
    return (
        <div
            className="spinner"
            style={{
                height: String(props.height || 2) + 'rem',
                width: String(props.width || 2) + 'rem',
            }}
        />
    )
}