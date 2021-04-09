import {MainService} from "./util/svc";
import HttpService from "./services/http";
import IndexerService from "./services/indexer";

(async function initApp() {
    const main = new MainService();
    main.add('http', new HttpService());
    main.add('indexer', new IndexerService());
    await main.start();
})();
