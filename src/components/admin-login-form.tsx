"use client";
import { useActionState } from "react";
import { loginAction, type FormState } from "@/app/admin/actions";
const initialState: FormState = {};
export function AdminLoginForm() {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialState,
  );
  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        Şifre
        <input
          type="password"
          name="password"
          required
          autoFocus
          className="rounded border border-[var(--line)] px-3 py-2"
        />
      </label>
      {state.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-[var(--ink)] px-4 py-2 text-sm text-white disabled:opacity-60"
      >
        {pending ? "Giriş yapılıyor…" : "Giriş Yap"}
      </button>
    </form>
  );
}
