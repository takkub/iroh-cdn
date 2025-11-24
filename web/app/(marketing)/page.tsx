import Link from 'next/link';
import { ArrowRight, Zap, Shield, Globe } from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="overflow-hidden">
            {/* Hero Section */}
            <div className="relative pt-16 pb-32 flex content-center items-center justify-center min-h-[75vh]">
                <div className="absolute top-0 w-full h-full bg-center bg-cover" style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1558494949-efc527b8912f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')"
                }}>
                    <span id="blackOverlay" className="w-full h-full absolute opacity-75 bg-black"></span>
                </div>
                <div className="container relative mx-auto">
                    <div className="items-center flex flex-wrap">
                        <div className="w-full lg:w-6/12 px-4 ml-auto mr-auto text-center">
                            <div className="pr-12">
                                <h1 className="text-white font-semibold text-5xl">
                                    Decentralized Content Delivery
                                </h1>
                                <p className="mt-4 text-lg text-gray-200">
                                    Experience the future of file sharing. Fast, secure, and unstoppable.
                                    Powered by Iroh P2P networking.
                                </p>
                                <div className="mt-8 flex justify-center gap-4">
                                    <Link href="/auth/register" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-transform transform hover:scale-105 flex items-center">
                                        Get Started <ArrowRight className="ml-2 h-5 w-5" />
                                    </Link>
                                    <Link href="/pricing" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 font-bold py-3 px-8 rounded-full transition-colors">
                                        View Pricing
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <section className="pb-20 bg-gray-50 dark:bg-gray-900 -mt-24">
                <div className="container mx-auto px-4">
                    <div className="flex flex-wrap">
                        <div className="lg:pt-12 pt-6 w-full md:w-4/12 px-4 text-center">
                            <div className="relative flex flex-col min-w-0 break-words bg-white dark:bg-gray-800 w-full mb-8 shadow-lg rounded-lg">
                                <div className="px-4 py-5 flex-auto">
                                    <div className="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 mb-5 shadow-lg rounded-full bg-red-400">
                                        <Zap className="w-6 h-6" />
                                    </div>
                                    <h6 className="text-xl font-semibold dark:text-white">Lightning Fast</h6>
                                    <p className="mt-2 mb-4 text-gray-500 dark:text-gray-400">
                                        Direct P2P streaming means no bottlenecks. Content is delivered from the nearest peer.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="w-full md:w-4/12 px-4 text-center">
                            <div className="relative flex flex-col min-w-0 break-words bg-white dark:bg-gray-800 w-full mb-8 shadow-lg rounded-lg">
                                <div className="px-4 py-5 flex-auto">
                                    <div className="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 mb-5 shadow-lg rounded-full bg-blue-400">
                                        <Shield className="w-6 h-6" />
                                    </div>
                                    <h6 className="text-xl font-semibold dark:text-white">Secure by Design</h6>
                                    <p className="mt-2 mb-4 text-gray-500 dark:text-gray-400">
                                        Content addressing ensures integrity. What you ask for is exactly what you get.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 w-full md:w-4/12 px-4 text-center">
                            <div className="relative flex flex-col min-w-0 break-words bg-white dark:bg-gray-800 w-full mb-8 shadow-lg rounded-lg">
                                <div className="px-4 py-5 flex-auto">
                                    <div className="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 mb-5 shadow-lg rounded-full bg-emerald-400">
                                        <Globe className="w-6 h-6" />
                                    </div>
                                    <h6 className="text-xl font-semibold dark:text-white">Global Scale</h6>
                                    <p className="mt-2 mb-4 text-gray-500 dark:text-gray-400">
                                        Works everywhere. No region locks. No censorship. Truly decentralized.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Tech Stack Section */}
            <section className="py-20 bg-white dark:bg-gray-900">
                <div className="container mx-auto px-4">
                    <div className="flex flex-wrap justify-center text-center mb-24">
                        <div className="w-full lg:w-6/12 px-4">
                            <h2 className="text-4xl font-semibold dark:text-white">Built with Modern Tech</h2>
                            <p className="text-lg leading-relaxed m-4 text-gray-500 dark:text-gray-400">
                                We use the latest technologies to ensure reliability and performance.
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap justify-center gap-8 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                        {/* Add logos here if available, using text for now */}
                        <div className="text-2xl font-bold text-gray-400">Next.js</div>
                        <div className="text-2xl font-bold text-gray-400">NestJS</div>
                        <div className="text-2xl font-bold text-gray-400">Iroh</div>
                        <div className="text-2xl font-bold text-gray-400">PostgreSQL</div>
                        <div className="text-2xl font-bold text-gray-400">Docker</div>
                    </div>
                </div>
            </section>
        </div>
    );
}
