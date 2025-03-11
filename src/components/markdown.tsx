import {visit} from "unist-util-visit";
import { Components } from 'react-markdown';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";

export function reactMarkdownRemarkDirective() {
    // @ts-expect-error unknown type
    return (tree) => {
      visit(
        tree,
        ["textDirective", "leafDirective", "containerDirective"],
        (node) => {
          node.data = {
            hName: node.name,
            hProperties: node.attributes,
            ...node.data
          };
          return node;
        }
      );
    };
  }

export const components: Components = {
  h1: ({children}) => <h1 className="text-2xl font-bold mb-4">{children}</h1>,
  h2: ({children}) => <h2 className="text-xl font-bold mb-3">{children}</h2>,
  h3: ({children}) => <h3 className="text-lg font-bold mb-2">{children}</h3>,
  h4: ({children}) => <h4 className="text-base font-bold mb-2">{children}</h4>,
  h5: ({children}) => <h5 className="text-sm font-bold mb-1">{children}</h5>,
  h6: ({children}) => <h6 className="text-sm font-bold mb-1">{children}</h6>,
  p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
  ul: ({children}) => <ul className="list-disc pl-4 mb-2 last:mb-0">{children}</ul>,
  ol: ({children}) => <ol className="list-decimal pl-4 mb-2 last:mb-0">{children}</ol>,
  li: ({children}) => <li className="mb-1 last:mb-0">{children}</li>,
  a: ({href, children}) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
    >
      {children}
    </a>
  ),
  // @ts-expect-error custom component
  Accordion: ({children, ...props}) => <div className="pb-4"><Accordion {...props} type="multiple">{children}</Accordion></div>,
  // @ts-expect-error custom component
  AccordionItem: ({children, value, ...props}) => <AccordionItem value={value} {...props}>{children}</AccordionItem>,
  // @ts-expect-error custom component
  AccordionTrigger: ({children, ...props}) => <AccordionTrigger {...props}>{children}</AccordionTrigger>,
  // @ts-expect-error custom component
  AccordionContent: ({children, ...props}) => <AccordionContent {...props}>{children}</AccordionContent>,
}

export const widgetComponents: Components = {
  h1: ({children}) => <h1 className="text-sm font-bold mb-2">{children}</h1>,
  h2: ({children}) => <h2 className="text-xs font-bold mb-2">{children}</h2>,
  h3: ({children}) => <h3 className="text-xs font-bold mb-1">{children}</h3>,
  p: ({children}) => <p className="mb-1 last:mb-0">{children}</p>,
  ul: ({children}) => <ul className="list-disc pl-3 mb-1 last:mb-0">{children}</ul>,
  ol: ({children}) => <ol className="list-decimal pl-3 mb-1 last:mb-0">{children}</ol>,
  li: ({children}) => <li className="mb-0.5 last:mb-0">{children}</li>,
  a: ({href, children}) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
    >
      {children}
    </a>
  ),
  // @ts-expect-error custom component
  Accordion: ({children, ...props}) => <div className="pb-2"><Accordion {...props} type="multiple" >{children}</Accordion></div>,
  // @ts-expect-error custom component
  AccordionItem: ({children, value, ...props}) => <AccordionItem value={value} {...props}>{children}</AccordionItem>,
  // @ts-expect-error custom component
  AccordionTrigger: ({children, ...props}) => <AccordionTrigger className="text-xs" {...props}>{children}</AccordionTrigger>,
  // @ts-expect-error custom component
  AccordionContent: ({children, ...props}) => <AccordionContent className="text-xs" {...props}>{children}</AccordionContent>,

}