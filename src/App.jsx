import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import { StoreProvider } from './context/StoreContext';

const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const ProductPage = lazy(() => import('./pages/ProductPage'));
const InfoPage = lazy(() => import('./pages/InfoPage'));
const GoldRatePage = lazy(() => import('./pages/GoldRatePage'));
const ReviewsPage = lazy(() => import('./pages/ReviewsPage'));
const NotFound = lazy(() => import('./pages/NotFound'));
const AdminApp = lazy(() => import('./admin/AdminApp'));
const ScreenPage = lazy(() => import('./pages/ScreenPage'));

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          {/* The showroom TV: the commercial alone, without the website around it. */}
          <Route
            path="screen"
            element={
              <Suspense fallback={<div className="min-h-screen bg-stage" />}>
                <ScreenPage />
              </Suspense>
            }
          />
          <Route
            path="admin"
            element={
              <Suspense fallback={null}>
                <AdminApp />
              </Suspense>
            }
          />
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="category/:slug" element={<CategoryPage />} />
            <Route path="search" element={<CategoryPage mode="search" />} />
            <Route path="product/:id" element={<ProductPage />} />
            <Route path="gold-rate" element={<GoldRatePage />} />
            <Route path="reviews" element={<ReviewsPage />} />
            <Route path="info/:slug" element={<InfoPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  );
}
