import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const AutoCloseAlert = ({ message, duration = 3000 }) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setVisible(false), duration);
        return () => clearTimeout(timer); // Cleanup timer
    }, [duration]);

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ y: -50, opacity: 0, scale: 0.8 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: -50, opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="fixed z-50 top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-lg font-semibold px-6 py-4 rounded-xl shadow-lg"
                >
                    {message}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

AutoCloseAlert.propTypes = {
    message: PropTypes.string.isRequired,
    duration: PropTypes.number,
};

export default AutoCloseAlert;
