const turkishMap: Record<string, string> = {
  ç: "c",
  Ç: "c",
  ğ: "g",
  Ğ: "g",
  ı: "i",
  İ: "i",
  ö: "o",
  Ö: "o",
  ş: "s",
  Ş: "s",
  ü: "u",
  Ü: "u",
};

const diacritics = /[̀-ͯ]/g;

export function slugify(input: string): string {
  return input
    .replace(/[çÇğĞıİöÖşŞüÜ]/g, (ch) => turkishMap[ch] ?? ch)
    .toLowerCase()
    .normalize("NFD")
    .replace(diacritics, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
