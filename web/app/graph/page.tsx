import styles from "./page.module.scss";
import { PageContent } from "../_components/page-content/PageContent";
import { getGraphData } from "../_data/getGraphData";
import { Graph } from "./Graph";

export default async function Page() {
  const data = await getGraphData();

  return (
    <PageContent title="Explore Graph">
      <div className={styles[""]} />
      <Graph data={data} />
    </PageContent>
  );
}
