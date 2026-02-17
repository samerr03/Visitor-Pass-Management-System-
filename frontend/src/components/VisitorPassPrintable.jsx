import React, { forwardRef } from "react";
import QRCode from "react-qr-code";
import logo from "../assets/logo.svg";

const VisitorPassPrintable = forwardRef(({ visitor }, ref) => {
    // ✅ Safe API base (no crash if env missing)
    const API_BASE_URL =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

    // uploads are served from host (without /api)
    const HOST = API_BASE_URL.replace(/\/api\/?$/, "");

    // Helper for safe date formatting
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        try {
            const date = new Date(dateString);
            return isNaN(date.getTime()) ? "Invalid Date" : date.toLocaleDateString();
        } catch {
            return "Error";
        }
    };

    const formatTime = (dateString) => {
        if (!dateString) return "N/A";
        try {
            const date = new Date(dateString);
            return isNaN(date.getTime())
                ? "Invalid Time"
                : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        } catch {
            return "Error";
        }
    };

    // Helper to process photo URL
    const getPhotoUrl = (photoPath) => {
        if (!photoPath) return null;

        try {
            let filename = photoPath;

            // Normalize slashes (Windows path fix)
            const normalized = String(photoPath).replace(/\\/g, "/");

            // Extract filename after uploads/
            if (normalized.includes("uploads/")) {
                filename = normalized.split("uploads/").pop();
            }

            if (filename) {
                return `${HOST}/uploads/${filename}`;
            }
        } catch (e) {
            console.error("Error processing photo URL", e);
        }

        return null;
    };

    // Keep ref attached to avoid react-to-print crash
    if (!visitor) {
        return <div ref={ref} className="hidden" />;
    }

    const photoUrl = getPhotoUrl(visitor.photo);
    const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
        visitor?.name || "Visitor"
    )}&background=0D8ABC&color=fff&size=200`;

    return (
        <div
            ref={ref}
            className="print-area w-[400px] mx-auto bg-white border border-slate-900 rounded-xl overflow-hidden relative text-sm p-0"
        >
            {/* Header */}
            <div className="bg-slate-900 text-white p-4 text-center print-color-adjust-exact webkit-print-color-adjust-exact relative">
                {/* Logo */}
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-md flex items-center justify-center p-1 shadow-sm">
                    <img src={logo} alt="Logo" className="w-full h-full object-contain" />
                </div>

                <div className="flex items-center justify-center gap-3 mb-1">
                    <h1 className="text-xl font-bold tracking-wider uppercase pl-12">
                        Visitor Pass
                    </h1>
                </div>
                <p className="text-slate-400 text-[10px] tracking-widest uppercase pl-12">
                    SafeEntry Systems
                </p>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col items-center gap-2">
                {/* Photo */}
                <div className="relative">
                    <div className="w-24 h-24 rounded-full border-2 border-slate-100 overflow-hidden bg-slate-100 mx-auto">
                        <img
                            src={photoUrl || fallbackAvatar}
                            alt="Visitor"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.currentTarget.src = fallbackAvatar;
                            }}
                        />
                    </div>
                </div>

                {/* Details */}
                <div className="text-center w-full space-y-0.5 mt-1">
                    <h2 className="text-lg font-bold text-slate-800 uppercase">
                        {visitor?.name || "Unknown"}
                    </h2>
                    <p className="text-slate-500 font-medium text-xs">
                        {visitor?.purpose || "N/A"} • {visitor?.phone || "N/A"}
                    </p>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-2 w-full bg-slate-50 p-2 rounded border border-slate-200 mt-2 print-color-adjust-exact">
                    <div>
                        <p className="text-[9px] text-slate-400 uppercase font-semibold">
                            Meeting With
                        </p>
                        <p className="font-bold text-slate-700 text-xs truncate">
                            {visitor?.personToMeet || "N/A"}
                        </p>
                    </div>
                    <div>
                        <p className="text-[9px] text-slate-400 uppercase font-semibold">
                            Pass ID
                        </p>
                        <p className="font-mono font-bold text-black text-xs truncate">
                            {visitor?.passId || "N/A"}
                        </p>
                    </div>
                    <div>
                        <p className="text-[9px] text-slate-400 uppercase font-semibold">
                            Entry Time
                        </p>
                        <p className="font-bold text-slate-700 text-xs">
                            {formatTime(visitor?.entryTime)}
                        </p>
                    </div>
                    <div>
                        <p className="text-[9px] text-slate-400 uppercase font-semibold">
                            Date
                        </p>
                        <p className="font-bold text-slate-700 text-xs">
                            {formatDate(visitor?.entryTime)}
                        </p>
                    </div>
                </div>

                {/* QR Code */}
                <div className="mt-2 flex justify-center items-center">
                    <QRCode
                        value={JSON.stringify({
                            id: visitor?._id || "",
                            passId: visitor?.passId || "",
                            name: visitor?.name || "",
                        })}
                        size={100}
                        viewBox={`0 0 256 256`}
                    />
                </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 border-t border-slate-100 p-1 text-center mt-2 print-color-adjust-exact">
                <p className="text-[8px] text-slate-400 uppercase tracking-widest">
                    Authorized Visitor Pass
                </p>
            </div>
        </div>
    );
});

VisitorPassPrintable.displayName = "VisitorPassPrintable";

export default VisitorPassPrintable;
