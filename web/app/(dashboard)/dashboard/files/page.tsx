'use client';

import Uploader from '@/components/Uploader';

export default function FilesPage() {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">My Files</h1>
            <Uploader />
        </div>
    );
}
