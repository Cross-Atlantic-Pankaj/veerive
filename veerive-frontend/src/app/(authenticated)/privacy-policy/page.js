export default function PrivacyPolicyPage() {

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
                  Your privacy is important to us. This policy explains how we collect, use, and protect your information.
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
                      This Privacy Policy explains how <strong>GMB Research Solutions Pvt Ltd</strong> ("GMB Research" – the owner of Veerive, referred to as "Veerive", "we", "us" or "our" in this Privacy Policy) collects, uses, stores, transfers and protects your Personal Information when you visit our website <a href="http://www.Veerive.com" className="text-indigo-600 hover:text-indigo-500">www.Veerive.com</a>, as well as other information, collected automatically, not directly submitted by you. Complete details on each type of Personal Information collected are provided in the dedicated sections of this Privacy Policy.
                    </p>
                    <p>
                      Veerive attaches great importance to your right to privacy and the protection of your personal data. We protect all information you provide us in accordance with applicable laws and our privacy policy. In addition, Veerive maintains the appropriate technical and organizational measures to protect your information against unauthorized or unlawful processing and/or against accidental loss, alteration, disclosure or access, or accidental or unlawful destruction or damage thereto.
                    </p>
                  </div>
                </section>

                {/* Section 1 */}
                <section id="section1" className="bg-gray-50 rounded-xl p-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    1. Short Overview
                  </h2>
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <h3 className="font-semibold text-gray-900 mb-2">What is Personal Information?</h3>
                        <p className="text-sm text-gray-600">Personal Information means any information about an individual from which that person can be identified. It does not include data where the identity has been removed (anonymous data).</p>
                      </div>
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <h3 className="font-semibold text-gray-900 mb-2">Our Commitment</h3>
                        <p className="text-sm text-gray-600">Veerive respects your privacy and is committed to protecting your Personal Information.</p>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <h3 className="font-semibold text-gray-900 mb-2">Data Collection</h3>
                        <p className="text-sm text-gray-600">Personal Information may be directly provided by you, or in case of Usage Data, collected automatically when using Veerive.</p>
                      </div>
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <h3 className="font-semibold text-gray-900 mb-2">Data Sharing</h3>
                        <p className="text-sm text-gray-600">Your data is shared with some third parties that help Veerive provide a better customer experience ONLY within Veerive services.</p>
                      </div>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h3 className="font-semibold text-green-800 mb-2 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Security
                      </h3>
                      <p className="text-sm text-green-700">Communications between our service, customer portal, and Veerive products are all encrypted via SSL.</p>
                    </div>
                  </div>
                </section>

                {/* Section 2 */}
                <section id="section2" className="bg-gray-50 rounded-xl p-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    2. Information We Collect
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Personal Information</h3>
                      <ul className="space-y-2">
                        {['Full name', 'Email address', 'Phone number', 'Company', 'Country', 'Cookies'].map((item) => (
                          <li key={item} className="flex items-center">
                            <svg className="w-4 h-4 text-indigo-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Veerive Analytics</h3>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                        <p className="text-blue-800 text-sm font-medium">Note: This feature is optional</p>
                      </div>
                      <ul className="space-y-2">
                        {['IP address', 'Login details', 'Browser type, version, and headers', 'Timestamp', 'URL location', 'Operating system and platform'].map((item) => (
                          <li key={item} className="flex items-center text-sm">
                            <svg className="w-3 h-3 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Veerive Related Data</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      {['Topic', 'Alerts opened', 'Alerts clicked', 'Newsletters opened', 'Newsletters clicked', 'Newsfeed views', 'Articles clicked'].map((item) => (
                        <div key={item} className="bg-white rounded-lg p-3 text-center shadow-sm">
                          <span className="text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800">
                      <strong>Important:</strong> Any use of Cookies – or other tracking tools – by Veerive serves the purpose of providing the Service required by the User. You are responsible for any third-party Personal Information obtained, published, or shared through Veerive and confirm that you have the third party's consent to provide such information to Veerive.
                    </p>
                  </div>
                </section>

                {/* Section 3 */}
                <section id="section3" className="bg-gray-50 rounded-xl p-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    3. Mode and Place of Processing Personal Information
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Methods of Processing</h3>
                      <p className="mb-4">
                        Personal Information processing is carried out using computers and/or IT-enabled tools, following organizational procedures and modes strictly related to the purposes indicated. In some cases, your Personal Information may be accessible to certain types of persons in charge, involved with the operation within Veerive (administration, sales, marketing, legal, system administration) or third parties (such as IT service providers, email servers, hosting providers, marketing and sales software, communications agencies).
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Legal Basis of Processing</h3>
                      <p className="mb-4">Veerive may process your Personal Information if one of the following applies:</p>
                      <div className="grid md:grid-cols-2 gap-4">
                        {[
                          'You have given consent to Veerive for one or more specific purposes',
                          'Provision of Personal Information is necessary for the performance of an agreement',
                          'Processing is necessary for compliance with a legal obligation',
                          'Processing is related to a task carried out in the public interest',
                          'Processing is necessary for legitimate interests pursued by Veerive'
                        ].map((item, index) => (
                          <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
                            <div className="flex items-start">
                              <p className="text-sm">{item}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Place of Processing</h3>
                      <p className="mb-4">
                        The Personal Information is processed at Veerive's operating offices and in any other places where the third-parties involved in the processing are located. Depending on your location, data transfers may involve transferring Personal Information to a country other than your own.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Retention Time</h3>
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <p className="mb-3">Personal Information shall be processed and stored for as long as required by the purpose it has been collected for.</p>
                        <ul className="space-y-2 text-sm">
                          <li>• Personal Information collected for contract performance shall be retained until such contract has been fully performed</li>
                          <li>• Personal Information collected for legitimate interests shall be retained as long as needed to fulfill such purposes</li>
                          <li>• Veerive may retain Personal Information for a longer period when required by legal obligation or authority order</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Section 4 */}
                <section id="section4" className="bg-gray-50 rounded-xl p-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    4. The Purposes of Processing
                  </h2>
                  <p className="mb-6">
                    The Personal Information concerning the User is collected to allow Veerive to provide its Services, as well as for the following purposes:
                  </p>
                  <div className="grid md:grid-cols-3 gap-4">
                    {[
                      'Analytics',
                      'Contacting the User',
                      'Commenting',
                      'Handling payments',
                      'Displaying content from external platforms',
                      'Infrastructure monitoring',
                      'Interaction with support and feedback platforms',
                      'Managing contacts and sending messages',
                      'Managing support and contact requests',
                      'Social features',
                      'Remarketing and behavioral targeting',
                      'Tag Management',
                      'Data transfer outside the EU'
                    ].map((purpose) => (
                      <div key={purpose} className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-3 text-center">
                        <span className="text-sm font-medium">{purpose}</span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Section 5 */}
                <section id="section5" className="bg-gray-50 rounded-xl p-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    5. Your Rights Regarding Personal Information
                  </h2>
                  <p className="mb-6">You may exercise certain rights regarding your Personal Information processed by Veerive:</p>
                  <div className="space-y-4">
                    {[
                      {
                        title: 'Withdraw your consent at any time',
                        description: 'You have the right to withdraw consent where you have previously given your consent to the processing of your Personal Information.',
                        icon: '🚫'
                      },
                      {
                        title: 'Object to processing of your Personal Information',
                        description: 'You have the right to object to the processing of your Personal Information if the processing is carried out on a legal basis other than consent.',
                        icon: '⚖️'
                      },
                      {
                        title: 'Access your Personal Information',
                        description: 'You have the right to learn if your Personal Information is being processed by Veerive and obtain a copy of your Personal Information undergoing processing.',
                        icon: '👁️'
                      },
                      {
                        title: 'Verify and seek rectification',
                        description: 'You have the right to verify the accuracy of your Personal Information and ask for it to be updated or corrected.',
                        icon: '✏️'
                      },
                      {
                        title: 'Restrict the processing',
                        description: 'You have the right, under certain circumstances, to restrict the processing of your Personal Information.',
                        icon: '⏸️'
                      },
                      {
                        title: 'Have your Personal Information deleted',
                        description: 'You have the right, under certain circumstances, to obtain the erasure of your Personal Information from Veerive.',
                        icon: '🗑️'
                      },
                      {
                        title: 'Receive and transfer your data',
                        description: 'You have the right to receive your Personal Information in a structured, machine-readable format and have it transmitted to another controller.',
                        icon: '📤'
                      },
                      {
                        title: 'Lodge a complaint',
                        description: 'You have the right to bring a claim before their competent data protection authority.',
                        icon: '📝'
                      }
                    ].map((right, index) => (
                      <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="flex items-start">
                          <span className="text-2xl mr-4">{right.icon}</span>
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-2">{right.title}</h3>
                            <p className="text-sm text-gray-600">{right.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-800 mb-2">How to Exercise These Rights</h3>
                    <p className="text-blue-700">
                      Any requests to exercise these rights can be directed to Veerive through the contact details provided in this Privacy Policy. These requests can be exercised free of charge and will be addressed by Veerive as early as possible and always within one month.
                    </p>
                  </div>
                </section>

                {/* Section 6 */}
                <section id="section6" className="bg-gray-50 rounded-xl p-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    6. Processing of Your Personal Information
                  </h2>
                  <p className="mb-6">Detailed information on the processing of Personal Information is collected for the following purposes and using the following services:</p>
                  <div className="grid md:grid-cols-2 gap-6">
                    {[
                      {
                        category: 'Analytics',
                        services: ['Google Analytics (Google Inc.)', 'Facebook Ads conversion tracking (Facebook, Inc.)', 'Google AdWords conversion tracking (Google Inc.)', 'Twitter Ads conversion tracking (Twitter, Inc.)']
                      },
                      {
                        category: 'Infrastructure Monitoring',
                        services: ['Pingdom (Pingdom AB)']
                      },
                      {
                        category: 'Managing Contacts and Sending Messages',
                        services: ['HubSpot', 'Zoho Campaigns']
                      },
                      {
                        category: 'Managing Support and Contact Requests',
                        services: ['HubSpot']
                      },
                      {
                        category: 'Remarketing and Behavioral Targeting',
                        services: ['Facebook Custom Audience (Facebook, Inc.)', 'Facebook Remarketing (Facebook, Inc.)', 'AdWords Remarketing (Google Inc.)', 'Twitter Remarketing (Twitter, Inc.)', 'Twitter Tailored Audiences (Twitter, Inc.)']
                      },
                      {
                        category: 'Tag Management',
                        services: ['Google Tag Manager (Google LLC)']
                      }
                    ].map((category, index) => (
                      <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
                        <h3 className="font-semibold text-gray-900 mb-3">{category.category}</h3>
                        <ul className="space-y-1">
                          {category.services.map((service, serviceIndex) => (
                            <li key={serviceIndex} className="text-sm text-gray-600 flex items-center">
                              <svg className="w-3 h-3 text-indigo-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              {service}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Section 7 */}
                <section id="section7" className="bg-gray-50 rounded-xl p-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    7. Additional Information about Data Collection and Processing
                  </h2>
                  <div className="space-y-6">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h3 className="font-semibold text-red-800 mb-2 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        Legal Action
                      </h3>
                      <p className="text-red-700">Your Personal Information may be used for legal purposes by Veerive in Court or the stages leading to possible legal action arising from improper use of Veerive or the related Services.</p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Changes to the Privacy Policy</h3>
                      <p className="mb-4">
                        Veerive reserves the right to modify this privacy policy at any time so please review it frequently. Changes and clarifications will take effect immediately upon their posting on the website. If we make material changes to this policy, we will notify you here that it has been updated.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Age of Consent</h3>
                      <p className="mb-4">
                        By using Veerive, you represent that you are at least the age of majority in your state or province of residence, or that you are the age of majority in your state or province of residence and you have given us your consent to allow any of your minor dependents to use this site.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Personal Information Transfer Outside the EU</h3>
                      <p className="mb-4">
                        Veerive is allowed to transfer Personal Information collected within the EU to third countries only according to a specific legal basis. Any such Personal Information transfer is based on one of the legal bases described below:
                      </p>
                      <div className="space-y-3">
                        {[
                          'Personal Information transfer abroad based on consent',
                          'Personal Information transfer based on standard contractual clauses',
                          'Other legal bases for Personal Information transfer abroad'
                        ].map((basis, index) => (
                          <div key={index} className="bg-white rounded-lg p-3 shadow-sm">
                            <h4 className="font-medium text-gray-900 mb-2">{basis}</h4>
                            <p className="text-sm text-gray-600">
                              {index === 0 && "If this is the legal basis, your Personal Information shall be transferred from the EU to third countries only if you have explicitly consented to such transfer."}
                              {index === 1 && "If this is the legal basis, the transfer of Personal Information from the EU to third countries is carried out by Veerive according to 'standard contractual clauses' provided by the European Commission."}
                              {index === 2 && "If no other legal basis applies, Personal Information shall be transferred from the EU to third countries only if specific conditions are met, such as contract performance or legal claims."}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Section 8 */}
                <section id="section8" className="bg-gray-50 rounded-xl p-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    8. Data Security
                  </h2>
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h3 className="font-semibold text-green-800 mb-2 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Security Measures
                      </h3>
                      <p className="text-green-700">We take appropriate security measures to prevent unauthorized access, disclosure, modification, or unauthorized destruction of Personal Information. We limit access to your Personal Information to only those employees, agents, contractors and other third parties who are required to know.</p>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h3 className="font-semibold text-yellow-800 mb-2 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        Important Notice
                      </h3>
                      <p className="text-yellow-800">No method of transmission over the Internet, or method of electronic storage, is 100% secure, however. Therefore, an absolute guarantee of security isn't possible. In case of any suspected Personal Information breach, we have processes in place and will notify you, and any applicable regulator, of a breach where we are legally required to do so.</p>
                    </div>
                  </div>
                </section>

                {/* Section 9 */}
                <section id="section9" className="bg-gray-50 rounded-xl p-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    9. Questions and Contact Information
                  </h2>
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-6 text-center">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Need Help with Your Privacy?</h3>
                    <p className="mb-4">
                      If you would like to access, correct, amend or delete any personal information we have about you, register a complaint, or simply want more information contact our Privacy Compliance Officer at:
                    </p>
                    <div className="flex justify-center">
                    <div className="rounded-lg p-2 md:p-4 inline-block shadow-sm">
                      <a 
                        href="mailto:contact@Veerive.com" 
                        className="text-gray-600 hover:text-black font-semibold text-lg flex items-center"
                      >
                        contact@Veerive.com
                      </a>
                    </div>
                    </div>
                  </div>
                </section>

                {/* Section 10 */}
                <section id="section10" className="bg-gray-50 rounded-xl p-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    10. Definitions
                  </h2>
                  <div className="space-y-4">
                    {[
                      {
                        term: 'User',
                        definition: 'means the individual using Veerive.'
                      },
                      {
                        term: 'Personal Information',
                        definition: 'means any information that directly, indirectly, or in connection with other information — including a personal identification number — allows for the identification or identifiability of a natural person.'
                      },
                      {
                        term: 'Usage Data',
                        definition: 'means information collected automatically through Veerive (or third-party services employed in Veerive), which can include: the IP addresses or domain names of the computers utilized by the Users who use Veerive, the time of the request, the method utilized to submit the request to the server, the country of origin, the features of the browser and the operating system utilized by the User, the various time details per visit and other parameters about the device operating system and/or the User\'s IT environment.'
                      },
                      {
                        term: 'Service',
                        definition: 'means a service provided by Veerive as described in the relative terms (if available) and on this site/application.'
                      },
                      {
                        term: 'Cookies',
                        definition: 'means a small piece of data stored in the User\'s device. GMB Research will use the information only in accordance with the Privacy Policy under which the information was collected unless it has received explicit authorization.'
                      }
                    ].map((item, index) => (
                      <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
                        <h3 className="font-semibold text-gray-900 mb-2">"{item.term}"</h3>
                        <p className="text-gray-600 text-sm">{item.definition}</p>
                      </div>
                    ))}
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