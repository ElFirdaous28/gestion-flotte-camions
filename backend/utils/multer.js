import multer from 'multer';
import path from 'path';
import fs from 'fs';

export const createUploader = ({ folder, allowedTypes, maxSize }) => {
    const uploadPath = path.join(process.cwd(), 'public', 'uploads', folder);
    fs.mkdirSync(uploadPath, { recursive: true });

    const storage = multer.diskStorage({
        destination: uploadPath,
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname);
            const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
            cb(null, name);
        },
    });

    const fileFilter = (req, file, cb) => {
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(
                new Error(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`),
                false
            );
        }
    };

    return multer({
        storage,
        fileFilter,
        limits: { fileSize: maxSize },
    });
};

export const uploadAvatar = createUploader({
    folder: 'avatars',
    allowedTypes: ['image/jpeg', 'image/png'],
    maxSize: 2 * 1024 * 1024,
});

export const uploadInvoice = createUploader({
    folder: 'invoices',
    allowedTypes: [
        'image/jpeg',
        'image/png',
        'application/pdf',
    ],
    maxSize: 5 * 1024 * 1024,
});