import { BadRequestException, PayloadTooLargeException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';

export const multerConfig = {
	dest: './uploads',
	// limits: {
	// 	fileSize: 1024 * 1024,
	// },
	fileFilter: (req, file, cb) => {
		const allowedFileTypes = /jpeg|jpg|png|gif/;
		const isAllowed = allowedFileTypes.test(extname(file.originalname).toLowerCase());
		if (isAllowed) {
			cb(null, true);
		} else {
			cb(new BadRequestException('Invalid file type. Only JPEG, JPG, PNG, and GIF are allowed.'));
		}
	},
	storage: diskStorage({
		destination: (req, file, cb) => {
			cb(null, './uploads');
		},
		filename: (req, file, cb) => {
			const timestamp = Date.now();
			const randomString = Math.random().toString(36).substring(7);
			const filename = `${timestamp}-${randomString}.${extname(file.originalname)}`;
			cb(null, filename);
		},
	}),
	// Custom exception for handling file size limit
	// onFileUploadComplete: (file) => {
	// 	if (file.size > multerConfig.limits.fileSize) {
	// 		throw new BadRequestException('File size exceeds the allowed limit.');
	// 	}
	// },
};
