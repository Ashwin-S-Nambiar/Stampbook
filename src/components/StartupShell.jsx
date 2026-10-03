import { DotsThree, Stamp as StampIcon } from '@phosphor-icons/react';
import { Book, Page } from './Book.jsx';
import Footer from './Footer.jsx';
import HeaderFrame from './HeaderFrame.jsx';
import NotFound from './NotFound.jsx';

export default function StartupShell() {
  return (
    <>
      <div
        data-startup-home=""
        className="grid h-full grid-cols-[minmax(0,1fr)] grid-rows-[auto_minmax(0,1fr)_auto] ps-[env(safe-area-inset-left)] pe-[env(safe-area-inset-right)]"
      >
        <HeaderFrame>
          <div className="relative">
            <button
              type="button"
              aria-label="More"
              aria-haspopup="menu"
              aria-expanded={false}
              className="btn press size-10 px-0 text-foil"
            >
              <DotsThree weight="bold" className="size-5!" />
            </button>
          </div>
          <a
            href="/?new"
            data-startup-add=""
            className="btn btn-foil ring-hover h-10 ps-3 pe-4"
          >
            <StampIcon weight="bold" />
            <span>
              Stamp<span className="hidden min-[25rem]:inline"> a trip</span>
            </span>
          </a>
        </HeaderFrame>
        <Book>
          <div className="hidden min-h-0 min-w-0 flex-1 spread:flex">
            <Page side="left" />
          </div>
          <Page className="startup-page" />
        </Book>
        <Footer />
      </div>
      <div data-startup-missing="" className="h-full">
        <NotFound />
      </div>
    </>
  );
}
