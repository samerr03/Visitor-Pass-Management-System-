import React, { forwardRef } from 'react';
import Barcode from 'react-barcode';

const StaffCard = forwardRef(({ user }, ref) => {
    if (!user) return null;

    // Construct Photo URL
    const getPhotoUrl = () => {
        if (user.photoUrl) return user.photoUrl;
        if (user.photo) {
            const baseURL = 'http://localhost:5000';
            if (user.photo.startsWith('http')) return user.photo;
            // Otherwise prepend base URL
            const cleanPath = user.photo.replace(/\\/g, '/').replace(/^\//, '');
            return `${baseURL}/${cleanPath}`;
        }
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0D8ABC&color=fff&size=200`;
    };

    return (
        <div className="w-full h-full flex justify-center items-center py-4 print:p-0 print:block print:w-auto print:h-auto">
            <div
                ref={ref}
                className="
                    w-[300px] h-[520px]
                    bg-white border border-slate-200 text-center relative shadow-2xl rounded-3xl overflow-hidden
                    print:w-[300px] print:h-[520px] print:fixed print:top-4 print:left-4 print:shadow-none print:border print:border-gray-300
                    flex flex-col font-sans
                "
                style={{ fontFamily: "'Inter', sans-serif", boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}
            >
                {/* Premium Header with Gradient & Overlay */}
                <div className="bg-gradient-to-br from-slate-900 via-[#0a192f] to-blue-900 h-44 w-full absolute top-0 left-0 flex flex-col items-center pt-2 overflow-hidden">
                    {/* Glossy Overlay */}
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl"></div>

                    {/* Logo & Tagline */}
                    <div className="relative z-10 flex flex-col items-center">
                        <img src="/src/assets/shield-logo.png" alt="System Logo" className="w-36 h-auto drop-shadow-md" />
                    </div>
                </div>

                {/* Profile Photo Section */}
                <div className="relative z-10 pt-24 mb-2">
                    <div className="relative w-32 h-32 mx-auto">
                        {/* Photo Container */}
                        <div className="w-full h-full rounded-full border-[4px] border-white ring-2 ring-blue-100 shadow-xl overflow-hidden bg-white">
                            <img
                                src={getPhotoUrl() ? `${getPhotoUrl()}?t=${Date.now()}` : null}
                                alt={user.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.style.display = 'none';
                                    e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center text-gray-400 font-bold bg-slate-100 text-4xl">${user.name.charAt(0)}</div>`;
                                }}
                            />
                        </div>
                        {/* Verified Badge */}
                        <div className="absolute bottom-1 right-1 bg-blue-500 text-white rounded-full p-1 border-2 border-white shadow-sm" title="Verified Staff">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Staff Details */}
                <div className="relative z-10 px-5 flex-grow flex flex-col items-center">
                    <h2 className="text-2xl font-bold text-slate-800 leading-tight tracking-tight mt-1">{user.name}</h2>
                    <div className="h-0.5 w-12 bg-blue-500/30 my-2 rounded-full"></div>
                    <span className="text-blue-600 text-[11px] font-bold uppercase tracking-[0.15em]">{user.designation || 'STAFF MEMBER'}</span>

                    {/* Info Block */}
                    <div className="w-full mt-4 bg-slate-50/80 p-3 rounded-xl border border-slate-100 shadow-sm backdrop-blur-sm">
                        <div className="grid grid-cols-2 gap-y-2 text-left">
                            <div>
                                <p className="text-slate-400 text-[9px] uppercase font-semibold tracking-wider">ID Number</p>
                                <p className="font-mono font-bold text-slate-700 text-xs">{user.staffId || '---'}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-slate-400 text-[9px] uppercase font-semibold tracking-wider">Department</p>
                                <p className="font-medium text-slate-700 text-xs capitalize truncate">{user.department || 'General'}</p>
                            </div>
                            <div>
                                <p className="text-slate-400 text-[9px] uppercase font-semibold tracking-wider">Role</p>
                                <p className="font-medium text-slate-700 text-xs capitalize">{user.role}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-slate-400 text-[9px] uppercase font-semibold tracking-wider">Joined</p>
                                <p className="font-medium text-slate-700 text-xs">{new Date().toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</p>
                            </div>
                        </div>
                    </div>

                    {/* Barcode Section */}
                    <div className="mt-auto mb-3 flex flex-col items-center w-full">
                        <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm w-full flex justify-center overflow-hidden">
                            <Barcode
                                value={user.staffId || 'UNKNOWN'}
                                format="CODE128"
                                width={1.8}
                                height={40}
                                displayValue={false}
                                margin={0}
                                background="transparent"
                            />
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono font-bold mt-1 tracking-wider">{user.staffId || '---'}</p>
                    </div>
                </div>

                {/* Footer Strip */}
                <div className="bg-[#0a192f] text-white text-[9px] py-2 w-full text-center tracking-[0.2em] font-medium border-t border-blue-900/50">
                    VISITOR MANAGEMENT SYSTEM
                </div>
            </div>
        </div>
    );
});

StaffCard.displayName = "StaffCard";

export default StaffCard;
