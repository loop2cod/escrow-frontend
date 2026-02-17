import Navigation from '@/components/landing-page/sections/Navigation';
import Footer from '@/components/landing-page/sections/Footer';
import '@/app/landing-page.css';

export default function CookiePolicy() {
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
                        <h1 className="text-4xl md:text-5xl font-bold mb-4  tracking-tight">Cookie Policy</h1>
                        <p className="text-primary font-medium">Last updated: {new Date().toLocaleDateString()}</p>
                    </div>

                    {/* Content Card */}
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 md:p-12">
                        <div className="space-y-10">
                            <section>
                                <h2 className="text-2xl font-bold mb-4 ">1. What Are Cookies</h2>
                                <p className="leading-relaxed ">
                                    Cookies are small text files that are placed on your computer or mobile device when you browse websites.
                                    They are widely used to make websites work, or work more efficiently, as well as to provide information to the owners of the site.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold mb-4 ">2. How We Use Cookies</h2>
                                <p className="leading-relaxed ">
                                    We use cookies for several reasons, detailed below. Unfortunately, in most cases, there are no industry standard options for disabling cookies
                                    without completely disabling the functionality and features they add to this site. It is recommended that you leave on all cookies if you are not sure
                                    whether you need them or not in case they are used to provide a service that you use.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold mb-4 ">3. The Cookies We Set</h2>
                                <ul className="list-disc ml-6 space-y-2  marker:text-primary">
                                    <li>
                                        <strong className="">Account related cookies:</strong> If you create an account with us then we will use cookies for the management of the signup process and general administration.
                                    </li>
                                    <li>
                                        <strong className="">Login related cookies:</strong> We use cookies when you are logged in so that we can remember this fact. This prevents you from having to log in every single time you visit a new page.
                                    </li>
                                    <li>
                                        <strong className="">Site preferences cookies:</strong> In order to provide you with a great experience on this site we provide the functionality to set your preferences for how this site runs when you use it.
                                    </li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold mb-4 ">4. Disabling Cookies</h2>
                                <p className="leading-relaxed ">
                                    You can prevent the setting of cookies by adjusting the settings on your browser (see your browser Help for how to do this).
                                    Be aware that disabling cookies will affect the functionality of this and many other websites that you visit.
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
