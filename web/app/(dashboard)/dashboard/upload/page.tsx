'use client';

import Uploader from '@/components/Uploader';

export default function UploadPage() {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Upload Files</h1>
            <Uploader />
        </div>
    );
}
