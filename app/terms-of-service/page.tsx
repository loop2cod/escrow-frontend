import Navigation from '@/components/landing-page/sections/Navigation';
import Footer from '@/components/landing-page/sections/Footer';
import '@/app/landing-page.css';

export default function TermsOfService() {
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
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Terms of Service</h1>
                        <p className="text-primary font-medium">Last updated: {new Date().toLocaleDateString()}</p>
                    </div>

                    {/* Content Card */}
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 md:p-12">
                        <div className="space-y-10">
                            <section>
                                <h2 className="text-2xl font-bold mb-4">1. Agreement to Terms</h2>
                                <p className="leading-relaxed text-muted-foreground">
                                    By accessing or using our services, you agree to be bound by these Terms of Service and all applicable laws and regulations.
                                    If you do not agree with any of these terms, you are prohibited from using or accessing this site.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold mb-4">2. Use License</h2>
                                <p className="leading-relaxed text-muted-foreground">
                                    Permission is granted to temporarily download one copy of the materials (information or software) on SecureEscrow's website for personal,
                                    non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold mb-4">3. Disclaimer</h2>
                                <p className="leading-relaxed text-muted-foreground">
                                    The materials on SecureEscrow's website are provided on an 'as is' basis. SecureEscrow makes no warranties, expressed or implied,
                                    and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability,
                                    fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold mb-4">4. Limitations</h2>
                                <p className="leading-relaxed text-muted-foreground">
                                    In no event shall SecureEscrow or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit,
                                    or due to business interruption) arising out of the use or inability to use the materials on SecureEscrow's website.
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
