import { motion as Motion } from "framer-motion";

const TypingIndicator = () => {
    return (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[var(--c-text-2)] leading-none">
            typing
            <span className="inline-flex items-end gap-[3px] h-2.5">
                {[0, 1, 2].map((i) => (
                    <Motion.span
                        key={i}
                        className="w-1 h-1 rounded-full bg-[var(--c-text-3)]"
                        animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }}
                        transition={{
                            duration: 0.9,
                            repeat: Infinity,
                            delay: i * 0.15,
                            ease: "easeInOut",
                        }}
                    />
                ))}
            </span>
        </span>
    );
};

export default TypingIndicator;
