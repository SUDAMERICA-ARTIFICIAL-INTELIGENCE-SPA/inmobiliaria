import React from "react";

function MotionDiv({ children, ...props }: React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>) {
    const {
        // Filter out framer-motion specific props
        ...htmlProps
    } = props;

    // Only pass valid HTML attributes
    const safeProps: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(htmlProps)) {
        if (key.startsWith("on") || key === "className" || key === "style" || key === "id" || key === "role" || key.startsWith("data-") || key.startsWith("aria-")) {
            safeProps[key] = value;
        }
    }

    return <div {...safeProps}>{children}</div>;
}

export const motion = {
    div: MotionDiv,
    span: MotionDiv,
    p: MotionDiv,
    section: MotionDiv,
    article: MotionDiv,
    header: MotionDiv,
    footer: MotionDiv,
    nav: MotionDiv,
    main: MotionDiv,
    aside: MotionDiv,
    button: MotionDiv,
};

export function AnimatePresence({ children }: React.PropsWithChildren) {
    return <>{children}</>;
}
