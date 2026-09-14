"use client";
export function DeleteProductButton({
  action,
}: {
  action: () => Promise<void>;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) {
          e.preventDefault();
        }
      }}
    >
      <button type="submit" className="text-sm text-red-600 underline">
        Sil
      </button>
    </form>
  );
}
