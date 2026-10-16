import { useEffect } from 'react';

const BASE = 'Pradeep Jewellers | Timeless Jewellery for Every Occasion';

export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | Pradeep Jewellers` : BASE;
    return () => {
      document.title = BASE;
    };
  }, [title]);
}
