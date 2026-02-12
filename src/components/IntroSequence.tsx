"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface IntroSequenceProps {
    onComplete: () => void;
}

const TERMINAL_LINES = [
    { text: "> Inicializando sistema OSINT...", delay: 0 },
    { text: "> Conectando a servidores del condado...", delay: 600 },
    { text: "> Bypassing firewall... [OK]", delay: 1200 },
    { text: "> Accediendo a registros de Miami-Dade County...", delay: 1800 },
    { text: "> Obteniendo registros de propiedad...", delay: 2400 },
    { text: "> Descifrando 500 activos inmobiliarios...", delay: 3000 },
    { text: "> Cruzando datos con registros fiscales...", delay: 3500 },
    { text: "", delay: 3800 },
    { text: "█ ACCESO CONCEDIDO █", delay: 4000, highlight: true },
];

export function IntroSequence({ onComplete }: IntroSequenceProps) {
    const [visibleLines, setVisibleLines] = useState<number>(0);
    const [progress, setProgress] = useState(0);
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        // Show terminal lines progressively
        TERMINAL_LINES.forEach((line, index) => {
            setTimeout(() => {
                setVisibleLines(index + 1);
            }, line.delay);
        });

        // Animate progress bar
        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(progressInterval);
                    return 100;
                }
                return prev + 1;
            });
        }, 42); // ~4.2 seconds to complete

        // Trigger fade out after all lines + a beat
        const fadeTimer = setTimeout(() => {
            setFadeOut(true);
        }, 4800);

        // Call onComplete after fade animation
        const completeTimer = setTimeout(() => {
            onComplete();
        }, 5600);

        return () => {
            clearInterval(progressInterval);
            clearTimeout(fadeTimer);
            clearTimeout(completeTimer);
        };
    }, [onComplete]);

    return (
        <AnimatePresence>
            {!fadeOut ? (
                <motion.div
                    key="intro"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
                >
                    {/* Scanline effect */}
                    <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
                        style={{
                            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,240,255,0.1) 2px, rgba(0,240,255,0.1) 4px)",
                        }}
                    />

                    {/* Subtle vignette */}
                    <div className="absolute inset-0 pointer-events-none"
                        style={{
                            background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.8) 100%)",
                        }}
                    />

                    <div className="relative w-full max-w-2xl px-8">
                        {/* Logo / Title */}
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="mb-8 text-center"
                        >
                            <h1 className="text-xs font-mono tracking-[0.5em] text-[#00F0FF]/40 uppercase mb-2">
                                Sistema de Inteligencia Inmobiliaria
                            </h1>
                            <div className="h-px w-full bg-gradient-to-r from-transparent via-[#00F0FF]/30 to-transparent" />
                        </motion.div>

                        {/* Terminal Output */}
                        <div className="font-mono text-sm space-y-1 mb-8 min-h-[260px]">
                            {TERMINAL_LINES.slice(0, visibleLines).map((line, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className={
                                        line.highlight
                                            ? "text-[#00F0FF] font-bold text-lg mt-4 tracking-widest animate-pulse"
                                            : "text-[#00F0FF]/70"
                                    }
                                >
                                    {line.text}
                                    {index === visibleLines - 1 && !line.highlight && (
                                        <span className="inline-block w-2 h-4 bg-[#00F0FF] ml-1 animate-pulse" />
                                    )}
                                </motion.div>
                            ))}
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-2">
                            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full rounded-full"
                                    style={{
                                        width: `${progress}%`,
                                        background: "linear-gradient(90deg, #00F0FF, #A855F7)",
                                        boxShadow: "0 0 20px rgba(0,240,255,0.5)",
                                    }}
                                    transition={{ duration: 0.1 }}
                                />
                            </div>
                            <div className="flex justify-between text-xs font-mono text-white/30">
                                <span>Cargando módulos...</span>
                                <span>{Math.min(progress, 100)}%</span>
                            </div>
                        </div>

                        {/* Bottom branding */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1, duration: 1 }}
                            className="mt-12 text-center"
                        >
                            <p className="text-[10px] font-mono text-white/15 tracking-widest uppercase">
                                Predesarrollo Agente de IA — v0.9.5
                            </p>
                        </motion.div>
                    </div>
                </motion.div>
            ) : (
                <motion.div
                    key="fade"
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="fixed inset-0 z-[9999] bg-black"
                />
            )}
        </AnimatePresence>
    );
}
