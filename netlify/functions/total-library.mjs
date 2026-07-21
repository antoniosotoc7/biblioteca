import { getStore } from "@netlify/blobs";

const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=30" } });
const normalize = (value = "") => String(value).trim().replace(/\s+/g, " ").toLocaleUpperCase("es-ES");

export default async (request) => {
  if (request.method !== "GET") return json({ error: "Método no permitido" }, 405);
  try {
    const store = getStore("book-reviews");
    const { blobs } = await store.list();
    const reviews = await Promise.all(blobs.slice(0, 2000).map(({ key }) => store.get(key, { type: "json" })));
    const grouped = new Map();
    for (const review of reviews.filter(Boolean)) {
      const title = normalize(review.title);
      if (!title) continue;
      const current = grouped.get(title) || { title, author: review.author || "Autor desconocido", users: new Set(), totalReads: 0, ratingSum: 0, recommendedYes: 0 };
      const rating = Number(review.rating) || 0;
      current.totalReads += 1;
      current.ratingSum += rating;
      if (rating === 5) current.recommendedYes += 1;
      if (review.userHash) current.users.add(review.userHash);
      grouped.set(title, current);
    }
    const result = [...grouped.values()].map(book => ({ title: book.title, author: book.author, readers: book.users.size || book.totalReads, totalReads: book.totalReads, recommendedYes: book.recommendedYes, averageRating: Number((book.ratingSum / book.totalReads).toFixed(1)) })).sort((a,b) => b.readers-a.readers || b.averageRating-a.averageRating || a.title.localeCompare(b.title,"es"));
    return json(result);
  } catch (error) {
    console.error(error);
    return json({ error: "No se pudo cargar la biblioteca total" }, 500);
  }
};
export const config = { path: "/api/total-library" };
