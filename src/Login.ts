import {a, button, div, DOMSource, h1, h4, input, VNode} from "@cycle/dom";
import xs, {Stream} from "xstream";
import {HTTPSource, RequestOptions} from "@cycle/http";
import onionify, {StateSource} from "cycle-onionify";

type UserData = {
  name: string,
  email: string,
  website: string,
};

export type State = {
  username?: string,
  password?: string,
  isLoggedIn: boolean
}

export type Reducer = (prev?: State) => State | undefined;

export interface LoginSources {
  DOM: DOMSource;
  HTTP: HTTPSource;
  onion: StateSource<State>;
}

export interface LoginSinks {
  DOM: Stream<VNode>;
  HTTP: Stream<RequestOptions>;
  router: Stream<string>;
  onion: Stream<Reducer>
}

function Login(sources: LoginSources): LoginSinks {
  const submitLogin$: Stream<RequestOptions> = xs.combine(sources.DOM.select('.login').events('click'), sources.onion.state$)
    .map(([e, state]) => {
      const randomNum = Math.round(Math.random() * 9) + 1;
      return {
        url: 'https://jsonplaceholder.typicode.com/users/' + String(randomNum),
        category: 'login',
        method: 'GET',
      };
    });

  const user$ = sources.HTTP.select('login')
    .flatten()
    .map(res => res.body as UserData)
    .startWith(null);

  const usernameChange$ = sources.DOM.select('.username').events('change')
    .map<Reducer>((e: any) => (prev: State) => ({...prev, username: e.target.value}));
  const passwordChange$ = sources.DOM.select('.password').events('change')
    .map<Reducer>((e: any) => (prev: State) => ({...prev, password: e.target.value}));
  const isLoggedIn$ = user$.map<Reducer>((user?: UserData) => (prev: State) => ({...prev, isLoggedIn: !!user }));
  const reducer$ = xs.merge(usernameChange$, passwordChange$, isLoggedIn$);

  const vdom$ = user$.map(user =>
    div('.users', [
      h1("Login now"),
      input('.username'),
      input('.password'),
      button('.login', 'Get random user'),
      user === null ? null : div('.user-details', [
        h1('.user-name', user.name),
        h4('.user-email', user.email),
        a('.user-website', {attrs: {href: user.website}}, user.website),
      ]),
    ]),
  );

  return {
    DOM: vdom$,
    router: sources.onion.state$.map((state?: State) => state.isLoggedIn && '/'),
    HTTP: submitLogin$,
    onion: reducer$
  };
}

const statefulLogin = onionify(Login);

export default statefulLogin;