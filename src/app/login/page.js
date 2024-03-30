import { login } from "../actions";

export default function Login() {
     return (
          <>
               <h1>Login</h1>
               <form action={login}>
                    <input
                         type="text"
                         name="username"
                         id="username"
                         placeholder="username"
                         required
                         className="input input-primary"
                    />
                    <input
                         type="password"
                         name="password"
                         id="password"
                         placeholder="password"
                         required
                         className="input input-primary"
                    />
                    <button type="submit" className="btn btn-primary">
                         Log In
                    </button>
               </form>
          </>
     );
}
