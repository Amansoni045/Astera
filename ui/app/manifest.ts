import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Astera — Deep Research Workspace",
    short_name: "Astera",
    description:
      "Astera is an open-source deep research application that searches the web, reads trusted sources, and delivers structured reports.",
    start_url: "/",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#09090b",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
