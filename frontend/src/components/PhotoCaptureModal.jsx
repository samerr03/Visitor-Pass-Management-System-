import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';

const PhotoCaptureModal = ({ isOpen, onClose, onCapture }) => {
    const webcamRef = useRef(null);
    const [imageSrc, setImageSrc] = useState(null);

    const videoConstraints = {
        width: 480,
        height: 480,
        facingMode: "user"
    };

    const capture = useCallback(() => {
        const image = webcamRef.current.getScreenshot();
        setImageSrc(image);
    }, [webcamRef]);

    const retake = () => {
        setImageSrc(null);
    };

    const confirmPhoto = () => {
        if (imageSrc) {
            onCapture(imageSrc);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in no-print">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-800">Capture Visitor Photo</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 bg-slate-900 flex flex-col items-center justify-center relative min-h-[400px]">
                    {imageSrc ? (
                        <div className="relative w-full aspect-square rounded-lg overflow-hidden border-2 border-white shadow-lg">
                            <img src={imageSrc} alt="Captured" className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className="relative w-full aspect-square rounded-lg overflow-hidden border-2 border-slate-700 shadow-lg bg-black">
                            <Webcam
                                audio={false}
                                ref={webcamRef}
                                screenshotFormat="image/jpeg"
                                videoConstraints={videoConstraints}
                                className="absolute top-0 left-0 w-full h-full object-cover"
                            />
                            {/* Overlay guide circle */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-64 h-64 border-2 border-white/50 rounded-full"></div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-white border-t flex justify-center gap-4">
                    {imageSrc ? (
                        <>
                            <button
                                onClick={retake}
                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                            >
                                Retake
                            </button>
                            <button
                                onClick={confirmPhoto}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 shadow transition-colors flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                Use Photo
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={onClose}
                                className="px-6 py-2 text-gray-500 hover:text-gray-700 font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={capture}
                                className="px-6 py-2 bg-slate-900 text-white rounded-full font-semibold hover:bg-black shadow-lg transition-transform hover:scale-105 flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                Capture Photo
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PhotoCaptureModal;
