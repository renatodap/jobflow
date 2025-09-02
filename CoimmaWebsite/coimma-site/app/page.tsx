"use client";
import React from "react";
import { motion } from "framer-motion";
import Header from "../components/Header";
import Footer from "../components/Footer";
import VideoPlayer from "../components/VideoPlayer";

export default function HomePage() {
  // Reusable component classes
  const sectionContainer = "max-w-screen-xl mx-auto px-6";
  const sectionPadding = "py-28";
  const sectionTitle = "text-4xl lg:text-5xl font-bold tracking-tight text-balance leading-tight text-[#5c0a0a]";
  const sectionSubtitle = "text-lg text-gray-600 leading-relaxed text-balance";
  const divider = "w-12 h-0.5 bg-[#5c0a0a] mx-auto";

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  return (
    <>
      <Header />
      <main className="bg-white text-[#333] antialiased">
        {/* 1. Hero Section with Video */}
        <section className="relative bg-[#5c0a0a] min-h-[70vh] flex items-center justify-center overflow-hidden">
          <div className="w-full max-w-screen-2xl mx-auto px-6">
            <div className="relative aspect-video w-full overflow-hidden rounded-3xl">
              <VideoPlayer
                src="/video.mp4"
                poster="/placeholder.jpg"
                title="Olhar no Futuro"
                description="A COIMMA é respeitada pela longa história de excelência e inovação."
                className="w-full h-full"
              />
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="text-center max-w-4xl mx-auto px-6">
                <h1 className="text-white text-5xl lg:text-6xl font-bold tracking-tight text-balance leading-tight mb-6">
                  Olhar no Futuro
                </h1>
                <p className="text-white/90 text-xl lg:text-2xl font-light leading-relaxed text-balance">
                  A COIMMA é respeitada pela longa história de excelência e inovação.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Destaques Section */}
        <motion.section 
          className={`bg-gray-50/50 ${sectionPadding}`}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <div className={sectionContainer}>
            <div className="text-center mb-16">
              <h2 className={`${sectionTitle} mb-4`}>Destaques</h2>
              <div className={`${divider} mb-6`}></div>
              <p className={sectionSubtitle}>Conheça nossos produtos mais inovadores</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Megatron */}
              <a href="/produtos/megatron" className="group block">
                <article className="relative overflow-hidden rounded-3xl shadow-md hover:shadow-lg transition-all duration-300 aspect-[4/3]">
                  <img 
                    src="/megatron.png" 
                    alt="Megatron" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm p-6">
                    <h3 className="text-xl font-bold text-[#5c0a0a] tracking-tight text-center">Megatron</h3>
                  </div>
                </article>
              </a>
              
              {/* Troncos Robust Plus */}
              <a href="/produtos/troncos-robust-plus" className="group block relative">
                <div className="absolute -top-3 -right-3 bg-[#ffcc00] text-[#5c0a0a] px-4 py-2 rounded-full text-sm font-bold tracking-tight z-10">
                  NOVO
                </div>
                <article className="relative overflow-hidden rounded-3xl shadow-md hover:shadow-lg transition-all duration-300 aspect-[4/3]">
                  <img 
                    src="/troncos-robust-plus.png" 
                    alt="Troncos Robust Plus" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm p-6">
                    <h3 className="text-xl font-bold text-[#5c0a0a] tracking-tight text-center">Troncos Robust Plus</h3>
                  </div>
                </article>
              </a>
              
              {/* Balanças Rodoviárias */}
              <a href="/produtos/balancas-rodoviarias" className="group block">
                <article className="relative overflow-hidden rounded-3xl shadow-md hover:shadow-lg transition-all duration-300 aspect-[4/3]">
                  <img 
                    src="/balancas-rodoviarias.png" 
                    alt="Balanças Rodoviárias" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm p-6">
                    <h3 className="text-xl font-bold text-[#5c0a0a] tracking-tight text-center">Balanças Rodoviárias</h3>
                  </div>
                </article>
              </a>
            </div>
          </div>
        </motion.section>

        {/* 3. Nossas Soluções Section */}
        <motion.section 
          className={`bg-white ${sectionPadding}`}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <div className={sectionContainer}>
            <div className="text-center mb-16">
              <h2 className={`${sectionTitle} mb-4`}>Nossas Soluções</h2>
              <div className={`${divider} mb-6`}></div>
              <p className={sectionSubtitle}>Soluções completas para o agronegócio brasileiro</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Pesagem Animal */}
              <article className="bg-gray-50/50 rounded-2xl p-8 text-center transition-all duration-300 hover:bg-gray-50">
                <div className="w-10 h-10 mx-auto mb-6 text-[#5c0a0a]">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-[#5c0a0a] mb-4 tracking-tight">Pesagem Animal</h3>
                <a href="/produtos/pesagem-animal" className="text-sm text-[#5c0a0a] underline hover:opacity-80 transition-opacity">
                  Ver Solução
                </a>
              </article>
              
              {/* Contenção Animal */}
              <article className="bg-gray-50/50 rounded-2xl p-8 text-center transition-all duration-300 hover:bg-gray-50">
                <div className="w-10 h-10 mx-auto mb-6 text-[#5c0a0a]">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-[#5c0a0a] mb-4 tracking-tight">Contenção Animal</h3>
                <a href="/produtos/contencao-animal" className="text-sm text-[#5c0a0a] underline hover:opacity-80 transition-opacity">
                  Ver Solução
                </a>
              </article>
              
              {/* Acessórios para Pecuária */}
              <article className="bg-gray-50/50 rounded-2xl p-8 text-center transition-all duration-300 hover:bg-gray-50">
                <div className="w-10 h-10 mx-auto mb-6 text-[#5c0a0a]">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-[#5c0a0a] mb-4 tracking-tight">Acessórios para Pecuária</h3>
                <a href="/produtos/acessorios-pecuaria" className="text-sm text-[#5c0a0a] underline hover:opacity-80 transition-opacity">
                  Ver Solução
                </a>
              </article>
              
              {/* Pesagem Rodoviária */}
              <article className="bg-gray-50/50 rounded-2xl p-8 text-center transition-all duration-300 hover:bg-gray-50">
                <div className="w-10 h-10 mx-auto mb-6 text-[#5c0a0a]">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-[#5c0a0a] mb-4 tracking-tight">Pesagem Rodoviária</h3>
                <a href="/produtos/pesagem-rodoviaria" className="text-sm text-[#5c0a0a] underline hover:opacity-80 transition-opacity">
                  Ver Solução
                </a>
              </article>
            </div>
          </div>
        </motion.section>

        {/* 4. Nossos Diferenciais Section */}
        <motion.section 
          className={`bg-gray-50 ${sectionPadding}`}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <div className={sectionContainer}>
            <div className="text-center mb-16">
              <h2 className={`${sectionTitle} mb-4`}>Nossos Diferenciais</h2>
              <div className={`${divider} mb-6`}></div>
              <p className={`${sectionSubtitle} max-w-2xl mx-auto`}>
                70 anos construindo excelência no agronegócio brasileiro
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <article className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-[#5c0a0a]/10 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-[#5c0a0a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-[#5c0a0a] tracking-tight">Atendimento</h3>
                <p className="text-gray-600 leading-relaxed text-balance">
                  A empresa prima pela qualidade dos seus produtos e por um atendimento diferenciado, do início ao fim do processo.
                </p>
              </article>

              <article className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-[#5c0a0a]/10 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-[#5c0a0a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-[#5c0a0a] tracking-tight">Líder de Mercado</h3>
                <p className="text-gray-600 leading-relaxed text-balance">
                  Com 70 anos de trajetória, somos referência em troncos e balanças bovinas no Brasil, desenvolvendo soluções que escutam e atendem a voz do campo.
                </p>
              </article>

              <article className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-[#5c0a0a]/10 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-[#5c0a0a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-[#5c0a0a] tracking-tight">Frota Própria</h3>
                <p className="text-gray-600 leading-relaxed text-balance">
                  Mais de 20 caminhões e equipe de montagem própria garantem entregas diretas e montagem técnica especializada.
                </p>
              </article>

              <article className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-[#5c0a0a]/10 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-[#5c0a0a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-[#5c0a0a] tracking-tight">De olho no futuro</h3>
                <p className="text-gray-600 leading-relaxed text-balance">
                  Parcerias com universidades e centros de pesquisa como a Embrapa nos colocam na vanguarda da inovação no setor pecuário.
                </p>
              </article>
            </div>
          </div>
        </motion.section>

        {/* 5. Depoimentos Section */}
        <motion.section 
          className={`bg-white ${sectionPadding}`}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <div className={sectionContainer}>
            <div className="text-center mb-16">
              <h2 className={`${sectionTitle} mb-4`}>Depoimentos</h2>
              <div className={`${divider} mb-6`}></div>
              <p className={`${sectionSubtitle} max-w-2xl mx-auto`}>
                O que nossos clientes dizem sobre nossos produtos e serviços
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <article className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
                <div className="mb-8">
                  <p className="text-gray-700 italic leading-relaxed text-lg text-balance">
                    "Após 40 anos de experiência na área veterinária, posso garantir que os produtos COIMMA sempre estiveram presentes com resultados de primeira qualidade."
                  </p>
                </div>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-[#5c0a0a] rounded-full flex items-center justify-center text-white font-medium mr-4">
                    WA
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Dr. Wander Baganha Azevedo</h4>
                    <p className="text-sm text-gray-500">Médico Veterinário</p>
                  </div>
                </div>
              </article>

              <article className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
                <div className="mb-8">
                  <p className="text-gray-700 italic leading-relaxed text-lg text-balance">
                    "Trabalho com a Coimma há mais de 25 anos. Aprovo e recomendo seus produtos a todos os pecuaristas que trabalham por um manejo mais racional."
                  </p>
                </div>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-[#5c0a0a] rounded-full flex items-center justify-center text-white font-medium mr-4">
                    GP
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Dr. Gilberto Andrade Pereira</h4>
                    <p className="text-sm text-gray-500">Médico veterinário, pecuarista e comerciante</p>
                  </div>
                </div>
              </article>

              <article className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
                <div className="mb-8">
                  <p className="text-gray-700 italic leading-relaxed text-lg text-balance">
                    "Tenho mais de dez produtos da Coimma instalados e funcionando em minhas fazendas. Comprovei a qualidade e durabilidade desses equipamentos."
                  </p>
                </div>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-[#5c0a0a] rounded-full flex items-center justify-center text-white font-medium mr-4">
                    AF
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Alexandre de Figueiredo Ferraz</h4>
                    <p className="text-sm text-gray-500">Empresário e pecuarista</p>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </motion.section>
      </main>
      <Footer />
    </>
  );
}
