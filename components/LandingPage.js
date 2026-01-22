'use client';

import { useRouter } from 'next/navigation';
import { 
  GraduationCap, 
  BookOpen, 
  Users, 
  Award, 
  CheckCircle, 
  ArrowRight,
  Star,
  Clock,
  Target,
  Menu,
  X,
  Briefcase,
  Code,
  FileCheck,
  Rocket
} from 'lucide-react';
import { useState } from 'react';

export default function LandingPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: Users,
      title: 'Private Remote Tutor',
      description: 'Get dedicated one-on-one attention from expert tutors who focus solely on your progress',
      color: 'blue'
    },
    {
      icon: Briefcase,
      title: 'Current Labour Market Tailored Curriculum',
      description: 'Learn skills that employers are actively seeking in today\'s job market',
      color: 'orange'
    },
    {
      icon: Code,
      title: 'Practical Like Classes',
      description: 'Hands-on learning with real coding exercises and live project work',
      color: 'green'
    },
    {
      icon: FileCheck,
      title: 'Tutor-marked Assignments',
      description: 'Receive personalized feedback on every assignment from your dedicated tutor',
      color: 'purple'
    },
    {
      icon: Rocket,
      title: 'Build Real-life Practical Milestone Project',
      description: 'Work alongside your tutor to create portfolio-worthy projects',
      color: 'pink'
    },
    {
      icon: Award,
      title: 'Get a Certificate of Completion',
      description: 'Earn recognized certificates to showcase your newly acquired skills',
      color: 'indigo'
    }
  ];

  const stats = [
    { value: '2000+', label: 'Students' },
    { value: '12+', label: 'Expert Tutors' },
    { value: '20+', label: 'Courses' },
    { value: '95%', label: 'Success Rate' }
  ];

  const benefits = [
    'One-on-one personalized sessions',
    'Structured curriculum designed by experts',
    'Progress tracking and feedback',
    'Flexible scheduling',
    'Affordable pricing',
    'Certificate of completion'
  ];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="border-b-2 border-gray-100 bg-white sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="bg-gradient-to-r from-blue-500 to-yellow-500 p-2 rounded-lg flex items-center gap-1">
                <GraduationCap className="text-white" size={24} />
                <span className="text-white font-bold hidden sm:inline">PVC</span>
              </div>
              <span className="font-bold text-base sm:text-xl text-gray-800 truncate">Early Code Institute</span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              <a href="#features" className="text-gray-600 hover:text-gray-800 font-medium">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-800 font-medium">How It Works</a>
              <a href="#courses" className="text-gray-600 hover:text-gray-800 font-medium">Courses</a>
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <button 
                onClick={() => router.push('/auth/login')}
                className="text-gray-700 hover:text-gray-900 font-semibold px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Sign In
              </button>
              <button 
                onClick={() => router.push('/auth/signup')}
                className="bg-gradient-to-r from-blue-500 to-yellow-500 hover:from-blue-600 hover:to-yellow-600 text-white font-semibold px-6 py-2 rounded-lg transition-all shadow-lg whitespace-nowrap"
              >
                Get Started
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-100">
              <div className="flex flex-col space-y-3">
                <a 
                  href="#features" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-600 hover:text-gray-800 font-medium px-4 py-2 rounded-lg hover:bg-gray-50"
                >
                  Features
                </a>
                <a 
                  href="#how-it-works"
                  onClick={() => setMobileMenuOpen(false)} 
                  className="text-gray-600 hover:text-gray-800 font-medium px-4 py-2 rounded-lg hover:bg-gray-50"
                >
                  How It Works
                </a>
                <a 
                  href="#courses"
                  onClick={() => setMobileMenuOpen(false)} 
                  className="text-gray-600 hover:text-gray-800 font-medium px-4 py-2 rounded-lg hover:bg-gray-50"
                >
                  Courses
                </a>
                <button 
                  onClick={() => router.push('/auth/login')}
                  className="text-gray-700 hover:text-gray-900 font-semibold px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-left"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => router.push('/auth/signup')}
                  className="bg-gradient-to-r from-blue-500 to-yellow-500 hover:from-blue-600 hover:to-yellow-600 text-white font-semibold px-4 py-2 rounded-lg transition-all shadow-lg"
                >
                  Get Started
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-orange-50 py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 leading-tight mb-4 sm:mb-6">
                Learn Tech in <span className="bg-gradient-to-r from-blue-600 to-yellow-500 bg-clip-text text-transparent">Private Virtual Classes</span> with
                <span> Expert Tutors</span>
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8">
                Gain access to high-demand tech skills with a private and dedicated instructor to coach you from start to finish.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button 
                  onClick={() => router.push('/auth/signup')}
                  className="bg-gradient-to-r from-blue-500 to-yellow-500 hover:from-blue-600 hover:to-yellow-600 text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  Start Learning Now
                  <ArrowRight size={20} />
                </button>
                <button className="border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-xl transition-all">
                  Browse Courses
                </button>
              </div>
            </div>

            <div className="relative mt-8 md:mt-0">
              <div className="bg-gradient-to-r from-blue-500 to-orange-500 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80" 
                  alt="Students learning" 
                  className="rounded-xl sm:rounded-2xl w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 bg-white border-y-2 border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-sm sm:text-base text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">Why Choose PVC?</h2>
            <p className="text-lg sm:text-xl text-gray-600">Everything you need for a successful learning journey</p>
          </div>

          {/* Grid: 3 columns on tablet/desktop, 1 column on mobile */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const colorClasses = {
                blue: 'from-blue-500 to-blue-600',
                orange: 'from-orange-500 to-orange-600',
                green: 'from-green-500 to-green-600',
                purple: 'from-purple-500 to-purple-600',
                pink: 'from-pink-500 to-pink-600',
                indigo: 'from-indigo-500 to-indigo-600'
              };

              return (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border-2 border-gray-100">
                  <div className={`bg-gradient-to-r ${colorClasses[feature.color]} p-3 sm:p-4 rounded-xl inline-block mb-4`}>
                    <Icon className="text-white" size={28} />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
                  <p className="text-sm sm:text-base text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">How It Works</h2>
            <p className="text-lg sm:text-xl text-gray-600">Start learning in 3 simple steps</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { step: 1, title: 'Sign Up', description: 'Create your account and complete your profile' },
              { step: 2, title: 'Choose Course', description: 'Browse and enroll in courses that match your goals' },
              { step: 3, title: 'Start Learning', description: 'Get paired with an expert tutor and begin your journey' }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="bg-gradient-to-r from-blue-500 to-orange-500 text-white text-xl sm:text-2xl font-bold w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  {item.step}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-sm sm:text-base text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-blue-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-6">What You'll Get</h2>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="bg-green-500 p-1 rounded-full flex-shrink-0">
                      <CheckCircle className="text-white" size={20} />
                    </div>
                    <span className="text-base sm:text-lg text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-gray-100 mt-8 md:mt-0">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex -space-x-2">
                  {[1,2,3,4].map((i) => (
                    <div key={i} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-blue-500 to-orange-500 border-2 border-white"></div>
                  ))}
                </div>
                <div>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map((i) => (
                      <Star key={i} className="text-yellow-400 fill-current" size={16} />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">Loved by 500+ students</p>
                </div>
              </div>
              <blockquote className="text-sm sm:text-base text-gray-700 italic mb-4">
                "PVC transformed my learning experience. The personalized attention from my tutor helped me achieve my goals faster than I ever imagined!"
              </blockquote>
              <div className="font-semibold text-gray-800">Sarah Johnson</div>
              <div className="text-xs sm:text-sm text-gray-500">Web Development Student</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-blue-500 to-orange-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">Ready to Start Your Learning Journey?</h2>
          <p className="text-base sm:text-lg lg:text-xl text-blue-50 mb-6 sm:mb-8">Join thousands of students achieving their goals with PVC</p>
          <button 
            onClick={() => router.push('/auth/signup')}
            className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-xl transition-all shadow-xl hover:shadow-2xl inline-flex items-center gap-2 text-base sm:text-lg"
          >
            Get Started Free
            <ArrowRight size={24} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-gradient-to-r from-blue-500 to-orange-500 p-2 rounded-lg">
                  <GraduationCap className="text-white" size={24} />
                </div>
                <span className="font-bold text-xl text-white">PVC</span>
              </div>
              <p className="text-gray-400 text-sm">Empowering learners worldwide through personalized education.</p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQs</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2024 PVC - Private Virtual Class. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}