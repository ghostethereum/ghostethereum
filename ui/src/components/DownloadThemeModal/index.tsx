import React, {ReactElement} from "react";
import Modal, {ModalContent, ModalHeader} from "../Modal";
import Button from "../Button";
import "./download-theme.scss";
import config from "../../../../util/config";

type Props = {
    id: string;
    onClose: () => void;
}

export default function DownloadThemeModal(props: Props): ReactElement {
    return (
      <Modal className="download-theme" onClose={props.onClose}>
          <ModalHeader onClose={props.onClose}>
              Download Ghost Theme Files
          </ModalHeader>
          <ModalContent>
              <ol>
                  <li className="download-theme__row">
                      <b className="download-theme__row__text">
                          Download and <a href="https://ghost.org/help/installing-a-theme/#install-a-theme-manually" target="_blank">install theme manually.</a>
                      </b>
                      <Button
                          btnType="primary"
                          onClick={() => window.open(`${config.apiUrl}/ghost-themes/Casper/${props.id}`, '_blank')}
                      >
                          Download theme.zip
                      </Button>
                  </li>
                  <li className="download-theme__row">
                      <b className="download-theme__row__text">
                          Upload <a href="https://ghost.org/docs/themes/routing/" target="_blank">routes.yaml</a>{` to Settings > Labs.`}
                      </b>
                      <Button
                          btnType="primary"
                          onClick={() => window.open(`${config.apiUrl}/ghost-routes/Casper/${props.id}`, '_blank')}
                      >
                          Download routes.yaml
                      </Button>
                  </li>
              </ol>
          </ModalContent>
      </Modal>
    );
}