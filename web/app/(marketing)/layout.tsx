import Navbar from '@/components/Navbar';

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-900">
            <Navbar />
            <main>{children}</main>
            <footer className="bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 mt-20">
                <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                    <p className="text-center text-base text-gray-400">
                        &copy; 2024 Iroh CDN. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
