import {a, div, DOMSource, h1, VNode} from "@cycle/dom";
import xs from "xstream";

export default function OtherComponent(sources: { DOM: DOMSource }) {

  const router = sources.DOM.select('a').events('click')
    .debug((ev: { preventDefault: Function }) => ev.preventDefault())
    .map((ev: any) => ev.target.pathname);

  const vnode$ = xs.of(div([h1("other"), a({props: {href: '/'}}, 'Link to Home')]));

  return {
    DOM: vnode$,
    router,
    HTTP: xs.empty(),
  }
}