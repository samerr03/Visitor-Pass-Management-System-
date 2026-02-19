import React, { useEffect, useState } from "react";
import QRCodeLib from "qrcode";
import logo from "../assets/shield-logo.png";

const VisitorPass = ({ visitor, innerRef }) => {
    const [qrCodeUrl, setQrCodeUrl] = useState("");

    useEffect(() => {
        if (visitor) {
            const generateQR = async () => {
                try {
                    const qrData = JSON.stringify({
                        id: visitor._id,
                        passId: visitor.passId,
                        name: visitor.name,
                        entryTime: visitor.entryTime,
                    });
                    const url = await QRCodeLib.toDataURL(qrData, { width: 200, margin: 1 });
                    setQrCodeUrl(url);
                } catch (err) {
                    console.error("QR Generation Error:", err);
                }
            };
            generateQR();
        }
    }, [visitor]);

    if (!visitor) return null;

    // 🔥 Safe API base (no crash if env missing)
    const API_BASE_URL =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

    // Remove /api from end safely
    const HOST = API_BASE_URL.replace(/\/api\/?$/, "");

    // Helper to process photo URL safely
    const getPhotoUrl = (photoPath) => {
        if (!photoPath) return null;

        let filename = photoPath;

        // Normalize slashes (Windows fix)
        const normalized = photoPath.replace(/\\/g, "/");

        // Extract filename after uploads/
        if (normalized.includes("uploads/")) {
            filename = normalized.split("uploads/").pop();
        }

        if (filename) {
            return `${HOST}/uploads/${filename}`;
        }

        return null;
    };

    const photoUrl = getPhotoUrl(visitor.photo);

    // Safe date formatting
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return isNaN(date.getTime())
            ? "Invalid Date"
            : date.toLocaleDateString();
    };

    const formatTime = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return isNaN(date.getTime())
            ? "Invalid Time"
            : date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            });
    };

    return (
        <div className="w-full h-full flex justify-center items-center py-4 print:p-0 print:block print:w-auto print:h-auto">
            <div
                ref={innerRef}
                className="w-[320px] min-h-[500px] bg-white border-2 border-slate-900 rounded-xl overflow-hidden shadow-2xl text-sm mx-auto print:w-[320px] print:shadow-none"
            >
                {/* Header */}
                <div className="bg-slate-900 text-white p-5 text-center relative">
                    {/* Logo */}
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-20 h-20 flex items-center justify-center">
                        <img src={logo} alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    <h1 className="text-xl font-bold uppercase pl-32">Visitor Pass</h1>
                    <p className="text-slate-400 text-[10px] uppercase pl-32">
                        Visitor Management System
                    </p>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col items-center gap-4">
                    {/* Photo */}
                    <div className="relative">
                        <div className="w-32 h-32 rounded-full border-4 border-slate-100 shadow-xl overflow-hidden bg-slate-100">
                            {photoUrl ? (
                                <img
                                    src={photoUrl}
                                    alt="Visitor"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.src = `https://ui-avatars.com/api/?name=${visitor.name}&background=0D8ABC&color=fff`;
                                    }}
                                />
                            ) : (
                                <img
                                    src={`https://ui-avatars.com/api/?name=${visitor.name}&background=0D8ABC&color=fff&size=200`}
                                    alt="Visitor"
                                    className="w-full h-full object-cover"
                                />
                            )}
                        </div>

                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded-full uppercase shadow-md">
                            Active
                        </div>
                    </div>

                    {/* Name */}
                    <div className="text-center w-full">
                        <h2 className="text-xl font-bold text-slate-800 uppercase">
                            {visitor.name}
                        </h2>
                        <p className="text-slate-500 text-xs">
                            {visitor.purpose} • {visitor.phone}
                        </p>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-3 w-full bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div>
                            <p className="text-[10px] text-slate-400 uppercase">
                                Meeting With
                            </p>
                            <p className="font-bold text-slate-700 text-sm truncate">
                                {visitor.personToMeet}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 uppercase">Pass ID</p>
                            <p className="font-mono font-bold text-blue-600 text-sm truncate">
                                {visitor.passId}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 uppercase">
                                Entry Time
                            </p>
                            <p className="font-bold text-slate-700 text-xs">
                                {formatTime(visitor.entryTime)}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 uppercase">Date</p>
                            <p className="font-bold text-slate-700 text-xs">
                                {formatDate(visitor.entryTime)}
                            </p>
                        </div>
                    </div>

                    {/* QR */}
                    <div className="mt-2 bg-white p-2 rounded-lg border-2 border-slate-200 flex justify-center">
                        {qrCodeUrl ? (
                            <img src={qrCodeUrl} alt="QR Code" className="w-[140px] h-[140px]" />
                        ) : (
                            <div className="w-[140px] h-[140px] bg-slate-100 flex items-center justify-center text-xs text-slate-400">Loading QR...</div>
                        )}
                    </div>

                    <p className="text-[8px] text-slate-400 text-center">
                        Scan at exit gate
                    </p>
                </div>

                {/* Footer */}
                <div className="bg-slate-50 border-t border-slate-100 p-2 text-center">
                    <p className="text-[8px] text-slate-400 uppercase">
                        Authorized Visitor Pass
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VisitorPass;
