import { Phone, MessageSquare, Calendar, Clock, TrendingUp, CheckCircle2, Play, Star, Zap, Users, BarChart3, Bot, ChevronDown } from 'lucide-react'
import { FloatingContactButtons } from '@/components/landing/FloatingContactButtons'
import { HeroCTAButtons, FinalCTAButtons } from '@/components/landing/HeroCTAButtons'
import { Link } from '@/lib/navigation'
import { useTranslations } from 'next-intl'
import { LanguageSwitcher } from '@/shared/components/LanguageSwitcher'

export default function LandingPage() {
  const t = useTranslations('Landing')
  const authT = useTranslations('Auth')
  const tPricing = useTranslations('Pricing')
  const tFooter = useTranslations('Footer')

  return (
    <div className="liquid-bg min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="glass-card mx-4 mt-4 md:mx-8 rounded-2xl">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="RecepcionistAI" className="w-10 h-10" />
              <span className="text-xl font-bold bg-gradient-to-r from-sky-600 to-sky-800 bg-clip-text text-transparent">
                RecepcionistAI
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sky-700 hover:text-sky-900 font-medium transition-colors">
                {t('features.title')}
              </a>
              <a href="#pricing" className="text-sky-700 hover:text-sky-900 font-medium transition-colors">
                {tPricing('title')}
              </a>
              <a href="#faq" className="text-sky-700 hover:text-sky-900 font-medium transition-colors">
                FAQ
              </a>
            </div>
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <Link
                href="/login"
                className="hidden sm:block text-sky-700 hover:text-sky-900 font-medium transition-colors"
              >
                {authT('login')}
              </Link>
              <Link
                href="/signup"
                className="glass-button text-sm px-4 py-2"
              >
                {authT('signup')}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Floating Contact Buttons */}
      <FloatingContactButtons />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 md:px-8 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 glass-badge-sky px-4 py-2 rounded-full">
              <Zap className="w-4 h-4" />
              <span>{t('hero.badge')}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-sky-900 leading-tight">
              {t('hero.title')}
              <br />
              <span className="bg-gradient-to-r from-sky-500 to-sky-700 bg-clip-text text-transparent">
                {t('hero.subtitle')}
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-sky-700 max-w-3xl mx-auto leading-relaxed">
              {t('hero.subheadline')}
            </p>

            {/* CTA Buttons */}
            <HeroCTAButtons />

            {/* Secondary CTA */}
            <a
              href="#demo"
              className="inline-flex items-center gap-2 text-sky-600 hover:text-sky-800 font-medium transition-colors"
            >
              <Play className="w-4 h-4" />
              {t('hero.demoVideo')}
            </a>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-8 text-sky-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span>{t('hero.trust.trial')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span>{t('hero.trust.setup')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span>{t('hero.trust.cancel')}</span>
              </div>
            </div>
          </div>

          {/* Hero Image/Demo */}
          <div id="demo" className="mt-16 relative">
            <div className="glass-card p-2 md:p-4 max-w-5xl mx-auto">
              <div className="relative rounded-2xl overflow-hidden aspect-video">
                <iframe
                  className="w-full h-full absolute inset-0"
                  src="https://www.loom.com/embed/ae56793a37ec465eaeb1d5d748586d67"
                  title="RecepcionistAI Demo"
                  frameBorder="0"
                  allowFullScreen
                />
              </div>
            </div>

            {/* Floating Stats */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-4">
              <div className="glass-card px-6 py-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-sky-900">98%</p>
                  <p className="text-xs text-sky-600">{t('hero.stats.callsAttended')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-sky-900 mb-4">
              {t('problems.title')}
            </h2>
            <p className="text-xl text-sky-700">
              {t('problems.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Phone,
                title: t('problems.p1.title'),
                description: t('problems.p1.desc'),
                stat: t('problems.p1.stat'),
                statLabel: t('problems.p1.statLabel')
              },
              {
                icon: Clock,
                title: t('problems.p2.title'),
                description: t('problems.p2.desc'),
                stat: t('problems.p2.stat'),
                statLabel: t('problems.p2.statLabel')
              },
              {
                icon: Users,
                title: t('problems.p3.title'),
                description: t('problems.p3.desc'),
                stat: t('problems.p3.stat'),
                statLabel: t('problems.p3.statLabel')
              }
            ].map((problem, index) => (
              <div
                key={index}
                className="glass-card p-8 text-center hover:border-red-200 transition-colors group"
              >
                <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-6 group-hover:bg-red-200 transition-colors">
                  <problem.icon className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-sky-900 mb-3">{problem.title}</h3>
                <p className="text-sky-600 mb-6">{problem.description}</p>
                <div className="pt-4 border-t border-sky-100">
                  <p className="text-3xl font-bold text-red-500">{problem.stat}</p>
                  <p className="text-sm text-sky-600">{problem.statLabel}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 px-4 md:px-8 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 glass-badge-success px-4 py-2 rounded-full mb-4">
              <CheckCircle2 className="w-4 h-4" />
              <span>{t('solution.badge')}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-sky-900 mb-4">
              {t('solution.title')}
            </h2>
            <p className="text-xl text-sky-700 max-w-2xl mx-auto">
              {t('solution.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              {[
                {
                  icon: Phone,
                  title: t('solution.f1.title'),
                  description: t('solution.f1.desc')
                },
                {
                  icon: MessageSquare,
                  title: t('solution.f2.title'),
                  description: t('solution.f2.desc')
                },
                {
                  icon: Calendar,
                  title: t('solution.f3.title'),
                  description: t('solution.f3.desc')
                },
                {
                  icon: BarChart3,
                  title: t('solution.f4.title'),
                  description: t('solution.f4.desc')
                }
              ].map((feature, index) => (
                <div key={index} className="flex gap-4 items-start">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-sky-900 mb-1">{feature.title}</h3>
                    <p className="text-sky-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="glass-card p-6">
              <div className="aspect-square rounded-xl bg-gradient-to-br from-sky-100 to-sky-200 flex items-center justify-center">
                <Bot className="w-32 h-32 text-sky-500" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="features" className="py-20 px-4 md:px-8 bg-gradient-to-b from-transparent via-sky-50/50 to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-sky-900 mb-4">
              {t('steps.title')}
            </h2>
            <p className="text-xl text-sky-700">
              {t('steps.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: t('steps.s1.title'),
                description: t('steps.s1.desc'),
                icon: MessageSquare
              },
              {
                step: "2",
                title: t('steps.s2.title'),
                description: t('steps.s2.desc'),
                icon: CheckCircle2
              },
              {
                step: "3",
                title: t('steps.s3.title'),
                description: t('steps.s3.desc'),
                icon: Zap
              }
            ].map((step, index) => (
              <div key={index} className="text-center relative">
                {index < 2 && (
                  <div className="hidden md:block absolute top-16 left-[60%] w-[80%] border-t-2 border-dashed border-sky-300" />
                )}
                <div className="glass-card p-8 relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white">
                    {step.step}
                  </div>
                  <div className="w-14 h-14 rounded-xl bg-sky-100 flex items-center justify-center mx-auto mb-4">
                    <step.icon className="w-7 h-7 text-sky-600" />
                  </div>
                  <h3 className="text-xl font-bold text-sky-900 mb-3">{step.title}</h3>
                  <p className="text-sky-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-sky-900 mb-4">
              {t('testimonials.title')}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: t('testimonials.c1.name'),
                role: t('testimonials.c1.role'),
                quote: t('testimonials.c1.quote'),
                rating: 5
              },
              {
                name: t('testimonials.c2.name'),
                role: t('testimonials.c2.role'),
                quote: t('testimonials.c2.quote'),
                rating: 5
              },
              {
                name: t('testimonials.c3.name'),
                role: t('testimonials.c3.role'),
                quote: t('testimonials.c3.quote'),
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="glass-card p-8">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sky-700 mb-6 italic">&quot;{testimonial.quote}&quot;</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white font-bold">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-bold text-sky-900">{testimonial.name}</p>
                    <p className="text-sm text-sky-600">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-sky-900 mb-4">
              {tPricing('title')}
            </h2>
            <p className="text-xl text-sky-700">
              {tPricing('subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: tPricing('starter.name'),
                price: 199,
                description: tPricing('starter.desc'),
                features: [
                  tPricing('features.messages', { count: 500 }),
                  tPricing('features.phone', { count: 1 }),
                  tPricing('features.autoReply'),
                  tPricing('features.dashboard'),
                  tPricing('features.support')
                ],
                cta: tPricing('cta'),
                popular: false
              },
              {
                name: tPricing('pro.name'),
                price: 299,
                description: tPricing('pro.desc'),
                features: [
                  tPricing('features.messages', { count: 2000 }),
                  tPricing('features.minutes', { count: 100 }),
                  tPricing('features.phone', { count: 3 }),
                  tPricing('features.appointments'),
                  tPricing('features.analytics'),
                  tPricing('features.integrations'),
                  tPricing('features.priority')
                ],
                cta: tPricing('cta'),
                popular: true
              },
              {
                name: tPricing('enterprise.name'),
                price: 499,
                description: tPricing('enterprise.desc'),
                features: [
                  tPricing('features.unlimited'),
                  tPricing('features.minutes', { count: 500 }),
                  tPricing('features.phoneUnlimited'),
                  tPricing('features.api'),
                  tPricing('features.users'),
                  tPricing('features.reports'),
                  tPricing('features.manager')
                ],
                cta: tPricing('enterprise.cta'),
                popular: false
              }
            ].map((plan, index) => (
              <div
                key={index}
                className={`glass-card p-8 relative ${plan.popular ? 'border-2 border-sky-400 scale-105' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="glass-badge-sky px-4 py-1">{tPricing('popular')}</span>
                  </div>
                )}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-sky-900 mb-2">{plan.name}</h3>
                  <p className="text-sky-600 mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-sky-900">${plan.price}</span>
                    <span className="text-sky-600">/mes</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      <span className="text-sky-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`block text-center py-3 px-6 rounded-xl font-semibold transition-all ${plan.popular
                    ? 'glass-button w-full'
                    : 'glass-button-secondary w-full'
                    }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center text-sky-600 mt-8">
            {tPricing('trial')}
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-4 md:px-8 bg-gradient-to-b from-transparent via-sky-50/50 to-transparent">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-sky-900 mb-4">
              {t('faq.title')}
            </h2>
          </div>

          <div className="space-y-4">
            {[
              { q: t('faq.q1.q'), a: t('faq.q1.a') },
              { q: t('faq.q2.q'), a: t('faq.q2.a') },
              { q: t('faq.q3.q'), a: t('faq.q3.a') },
              { q: t('faq.q4.q'), a: t('faq.q4.a') },
              { q: t('faq.q5.q'), a: t('faq.q5.a') },
              { q: t('faq.q6.q'), a: t('faq.q6.a') },
              { q: t('faq.q7.q'), a: t('faq.q7.a') }
            ].map((faq, index) => (
              <details key={index} className="glass-card group">
                <summary className="p-6 cursor-pointer list-none flex items-center justify-between">
                  <span className="font-semibold text-sky-900 pr-4">{faq.q}</span>
                  <ChevronDown className="w-5 h-5 text-sky-600 group-open:rotate-180 transition-transform flex-shrink-0" />
                </summary>
                <div className="px-6 pb-6 text-sky-700">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-400/20 to-sky-600/20" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-sky-900 mb-4">
                {t('finalCta.title')}
              </h2>
              <p className="text-xl text-sky-700 mb-8 max-w-2xl mx-auto">
                {t('finalCta.subtitle')}
              </p>
              <FinalCTAButtons />
              <p className="text-sky-600 mt-6">
                {t('finalCta.footer')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 md:px-8 border-t border-sky-200">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src="/logo.svg" alt="RecepcionistAI" className="w-10 h-10" />
                <span className="text-xl font-bold bg-gradient-to-r from-sky-600 to-sky-800 bg-clip-text text-transparent">
                  RecepcionistAI
                </span>
              </div>
              <p className="text-sky-600">
                {tFooter('description')}
              </p>
            </div>
            <div>
              <h4 className="font-bold text-sky-900 mb-4">{t('footer.product')}</h4>
              <ul className="space-y-2 text-sky-600">
                <li><a href="#features" className="hover:text-sky-800">{t('features.title')}</a></li>
                <li><a href="#pricing" className="hover:text-sky-800">{tPricing('title')}</a></li>
                <li><a href="#faq" className="hover:text-sky-800">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sky-900 mb-4">{t('footer.company')}</h4>
              <ul className="space-y-2 text-sky-600">
                <li><a href="#" className="hover:text-sky-800">{t('footer.about')}</a></li>
                <li><a href="#" className="hover:text-sky-800">{t('footer.blog')}</a></li>
                <li><a href="#" className="hover:text-sky-800">{t('footer.contact')}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sky-900 mb-4">{t('footer.legal')}</h4>
              <ul className="space-y-2 text-sky-600">
                <li><a href="#" className="hover:text-sky-800">{t('footer.terms')}</a></li>
                <li><a href="#" className="hover:text-sky-800">{t('footer.privacy')}</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-sky-200 text-center text-sky-600">
            <p>© {new Date().getFullYear()} RecepcionistAI. {tFooter('rights')}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
