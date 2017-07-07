import {div, DOMSource, h1, VNode} from "@cycle/dom";
import {Stream} from "xstream";

export default function Layout(Component: (sources: { DOM: DOMSource }) => { DOM?: Stream<VNode> }) {
  return (sources: { DOM: DOMSource }) => {
    const comp = Component(sources);
    return {
      ...comp,
      DOM: comp.DOM.map((vnode: VNode) =>
        div([
          h1("Header"),
          vnode,
          h1("Footer")
        ])
      )
    };
  };
}