
const mongoose = require('mongoose');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const nodemailer = require('nodemailer');
const https = require('https');
const http = require('http');

const COLORS = {
    navy: '#172B55',
    blue: '#3157A4',
    lightBlue: '#EEF3FF',
    background: '#F3F6FC',
    text: '#202B3C',
    muted: '#66738A',
    border: '#DCE4F0',
    green: '#147D4A',
    lightGreen: '#E6F7ED',
    amber: '#986313',
    lightAmber: '#FFF3D9',
    white: '#FFFFFF',
};

const getPhotoBuffer = (url) =>
    new Promise((resolve) => {
        if (!url || typeof url !== 'string') {
            return resolve(null);
        }

        let parsedUrl;

        try {
            parsedUrl = new URL(url);
        } catch {
            return resolve(null);
        }

        if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
            return resolve(null);
        }

        const client = parsedUrl.protocol === 'https:' ? https : http;
        let settled = false;

        const finish = (value) => {
            if (!settled) {
                settled = true;
                resolve(value);
            }
        };

        const request = client.get(parsedUrl, (response) => {
            if (
                response.statusCode >= 300 &&
                response.statusCode < 400 &&
                response.headers.location
            ) {
                response.resume();

                if (parsedUrl.protocol !== 'https:') {
                    return finish(null);
                }

                const redirect = new URL(
                    response.headers.location,
                    parsedUrl
                );

                if (redirect.protocol !== 'https:') {
                    return finish(null);
                }

                return getPhotoBuffer(redirect.toString())
                    .then(finish)
                    .catch(() => finish(null));
            }

            if (response.statusCode !== 200) {
                response.resume();
                return finish(null);
            }

            const contentType = response.headers['content-type'] || '';

            if (!contentType.startsWith('image/')) {
                response.resume();
                return finish(null);
            }

            const chunks = [];
            let totalSize = 0;
            const maxSize = 5 * 1024 * 1024;

            response.on('data', (chunk) => {
                totalSize += chunk.length;

                if (totalSize > maxSize) {
                    request.destroy();
                    finish(null);
                    return;
                }

                chunks.push(chunk);
            });

            response.on('end', () => {
                if (totalSize <= maxSize) {
                    finish(Buffer.concat(chunks));
                }
            });

            response.on('error', () => finish(null));
        });

        request.setTimeout(5000, () => {
            request.destroy();
            finish(null);
        });

        request.on('error', () => finish(null));
    });

const formatDate = (value) => {
    if (!value) return 'N/A';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return 'N/A';

    return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const safeText = (value) => {
    if (value === null || value === undefined || value === '') {
        return 'N/A';
    }

    return String(value);
};

const drawLabelValue = (doc, label, value, x, y, width) => {
    doc.font('Helvetica-Bold')
        .fontSize(8)
        .fillColor(COLORS.muted)
        .text(label.toUpperCase(), x, y, {
            width,
            lineBreak: false,
        });

    doc.font('Helvetica')
        .fontSize(10)
        .fillColor(COLORS.text)
        .text(safeText(value), x, y + 14, {
            width,
            height: 25,
            ellipsis: true,
        });
};

const sendVisitorPassEmail = async (req, res, next) => {
    try {
        const visitorId = req.params.id;

        if (
            !visitorId ||
            !mongoose.Types.ObjectId.isValid(visitorId)
        ) {
            return res.status(400).json({
                message: 'Invalid or missing visitor ID.',
            });
        }

        const Visitor = req.models?.Visitor;

        if (!Visitor) {
            return res.status(500).json({
                message: 'Visitor model is not available.',
            });
        }

        const visitor = await Visitor.findById(visitorId);

        if (!visitor) {
            return res.status(404).json({
                message: 'Visitor not found.',
            });
        }

        if (!visitor.email || !visitor.passId) {
            return res.status(400).json({
                message: 'Visitor email or pass ID is missing.',
            });
        }

        const {
            SMTP_HOST,
            SMTP_PORT,
            SMTP_SECURE,
            SMTP_USER,
            SMTP_PASS,
            FRONTEND_URL,
        } = process.env;

        if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
            return res.status(500).json({
                message: 'Email service is not configured.',
            });
        }

        const port = Number(SMTP_PORT || 465);

        const transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port,
            secure:
                SMTP_SECURE !== undefined
                    ? SMTP_SECURE === 'true'
                    : port === 465,
            auth: {
                user: SMTP_USER,
                pass: SMTP_PASS,
            },
        });

        const frontendUrl = (
            FRONTEND_URL || 'http://localhost:5173'
        ).replace(/\/+$/, '');

        const verificationUrl =
            `${frontendUrl}/verify/${encodeURIComponent(visitor.passId)}`;

        const qrBuffer = await QRCode.toBuffer(verificationUrl, {
            type: 'png',
            width: 320,
            margin: 2,
            errorCorrectionLevel: 'H',
        });

        // Use a public photo URL if your Visitor model stores one.
        const photoUrl =
            visitor.photoUrl ||
            visitor.photo ||
            visitor.profilePhoto ||
            '';

        const photoBuffer = await getPhotoBuffer(photoUrl);

        const doc = new PDFDocument({
            size: 'A4',
            margins: {
                top: 30,
                bottom: 30,
                left: 36,
                right: 36,
            },
            info: {
                Title: `Visitor Pass ${visitor.passId}`,
                Author: 'Visitor Pass Management System',
            },
        });

        const chunks = [];

        const pdfBufferPromise = new Promise((resolve, reject) => {
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
        });

        const pageWidth = doc.page.width;
        const pageHeight = doc.page.height;
        const margin = 36;
        const cardX = margin;
        const cardY = 60;
        const cardWidth = pageWidth - margin * 2;
        const cardHeight = 660;
        const innerX = cardX + 25;
        const innerRight = cardX + cardWidth - 25;
        const innerWidth = innerRight - innerX;

        const status = safeText(visitor.status || 'ACTIVE').toUpperCase();
        const isActive = status === 'ACTIVE';

        // Background
        doc.rect(0, 0, pageWidth, pageHeight)
            .fill(COLORS.background);

        // Main card
        doc.roundedRect(cardX, cardY, cardWidth, cardHeight, 18)
            .fill(COLORS.white);

        doc.roundedRect(cardX, cardY, cardWidth, 112, 18)
            .fill(COLORS.navy);

        // Square the lower header corners.
        doc.rect(cardX, cardY + 85, cardWidth, 27)
            .fill(COLORS.navy);

        // Header
        doc.fillColor(COLORS.white)
            .font('Helvetica-Bold')
            .fontSize(24)
            .text('VISITOR PASS', cardX + 20, cardY + 24, {
                width: cardWidth - 40,
                align: 'center',
            });

        doc.fillColor('#DCE7FF')
            .font('Helvetica')
            .fontSize(9)
            .text('VISITOR PASS MANAGEMENT SYSTEM', cardX + 20, cardY + 62, {
                width: cardWidth - 40,
                align: 'center',
                characterSpacing: 1,
            });

        // Pass ID and status
        doc.fillColor(COLORS.muted)
            .font('Helvetica-Bold')
            .fontSize(8)
            .text('PASS IDENTIFICATION', innerX, 192);

        doc.fillColor(COLORS.blue)
            .font('Helvetica-Bold')
            .fontSize(16)
            .text(safeText(visitor.passId), innerX, 207, {
                width: innerWidth - 125,
                ellipsis: true,
            });

        const badgeWidth = 105;
        const badgeX = innerRight - badgeWidth;
        const badgeY = 204;

        doc.roundedRect(
            badgeX,
            badgeY,
            badgeWidth,
            28,
            8
        ).fill(isActive ? COLORS.lightGreen : COLORS.lightAmber);

        doc.fillColor(isActive ? COLORS.green : COLORS.amber)
            .font('Helvetica-Bold')
            .fontSize(9)
            .text(status, badgeX, badgeY + 9, {
                width: badgeWidth,
                align: 'center',
                ellipsis: true,
            });

        doc.moveTo(innerX, 248)
            .lineTo(innerRight, 248)
            .lineWidth(1)
            .strokeColor(COLORS.border)
            .stroke();

        // Photo panel
        const photoX = innerX;
        const photoY = 269;
        const photoSize = 112;

        doc.roundedRect(photoX, photoY, photoSize, photoSize, 12)
            .fill(COLORS.lightBlue);

        if (photoBuffer) {
            try {
                doc.save();
                doc.roundedRect(
                    photoX + 4,
                    photoY + 4,
                    photoSize - 8,
                    photoSize - 8,
                    8
                ).clip();

                doc.image(photoBuffer, photoX + 4, photoY + 4, {
                    fit: [photoSize - 8, photoSize - 8],
                    align: 'center',
                    valign: 'center',
                });

                doc.restore();
            } catch (error) {
                doc.restore();
                doc.fillColor(COLORS.blue)
                    .font('Helvetica-Bold')
                    .fontSize(30)
                    .text(
                        safeText(visitor.name).charAt(0).toUpperCase(),
                        photoX,
                        photoY + 39,
                        { width: photoSize, align: 'center' }
                    );
            }
        } else {
            doc.fillColor(COLORS.blue)
                .font('Helvetica-Bold')
                .fontSize(30)
                .text(
                    safeText(visitor.name).charAt(0).toUpperCase(),
                    photoX,
                    photoY + 39,
                    { width: photoSize, align: 'center' }
                );
        }

        // Visitor identity
        const identityX = photoX + photoSize + 22;
        const identityWidth = innerRight - identityX;

        doc.fillColor(COLORS.muted)
            .font('Helvetica-Bold')
            .fontSize(8)
            .text('VISITOR NAME', identityX, photoY + 3);

        doc.fillColor(COLORS.text)
            .font('Helvetica-Bold')
            .fontSize(17)
            .text(safeText(visitor.name), identityX, photoY + 20, {
                width: identityWidth,
                height: 40,
                ellipsis: true,
            });

        doc.fillColor(COLORS.muted)
            .font('Helvetica-Bold')
            .fontSize(8)
            .text('PURPOSE OF VISIT', identityX, photoY + 65);

        doc.fillColor(COLORS.text)
            .font('Helvetica')
            .fontSize(11)
            .text(safeText(visitor.purpose), identityX, photoY + 80, {
                width: identityWidth,
                height: 26,
                ellipsis: true,
            });

        // Details section
        doc.roundedRect(innerX, 406, innerWidth, 142, 12)
            .fill('#F8FAFE');

        const gap = 20;
        const columnWidth = (innerWidth - gap) / 2;
        const col2X = innerX + columnWidth + gap;

        drawLabelValue(
            doc,
            'Phone',
            visitor.phone,
            innerX + 14,
            424,
            columnWidth - 14
        );

        drawLabelValue(
            doc,
            'Email',
            visitor.email,
            col2X,
            424,
            columnWidth - 14
        );

        drawLabelValue(
            doc,
            'Person to Meet',
            visitor.personToMeet,
            innerX + 14,
            480,
            columnWidth - 14
        );

        drawLabelValue(
            doc,
            'Entry Time',
            formatDate(visitor.entryTime),
            col2X,
            480,
            columnWidth - 14
        );

        // QR verification panel
        const qrPanelY = 565;
        const qrPanelHeight = 105;

        doc.roundedRect(innerX, qrPanelY, innerWidth, qrPanelHeight, 12)
            .fill(COLORS.lightBlue);

        doc.roundedRect(
            innerX + 13,
            qrPanelY + 12,
            81,
            81,
            8
        ).fill(COLORS.white);

        doc.image(qrBuffer, innerX + 19, qrPanelY + 18, {
            fit: [69, 69],
        });

        const qrTextX = innerX + 112;
        const qrTextWidth = innerRight - qrTextX;

        doc.fillColor(COLORS.navy)
            .font('Helvetica-Bold')
            .fontSize(12)
            .text('SCAN TO VERIFY', qrTextX, qrPanelY + 27, {
                width: qrTextWidth,
            });

        doc.fillColor(COLORS.muted)
            .font('Helvetica')
            .fontSize(9)
            .text(
                'Scan this QR code to open the visitor pass verification page.',
                qrTextX,
                qrPanelY + 48,
                {
                    width: qrTextWidth,
                    height: 34,
                }
            );

        // Footer
        doc.fillColor(COLORS.muted)
            .font('Helvetica')
            .fontSize(8)
            .text(
                'Please present this pass at the entry/exit gate.',
                cardX + 20,
                692,
                {
                    width: cardWidth - 40,
                    align: 'center',
                }
            );

        doc.fillColor(COLORS.blue)
            .font('Helvetica-Bold')
            .fontSize(8)
            .text('AUTHORIZED VISITOR PASS', cardX + 20, 708, {
                width: cardWidth - 40,
                align: 'center',
                characterSpacing: 1,
            });

        doc.end();

        const pdfBuffer = await pdfBufferPromise;

        await transporter.sendMail({
            from: `"Visitor Pass System" <${SMTP_USER}>`,
            to: visitor.email,
            subject: `Your Visitor Pass - ${visitor.passId}`,
            text: [
                `Hello ${visitor.name || 'Visitor'},`,
                '',
                'Your visitor pass is attached as a PDF.',
                `Pass ID: ${visitor.passId}`,
                `Verification: ${verificationUrl}`,
                '',
                'Please keep this pass available for verification.',
            ].join('\n'),
            attachments: [
                {
                    filename: `Visitor-Pass-${visitor.passId}.pdf`,
                    content: pdfBuffer,
                    contentType: 'application/pdf',
                },
            ],
        });

        return res.status(200).json({
            message: `Visitor pass sent to ${visitor.email}.`,
        });
    } catch (error) {
        console.error('Send visitor pass email error:', error.message);
        return next(error);
    }
};

module.exports = sendVisitorPassEmail;
