import { motion } from "framer-motion";

const TypingIndicator = () => {
    return (
        <div className="flex items-center gap-1 bg-gray-700/50 px-3 py-2 rounded-full w-fit">
            <span className="text-xs text-gray-400 mr-2">Typing</span>
            <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        className="w-1.5 h-1.5 bg-fuchsia-400 rounded-full"
                        animate={{ y: [0, -5, 0] }}
                        transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: i * 0.2,
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

export default TypingIndicator;
