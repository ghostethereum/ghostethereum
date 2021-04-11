import React, {ReactElement, useState} from "react";
import Modal, {ModalContent, ModalFooter, ModalHeader} from "../Modal";
import "./add-profile-modal.scss";
import Icon from "../Icon";
import SpinnerGif from "../../../static/icons/spinner.gif";
import GhostLogo from "../../../static/icons/ghost-logo-dark.png";
import Input from "../Input";
import Button from "../Button";
import Dropdown from "../Dropdown";

type Props = {
    onClose: () => void;
}

enum Steps {
    ChooseIntegration,
    IntegrationForm,
    PaymentPlans,
}

type PaymentPlan = {
    title: 'Monthly' | 'Yearly' | 'Weekly';
    description: string;
    currency: string;
    amount: number;
}

export default function AddProfileModal(props: Props): ReactElement {
    const [currentStep, setStep] = useState(Steps.ChooseIntegration);
    const [adminUrl, setAdminUrl] = useState('');
    const [adminAPIKey, setAdminAPIKey] = useState('');
    const [plans, setPlans] = useState<PaymentPlan[]>([]);

    switch (currentStep) {
        case Steps.ChooseIntegration:
            return (
                <ChooseIntegration
                    {...props}
                    onNext={() => setStep(Steps.IntegrationForm)}
                />
            );
        case Steps.IntegrationForm:
            return (
                <IntegrationForm
                    {...props}
                    onNext={() => setStep(Steps.PaymentPlans)}
                    onBack={() => setStep(Steps.ChooseIntegration)}
                    adminUrl={adminUrl}
                    adminAPIKey={adminAPIKey}
                    updateAdminUrl={(url: string) => setAdminUrl(url)}
                    updateAdminAPIKey={(key: string) => setAdminAPIKey(key)}
                />
            );
        case Steps.PaymentPlans:
            return (
                <PaymentPlans
                    {...props}
                    onBack={() => setStep(Steps.IntegrationForm)}
                    onNext={() => null}
                    plans={plans}
                    setPlans={setPlans}
                />
            )
        default:
            return (
                <ChooseIntegration
                    {...props}
                    onNext={() => setStep(Steps.IntegrationForm)}
                />
            );
    }
}

type StepProps = {
    onClose: () => void;
    onNext: () => void;
    onBack?: () => void;
}

function ChooseIntegration(props: StepProps) {
    return (
        <Modal
            className="add-profile-modal"
            onClose={props.onClose}
        >
            <ModalHeader onClose={props.onClose}>
                Choose integrations
            </ModalHeader>
            <ModalContent>
                <div
                    className="add-profile-modal__content-row"
                    onClick={props.onNext}
                >
                    <div className="add-profile-modal__content-row__name">
                        Ghost
                    </div>
                    <div className="add-profile-modal__content-row__icon">
                        <Icon
                            size={2}
                            url={GhostLogo}
                        />
                    </div>
                </div>
            </ModalContent>
        </Modal>
    );
}



function IntegrationForm(props: StepProps & {
    updateAdminUrl: (data: string) => void;
    updateAdminAPIKey: (data: string) => void;
    adminUrl: string;
    adminAPIKey: string;

}) {
    return (
        <Modal
            className="add-profile-modal"
            onClose={props.onClose}
        >
            <ModalHeader onClose={props.onClose}>
                Enter Ghost Admin Info
            </ModalHeader>
            <ModalContent>
                <small>Feel lost? <a href="https://ghost.org/docs/admin-api/#token-authentication" target="_blank">See instruction here</a></small>
                <Input
                    label="Base URL"
                    type="text"
                    placeholder="https://demo.ghost.io"
                    value={props.adminUrl}
                    onChange={e => props.updateAdminUrl(e.target.value)}
                />
                <Input
                    label="Admin API Key"
                    type="text"
                    value={props.adminAPIKey}
                    onChange={e => props.updateAdminAPIKey(e.target.value)}
                />
            </ModalContent>
            <ModalFooter>
                <Button
                    btnType="secondary"
                    onClick={props.onBack}
                >
                    Back
                </Button>
                <Button
                    btnType="primary"
                    onClick={props.onNext}
                    disabled={!props.adminAPIKey || !props.adminUrl}
                >
                    Next
                </Button>
            </ModalFooter>
        </Modal>
    );
}

function PaymentPlans(props: StepProps & {
    plans: PaymentPlan[];
    setPlans: (plans: PaymentPlan[]) => void;
}) {
    return (
        <Modal
            className="add-profile-modal"
            onClose={props.onClose}
        >
            <ModalHeader onClose={props.onClose}>
                Edit Payment Plans
            </ModalHeader>
            <ModalContent>
                <Dropdown
                    label="Currency"
                    options={[
                        { value: 'DAI', text: 'DAI' },
                    ]}
                />
                <Dropdown
                    label="Payment Terms"
                    options={[
                        { value: 'weekly', text: 'Weekly'},
                        { value: 'monthly', text: 'Monthly'},
                        { value: 'yearly', text: 'Yearly'},
                    ]}
                />
                <Input
                    className="plan-description-input"
                    label="Plan Description"
                    type="text"
                    placeholder="e.g. month-to-month flexibility"
                />
                <Input
                    label="Amount"
                    type="number"
                />
            </ModalContent>
            <ModalFooter>
                <Button
                    btnType="secondary"
                    onClick={props.onBack}
                >
                    Back
                </Button>
                <Button
                    btnType="primary"
                    onClick={props.onNext}
                >
                    Next
                </Button>
            </ModalFooter>
        </Modal>
    );
}