import {div, h1, VNode} from "@cycle/dom";
import App, {Sinks, Sources} from "./App";
import onionify from "cycle-onionify";
import isolate from "@cycle/isolate";
import xs from "xstream";

function Main(sources: Sources) {
  const main1: Sinks = isolate(App)(sources);
  const main2: Sinks = isolate(App)(sources);
  return {
    DOM: xs.combine(main1.DOM, main2.DOM).map(([main1Dom, main2Dom]) => {
      return div([
        h1("Welcome"),
        main1Dom,
        main2Dom
      ])
    }),
    onion: xs.merge(main1.onion, main2.onion),
    router: xs.empty(),
    HTTP: xs.empty(),
  }
}

const statefulMain = onionify(Main);

export default statefulMain;
