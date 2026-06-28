import { CheckCircle2 } from "lucide-react";
import { Outlet } from "react-router-dom";

const AuthLayout = () => (
  <div className="grid min-h-screen bg-mist lg:grid-cols-[1fr_1.1fr]">
    <section className="hidden bg-ink px-12 py-14 text-white lg:flex lg:flex-col lg:justify-between">
      <div>
        <div className="grid h-12 w-12 place-items-center rounded-md bg-coral">
          <CheckCircle2 size={26} />
        </div>
        <h1 className="mt-8 max-w-lg text-5xl font-bold leading-tight">Plan task and track there progress assign to your team members. </h1>
      </div>
      <div className="grid gap-4 text-sm text-slate-200">
        <p>Simple yet useful dashboard for your team.</p>
        <p className="text-slate-400">The first registered account is promoted to admin automatically.</p>
      </div>
    </section>
    <main className="flex items-center justify-center px-4 py-10">
      <Outlet />
    </main>
  </div>
);

export default AuthLayout;
