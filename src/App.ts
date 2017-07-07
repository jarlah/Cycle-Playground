import {button, div, DOMSource, h1, p, VNode} from "@cycle/dom";
import xs, {Stream} from "xstream";
import {StateSource} from "cycle-onionify";

export type State = {
  msg: string | undefined
}

export type Reducer = (prev?: State) => State | undefined;

export interface Sources {
  DOM: DOMSource;
  onion: StateSource<State>;
}

export interface Sinks {
  DOM: Stream<VNode>;
  onion: Stream<Reducer>;
}

export type Actions = {
  click$: Stream<any>,
  clear$: Stream<any>
}

function view(state: State): VNode {
  return div([
    h1("Click the button"),
    button(".clickMe", "Click me"),
    button(".clear", "Clear me"),
    p("State: " + state.msg)
  ]);
}

function intent(domSource: DOMSource): Actions {
  return {
    click$: domSource.select('.clickMe').events('click'),
    clear$: domSource.select('.clear').events('click')
  };
}

function model(actions: Actions): Stream<Reducer> {
  const initial$ = xs.of((): State => ({msg: ""}));
  const click$ = actions.click$.mapTo((prev: State): State => ({...prev, msg: prev.msg + "Hello World"}));
  const clear$ = actions.clear$.mapTo((prev: State): State => ({...prev, msg: ""}));
  return xs.merge(initial$, click$, clear$);
}

export default function App(sources: Sources): Sinks {
  return {
    DOM: sources.onion.state$.map(view),
    onion: model(intent(sources.DOM))
  };
}
