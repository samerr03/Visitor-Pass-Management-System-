import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, AlertCircle } from 'lucide-react';

const QRScannerModal = ({ isOpen, onClose, onScanSuccess }) => {
    const scannerRef = useRef(null);
    const html5QrCode = useRef(null);
    const [cameraError, setCameraError] = useState(null);

    useEffect(() => {
        if (!isOpen) return;

        let isMounted = true;
        setCameraError(null);

        const startScanner = async () => {
            try {
                html5QrCode.current = new Html5Qrcode("qr-reader");
                await html5QrCode.current.start(
                    { facingMode: "environment" },
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                        aspectRatio: 1.0
                    },
                    (decodedText) => {
                        if (isMounted) {
                            handleSuccess(decodedText);
                        }
                    },
                    (error) => {
                        // Ignore standard scan failures (empty frame)
                    }
                );
            } catch (err) {
                if (isMounted) {
                    console.error("Camera Error:", err);
                    setCameraError("Unable to access camera. Please check permissions.");
                }
            }
        };

        // Small timeout to allow DOM element "qr-reader" to render
        const timeoutId = setTimeout(() => {
            if (isMounted) startScanner();
        }, 100);

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
            if (html5QrCode.current && html5QrCode.current.isScanning) {
                html5QrCode.current.stop()
                    .then(() => {
                        html5QrCode.current.clear();
                    })
                    .catch((err) => console.error("Error stopping scanner:", err));
            }
        };
    }, [isOpen]);

    const handleSuccess = (decodedText) => {
        // Stop scanning immediately on success
        if (html5QrCode.current && html5QrCode.current.isScanning) {
            html5QrCode.current.stop().catch(console.error);
        }

        onScanSuccess(decodedText);
    };

    const handleClose = () => {
        if (html5QrCode.current && html5QrCode.current.isScanning) {
            html5QrCode.current.stop().catch(console.error);
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col transform transition-all">

                {/* Header */}
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <div className="flex items-center gap-2 text-slate-800">
                        <Camera className="w-5 h-5 text-indigo-600" />
                        <h3 className="font-bold">Scan QR Code</h3>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-1.5 rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Scanner Area */}
                <div className="p-4 bg-slate-900 flex flex-col items-center justify-center min-h-[300px] relative">
                    {cameraError ? (
                        <div className="text-center p-6 text-red-400">
                            <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-80" />
                            <p className="text-sm">{cameraError}</p>
                        </div>
                    ) : (
                        <div className="w-full relative overflow-hidden rounded-xl bg-black">
                            {/* Standard html5-qrcode mount point */}
                            <div id="qr-reader" className="w-full" ref={scannerRef}></div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-white text-center border-t border-slate-100">
                    <p className="text-xs text-slate-500 font-medium">Position the QR code within the frame to scan.</p>
                </div>

            </div>
        </div>
    );
};

export default QRScannerModal;
