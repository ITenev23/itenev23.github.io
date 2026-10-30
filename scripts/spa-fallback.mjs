// GitHub Pages has no rewrite rules: serving index.html as 404.html lets the
// client router resolve deep links like /projects/foo on a hard refresh.
import { copyFileSync } from "node:fs";

copyFileSync("dist/index.html", "dist/404.html");
