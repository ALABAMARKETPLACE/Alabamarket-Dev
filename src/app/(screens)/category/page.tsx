import { redirect } from "next/navigation";

// When someone pastes the bare /category URL (produced by replaceState) into a
// new tab there is no [id] segment, so Next.js would otherwise fall through to
// the [product-details] catch-all and render a broken product page.
// Redirect to home so the user lands somewhere sensible.
export default function CategoryIndexPage() {
  redirect("/");
}
