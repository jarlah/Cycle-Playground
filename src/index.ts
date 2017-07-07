import {run} from "@cycle/run";
import {makeDOMDriver, VNode} from "@cycle/dom";
import {Stream} from "xstream";
import {makeRouterDriver, RouterSource} from "cyclic-router";
import {createHashHistory} from "history";
import switchPath from "switch-path";
import Layout from "./Layout";
import Other from "./Other";
import Main from "./Main";
import Login from "./Login";
import {makeHTTPDriver, RequestOptions} from "@cycle/http";

function Router(sources: { router: RouterSource }) {
  const match$ = sources.router.define({
    '/': Layout(Main),
    '/other': Layout(Other),
    '/login': Layout(Login)
  });

  const page$ = match$.map(({path, value}: { path: string, value: Function }) => {
    return value(Object.assign({}, sources, {
      router: sources.router.path(path)
    }));
  });

  return {
    DOM: page$.map((c: { DOM: Stream<VNode> }) => c.DOM).flatten(),
    router: page$.map((c: { router: Stream<string> }) => c.router).flatten(),
    HTTP: page$.map((c: { HTTP: Stream<RequestOptions> }) => c.HTTP).flatten(),
  };
}

const drivers = {
  DOM: makeDOMDriver('#app'),
  router: makeRouterDriver(createHashHistory(), switchPath),
  HTTP: makeHTTPDriver(),
};

run(Router as any, drivers);
