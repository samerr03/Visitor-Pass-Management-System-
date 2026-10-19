
import React, { useEffect, useState } from "react";
import QRCodeLib from "qrcode";
import logo from "../assets/shield-logo.png";

const VisitorPass = ({ visitor, innerRef }) => {
    const [qrCodeUrl, setQrCodeUrl] = useState("");

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
    const base = API_BASE_URL.replace(/\/+$/, "");

    useEffect(() => {
        let cancelled = false;

        const generateQR = async () => {
            if (!visitor?.passId) {
                setQrCodeUrl("");
                return;
            }

            try {
                const qrData = `${window.location.origin}/verify/${encodeURIComponent(
                    visitor.passId
                )}`;

                const url = await QRCodeLib.toDataURL(qrData, {
                    width: 320,
                    margin: 2,
                    errorCorrectionLevel: "M",
                });

                if (!cancelled) setQrCodeUrl(url);
            } catch (error) {
                console.error("QR generation error:", error);
                if (!cancelled) setQrCodeUrl("");
            }
        };

        generateQR();

        return () => {
            cancelled = true;
        };
    }, [visitor?.passId]);

    if (!visitor) return null;

    const getPhotoUrl = (photoPath) => {
        if (!photoPath) return "";

        if (/^https?:\/\//i.test(photoPath)) {
            return photoPath;
        }

        const normalized = String(photoPath)
            .replace(/\\/g, "/")
            .replace(/^\/+/, "");

        const filename = normalized.includes("uploads/")
            ? normalized.split("uploads/").pop()
            : normalized;

        return filename
            ? `${base}/uploads/${filename
                  .split("/")
                  .map(encodeURIComponent)
                  .join("/")}`
            : "";
    };

    const photoUrl = getPhotoUrl(visitor.photo);
    const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
        visitor.name || "Visitor"
    )}&background=E2E8F0&color=172554&size=256`;

    const formatDate = (value) => {
        if (!value) return "N/A";
        const date = new Date(value);
        return Number.isNaN(date.getTime())
            ? "N/A"
            : date.toLocaleDateString();
    };

    const formatTime = (value) => {
        if (!value) return "N/A";
        const date = new Date(value);
        return Number.isNaN(date.getTime())
            ? "N/A"
            : date.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
              });
    };

    const status = visitor.status || "ACTIVE";

    const statusStyles = {
        ACTIVE: "bg-emerald-100 text-emerald-800",
        USED: "bg-slate-200 text-slate-700",
        EXPIRED: "bg-red-100 text-red-800",
    };

    const fields = [
        ["Purpose", visitor.purpose],
        ["Phone", visitor.phone],
        ["Meeting With", visitor.personToMeet],
        ["Entry Time", formatTime(visitor.entryTime)],
        ["Date", formatDate(visitor.entryTime)],
        ["Email", visitor.email],
    ];

    return (
        <div className="w-full flex justify-center py-3 print:p-0 print:block">
            <style>{`
                .visitor-card {
                    width: 100%;
                    max-width: 360px;
                    box-sizing: border-box;
                    overflow: hidden;
                    border: 1px solid #dbe3ef;
                    border-radius: 16px;
                    background: #fff;
                    color: #172033;
                    font-family: Arial, Helvetica, sans-serif;
                    box-shadow: 0 10px 30px rgba(15,23,42,.12);
                }

                .visitor-card *,
                .visitor-card *::before,
                .visitor-card *::after {
                    box-sizing: border-box;
                }

                .visitor-card .vc-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 17px 16px;
                    background: #172554;
                    color: white;
                }

                .visitor-card .vc-logo {
                    width: 48px;
                    height: 48px;
                    flex-shrink: 0;
                    padding: 3px;
                    border-radius: 9px;
                    background: white;
                    object-fit: contain;
                }

                .visitor-card .vc-title {
                    min-width: 0;
                }

                .visitor-card .vc-title h2 {
                    margin: 0;
                    font-size: 19px;
                    font-weight: 800;
                    letter-spacing: .8px;
                    line-height: 1.3;
                }

                .visitor-card .vc-title p {
                    margin: 4px 0 0;
                    color: #cbd5e1;
                    font-size: 9px;
                    line-height: 1.4;
                    letter-spacing: .7px;
                    text-transform: uppercase;
                }

                .visitor-card .vc-body {
                    padding: 17px;
                }

                .visitor-card .vc-profile {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    padding-bottom: 16px;
                    border-bottom: 1px solid #e2e8f0;
                }

                .visitor-card .vc-photo {
                    width: 94px;
                    height: 108px;
                    flex-shrink: 0;
                    border: 2px solid #e2e8f0;
                    border-radius: 10px;
                    object-fit: cover;
                    background: #f1f5f9;
                }

                .visitor-card .vc-profile-info {
                    min-width: 0;
                    flex: 1;
                }

                .visitor-card .vc-label {
                    color: #64748b;
                    font-size: 9px;
                    font-weight: 700;
                    letter-spacing: .7px;
                    text-transform: uppercase;
                }

                .visitor-card .vc-name {
                    margin: 5px 0 11px;
                    color: #172554;
                    font-size: 17px;
                    font-weight: 800;
                    line-height: 1.3;
                    overflow-wrap: anywhere;
                }

                .visitor-card .vc-passid {
                    margin-top: 5px;
                    color: #1d4ed8;
                    font-family: monospace;
                    font-size: 12px;
                    font-weight: 800;
                    overflow-wrap: anywhere;
                }

                .visitor-card .vc-fields {
                    display: grid;
                    grid-template-columns: minmax(0,1fr) minmax(0,1fr);
                    gap: 13px 10px;
                    margin-top: 16px;
                    padding: 13px;
                    border: 1px solid #e2e8f0;
                    border-radius: 11px;
                    background: #f8fafc;
                }

                .visitor-card .vc-field {
                    min-width: 0;
                }

                .visitor-card .vc-value {
                    margin-top: 4px;
                    color: #1e293b;
                    font-size: 11px;
                    font-weight: 700;
                    line-height: 1.45;
                    overflow-wrap: anywhere;
                    word-break: break-word;
                }

                .visitor-card .vc-qr-section {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 13px;
                    margin-top: 17px;
                    padding-top: 15px;
                    border-top: 1px dashed #cbd5e1;
                }

                .visitor-card .vc-qr-box {
                    width: 116px;
                    height: 116px;
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 6px;
                    border: 1px solid #dbe3ef;
                    border-radius: 10px;
                    background: white;
                }

                .visitor-card .vc-qr-box img {
                    display: block;
                    width: 102px;
                    height: 102px;
                    object-fit: contain;
                }

                .visitor-card .vc-qr-info {
                    min-width: 0;
                }

                .visitor-card .vc-qr-info strong {
                    display: block;
                    color: #172554;
                    font-size: 12px;
                    line-height: 1.4;
                }

                .visitor-card .vc-qr-info p {
                    margin: 5px 0 0;
                    color: #64748b;
                    font-size: 10px;
                    line-height: 1.5;
                }

                .visitor-card .vc-footer {
                    padding: 11px;
                    border-top: 1px solid #e2e8f0;
                    background: #f8fafc;
                    color: #64748b;
                    text-align: center;
                    font-size: 9px;
                    font-weight: 700;
                    letter-spacing: .8px;
                    text-transform: uppercase;
                }

                @media print {
                    .visitor-card {
                        max-width: 360px !important;
                        margin: 0 auto !important;
                        box-shadow: none !important;
                        break-inside: avoid !important;
                        page-break-inside: avoid !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }

                    .visitor-card .vc-header,
                    .visitor-card .vc-fields,
                    .visitor-card .vc-footer {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>

            <div ref={innerRef} className="visitor-card">
                <header className="vc-header">
                    <img src={logo} alt="System logo" className="vc-logo" />

                    <div className="vc-title">
                        <h2>VISITOR PASS</h2>
                        <p>Visitor Management System</p>
                        <span
                            className={`inline-block mt-2 rounded-full px-3 py-1 text-[10px] font-extrabold ${
                                statusStyles[status] ||
                                statusStyles.ACTIVE
                            }`}
                        >
                            {status}
                        </span>
                    </div>
                </header>

                <main className="vc-body">
                    <section className="vc-profile">
                        <img
                            src={photoUrl || fallbackAvatar}
                            alt={`${visitor.name || "Visitor"} photo`}
                            className="vc-photo"
                            onError={(event) => {
                                if (!event.currentTarget.dataset.fallback) {
                                    event.currentTarget.dataset.fallback = "true";
                                    event.currentTarget.src = fallbackAvatar;
                                }
                            }}
                        />

                        <div className="vc-profile-info">
                            <div className="vc-label">Visitor Name</div>
                            <div className="vc-name">
                                {visitor.name || "Unknown Visitor"}
                            </div>

                            <div className="vc-label">Pass ID</div>
                            <div className="vc-passid">
                                {visitor.passId || "N/A"}
                            </div>
                        </div>
                    </section>

                    <section className="vc-fields">
                        {fields.map(([label, value]) => (
                            <div className="vc-field" key={label}>
                                <div className="vc-label">{label}</div>
                                <div className="vc-value">
                                    {value || "N/A"}
                                </div>
                            </div>
                        ))}
                    </section>

                    <section className="vc-qr-section">
                        <div className="vc-qr-box">
                            {qrCodeUrl ? (
                                <img
                                    src={qrCodeUrl}
                                    alt="Visitor verification QR"
                                />
                            ) : (
                                <span className="vc-label">Loading QR...</span>
                            )}
                        </div>

                        <div className="vc-qr-info">
                            <strong>Scan to Verify</strong>
                            <p>
                                Scan at the entry or exit gate to verify
                                this visitor pass.
                            </p>
                        </div>
                    </section>
                </main>

                <footer className="vc-footer">
                    Authorized Visitor Pass
                </footer>
            </div>
        </div>
    );
};

export default VisitorPass;
