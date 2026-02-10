import Link from 'next/link'
import {
  Phone,
  MessageSquare,
  Calendar,
  Clock,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Play,
  Star,
  Zap,
  Users,
  BarChart3,
  Bot,
  ChevronDown,
  Headphones
} from 'lucide-react'

// Número de WhatsApp del agente AI (USA)
const WHATSAPP_NUMBER = "15179302149"
const WHATSAPP_MESSAGE = "Hola! Me interesa RecepcionistAI, quiero agendar una demo."

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
                Crear Cuenta
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Floating WhatsApp Button */}
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#25D366] hover:bg-[#128C7E] text-white px-5 py-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 group"
      >
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        <span className="hidden sm:block font-semibold">Habla con nuestro AI</span>
        <span className="absolute -top-2 -right-2 flex h-5 w-5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-5 w-5 bg-white items-center justify-center">
            <Headphones className="w-3 h-3 text-[#25D366]" />
          </span>
        </span>
      </a>

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
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-button text-lg px-8 py-4 flex items-center gap-2 w-full sm:w-auto justify-center bg-[#25D366] hover:bg-[#128C7E]"
              >
                <MessageSquare className="w-5 h-5" />
                Agendar Demo Gratis
              </a>
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
                <span>7 días de prueba gratis</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span>Configuración incluida</span>
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
              Empieza en 3 simples pasos
            </h2>
            <p className="text-xl text-sky-700">
              Nosotros nos encargamos de todo
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Agenda tu demo",
                description: "Habla con nuestro agente AI por WhatsApp y agenda una llamada de demostración gratuita.",
                icon: MessageSquare
              },
              {
                step: "2",
                title: "Elige tu plan",
                description: "Selecciona el plan que mejor se adapte a tu negocio. Incluye 7 días de prueba gratis.",
                icon: CheckCircle2
              },
              {
                step: "3",
                title: "Listo para atender",
                description: "Configuramos tu agente personalizado y empiezas a recibir clientes 24/7.",
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
                quote: "El equipo de RecepcionistAI configuró todo por mí. Ahora atiendo clientes hasta los domingos sin trabajar.",
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
                cta: "Empezar con 7 días gratis",
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
                cta: "Empezar con 7 días gratis",
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
            Todos los planes incluyen 7 días de prueba gratis y configuración personalizada.
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
                question: "¿Cómo funciona la prueba de 7 días?",
                answer: "Al elegir tu plan, tienes 7 días completos para probar el servicio. Si no estás satisfecho, cancelas antes de que termine el periodo y no se te cobra nada."
              },
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
                question: "¿Quién configura el agente de IA?",
                answer: "Nosotros nos encargamos de toda la configuración. Solo necesitamos la información de tu negocio (horarios, servicios, precios) y configuramos tu agente personalizado."
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
                Habla con nuestro agente AI y descubre cómo podemos ayudar a tu negocio
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-button text-lg px-8 py-4 flex items-center gap-2 bg-[#25D366] hover:bg-[#128C7E]"
                >
                  <MessageSquare className="w-5 h-5" />
                  Agendar Demo por WhatsApp
                </a>
              </div>
              <p className="text-sky-600 mt-6">
                7 días gratis • Configuración incluida • Cancela cuando quieras
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
