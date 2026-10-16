import LuxuryButton from '../components/common/LuxuryButton';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function NotFound() {
  useDocumentTitle('Page not found');
  return (
    <div className="container-x flex flex-col items-center py-28 text-center">
      <p className="t-script text-6xl text-primary">Oops</p>
      <h1 className="t-section mt-4 text-heading">This page has slipped away</h1>
      <p className="t-subtitle mt-2">Let us take you back to something beautiful.</p>
      <LuxuryButton to="/" className="mt-8">
        Back to Home
      </LuxuryButton>
    </div>
  );
}
