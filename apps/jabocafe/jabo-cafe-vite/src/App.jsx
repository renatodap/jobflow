import React from 'react'
import { Button } from '@/components/ui/button.jsx'
import './App.css'

// Importando todas as imagens
import jaboLogo from './assets/jabo_logo.png'
import heroPeopleFazenda from './assets/hero_people_fazenda.jpeg'
import heroColheitaCafe from './assets/hero_colheita_cafe.jpeg'
import fazendaVistaAerea from './assets/fazenda_vista_aerea.jpeg'
import ilustracaoGraosCafe from './assets/ilustracao_graos_cafe.png'
import videoPreparacaoCafe from './assets/video_preparacao_cafe.png'
import etapa1FazendaXicara from './assets/etapa1_fazenda_xicara.jpeg'
import etapa2TradicaoInovacao from './assets/etapa2_tradicao_inovacao.jpeg'
import etapa3Sustentabilidade from './assets/etapa3_sustentabilidade.jpeg'
import etapa4ExperienciaUnica from './assets/etapa4_experiencia_unica.jpeg'
import blog1Sustentabilidade from './assets/blog1_sustentabilidade.jpeg'
import blog2GraosCafe from './assets/blog2_graos_cafe.webp'
import blog3Degustacao from './assets/blog3_degustacao.webp'

function App() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header/Navigation */}
      <header className="header">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="logo">
              <img src={jaboLogo} alt="Jabô Café" className="h-12" />
            </div>
            <nav className="navigation">
              <div className="nav-items">
                <a href="#home" className="nav-item nav-home">HOME</a>
                <a href="#missao" className="nav-item nav-missao">MISSÃO E VALORES</a>
                <a href="#historia" className="nav-item nav-historia">NOSSA HISTÓRIA</a>
                <a href="#cafe" className="nav-item nav-cafe">NOSSO CAFÉ</a>
                <a href="#sustentabilidade" className="nav-item nav-sustentabilidade">SUSTENTABILIDADE</a>
                <a href="#blog" className="nav-item nav-blog">BLOG</a>
                <a href="#contato" className="nav-item nav-contato">CONTATO</a>
              </div>
            </nav>
            <div className="language-selector">
              <span className="language-flag">🇧🇷</span>
              <span>Portuguese</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container mx-auto px-4">
          <div className="hero-content">
            <div className="hero-left">
              <p className="hero-subtitle">DA FAZENDA PARA SUA XÍCARA: CAFÉ ESPECIAL COM ALMA</p>
              <h1 className="hero-title">SUSTENTABILIDADE E TRADIÇÃO EM CADA GRÃO</h1>
              <p className="hero-description">
                Descubra o sabor único do Jabô Café, cultivado em harmonia com a natureza e com a paixão de gerações.
              </p>
              <Button className="hero-button">EXPLORE NOSSA TRADIÇÃO</Button>
            </div>
            <div className="hero-images">
              <div className="hero-main-image">
                <img src={heroPeopleFazenda} alt="Pessoas na fazenda" />
              </div>
              <div className="hero-side-content">
                <img src={heroColheitaCafe} alt="Colheita de café" className="hero-side-image" />
                <div className="hero-card">
                  <h3>COMO FAZEMOS DIFERENTE</h3>
                  <p>Produção sustentável e colheita manual garantem qualidade em cada grão.</p>
                  <Button className="hero-card-button">CONHEÇA NOSSO CAFÉ</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tradição Section */}
      <section className="tradicao-section">
        <div className="container mx-auto px-4">
          <div className="tradicao-content">
            <div className="tradicao-left">
              <div className="tradicao-images">
                <img src={fazendaVistaAerea} alt="Vista aérea da fazenda" className="fazenda-image" />
                <img src={ilustracaoGraosCafe} alt="Ilustração grãos de café" className="graos-illustration" />
              </div>
            </div>
            <div className="tradicao-right">
              <p className="tradicao-subtitle">UMA TRADIÇÃO QUE INSPIRA CONFIANÇA</p>
              <h2 className="tradicao-title">CULTIVANDO EXCELÊNCIA DESDE 1938</h2>
              <p className="tradicao-description">
                No coração de Guaxupé, a Fazenda Jaboticabeiras cultiva cafés especiais com paixão, tradição familiar e práticas sustentáveis.
              </p>
              
              <div className="tradicao-columns">
                <div className="tradicao-column">
                  <h3>NOSSA HISTÓRIA</h3>
                  <p>Mais de 80 anos dedicados ao cultivo de cafés premiados.</p>
                </div>
                <div className="tradicao-column">
                  <h3>PRODUÇÃO SUSTENTÁVEL</h3>
                  <p>Compromisso com o meio ambiente e inovações.</p>
                </div>
              </div>

              <ul className="tradicao-features">
                <li>🟡 ORIGEM FAMILIAR DESDE 1938</li>
                <li>🟡 CULTIVO REGENERATIVO E SOLO SAUDÁVEL</li>
                <li>🟡 RESPEITO ÀS TRADIÇÕES CAFEEIRAS</li>
              </ul>

              <Button className="tradicao-button">SAIBA MAIS SOBRE NÓS</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Experimente o Sabor Section */}
      <section className="sabor-section">
        <div className="container mx-auto px-4">
          <div className="sabor-content">
            <div className="sabor-left">
              <h2 className="sabor-title">EXPERIMENTE O SABOR DA TRADIÇÃO</h2>
              <p className="sabor-description">
                Descubra como cultivamos cafés únicos, respeitando a natureza e nossas raízes familiares.
              </p>
            </div>
            <div className="sabor-right">
              <div className="video-container">
                <img src={videoPreparacaoCafe} alt="Vídeo preparação de café" />
                <div className="play-button">▶</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Depoimentos Section */}
      <section className="depoimentos-section">
        <div className="container mx-auto px-4">
          <div className="depoimentos-header">
            <p className="depoimentos-subtitle">CAFÉ QUE ENCANTA PALADARES AO REDOR DO MUNDO</p>
            <h2 className="depoimentos-title">O QUE NOSSOS CLIENTES DIZEM</h2>
            <p className="depoimentos-description">
              Confira as histórias de quem já provou e aprovou o sabor único do Jabô Café.
            </p>
          </div>
          
          <div className="depoimentos-grid">
            <div className="depoimento-card">
              <p className="depoimento-text">
                Ter experimentado o Café Jabô foi uma sensação de nostalgia com emoções. Um café frutado, leve, muito saboroso e que traz consigo tanta história, selos e cuidado que é impossível tomar com pressa ou tomar sem sentir alguma coisa. Parabéns à família produtora e à fazenda Jaboticabeiras por terem criado esse patrimônio brasileiro.
              </p>
              <div className="depoimento-author">
                <div className="author-info">
                  <h4>DEPOIMENTO CAFÉ JABÔ - BARBARA GRINGS</h4>
                  <p>Cliente</p>
                </div>
              </div>
            </div>
            
            <div className="depoimento-card">
              <p className="depoimento-text">Perfeito! Obrigada!!!! Delicioso!</p>
              <div className="depoimento-author">
                <div className="author-info">
                  <h4>DEPOIMENTO CAFÉ JABÔ - ISABELLA SALTON</h4>
                  <p>Cliente</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Jornada de Excelência Section */}
      <section className="jornada-section">
        <div className="container mx-auto px-4">
          <div className="jornada-header">
            <p className="jornada-subtitle">NOSSA JORNADA DE EXCELÊNCIA</p>
            <h2 className="jornada-title">QUALIDADE, SUSTENTABILIDADE E IMPACTO EM CADA ETAPA</h2>
          </div>
          
          <div className="jornada-grid">
            <div className="jornada-card jornada-verde">
              <div className="jornada-number">01</div>
              <img src={etapa1FazendaXicara} alt="Da Fazenda à Xícara" />
              <h3>DA FAZENDA À XÍCARA</h3>
            </div>
            
            <div className="jornada-card jornada-azul">
              <div className="jornada-number">02</div>
              <img src={etapa2TradicaoInovacao} alt="Tradição e Inovação" />
              <h3>TRADIÇÃO E INOVAÇÃO</h3>
            </div>
            
            <div className="jornada-card jornada-laranja">
              <div className="jornada-number">03</div>
              <img src={etapa3Sustentabilidade} alt="Sustentabilidade na Essência" />
              <h3>SUSTENTABILIDADE NA ESSÊNCIA</h3>
            </div>
            
            <div className="jornada-card jornada-roxo">
              <div className="jornada-number">04</div>
              <img src={etapa4ExperienciaUnica} alt="Experiência Única" />
              <h3>EXPERIÊNCIA ÚNICA</h3>
            </div>
          </div>
          
          <div className="jornada-button-container">
            <Button className="jornada-button">EXPLORE NOSSA HISTÓRIA</Button>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="blog-section">
        <div className="container mx-auto px-4">
          <div className="blog-header">
            <p className="blog-subtitle">BLOG JABÔ CAFÉ</p>
            <h2 className="blog-title">DICAS, TENDÊNCIAS E TUDO SOBRE O UNIVERSO DO CAFÉ</h2>
          </div>
          
          <div className="blog-grid">
            <article className="blog-card">
              <img src={blog1Sustentabilidade} alt="Sustentabilidade no Café" />
              <div className="blog-content">
                <h3>SUSTENTABILIDADE NO CAFÉ: COMO A FAZENDA JABOTICABEIRAS INSPIRA UMA NOVA GERAÇÃO DE PRODUTORES</h3>
                <div className="blog-meta">
                  <span>novembro 19, 2024</span>
                  <span>Nenhum comentário</span>
                </div>
                <Button className="blog-button">Ler Mais »</Button>
              </div>
            </article>
            
            <article className="blog-card">
              <img src={blog2GraosCafe} alt="O Papel da Fazenda Jaboticabeiras" />
              <div className="blog-content">
                <h3>O PAPEL DA FAZENDA JABOTICABEIRAS NO CENÁRIO GLOBAL DE CAFÉS ESPECIAIS</h3>
                <div className="blog-meta">
                  <span>novembro 19, 2024</span>
                  <span>Nenhum comentário</span>
                </div>
                <Button className="blog-button">Ler Mais »</Button>
              </div>
            </article>
            
            <article className="blog-card">
              <img src={blog3Degustacao} alt="Como Degustar Café Especial" />
              <div className="blog-content">
                <h3>COMO DEGUSTAR CAFÉ ESPECIAL: UM GUIA PARA APRECIAR CADA NOTA DE SABOR</h3>
                <div className="blog-meta">
                  <span>novembro 19, 2024</span>
                  <span>Nenhum comentário</span>
                </div>
                <Button className="blog-button">Ler Mais »</Button>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Contato Section */}
      <section className="contato-section">
        <div className="container mx-auto px-4">
          <div className="contato-content">
            <h2 className="contato-title">ESTAMOS À SUA DISPOSIÇÃO! DEIXE SEU CONTATO!</h2>
            <div className="contato-form">
              <input type="email" placeholder="Email" className="contato-input" />
              <Button className="contato-button">ENVIAR MENSAGEM</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container mx-auto px-4">
          <div className="footer-content">
            <div className="footer-column">
              <h3>CONTATO</h3>
              <p>renatofap@jabo.cafe</p>
              <p>(11) 98415-3337</p>
              <p>Fazenda Jaboticabeiras, S/N - Japy, Guaxupé - MG, 37800-000</p>
            </div>
            
            <div className="footer-column">
              <h3>MENU</h3>
              <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="#sobre">Sobre</a></li>
                <li><a href="#loja">Loja</a></li>
                <li><a href="#blog">Blog</a></li>
                <li><a href="#contato">Contato</a></li>
              </ul>
            </div>
            
            <div className="footer-column">
              <h3>LINKS ÚTEIS</h3>
              <ul>
                <li><a href="#privacidade">Políticas de Privacidade</a></li>
                <li><a href="#termos">Termos de Uso</a></li>
                <li><a href="#cookies">Cookies</a></li>
                <li><a href="#loja">Loja</a></li>
              </ul>
            </div>
            
            <div className="footer-column">
              <h3>SOBRE</h3>
              <p>
                Desde 1938, a Fazenda Jaboticabeiras tem sido sinônimo de qualidade e sustentabilidade na produção de café especial. Nossa história é construída sobre a dedicação, inovação e respeito à natureza, com cada grão de café cultivado e colhido com o maior cuidado.
              </p>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>©2025 Copyright 2024 – Jabô – Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App

