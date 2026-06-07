export default function TermsOfServicePage() {

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Main Content */}
      <div className="max-w-6xl mx-auto lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="flex flex-col lg:flex-row">

            {/* Content Area */}
            <div className="lg:w-full p-2 md:p-6 lg:p-6">
              {/* Header */}
              <div className="text-center mb-4">
                <p className="text-gray-600 text-base p-2 md:text-lg">
                  These terms govern your use of our platform and services. Please read them carefully.
                </p>
              </div>

              {/* Content Sections */}
              <div className="space-y-8 text-gray-700">
                
                {/* General Section */}
                <section id="general" className="bg-gray-50 rounded-xl p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                      G
                    </span>
                    General
                  </h2>
                  <div className="prose prose-gray max-w-none">
                    <p className="mb-4">
                      This Agreement provides for the terms and conditions applicable to the user ("User/Customer") of the content and data available on this website <a href="http://www.veerive.com" className="text-indigo-600 hover:text-indigo-500">www.veerive.com</a> ("the Website" or "product"), which is owned and operated by <strong>GMB Research Solutions Pvt. Ltd.</strong>, a company incorporated under the Companies Act, 1956 having its head office at Unit No. 203, 2nd Floor, Suite # 365, SBR CV Towers, Sector-I, Sy No 64, HUDA Techno Enclave Madhapur, Hyderabad 500081 Telangana India ("hereinafter referred to as 'GMB Research'").
                    </p>
                    <p>
                      The terms set out herein below include any amendments thereof posted on the website and will be binding on the users accessing the website and subscribing for any services. Waiver of any provision of the Terms will be effective only if in writing and agreed by each of the parties.
                    </p>
                  </div>
                </section>

                {/* Short Overview */}
                <section id="overview" className="bg-gray-50 rounded-xl p-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    Key Highlights
                  </h2>
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <h3 className="font-semibold text-gray-900 mb-2">User Accounts</h3>
                        <p className="text-sm text-gray-600">Registration required for access. Keep your login details secure and confidential.</p>
                      </div>
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <h3 className="font-semibold text-gray-900 mb-2">Services</h3>
                        <p className="text-sm text-gray-600">Content aggregation, classification, search, email alerts and newsletters for business information.</p>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <h3 className="font-semibold text-gray-900 mb-2">Permitted Use</h3>
                        <p className="text-sm text-gray-600">Access for viewing, downloading, saving content as per terms. No redistribution or commercial exploitation.</p>
                      </div>
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <h3 className="font-semibold text-gray-900 mb-2">Intellectual Property</h3>
                        <p className="text-sm text-gray-600">All rights reserved with GMB Research and respective content owners.</p>
                      </div>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h3 className="font-semibold text-green-800 mb-2 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Security & Privacy
                      </h3>
                      <p className="text-sm text-green-700">Your data is protected according to our Privacy Policy. Maintain confidentiality of your account credentials.</p>
                    </div>
                  </div>
                </section>

                {/* Section 1 - User Account */}
                <section id="user-account" className="bg-gray-50 rounded-xl p-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    1. User Account
                  </h2>
                  <div className="prose prose-gray max-w-none">
                    <p className="mb-4">
                      The Website requires registration as a User by creating an Account in order to access information or data on the Website. The User will be provided with separate login details for access upon completion of the Website's registration process which the User shall treat and keep in high confidence and shall not pass on to any third parties.
                    </p>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                      <h3 className="font-semibold text-yellow-800 mb-2">Important Responsibilities</h3>
                      <ul className="space-y-2 text-yellow-700">
                        <li>• Maintain confidentiality of password and account</li>
                        <li>• Take full responsibility for all activities under your account</li>
                        <li>• Immediately notify GMB Research of any unauthorized use</li>
                        <li>• Report any security breaches promptly</li>
                      </ul>
                    </div>
                    <p className="text-sm text-gray-600">
                      GMB Research cannot and will not be liable for any loss or damage arising from the failure to comply with this clause by the User.
                    </p>
                  </div>
                </section>

                {/* Section 2 - Services */}
                <section id="services" className="bg-gray-50 rounded-xl p-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    2. Services
                  </h2>
                  <div className="prose prose-gray max-w-none">
                    <p className="mb-4">
                      The website, www.veerive.com is an online web product designed to cater to the needs of marketing communications, analysts, experts, researchers, government officials, etc by providing services relating to:
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      {[
                        'Content aggregation',
                        'Classification services',
                        'Search functionality',
                        'Email alerts',
                        'Customized newsletters',
                        'Business information access'
                      ].map((service) => (
                        <div key={service} className="bg-white rounded-lg p-3 shadow-sm">
                          <div className="flex items-center">
                            <svg className="w-4 h-4 text-indigo-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-medium">{service}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="mb-4">
                      The User or subscriber shall have access to business information like news articles, features, analysis on different industries, companies, and business executives etc., linked to the articles published in the websites of various newspapers, magazines, and web portals.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-blue-800 text-sm">
                        <strong>Note:</strong> GMB Research reserves the right to amend, modify or suspend its Services (or any part thereof) from time to time. The terms and conditions of this agreement constitute the entire and only agreement between GMB Research Solutions Pvt. Ltd. and the User.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Section 3 - Acceptance of Terms */}
                <section id="acceptance" className="bg-gray-50 rounded-xl p-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    3. Acceptance of Terms
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">A. Acceptance of Terms as Laid Down by GMB Research</h3>
                      <p className="mb-4">
                        By subscribing to the website or accessing the website past the home page, the User agrees and consents to the acceptance of the terms of this Agreement with GMB Research and will be liable for any breach or violation.
                      </p>
                      <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Changes to Terms</h4>
                        <p className="text-sm text-gray-600">
                          GMB Research may in its discretion change the terms of the website from time to time and any change in terms shall be effective on its posting on the website. If you do not agree to the changes, you may write to GMB Research at Unit No. 601-602, Sixth Floor, Tower 4B, DLF Corporate Park, Phase – III, MG Road, Gurugram, Haryana – 122002, India.
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">B. Acceptance of Terms as Laid Down by Third Party Service Providers</h3>
                      <p className="mb-4">
                        By subscribing to the website, or accessing any portion of the website past the homepage, the User is considered to be bound by, and in agreement with the Terms of Service as laid down by the following third party service providers:
                      </p>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <h4 className="font-medium text-gray-900 mb-2">YouTube</h4>
                          <p className="text-sm text-gray-600">
                            A service provided by Google LLC — a company operating under the laws of The State of Delaware, located at 1600 Amphitheatre Parkway, Mountain View, CA 94043
                          </p>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <h4 className="font-medium text-gray-900 mb-2">Twitter</h4>
                          <p className="text-sm text-gray-600">
                            A service provided by Twitter, Inc. — a company operating under the laws of The State of California, located at 1355 Market Street, Suite 900 San Francisco, CA 94103
                          </p>
                        </div>
                      </div>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                        <p className="text-red-700 text-sm">
                          <strong>Important:</strong> Third Party Services providers may amend these Terms of Service at their discretion without prior notice. By continuing to use any service provided by GMB Research, you are automatically considered to be in agreement with any future amendments.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Section 4 - Term of Subscription */}
                <section id="subscription" className="bg-gray-50 rounded-xl p-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    4. Term of Subscription
                  </h2>
                  <div className="prose prose-gray max-w-none">
                    <p className="mb-4">
                      By subscribing to access the website on payment of subscription fees, the User shall be given the License and access rights as per the plan opted, which shall be renewable on expiry of the period on terms as applicable thereon at the time of renewal.
                    </p>
                    <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
                      <h3 className="font-semibold text-gray-900 mb-2">License Grant</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        GMB Research grants to the User (for so long as the User has a valid subscription), a personal, non-exclusive, non-transferable licence ("the Licence") to access and use the website's services only upon the Terms and Conditions of this Agreement.
                      </p>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <h4 className="font-medium text-yellow-800 mb-2">License Restrictions</h4>
                        <ul className="space-y-1 text-yellow-700 text-sm">
                          <li>• User shall not assign, dispose of, sub-license, or transfer rights</li>
                          <li>• Access limited to authorized employees or Secondary Users only</li>
                          <li>• Prior written permission required from GMB Research for additional users</li>
                          <li>• Secondary Users must accept and adhere to these Terms and Conditions</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Section 5 - Privacy Policy */}
                <section id="privacy" className="bg-gray-50 rounded-xl p-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    5. Privacy Policy
                  </h2>
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-6">
                    <div className="flex items-center mb-4">
                      <svg className="w-8 h-8 text-indigo-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <h3 className="text-lg font-semibold text-gray-900">Privacy Commitment</h3>
                    </div>
                    <p className="text-gray-700 mb-4">
                      GMB Research is committed to protecting the privacy and confidentiality of any personal information that it may request and receive from its clients, business partners and other users of the Website and the User hereby agrees with and consents to the privacy policy of GMB Research.
                    </p>
                    <p className="text-sm text-indigo-700">
                      To read GMB Research's privacy policy statement regarding such personal information, please refer to the PRIVACY POLICY on the website.
                    </p>
                  </div>
                </section>

                {/* Section 6 - Permitted Use */}
                <section id="permitted-use" className="bg-gray-50 rounded-xl p-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    6. Permitted Use
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 text-green-600">✓ What You Can Do</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        {[
                          'Online access to website content',
                          'Download, save, or print text',
                          'Use search results for permitted purposes',
                          'Access information as per publisher\'s terms'
                        ].map((permitted, index) => (
                          <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <div className="flex items-center">
                              <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              <span className="text-sm text-green-700">{permitted}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 text-red-600">✗ What You Cannot Do</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        {[
                          'Copy, market, resell, or distribute content',
                          'Re-transmit or re-publish GMB Research content',
                          'Compile databases or carry on automated browsing',
                          'Commercially exploit content beyond defined purposes',
                          'Reverse engineer or modify software',
                          'Use content in ways prejudicial to reputation',
                          'Manipulate or distort content electronically',
                          'Reproduce or transmit to other websites'
                        ].map((prohibited, index) => (
                          <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <div className="flex items-center">
                              <svg className="w-4 h-4 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                              <span className="text-sm text-red-700">{prohibited}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h3 className="font-semibold text-yellow-800 mb-2 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        Legal Consequences
                      </h3>
                      <p className="text-yellow-800 text-sm">
                        GMB Research reserves the right to assert claims for damages and to obtain an injunction requiring the Customer to desist from improper or unauthorized use of the website and its content.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Section 7 - Security */}
                <section id="security" className="bg-gray-50 rounded-xl p-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    7. Security
                  </h2>
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Technological Measures
                      </h3>
                      <p className="text-blue-700 text-sm">
                        There may be technological measures in the website that are designed to prevent unauthorized use. Users may need to activate, reactivate, or change passwords for secure access.
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <h3 className="font-semibold text-gray-900 mb-3">GMB Research Security Rights</h3>
                      <ul className="space-y-2 text-gray-600 text-sm">
                        <li>• Temporarily cease server operations as security measures</li>
                        <li>• Alter, delete, or add content stored on the website</li>
                        <li>• Collect and store anonymous usage data for technical support</li>
                        <li>• Debug errors and improve product quality</li>
                      </ul>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h3 className="font-semibold text-green-800 mb-2">Privacy Protection</h3>
                      <p className="text-green-700 text-sm">
                        GMB Research undertakes not to disclose anonymous data in any form that personally identifies the user as per the privacy policy.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Section 8 - Suspension and Termination */}
                <section id="suspension" className="bg-gray-50 rounded-xl p-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    8. Suspension and Termination
                  </h2>
                  <div className="space-y-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h3 className="font-semibold text-red-800 mb-2">Grounds for Suspension</h3>
                      <p className="text-red-700 text-sm mb-3">
                        GMB Research may suspend a User Account or temporarily disable access in the event of:
                      </p>
                      <ul className="space-y-1 text-red-700 text-sm">
                        <li>• Suspected illegal activity</li>
                        <li>• Extended periods of inactivity</li>
                        <li>• Requests by law enforcement or government agencies</li>
                      </ul>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <h3 className="font-semibold text-gray-900 mb-3">Termination Consequences</h3>
                      <div className="grid md:grid-cols-3 gap-3">
                        {[
                          'Denial of access to all services',
                          'Deletion of account information',
                          'Deletion of all user data'
                        ].map((consequence, index) => (
                          <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-600">{consequence}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h3 className="font-semibold text-yellow-800 mb-2">Surviving Terms</h3>
                      <p className="text-yellow-700 text-sm">
                        Restrictions on downloaded material, disclaimers, and limitation of liabilities shall survive termination.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Section 9 - Intellectual Property Rights */}
                <section id="intellectual-property" className="bg-gray-50 rounded-xl p-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    9. Intellectual Property Rights
                  </h2>
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-6">
                      <h3 className="font-semibold text-purple-800 mb-3 flex items-center">
                        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Ownership Rights
                      </h3>
                      <p className="text-purple-700 text-sm">
                        All intellectual property rights, title and interest with respect to the marks <strong>GMB Research</strong> and <strong>Veerive</strong>, domain name and the website are reserved with and owned by GMB Research.
                      </p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <h3 className="font-semibold text-gray-900 mb-3">Protected Assets</h3>
                        <ul className="space-y-2">
                          {[
                            'Copyrights',
                            'Patents',
                            'Designs',
                            'Know-how',
                            'Trade secrets',
                            'Inventions (patent pending)',
                            'Goodwill',
                            'Databases'
                          ].map((asset) => (
                            <li key={asset} className="flex items-center text-sm">
                              <svg className="w-3 h-3 text-purple-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              {asset}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <h3 className="font-semibold text-gray-900 mb-3">Content Rights</h3>
                        <p className="text-sm text-gray-600 mb-3">
                          Rights with respect to any publication or content on the website shall be reserved with GMB Research or with the respective owner of the copyright.
                        </p>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-blue-700 text-sm">
                            <strong>Important:</strong> Any rights not expressly granted to the User in this Agreement are retained by GMB Research or the respective copyright owner.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Section 10 - Third Party Sites */}
                <section id="third-party" className="bg-gray-50 rounded-xl p-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    10. Third Party Sites
                  </h2>
                  <div className="space-y-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h3 className="font-semibold text-yellow-800 mb-2 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        External Links Notice
                      </h3>
                      <p className="text-yellow-700 text-sm">
                        Links to external internet sites are provided for convenience only. The listing of an external site does not imply endorsement by GMB Research or its affiliates.
                      </p>
                    </div>

                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <h3 className="font-semibold text-gray-900 mb-3">GMB Research Disclaimers</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        {[
                          'No representations regarding availability and performance',
                          'Not responsible for accuracy of external content',
                          'Not liable for copyright compliance of external sites',
                          'No responsibility for legality or decency of external material',
                          'Different privacy policies may apply to third-party sites',
                          'No liability for collection, use or disclosure by third parties'
                        ].map((disclaimer, index) => (
                          <div key={index} className="flex items-start">
                            <svg className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm text-gray-600">{disclaimer}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-700 text-sm">
                        <strong>Important:</strong> Once the User logs onto any other website, it shall be governed by the Privacy Policy and Terms & Conditions of that website only.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Section 11 - Disclaimer */}
                <section id="disclaimer" className="bg-gray-50 rounded-xl p-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    11. Disclaimer
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Content Disclaimer</h3>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                        <p className="text-red-700 text-sm mb-3">
                          GMB Research provides access to information published on internet by newspapers, magazines, and web portals. While every attempt has been made to ascertain authenticity, GMB Research has no control over content accuracy, integrity, or quality.
                        </p>
                        <p className="text-red-700 text-sm">
                          <strong>No Liability:</strong> GMB Research makes no guarantees and undertakes no responsibility for any information, including its authenticity, currency, content, quality, copyright compliance, legality, or any resulting loss or damage.
                        </p>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <h4 className="font-medium text-gray-900 mb-2">Not Liable For</h4>
                          <ul className="space-y-1 text-sm text-gray-600">
                            <li>• Direct or indirect damages</li>
                            <li>• Loss of profits, property, revenue</li>
                            <li>• Data loss or virus infestation</li>
                            <li>• Content-based decisions</li>
                            <li>• Errors or omissions in content</li>
                          </ul>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <h4 className="font-medium text-gray-900 mb-2">Website Functionality</h4>
                          <ul className="space-y-1 text-sm text-gray-600">
                            <li>• Delay or inability to use website</li>
                            <li>• Provision or failure to provide functionalities</li>
                            <li>• Information, software, products obtained</li>
                            <li>• Contract, tort, negligence issues</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Warranty Disclaimer</h3>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-yellow-800 text-sm mb-3">
                          GMB Research does not guarantee whether content providers are recognized, reputable, or quality service providers. The User must satisfy itself about all relevant aspects prior to registration/subscription.
                        </p>
                        <div className="grid md:grid-cols-2 gap-3">
                          <div>
                            <h4 className="font-medium text-yellow-900 mb-2">"As Is" Basis</h4>
                            <p className="text-yellow-700 text-sm">
                              Materials and media are provided "as is" and "as available" without warranty of any kind, express, implied, or statutory.
                            </p>
                          </div>
                          <div>
                            <h4 className="font-medium text-yellow-900 mb-2">No Warranties</h4>
                            <p className="text-yellow-700 text-sm">
                              No implied warranties of suitability, non-infringement, security, reliability, timeliness, accuracy, or performance.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Section 12 - Policy For Change */}
                <section id="policy-change" className="bg-gray-50 rounded-xl p-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    12. Policy For Change
                  </h2>
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-800 mb-2">Periodic Changes</h3>
                      <p className="text-blue-700 text-sm mb-3">
                        GMB Research may periodically change the terms and conditions without notice. User is responsible for checking the terms periodically for revisions.
                      </p>
                      <p className="text-blue-700 text-sm">
                        All amended Terms become effective upon our posting to the Site, and any use of the site after such revisions have been posted signifies the consent of the User to the changes.
                      </p>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h3 className="font-semibold text-green-800 mb-2 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Significant Changes
                      </h3>
                      <p className="text-green-700 text-sm">
                        For significant changes, a more prominent notice through email notification will be sent and also be notified separately on the website.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Section 13 - Liability */}
                <section id="liability" className="bg-gray-50 rounded-xl p-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    13. Liability
                  </h2>
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h3 className="font-semibold text-red-800 mb-2">GMB Research Not Liable For</h3>
                        <ul className="space-y-2 text-red-700 text-sm">
                          <li>• Non-availability during maintenance</li>
                          <li>• Unplanned suspension due to technical reasons</li>
                          <li>• Damage to computer systems</li>
                          <li>• Loss of data from downloads</li>
                          <li>• Viruses or harmful components</li>
                          <li>• Errors or defects in content</li>
                        </ul>
                      </div>
                      
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h3 className="font-semibold text-yellow-800 mb-2">User Responsibilities</h3>
                        <ul className="space-y-2 text-yellow-700 text-sm">
                          <li>• Downloads at own discretion and risk</li>
                          <li>• Sole responsibility for system damage</li>
                          <li>• Liable for non-contractual use</li>
                          <li>• Responsible for illegal or abusive use</li>
                          <li>• Must indemnify GMB Research for misuse</li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <h3 className="font-semibold text-gray-900 mb-3">Indemnification</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        The User shall indemnify and hold harmless GMB Research and publishers against any and all losses or damages arising from:
                      </p>
                      <div className="grid md:grid-cols-2 gap-3">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <span className="text-sm">Improper use including trademark passing off</span>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <span className="text-sm">Infringement of intellectual property rights</span>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <span className="text-sm">Any claims arising from content use</span>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <span className="text-sm">Even from permitted use of content</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h3 className="font-semibold text-red-800 mb-2">Limitation of Liability</h3>
                      <p className="text-red-700 text-sm">
                        In no event shall GMB Research, its subsidiaries, affiliates, agents, employees or representatives be liable for any indirect, incidental, special, punitive, exemplary or consequential loss or damages, nor for any lost profits or revenues.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Section 14 - Governing Law */}
                <section id="governing-law" className="bg-gray-50 rounded-xl p-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    14. Governing Law
                  </h2>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                          </svg>
                          Governing Law
                        </h3>
                        <p className="text-blue-700 text-sm">
                          These terms shall be governed by and constructed in accordance with the <strong>laws of India</strong> without reference to conflict of laws principles or User's actual state or country of residence.
                        </p>
                      </div>
                      <div>
                        <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          Jurisdiction
                        </h3>
                        <p className="text-blue-700 text-sm">
                          Any disputes arising in relation hereto shall be subject to the exclusive jurisdiction of the courts at <strong>New Delhi, India</strong>.
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 bg-white rounded-lg p-3">
                      <p className="text-gray-600 text-sm">
                        <strong>Note:</strong> GMB Research may, however, proceed against the User in another domestic or foreign jurisdiction.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Section 15 - Indemnification */}
                <section id="indemnification" className="bg-gray-50 rounded-xl p-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    15. Indemnification
                  </h2>
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h3 className="font-semibold text-green-800 mb-2">GMB Research Indemnifies User</h3>
                      <p className="text-green-700 text-sm">
                        GMB Research agrees, to the fullest extent permitted by law, to indemnify and hold harmless the USER, its officers, directors and employees against all damages, liabilities or costs, including reasonable attorneys' fees and defense costs, to the extent caused by GMB Research's negligent performance of professional services under this Agreement.
                      </p>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-800 mb-2">User Indemnifies GMB Research</h3>
                      <p className="text-blue-700 text-sm">
                        The USER agrees, to the fullest extent permitted by law, to indemnify and hold harmless GMB Research, its officers, directors, and employees against all damages, liabilities or costs, including reasonable attorneys' fees and defense costs, to the extent caused by the USER's negligent acts in connection with the terms of this Agreement.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Section 16 - Miscellaneous */}
                <section id="miscellaneous" className="bg-gray-50 rounded-xl p-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    16. Miscellaneous
                  </h2>
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <h3 className="font-semibold text-gray-900 mb-2">User Responsibilities</h3>
                        <p className="text-sm text-gray-600">
                          All charges with respect to internet connection, telephone and as required for access to the website shall be borne by the User.
                        </p>
                      </div>
                      
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <h3 className="font-semibold text-gray-900 mb-2">Data Verification</h3>
                        <p className="text-sm text-gray-600">
                          It is advisable that information obtained from the website be verified from other sources before use.
                        </p>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h3 className="font-semibold text-yellow-800 mb-2">Communication Requirements</h3>
                      <p className="text-yellow-700 text-sm mb-3">
                        All notices, demands and other communications must be in writing and will be deemed given by:
                      </p>
                      <div className="grid md:grid-cols-2 gap-3">
                        {[
                          'Certified mail, postage prepaid',
                          'Overnight courier delivery',
                          'Facsimile transmission (confirmed)',
                          'Electronic mail (confirmed)'
                        ].map((method, index) => (
                          <div key={index} className="flex items-center">
                            <svg className="w-3 h-3 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm">{method}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="font-semibold text-blue-800 mb-2">Severability</h3>
                        <p className="text-blue-700 text-sm">
                          If any provision is held invalid, illegal, or unenforceable, the validity and enforceability of remaining provisions shall not be affected.
                        </p>
                      </div>
                      
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h3 className="font-semibold text-red-800 mb-2">Force Majeure</h3>
                        <p className="text-red-700 text-sm">
                          Not liable for delays due to causes beyond reasonable control including natural disasters, wars, strikes, equipment failures.
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-100 rounded-lg p-4">
                      <p className="text-gray-700 text-sm">
                        <strong>Succession:</strong> All rights and duties arising from these terms of use shall pass to any legal successor of GMB Research.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Section 17 - DMCA Notice */}
                <section id="dmca" className="bg-gray-50 rounded-xl p-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    17. Copyright Infringement – DMCA Notice
                  </h2>
                  <div className="space-y-4">
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <h3 className="font-semibold text-purple-800 mb-2">Digital Millennium Copyright Act (DMCA)</h3>
                      <p className="text-purple-700 text-sm">
                        The DMCA is a United States copyright law that provides online service providers relief from liability for copyright infringement if they promptly remove offending content once notified of an alleged infringement by the Copyright owner or designated Agent.
                      </p>
                    </div>

                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <h3 className="font-semibold text-gray-900 mb-3">Filing a DMCA Complaint</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        You may file a complaint with Veerive if you believe content hosted by Veerive violates your rights under US Copyright Law:
                      </p>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            By Mail
                          </h4>
                          <div className="text-blue-700 text-sm">
                            <p className="font-medium">Copyright Agent (DMCA)</p>
                            <p>Veerive</p>
                            <p>Unit No. 203, 2nd Floor, Suite # 365,</p>
                            <p>SBR CV Towers, Sector-I, Sy No 64,</p>
                            <p>HUDA Techno Enclave Madhapur,</p>
                            <p>Hyderabad 500081</p>
                            <p>Telangana, India</p>
                          </div>
                        </div>
                        
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <h4 className="font-medium text-green-800 mb-2 flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                            </svg>
                            By Email
                          </h4>
                          <div className="text-green-700">
                            <a 
                              href="mailto:info@veerive.com" 
                              className="text-green-700 hover:text-green-600 font-semibold text-lg"
                            >
                              info@veerive.com
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Contact Section */}
                <section id="contact" className="bg-gray-50 rounded-xl p-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    Questions and Contact Information
                  </h2>
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-6 text-center">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Need Help with These Terms?</h3>
                    <p className="mb-4">
                      If you have any questions about these Terms of Service or need clarification on any provisions, please contact us:
                    </p>
                    <div className="flex justify-center">
                      <div className="rounded-lg p-2 md:p-4 inline-block shadow-sm">
                        <a 
                          href="mailto:contact@veerive.com" 
                          className="text-gray-600 hover:text-black font-semibold text-lg flex items-center"
                        >
                          contact@veerive.com
                        </a>
                      </div>
                    </div>
                  </div>
                </section>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}