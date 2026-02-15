import React from 'react';
import QRCode from 'react-qr-code';

const VisitorPass = ({ visitor, innerRef }) => {
    if (!visitor) return null;

    // Helper to process photo URL
    const getPhotoUrl = (photoPath) => {
        if (!photoPath) return null;

        // Handle different path formats:
        // 1. "uploads/file.jpg" (Relative)
        // 2. "backend/uploads/file.jpg" (From some legacy saves)
        // 3. "C:\path\to\uploads\file.jpg" (Absolute Windows)

        let filename = photoPath;

        // Normalize slashes
        const normalized = photoPath.replace(/\\/g, '/');

        // If it contains "uploads/", extract everything after it
        if (normalized.includes('uploads/')) {
            filename = normalized.split('uploads/').pop();
        }

        // If we just have a filename, or cleaned it up
        if (filename) {
            return `http://localhost:5000/uploads/${filename}`;
        }

        return null;
    };

    const photoUrl = getPhotoUrl(visitor.photo);

    // Helper for safe date formatting
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString();
    };

    const formatTime = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? 'Invalid Time' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="w-full h-full flex justify-center items-center py-4 print:p-0 print:block print:w-auto print:h-auto">
            {/* ... (rest of the wrapper) ... */}
            <div
                ref={innerRef}
                className="
                    w-[320px] h-auto min-h-[500px]
                    bg-white border-2 border-slate-900 rounded-xl overflow-hidden relative 
                    shadow-2xl text-sm 
                    mx-auto
                    print:w-[320px] print:h-auto print:m-0 print:shadow-none print:border-2 print:border-slate-800
                "
            >
                {/* Header */}
                <div className="bg-slate-900 text-white p-5 text-center print:p-6 print:bg-slate-900 print:text-white print-color-adjust-exact">
                    <div className="flex items-center justify-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center print:w-10 print:h-10">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400 print:h-6 print:w-6" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <h1 className="text-xl font-bold tracking-wider uppercase print:text-2xl">Visitor Pass</h1>
                    </div>
                    <p className="text-slate-400 text-[10px] tracking-widest uppercase print:text-xs">SafeEntry Systems</p>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col items-center gap-4 print:p-4 print:gap-2">

                    {/* Photo & Status */}
                    <div className="relative">
                        <div className="w-32 h-32 rounded-full border-4 border-slate-100 shadow-xl overflow-hidden bg-slate-100 print:w-32 print:h-32">
                            {photoUrl ? (
                                <img
                                    src={photoUrl}
                                    alt="Visitor"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'block';
                                        e.target.src = `https://ui-avatars.com/api/?name=${visitor.name}&background=0D8ABC&color=fff`;
                                        e.target.style.display = 'block';
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
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wider shadow-md print:text-xs print:px-3 print:py-0.5 print-color-adjust-exact">
                            Active
                        </div>
                    </div>

                    {/* Details */}
                    <div className="text-center w-full space-y-0.5 mt-2">
                        <h2 className="text-xl font-bold text-slate-800 uppercase">{visitor.name}</h2>
                        <p className="text-slate-500 font-medium text-xs">{visitor.purpose} • {visitor.phone}</p>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-3 w-full bg-slate-50 p-3 rounded-xl border border-slate-100 mt-2 print:bg-slate-50 print:border-gray-200">
                        <div>
                            <p className="text-[10px] text-slate-400 uppercase font-semibold">Meeting With</p>
                            <p className="font-bold text-slate-700 text-sm truncate">{visitor.personToMeet}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 uppercase font-semibold">Pass ID</p>
                            <p className="font-mono font-bold text-blue-600 text-sm truncate">{visitor.passId}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 uppercase font-semibold">Entry Time</p>
                            <p className="font-bold text-slate-700 text-xs">{formatTime(visitor.entryTime)}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 uppercase font-semibold">Date</p>
                            <p className="font-bold text-slate-700 text-xs">{formatDate(visitor.entryTime)}</p>
                        </div>
                    </div>

                    {/* QR Code - Larger and clearer */}
                    <div className="mt-2 bg-white p-2 rounded-lg border-2 border-slate-200 flex justify-center items-center print:border-2 print:p-2">
                        <QRCode
                            value={JSON.stringify({
                                id: visitor._id,
                                passId: visitor.passId,
                                name: visitor.name,
                                entryTime: visitor.entryTime
                            })}
                            size={140}
                            className="h-auto max-w-full"
                            viewBox={`0 0 256 256`}
                        />
                    </div>
                    <p className="text-[8px] text-slate-400 text-center max-w-[150px]">
                        Scan at exit gate
                    </p>
                </div>

                {/* Footer */}
                <div className="absolute bottom-0 w-full bg-slate-50 border-t border-slate-100 p-2 text-center print:bg-slate-50">
                    <p className="text-[8px] text-slate-400 uppercase tracking-widest">Authorized Visitor Pass</p>
                </div>
            </div>
        </div>
    );
};

export default VisitorPass;
