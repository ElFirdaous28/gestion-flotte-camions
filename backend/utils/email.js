import nodemailer from 'nodemailer';
import fs from 'fs';
import Handlebars from 'handlebars';
import config from '../config/config.js';

export const sendTemplateEmail = async ({ to, subject, templatePath, context }) => {
    try {
        const templateSource = fs.readFileSync(templatePath, 'utf8');
        const template = Handlebars.compile(templateSource);
        const html = template(context);

        const transporter = nodemailer.createTransport({
            host: config.SMTP_HOST,
            port: config.SMTP_PORT,
            secure: config.SMTP_SECURE,
            auth: {
                user: config.SMTP_USER,
                pass: config.SMTP_PASS,
            },
        });

        const info = await transporter.sendMail({
            from: `"Fleet Management" <${config.SMTP_USER}>`,
            to,
            subject,
            html,
        });

        console.log('Email sent: %s', info.messageId);
    } catch (error) {
        console.error('Email error:', error);
        throw new Error('Unable to send email');
    }
};
