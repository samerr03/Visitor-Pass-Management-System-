
import React, { forwardRef, useEffect, useState } from "react";
import QRCodeLib from "qrcode";
import logo from "../assets/shield-logo.png";

const VisitorPassPrintable = forwardRef(({ visitor }, ref) => {
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
                const frontendUrl = window.location.origin;
                const qrData = `${frontendUrl}/verify/${encodeURIComponent(
                    visitor.passId
                )}`;

                const url = await QRCodeLib.toDataURL(qrData, {
                    width: 320,
                    margin: 2,
                    errorCorrectionLevel: "M",
                });

                if (!cancelled) setQrCodeUrl(url);
            } catch (error) {
                console.error("QR generation failed:", error);
                if (!cancelled) setQrCodeUrl("");
            }
        };

        generateQR();

        return () => {
            cancelled = true;
        };
    }, [visitor?.passId]);

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

        if (!filename) return "";

        // Preserve the API base path for local/backend-hosted photos.
        return `${base}/uploads/${filename
            .split("/")
            .map(encodeURIComponent)
            .join("/")}`;
    };

    if (!visitor) {
        return <div ref={ref} />;
    }

    const photoUrl = getPhotoUrl(visitor.photo);

    const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
        visitor.name || "Visitor"
    )}&background=E2E8F0&color=1E293B&size=256`;

    const details = [
        ["Email", visitor.email || "N/A"],
        ["Phone", visitor.phone || "N/A"],
        ["Purpose", visitor.purpose || "N/A"],
        ["Meeting With", visitor.personToMeet || "N/A"],
        ["Entry Time", formatTime(visitor.entryTime)],
        ["Date", formatDate(visitor.entryTime)],
    ];

    return (
        <div ref={ref} className="visitor-pass-print">
            <style>{`
                .visitor-pass-print {
                    width: 100%;
                    max-width: 420px;
                    margin: 0 auto;
                    box-sizing: border-box;
                    background: #ffffff;
                    color: #172033;
                    font-family: Arial, Helvetica, sans-serif;
                    border: 1px solid #dbe3ef;
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
                }

                .visitor-pass-print *,
                .visitor-pass-print *::before,
                .visitor-pass-print *::after {
                    box-sizing: border-box;
                }

                .vp-header {
                    background: #172554;
                    color: #ffffff;
                    padding: 20px 18px;
                    display: flex;
                    align-items: center;
                    gap: 13px;
                }

                .vp-logo {
                    width: 54px;
                    height: 54px;
                    object-fit: contain;
                    flex-shrink: 0;
                    background: #ffffff;
                    border-radius: 10px;
                    padding: 4px;
                }

                .vp-heading {
                    min-width: 0;
                    flex: 1;
                }

                .vp-heading h1 {
                    margin: 0;
                    font-size: 21px;
                    line-height: 1.3;
                    font-weight: 800;
                    letter-spacing: 1px;
                }

                .vp-heading p {
                    margin: 5px 0 0;
                    color: #cbd5e1;
                    font-size: 10px;
                    letter-spacing: 1.1px;
                    text-transform: uppercase;
                }

                .vp-status {
                    display: inline-block;
                    margin-top: 9px;
                    padding: 4px 10px;
                    border-radius: 999px;
                    background: #d1fae5;
                    color: #065f46;
                    font-size: 10px;
                    font-weight: 800;
                    letter-spacing: 0.6px;
                }

                .vp-body {
                    padding: 20px;
                }

                .vp-profile {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding-bottom: 18px;
                    border-bottom: 1px solid #e2e8f0;
                }

                .vp-photo {
                    width: 104px;
                    height: 116px;
                    flex-shrink: 0;
                    border: 1px solid #cbd5e1;
                    border-radius: 10px;
                    object-fit: cover;
                    background: #f1f5f9;
                }

                .vp-profile-info {
                    flex: 1;
                    min-width: 0;
                }

                .vp-label {
                    color: #64748b;
                    font-size: 9px;
                    font-weight: 700;
                    letter-spacing: 0.8px;
                    text-transform: uppercase;
                }

                .vp-name {
                    margin: 5px 0 9px;
                    color: #172554;
                    font-size: 19px;
                    font-weight: 800;
                    line-height: 1.25;
                    overflow-wrap: anywhere;
                    text-transform: uppercase;
                }

                .vp-passid {
                    margin-top: 5px;
                    color: #1d4ed8;
                    font-size: 12px;
                    font-weight: 800;
                    overflow-wrap: anywhere;
                }

                .vp-grid {
                    display: grid;
                    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
                    gap: 14px 12px;
                    margin-top: 18px;
                    padding: 15px;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                }

                .vp-field {
                    min-width: 0;
                }

                .vp-value {
                    margin-top: 5px;
                    color: #1e293b;
                    font-size: 11px;
                    font-weight: 700;
                    line-height: 1.5;
                    overflow-wrap: anywhere;
                    word-break: break-word;
                }

                .vp-qr-section {
                    margin-top: 20px;
                    padding-top: 17px;
                    border-top: 1px dashed #cbd5e1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 16px;
                }

                .vp-qr-box {
                    width: 124px;
                    height: 124px;
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 7px;
                    background: #ffffff;
                    border: 1px solid #dbe3ef;
                    border-radius: 10px;
                }

                .vp-qr-box img {
                    display: block;
                    width: 108px;
                    height: 108px;
                    object-fit: contain;
                }

                .vp-qr-info {
                    min-width: 0;
                }

                .vp-qr-info h3 {
                    margin: 0 0 6px;
                    color: #172554;
                    font-size: 13px;
                    font-weight: 800;
                }

                .vp-qr-info p {
                    margin: 0;
                    color: #64748b;
                    font-size: 10px;
                    line-height: 1.6;
                }

                .vp-footer {
                    padding: 12px 16px;
                    text-align: center;
                    background: #f8fafc;
                    border-top: 1px solid #e2e8f0;
                    color: #64748b;
                    font-size: 9px;
                    font-weight: 700;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                }

                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 12mm;
                    }

                    html, body {
                        margin: 0 !important;
                        padding: 0 !important;
                        background: #ffffff !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }

                    .visitor-pass-print {
                        width: 100% !important;
                        max-width: 420px !important;
                        margin: 0 auto !important;
                        box-shadow: none !important;
                        border: 1px solid #cbd5e1 !important;
                        border-radius: 12px !important;
                        overflow: hidden !important;
                        break-inside: avoid !important;
                        page-break-inside: avoid !important;
                    }

                    .vp-header, .vp-grid, .vp-footer,
                    .vp-status, .vp-qr-box {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }

                    .vp-qr-section {
                        break-inside: avoid !important;
                        page-break-inside: avoid !important;
                    }

                    img {
                        print-color-adjust: exact !important;
                        -webkit-print-color-adjust: exact !important;
                    }
                }
            `}</style>

            <header className="vp-header">
                <img src={logo} alt="Visitor system logo" className="vp-logo" />

                <div className="vp-heading">
                    <h1>VISITOR PASS</h1>
                    <p>Visitor Management System</p>
                    <span className="vp-status">
                        {visitor.status || "ACTIVE"}
                    </span>
                </div>
            </header>

            <main className="vp-body">
                <section className="vp-profile">
                    <img
                        src={photoUrl || fallbackAvatar}
                        alt={`${visitor.name || "Visitor"} photo`}
                        className="vp-photo"
                        crossOrigin="anonymous"
                        onError={(event) => {
                            if (event.currentTarget.src !== fallbackAvatar) {
                                event.currentTarget.src = fallbackAvatar;
                            }
                        }}
                    />

                    <div className="vp-profile-info">
                        <div className="vp-label">Visitor Name</div>
                        <h2 className="vp-name">
                            {visitor.name || "Unknown Visitor"}
                        </h2>

                        <div className="vp-label">Pass ID</div>
                        <div className="vp-passid">
                            {visitor.passId || "N/A"}
                        </div>
                    </div>
                </section>

                <section className="vp-grid">
                    {details.map(([label, value]) => (
                        <div className="vp-field" key={label}>
                            <div className="vp-label">{label}</div>
                            <div className="vp-value">{value}</div>
                        </div>
                    ))}
                </section>

                <section className="vp-qr-section">
                    <div className="vp-qr-box">
                        {qrCodeUrl ? (
                            <img src={qrCodeUrl} alt="Pass verification QR code" />
                        ) : (
                            <span className="vp-label">Generating QR...</span>
                        )}
                    </div>

                    <div className="vp-qr-info">
                        <h3>Scan to Verify</h3>
                        <p>
                            Scan this QR code at the entry or exit gate to
                            open the visitor pass verification page.
                        </p>
                    </div>
                </section>
            </main>

            <footer className="vp-footer">
                Authorized Visitor Pass
            </footer>
        </div>
    );
});

VisitorPassPrintable.displayName = "VisitorPassPrintable";

export default VisitorPassPrintable;
