import Link from 'next/link'
import {
  Phone,
  MessageSquare,
  Calendar,
  Clock,
  TrendingUp,
  Shield,
  CheckCircle2,
  ArrowRight,
  Play,
  Star,
  Zap,
  Users,
  BarChart3,
  Bot,
  ChevronDown
} from 'lucide-react'

export default function LandingPage() {
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
                Características
              </a>
              <a href="#pricing" className="text-sky-700 hover:text-sky-900 font-medium transition-colors">
                Precios
              </a>
              <a href="#faq" className="text-sky-700 hover:text-sky-900 font-medium transition-colors">
                FAQ
              </a>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="hidden sm:block text-sky-700 hover:text-sky-900 font-medium transition-colors"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/signup"
                className="glass-button text-sm px-4 py-2"
              >
                Prueba Gratis
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 md:px-8 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 glass-badge-sky px-4 py-2 rounded-full">
              <Zap className="w-4 h-4" />
              <span>Potenciado por Inteligencia Artificial</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-sky-900 leading-tight">
              Tu Recepcionista AI
              <br />
              <span className="bg-gradient-to-r from-sky-500 to-sky-700 bg-clip-text text-transparent">
                Que Nunca Descansa
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-sky-700 max-w-3xl mx-auto leading-relaxed">
              Atiende llamadas, responde mensajes y agenda citas <strong>24/7</strong>.
              Sin contratar personal. Sin perder clientes.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/signup"
                className="glass-button text-lg px-8 py-4 flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                Empezar Prueba Gratis
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#demo"
                className="glass-button-secondary text-lg px-8 py-4 flex items-center gap-2 w-full sm:w-auto justify-center rounded-xl"
              >
                <Play className="w-5 h-5" />
                Ver Demo
              </a>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-8 text-sky-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span>14 días gratis</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span>Sin tarjeta de crédito</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span>Cancela cuando quieras</span>
              </div>
            </div>
          </div>

          {/* Hero Image/Demo */}
          <div id="demo" className="mt-16 relative">
            <div className="glass-card p-2 md:p-4 max-w-5xl mx-auto">
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-sky-100 to-sky-200 aspect-video flex items-center justify-center">
                {/* Placeholder for demo video - replace with actual video embed */}
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 rounded-full bg-white/80 flex items-center justify-center mx-auto cursor-pointer hover:scale-110 transition-transform shadow-lg">
                    <Play className="w-8 h-8 text-sky-600 ml-1" />
                  </div>
                  <p className="text-sky-700 font-medium">Ver cómo funciona RecepcionistAI</p>
                </div>
                {/* Uncomment and replace VIDEO_ID when you have a video:
                <iframe
                  className="w-full h-full absolute inset-0"
                  src="https://www.youtube.com/embed/VIDEO_ID"
                  title="RecepcionistAI Demo"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
                */}
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
                  <p className="text-xs text-sky-600">Llamadas atendidas</p>
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
              ¿Te suena familiar?
            </h2>
            <p className="text-xl text-sky-700">
              Estos problemas le cuestan dinero a tu negocio todos los días
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Phone,
                title: "Llamadas perdidas",
                description: "Clientes que llaman fuera de horario o cuando estás ocupado. Cada llamada perdida es dinero que se va.",
                stat: "67%",
                statLabel: "de clientes no vuelven a llamar"
              },
              {
                icon: Clock,
                title: "Tiempo desperdiciado",
                description: "Horas contestando las mismas preguntas: horarios, precios, ubicación. Tiempo que podrías usar para vender.",
                stat: "4hrs",
                statLabel: "diarias en tareas repetitivas"
              },
              {
                icon: Users,
                title: "Personal costoso",
                description: "Una recepcionista cuesta $800-1,500/mes, solo trabaja 8 horas, se enferma y toma vacaciones.",
                stat: "$1,200",
                statLabel: "costo mensual promedio"
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
              <span>La Solución</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-sky-900 mb-4">
              RecepcionistAI trabaja por ti 24/7
            </h2>
            <p className="text-xl text-sky-700 max-w-2xl mx-auto">
              Por menos de <strong>$7 al día</strong>, tienes una recepcionista que nunca descansa,
              nunca se enferma y siempre está de buen humor.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              {[
                {
                  icon: Phone,
                  title: "Atiende llamadas con voz natural",
                  description: "IA conversacional que suena humana. Responde preguntas, toma mensajes y transfiere llamadas importantes."
                },
                {
                  icon: MessageSquare,
                  title: "Responde WhatsApp y SMS",
                  description: "Contesta automáticamente en segundos. Califica leads y responde las preguntas frecuentes."
                },
                {
                  icon: Calendar,
                  title: "Agenda citas automáticamente",
                  description: "Sincroniza con tu calendario y permite a los clientes reservar sin tu intervención."
                },
                {
                  icon: BarChart3,
                  title: "Dashboard con métricas",
                  description: "Ve todas las interacciones, leads capturados y oportunidades en un solo lugar."
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
              Funciona en 3 simples pasos
            </h2>
            <p className="text-xl text-sky-700">
              Configúralo en minutos, no en semanas
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Crea tu cuenta",
                description: "Regístrate gratis y configura tu perfil de negocio en menos de 5 minutos.",
                icon: Users
              },
              {
                step: "2",
                title: "Conecta tu número",
                description: "Vincula tu número de teléfono actual o te damos uno nuevo. Sin cambiar tu línea.",
                icon: Phone
              },
              {
                step: "3",
                title: "Activa y relájate",
                description: "RecepcionistAI empieza a trabajar. Tú te enfocas en lo que importa: tu negocio.",
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
              Lo que dicen nuestros clientes
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Dr. Carlos Méndez",
                role: "Clínica Dental Sonrisa",
                quote: "Antes perdía 5-6 llamadas diarias. Ahora RecepcionistAI las atiende todas y hasta agenda las citas. Recuperé mi inversión en la primera semana.",
                rating: 5
              },
              {
                name: "María González",
                role: "Inmobiliaria MG",
                quote: "Mis agentes ya no pierden tiempo contestando preguntas básicas. La IA califica los leads y solo nos pasa los interesados reales.",
                rating: 5
              },
              {
                name: "Roberto Sánchez",
                role: "Taller Automotriz RS",
                quote: "Pensé que era muy tecnológico para mí, pero la configuración fue súper fácil. Ahora atiendo clientes hasta los domingos sin trabajar.",
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
              Planes simples, sin sorpresas
            </h2>
            <p className="text-xl text-sky-700">
              Elige el plan que mejor se adapte a tu negocio
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Básico",
                price: 199,
                description: "Perfecto para pequeños negocios",
                features: [
                  "500 mensajes/mes",
                  "1 número de teléfono",
                  "Respuestas automáticas",
                  "Dashboard básico",
                  "Soporte por email"
                ],
                cta: "Empezar Gratis",
                popular: false
              },
              {
                name: "Pro",
                price: 299,
                description: "Para negocios en crecimiento",
                features: [
                  "2,000 mensajes/mes",
                  "100 minutos de voz",
                  "3 números de teléfono",
                  "Agenda de citas",
                  "Analíticas avanzadas",
                  "Integraciones",
                  "Soporte prioritario"
                ],
                cta: "Empezar Gratis",
                popular: true
              },
              {
                name: "Enterprise",
                price: 499,
                description: "Para equipos y franquicias",
                features: [
                  "Mensajes ilimitados",
                  "500 minutos de voz",
                  "Números ilimitados",
                  "API completa",
                  "Múltiples usuarios",
                  "Reportes personalizados",
                  "Gerente de cuenta dedicado"
                ],
                cta: "Contactar Ventas",
                popular: false
              }
            ].map((plan, index) => (
              <div
                key={index}
                className={`glass-card p-8 relative ${plan.popular ? 'border-2 border-sky-400 scale-105' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="glass-badge-sky px-4 py-1">Más Popular</span>
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
                  className={`block text-center py-3 px-6 rounded-xl font-semibold transition-all ${
                    plan.popular
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
            Todos los planes incluyen 14 días de prueba gratis. Sin tarjeta de crédito.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-4 md:px-8 bg-gradient-to-b from-transparent via-sky-50/50 to-transparent">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-sky-900 mb-4">
              Preguntas Frecuentes
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                question: "¿Necesito cambiar mi número de teléfono?",
                answer: "No. Puedes mantener tu número actual y redirigir las llamadas a RecepcionistAI, o podemos darte un número nuevo dedicado."
              },
              {
                question: "¿La IA suena como un robot?",
                answer: "No. Usamos la tecnología de voz más avanzada disponible. Nuestros clientes reportan que sus usuarios no notan la diferencia con una persona real."
              },
              {
                question: "¿Qué pasa si la IA no puede responder algo?",
                answer: "Puedes configurar reglas para transferir llamadas a un humano en casos específicos, o la IA puede tomar un mensaje y notificarte inmediatamente."
              },
              {
                question: "¿Cuánto tarda la configuración?",
                answer: "La mayoría de nuestros clientes están operativos en menos de 30 minutos. Nuestro equipo de soporte te guía en cada paso."
              },
              {
                question: "¿Puedo cancelar en cualquier momento?",
                answer: "Sí. No hay contratos ni compromisos. Puedes cancelar tu suscripción cuando quieras desde tu panel de control."
              },
              {
                question: "¿Funciona en mi país?",
                answer: "RecepcionistAI funciona en toda Latinoamérica, Estados Unidos y España. Soportamos números locales en múltiples países."
              }
            ].map((faq, index) => (
              <details key={index} className="glass-card group">
                <summary className="p-6 cursor-pointer list-none flex items-center justify-between">
                  <span className="font-semibold text-sky-900 pr-4">{faq.question}</span>
                  <ChevronDown className="w-5 h-5 text-sky-600 group-open:rotate-180 transition-transform flex-shrink-0" />
                </summary>
                <div className="px-6 pb-6 text-sky-700">
                  {faq.answer}
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
                ¿Listo para no perder más clientes?
              </h2>
              <p className="text-xl text-sky-700 mb-8 max-w-2xl mx-auto">
                Únete a cientos de negocios que ya usan RecepcionistAI para atender a sus clientes 24/7
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/signup"
                  className="glass-button text-lg px-8 py-4 flex items-center gap-2"
                >
                  Empezar Prueba Gratis de 14 Días
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
              <p className="text-sky-600 mt-6">
                Sin tarjeta de crédito • Configura en 5 minutos • Cancela cuando quieras
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
                Tu recepcionista AI que trabaja 24/7 para que tú no tengas que hacerlo.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-sky-900 mb-4">Producto</h4>
              <ul className="space-y-2 text-sky-600">
                <li><a href="#features" className="hover:text-sky-800">Características</a></li>
                <li><a href="#pricing" className="hover:text-sky-800">Precios</a></li>
                <li><a href="#faq" className="hover:text-sky-800">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sky-900 mb-4">Empresa</h4>
              <ul className="space-y-2 text-sky-600">
                <li><a href="#" className="hover:text-sky-800">Sobre Nosotros</a></li>
                <li><a href="#" className="hover:text-sky-800">Blog</a></li>
                <li><a href="#" className="hover:text-sky-800">Contacto</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sky-900 mb-4">Legal</h4>
              <ul className="space-y-2 text-sky-600">
                <li><a href="#" className="hover:text-sky-800">Términos de Servicio</a></li>
                <li><a href="#" className="hover:text-sky-800">Política de Privacidad</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-sky-200 text-center text-sky-600">
            <p>© {new Date().getFullYear()} RecepcionistAI. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
