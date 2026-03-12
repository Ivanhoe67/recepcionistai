import { Phone, MessageSquare, Calendar, Clock, CheckCircle2, Play, Zap, BarChart3, Bot, ChevronDown, Users, TrendingUp, Shield, ArrowRight } from 'lucide-react'
import { FloatingContactButtons } from '@/components/landing/FloatingContactButtons'
import { HeroCTAButtons, FinalCTAButtons } from '@/components/landing/HeroCTAButtons'
import { Link } from '@/lib/navigation'
import { useTranslations } from 'next-intl'
import { LanguageSwitcher } from '@/shared/components/LanguageSwitcher'

const WHATSAPP_NUMBER = "15179302149"

export default function LandingPage() {
  const t = useTranslations('Landing')
  const authT = useTranslations('Auth')
  const tPricing = useTranslations('Pricing')
  const tFooter = useTranslations('Footer')

  const demoMsg = encodeURIComponent("¡Hola! Quiero agendar una demo de RecepcionistaAI.")

  return (
    <div className="liquid-bg min-h-screen">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="glass-card mx-4 mt-4 md:mx-8 rounded-2xl">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="RecepcionistaAI" className="w-10 h-10" />
              <span className="text-xl font-bold bg-gradient-to-r from-sky-600 to-sky-800 bg-clip-text text-transparent">
                RecepcionistaAI
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#como-funciona" className="text-sky-700 hover:text-sky-900 font-medium transition-colors">
                {t('nav.comoFunciona')}
              </a>
              <a href="#beneficios" className="text-sky-700 hover:text-sky-900 font-medium transition-colors">
                {t('nav.beneficios')}
              </a>
              <a href="#planes" className="text-sky-700 hover:text-sky-900 font-medium transition-colors">
                {t('nav.planes')}
              </a>
              <a href="#faq" className="text-sky-700 hover:text-sky-900 font-medium transition-colors">
                {t('nav.faq')}
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
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${demoMsg}`}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-button text-sm px-4 py-2"
              >
                {t('nav.demo')}
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Floating Contact Buttons */}
      <FloatingContactButtons />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 md:px-8 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-6">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 glass-badge-sky px-4 py-2 rounded-full">
              <Zap className="w-4 h-4" />
              <span>{t('hero.eyebrow')}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-sky-900 leading-tight max-w-4xl mx-auto">
              {t('hero.title')}
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-sky-700 max-w-3xl mx-auto leading-relaxed">
              {t('hero.subtitle')}
            </p>

            {/* Support line */}
            <p className="text-base text-sky-500 max-w-2xl mx-auto">
              {t('hero.supportLine')}
            </p>

            {/* CTA Buttons */}
            <HeroCTAButtons />

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-sky-600">
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

          {/* Demo Video */}
          <div id="demo" className="mt-16 relative">
            <div className="glass-card p-2 md:p-4 max-w-5xl mx-auto">
              <div className="relative rounded-2xl overflow-hidden aspect-video">
                <iframe
                  className="w-full h-full absolute inset-0"
                  src="https://www.loom.com/embed/ae56793a37ec465eaeb1d5d748586d67"
                  title="RecepcionistaAI Demo"
                  frameBorder="0"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problema */}
      <section id="problema" className="py-20 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-sky-900 mb-4">
              {t('problems.title')}
            </h2>
            <p className="text-xl text-sky-700">
              {t('problems.intro')}
            </p>
          </div>

          <div className="glass-card p-8 md:p-12">
            <ul className="space-y-4">
              {[
                t('problems.pain1'),
                t('problems.pain2'),
                t('problems.pain3'),
                t('problems.pain4'),
                t('problems.pain5'),
                t('problems.pain6'),
              ].map((pain, index) => (
                <li key={index} className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                  </div>
                  <span className="text-lg text-sky-800">{pain}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 pt-8 border-t border-sky-100">
              <p className="text-xl font-semibold text-sky-900 text-center">
                {t('problems.close')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solución */}
      <section id="solucion" className="py-20 px-4 md:px-8 relative">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 glass-badge-success px-4 py-2 rounded-full mb-4">
              <CheckCircle2 className="w-4 h-4" />
              <span>{t('solution.badge')}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-sky-900 mb-4">
              {t('solution.title')}
            </h2>
            <p className="text-xl text-sky-700 max-w-2xl mx-auto">
              {t('solution.intro')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="glass-card p-8">
              <ul className="space-y-4">
                {[
                  { icon: MessageSquare, text: t('solution.item1') },
                  { icon: Phone, text: t('solution.item2') },
                  { icon: Users, text: t('solution.item3') },
                  { icon: Calendar, text: t('solution.item4') },
                  { icon: ArrowRight, text: t('solution.item5') },
                  { icon: BarChart3, text: t('solution.item6') },
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg font-medium text-sky-800">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <div className="glass-card p-6">
                <div className="aspect-square rounded-xl bg-gradient-to-br from-sky-100 to-sky-200 flex items-center justify-center">
                  <Bot className="w-32 h-32 text-sky-500" />
                </div>
              </div>
              <p className="text-sky-700 text-center leading-relaxed">
                {t('solution.close')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section id="beneficios" className="py-20 px-4 md:px-8 bg-gradient-to-b from-transparent via-sky-50/50 to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-sky-900 mb-4">
              {t('benefits.title')}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Zap, key: 'b1' },
              { icon: Phone, key: 'b2' },
              { icon: Calendar, key: 'b3' },
              { icon: Users, key: 'b4' },
              { icon: BarChart3, key: 'b5' },
              { icon: Shield, key: 'b6' },
            ].map(({ icon: Icon, key }) => (
              <div key={key} className="glass-card p-8 hover:border-sky-300 transition-colors group">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-sky-900 mb-3">
                  {t(`benefits.${key}.title` as any)}
                </h3>
                <p className="text-sky-600">
                  {t(`benefits.${key}.desc` as any)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" className="py-20 px-4 md:px-8">
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
              { step: '1', titleKey: 'steps.s1.title', descKey: 'steps.s1.desc', icon: MessageSquare },
              { step: '2', titleKey: 'steps.s2.title', descKey: 'steps.s2.desc', icon: CheckCircle2 },
              { step: '3', titleKey: 'steps.s3.title', descKey: 'steps.s3.desc', icon: Zap },
            ].map((item, index) => (
              <div key={index} className="text-center relative">
                {index < 2 && (
                  <div className="hidden md:block absolute top-16 left-[60%] w-[80%] border-t-2 border-dashed border-sky-300" />
                )}
                <div className="glass-card p-8 relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white">
                    {item.step}
                  </div>
                  <div className="w-14 h-14 rounded-xl bg-sky-100 flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-7 h-7 text-sky-600" />
                  </div>
                  <h3 className="text-xl font-bold text-sky-900 mb-3">{t(item.titleKey as any)}</h3>
                  <p className="text-sky-600">{t(item.descKey as any)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Para quién es */}
      <section id="para-quien" className="py-20 px-4 md:px-8 bg-gradient-to-b from-transparent via-sky-50/50 to-transparent">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-sky-900 mb-4">
              {t('forWho.title')}
            </h2>
            <p className="text-xl text-sky-700">
              {t('forWho.intro')}
            </p>
          </div>

          <div className="glass-card p-8 md:p-12">
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {[
                t('forWho.item1'),
                t('forWho.item2'),
                t('forWho.item3'),
                t('forWho.item4'),
                t('forWho.item5'),
                t('forWho.item6'),
                t('forWho.item7'),
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-sky-800 font-medium">{item}</span>
                </div>
              ))}
            </div>
            <div className="pt-6 border-t border-sky-100 text-center">
              <p className="text-sky-700 text-lg">{t('forWho.close')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Capturas / Producto */}
      <section id="producto" className="py-20 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-sky-900 mb-4">
              {t('product.title')}
            </h2>
            <p className="text-xl text-sky-700 max-w-2xl mx-auto">
              {t('product.intro')}
            </p>
          </div>

          <div className="glass-card p-4 md:p-8 mb-8">
            <div className="flex flex-wrap gap-3 justify-center mb-8">
              {[
                t('product.tag1'),
                t('product.tag2'),
                t('product.tag3'),
                t('product.tag4'),
                t('product.tag5'),
              ].map((tag, index) => (
                <span key={index} className="glass-badge-sky px-4 py-2 rounded-full text-sm font-medium">
                  {tag}
                </span>
              ))}
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-sky-100 to-sky-200 aspect-video flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-24 h-24 text-sky-400 mx-auto mb-4" />
                <p className="text-sky-500 font-medium">Dashboard RecepcionistaAI</p>
              </div>
            </div>
          </div>

          <p className="text-center text-lg text-sky-700 max-w-2xl mx-auto">
            {t('product.close')}
          </p>
        </div>
      </section>

      {/* Planes */}
      <section id="planes" className="py-20 px-4 md:px-8 bg-gradient-to-b from-transparent via-sky-50/50 to-transparent">
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
                ideal: tPricing('starter.ideal'),
                features: [
                  tPricing('features.dashboard'),
                  tPricing('features.analytics'),
                  tPricing('features.leads'),
                  tPricing('features.messages'),
                  tPricing('features.appointments'),
                ],
                cta: tPricing('cta'),
                popular: false
              },
              {
                name: tPricing('pro.name'),
                price: 299,
                description: tPricing('pro.desc'),
                ideal: tPricing('pro.ideal'),
                features: [
                  tPricing('features.dashboard'),
                  tPricing('features.analytics'),
                  tPricing('features.leads'),
                  tPricing('features.voice'),
                  tPricing('features.appointments'),
                ],
                cta: tPricing('cta'),
                popular: true
              },
              {
                name: tPricing('enterprise.name'),
                price: 499,
                description: tPricing('enterprise.desc'),
                ideal: tPricing('enterprise.ideal'),
                features: [
                  tPricing('features.dashboard'),
                  tPricing('features.analytics'),
                  tPricing('features.leads'),
                  tPricing('features.voice'),
                  tPricing('features.messages'),
                  tPricing('features.appointments'),
                ],
                cta: tPricing('enterprise.cta'),
                popular: false
              }
            ].map((plan, index) => (
              <div
                key={index}
                className={`glass-card p-8 relative flex flex-col ${plan.popular ? 'border-2 border-sky-400 scale-105' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="glass-badge-sky px-4 py-1">{tPricing('popular')}</span>
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-sky-900 mb-2">{plan.name}</h3>
                  <p className="text-sky-600 mb-4 text-sm">{plan.description}</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-sky-900">${plan.price}</span>
                    <span className="text-sky-600">/mes</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-6 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      <span className="text-sky-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-4 border-t border-sky-100 mb-6">
                  <p className="text-xs text-sky-500 text-center leading-relaxed">{plan.ideal}</p>
                </div>
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

          <div className="mt-12 text-center space-y-4">
            <p className="text-sky-700 font-medium text-lg">
              {tPricing('trial')}
            </p>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${demoMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 glass-button px-8 py-4 text-lg"
            >
              <Calendar className="w-5 h-5" />
              {tPricing('trialCta')}
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-4 md:px-8">
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

      {/* Prueba gratis */}
      <section id="prueba" className="py-20 px-4 md:px-8 bg-gradient-to-b from-transparent via-sky-50/50 to-transparent">
        <div className="max-w-3xl mx-auto text-center">
          <div className="glass-card p-12">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-sky-900 mb-4">
              {t('freeTrial.title')}
            </h2>
            <p className="text-xl text-sky-700 mb-4">
              {t('freeTrial.desc')}
            </p>
            <p className="text-sky-500 mb-8">
              {t('freeTrial.support')}
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 glass-button text-lg px-10 py-4"
            >
              <CheckCircle2 className="w-5 h-5" />
              {t('freeTrial.cta')}
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-400/20 to-sky-600/20" />
            <div className="relative">
              <h2 className="text-3xl md:text-5xl font-bold text-sky-900 mb-6">
                {t('finalCta.title')}
              </h2>
              <p className="text-xl text-sky-700 mb-8 max-w-2xl mx-auto">
                {t('finalCta.subtitle')}
              </p>
              <FinalCTAButtons />
              <p className="text-sky-500 mt-6 text-sm">
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
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <img src="/logo.svg" alt="RecepcionistaAI" className="w-10 h-10" />
                <span className="text-xl font-bold bg-gradient-to-r from-sky-600 to-sky-800 bg-clip-text text-transparent">
                  RecepcionistaAI
                </span>
              </div>
              <p className="text-sky-600 mb-3">
                {tFooter('description')}
              </p>
              <p className="text-sky-500 text-sm font-medium">{tFooter('support')}</p>
            </div>
            <div>
              <h4 className="font-bold text-sky-900 mb-4">{t('footer.product')}</h4>
              <ul className="space-y-2 text-sky-600">
                <li><a href="#como-funciona" className="hover:text-sky-800">{t('nav.comoFunciona')}</a></li>
                <li><a href="#planes" className="hover:text-sky-800">{t('nav.planes')}</a></li>
                <li><a href="#faq" className="hover:text-sky-800">{t('nav.faq')}</a></li>
                <li>
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}?text=${demoMsg}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-sky-800"
                  >
                    WhatsApp
                  </a>
                </li>
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
            <p>© {new Date().getFullYear()} RecepcionistaAI. {tFooter('rights')}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
