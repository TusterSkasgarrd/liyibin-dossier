import { useState } from 'react';
import { Admin } from './admin/Admin';
import { IntroOverlay } from './components/IntroOverlay';
import { DataProvider } from './data/store';
import { BlueprintFrame } from './components/BlueprintFrame';
import { Nav } from './components/Nav';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Skills } from './components/Skills';
import { Toolbox } from './components/Toolbox';
import { SloganBand } from './components/SloganBand';
import { Projects } from './components/Projects';
import { Notes } from './components/Notes';
import { Practice } from './components/Practice';
import { Honors } from './components/Honors';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';

export function App() {
  const [introDone, setIntroDone] = useState(() => {
    if (typeof window === 'undefined') return true;
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (calm) return true;
    // 同一会话内不重复播
    return sessionStorage.getItem('intro-done') === '1';
  });

  // 后台：/admin（兼容 GitHub Pages 子路径 /liyibin-dossier/admin）
  if (window.location.pathname.replace(/\/+$/, '').endsWith('/admin')) return <Admin />;

  if (!introDone) {
    return (
      <IntroOverlay
        onDone={() => {
          sessionStorage.setItem('intro-done', '1');
          setIntroDone(true);
        }}
      />
    );
  }

  return (
    <DataProvider>
      <BlueprintFrame />
      <Nav />
      <main>
        <Hero />
        <About />
        <Skills />
        <Toolbox />
        <SloganBand />
        <Projects />
        <Notes />
        <Practice />
        <Honors />
        <Contact />
      </main>
      <Footer />
    </DataProvider>
  );
}
