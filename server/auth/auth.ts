"use server";

import { signIn, signOut } from "../../auth";

export const Goo_login = async () => {
  await signIn("google");
};



export const Sign_Out = async () => {
  await signOut({ redirectTo: "/" });
};

