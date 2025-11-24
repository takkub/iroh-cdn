import Link from 'next/link';
import { Check } from 'lucide-react';

const tiers = [
    {
        name: 'Free',
        price: 0,
        features: [
            '100MB Storage',
            '5 Files Limit',
            '7 Days Link Expiration',
            'Community Support',
        ],
        cta: 'Start for Free',
        href: '/auth/register',
        mostPopular: false,
    },
    {
        name: 'Pro',
        price: 9.99,
        features: [
            '10GB Storage',
            'Unlimited Files',
            'Permanent Links',
            'No Ads',
            'API Access',
            'Priority Support',
        ],
        cta: 'Get Pro',
        href: '/auth/register?plan=pro',
        mostPopular: true,
    },
    {
        name: 'Business',
        price: 49.99,
        features: [
            '100GB Storage',
            'Custom Domain',
            'Team Collaboration',
            'Advanced Analytics',
            'Dedicated Support',
            'SLA Guarantee',
        ],
        cta: 'Contact Sales',
        href: 'mailto:sales@irohcdn.com',
        mostPopular: false,
    },
];

export default function PricingPage() {
    return (
        <div className="bg-gray-50 dark:bg-gray-900 py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-4xl text-center">
                    <h2 className="text-base font-semibold leading-7 text-indigo-600">Pricing</h2>
                    <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
                        Simple, transparent pricing
                    </p>
                </div>
                <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600 dark:text-gray-300">
                    Choose the plan that fits your needs. Upgrade or downgrade at any time.
                </p>
                <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                    {tiers.map((tier, tierIdx) => (
                        <div
                            key={tier.name}
                            className={`flex flex-col justify-between rounded-3xl bg-white dark:bg-gray-800 p-8 ring-1 ring-gray-200 dark:ring-gray-700 xl:p-10 ${tier.mostPopular ? 'ring-2 ring-indigo-600 scale-105 shadow-xl z-10' : ''
                                }`}
                        >
                            <div>
                                <div className="flex items-center justify-between gap-x-4">
                                    <h3 className="text-lg font-semibold leading-8 text-gray-900 dark:text-white">
                                        {tier.name}
                                    </h3>
                                    {tier.mostPopular && (
                                        <span className="rounded-full bg-indigo-600/10 px-2.5 py-1 text-xs font-semibold leading-5 text-indigo-600 dark:text-indigo-400">
                                            Most popular
                                        </span>
                                    )}
                                </div>
                                <p className="mt-4 text-sm leading-6 text-gray-600 dark:text-gray-400">
                                    {tier.name === 'Free' ? 'Perfect for trying out.' : 'For serious users.'}
                                </p>
                                <p className="mt-6 flex items-baseline gap-x-1">
                                    <span className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">${tier.price}</span>
                                    <span className="text-sm font-semibold leading-6 text-gray-600 dark:text-gray-400">/month</span>
                                </p>
                                <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
                                    {tier.features.map((feature) => (
                                        <li key={feature} className="flex gap-x-3">
                                            <Check className="h-6 w-5 flex-none text-indigo-600" aria-hidden="true" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <Link
                                href={tier.href}
                                className={`mt-8 block rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${tier.mostPopular
                                        ? 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-indigo-600'
                                        : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600'
                                    }`}
                            >
                                {tier.cta}
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
