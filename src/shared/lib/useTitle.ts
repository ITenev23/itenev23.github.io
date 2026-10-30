import { useEffect } from "react";
import { profile } from "@/content";

/**
 * Sets the browser tab title for a page: "<page> - <name>", or "<name> - <headline>" on
 * the home page. The CV's PDF takes its document title from here as well.
 */
export function useTitle(page?: string) {
  useEffect(() => {
    document.title = page ? `${page} - ${profile.name}` : `${profile.name} - ${profile.headline}`;
  }, [page]);
}
