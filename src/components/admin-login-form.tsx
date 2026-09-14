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
    <form action={formAction} className="admin-login-form">
      <label>
        Şifre
        <input type="password" name="password" required autoFocus />
      </label>
      {state.error && (
        <p className="admin-login-error" role="alert">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="button admin-login-submit"
      >
        {pending ? "Giriş yapılıyor…" : "Giriş Yap"}
      </button>
    </form>
  );
}
