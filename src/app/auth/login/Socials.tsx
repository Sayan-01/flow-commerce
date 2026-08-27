import { Google } from "../../../../public/google";
import { Goo_login } from "../../../../server/auth/auth";


const Socials = () => {
  return (
    <div className="flex flex-col space-y-4">
      <form action={Goo_login}>
        <button
          className="bg-[#111111] relative group/btn flex space-x-2 items-center justify-center px-4 w-full text-white rounded-lg border border-zinc-800 h-[42px] font-medium shadow-[0px_0px_1px_1px_var(--neutral-800)]"
          type="submit"
        >
          <Google />
          <span className="text-neutral-700 dark:text-neutral-300 text-sm">Log in with Google</span>
          <BottomGradient />
        </button>
      </form>
    </div>
  );
};

const BottomGradient = () => {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
    </>
  );
};

export default Socials;
