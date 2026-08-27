import Socials from "./Socials";

const page = async () => {
  return (
    <div className="w-full max-w-sm rounded-2xl border border-zinc-200/80 bg-white/90 p-8 shadow-xl shadow-indigo-500/5 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-900/90">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Welcome to FlowCommerce
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Sign in to access AI Shopping Agent & Merchant Portal
        </p>
      </div>
      <Socials />
    </div>
  );
};

export default page;

