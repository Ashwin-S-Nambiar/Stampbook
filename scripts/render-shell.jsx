import { renderToStaticMarkup } from 'react-dom/server';
import StartupShell from '../src/components/StartupShell.jsx';
import { installPreview } from '../src/lib/preview.js';

export const renderShell = () => renderToStaticMarkup(<StartupShell />);
export const renderBootstrap = (version) =>
  `(${installPreview.toString()})(${JSON.stringify(version)})`;
