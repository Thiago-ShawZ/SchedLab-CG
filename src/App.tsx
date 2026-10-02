import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Home from '@/pages/Home';
import Catalog from '@/pages/Catalog';
import ProductDetails from '@/pages/ProductDetails';
import About from '@/pages/About';
import HairTypes from '@/pages/HairTypes';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col bg-ink-950">
        <Navbar />
        <main className="flex-1" id="main-content">
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-brand-500 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
          >
            Pular para conteúdo
          </a>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/about" element={<About />} />
            <Route path="/hair-types" element={<HairTypes />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
