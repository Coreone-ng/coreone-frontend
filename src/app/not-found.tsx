import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "404 — CoreOne",
  description: "The page you are looking for doesn't exist or has been moved.",
};
export { NotFoundPage as default } from "@/features/not-found/NotFoundPage";
