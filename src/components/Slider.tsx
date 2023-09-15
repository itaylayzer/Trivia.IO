import { useState } from "react";

export default function Slider({
    width,
    step,
    min,
    max,
    onValue,
    defualtValue,
    space,
}: {
    defualtValue: number;
    step?: number;
    min?: number;
    max?: number;
    width?: number;
    space?: number;
    onValue?: (d: number) => void;
}) {
    const n = useState<number>(defualtValue ?? 0);

    const styles = {
        slider: {
            display: "inline-flex",
            width: width ?? 200,
        },
        span: {
            display: "inline-block",
            translate: "0 -12px",
        },
        input: {
            display: "inline-block",
            height: 3,
            marginRight: space ?? 10,
        },
    } as { [key: string]: React.CSSProperties };
    return (
        <div className="slider" style={styles.slider}>
            <input
                type="range"
                step={step ?? 1}
                min={min ?? 0}
                max={max ?? 10}
                defaultValue={n[0].toString()}
                style={styles.input}
                onChange={(e) => {
                    n[1](e.currentTarget.valueAsNumber);
                    onValue?.(e.currentTarget.valueAsNumber);
                }}
            />
            <span style={styles.span}>{n[0]}</span>
        </div>
    );
}
