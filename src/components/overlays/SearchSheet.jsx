import { X } from 'lucide-react';
import Drawer from './Drawer';
import SearchBox from '../layout/SearchBox';
import { useStore } from '../../context/StoreContext';

export default function SearchSheet() {
  const { panel, closePanel } = useStore();
  return (
    <Drawer open={panel === 'search'} onClose={closePanel} side="full" labelledBy="search-title">
      <div className="mx-auto max-w-xl px-4 pt-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="search-title" className="font-serif text-xl text-heading">
            Search
          </h2>
          <button type="button" onClick={closePanel} aria-label="Close search" className="rounded-full p-2 hover:bg-blush">
            <X className="size-5" strokeWidth={1.5} />
          </button>
        </div>
        <SearchBox variant="sheet" autoFocus onDone={closePanel} />
      </div>
    </Drawer>
  );
}
