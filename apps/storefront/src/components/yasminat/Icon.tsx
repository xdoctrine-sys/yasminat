import icons from './icons.json';

export type IconName = keyof typeof icons;
/** Official local Lucide paths, shared with the approved design. */
export function YasIcon({name, className = ''}: {name: IconName; className?: string}) {
  return <svg className={`icon yas-icon ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" dangerouslySetInnerHTML={{__html: icons[name]}} />;
}
