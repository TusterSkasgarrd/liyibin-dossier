import { Admin } from './admin/Admin';
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
  // 后台：/admin
  if (window.location.pathname.startsWith('/admin')) return <Admin />;

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
