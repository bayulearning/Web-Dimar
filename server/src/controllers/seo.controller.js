import { buildRobotsTxt, buildSitemapXml } from "../services/seo.service.js";

export async function getSitemapXmlController(_req, res) {
  const xml = await buildSitemapXml();
  res.type("application/xml").send(xml);
}

export function getRobotsTxtController(_req, res) {
  res.type("text/plain").send(buildRobotsTxt());
}
