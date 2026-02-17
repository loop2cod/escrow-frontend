import Navigation from '@/components/landing-page/sections/Navigation';
import Footer from '@/components/landing-page/sections/Footer';
import '@/app/landing-page.css';

export default function PrivacyPolicy() {
    return (
        <div className="landing-page-specific relative min-h-screen bg-[#0B0C10] text-gray-300">
            {/* Grain Overlay */}
            <div className="grain-overlay" />

            {/* Navigation */}
            <Navigation />

            {/* Main Content */}
            <main className="relative pt-32 pb-20 px-6">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Privacy Policy</h1>
                        <p className="text-primary font-medium">Last updated: {new Date().toLocaleDateString()}</p>
                    </div>

                    {/* Content Card */}
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 md:p-12">
                        <div className="space-y-10">
                            <section>
                                <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
                                <p className="leading-relaxed text-muted-foreground">
                                    Welcome to SecureEscrow. We verify respect your privacy and are committed to protecting your personal data.
                                    This privacy policy will inform you as to how we look after your personal data when you visit our website
                                    and tell you about your privacy rights and how the law protects you.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold mb-4">2. Data We Collect</h2>
                                <p className="leading-relaxed text-muted-foreground mb-4">
                                    We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:
                                </p>
                                <ul className="list-disc ml-6 space-y-2 text-muted-foreground marker:text-primary">
                                    <li><strong className=">Identity Data</strong> includes first name, maiden name, last name, username or similar identifier.</li>
                                    <li><strong className=">Contact Data</strong> includes billing address, delivery address, email address and telephone numbers.</li>
                                    <li><strong className=">Financial Data</strong> includes bank account and payment card details.</li>
                                    <li><strong className=">Transaction Data</strong> includes details about payments to and from you and other details of products and services you have purchased from us.</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold mb-4">3. How We Use Your Data</h2>
                                <p className="leading-relaxed text-muted-foreground mb-4">
                                    We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
                                </p>
                                <ul className="list-disc ml-6 space-y-2 text-muted-foreground marker:text-primary">
                                    <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
                                    <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
                                    <li>Where we need to comply with a legal or regulatory obligation.</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold mb-4">4. Contact Us</h2>
                                <p className="leading-relaxed text-muted-foreground">
                                    If you have any questions about this privacy policy or our privacy practices, please contact us.
                                </p>
                            </section>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}
